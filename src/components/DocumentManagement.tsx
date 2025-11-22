import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  FileCheck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  File,
  FileImage,
  FileCog
} from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'design' | 'engineering' | 'permit' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  signatures?: {
    userId: string;
    userName: string;
    signedAt: string;
    role: string;
  }[];
  requiresSignature: boolean;
  status: 'pending' | 'signed' | 'rejected';
}

interface DocumentManagementProps {
  projectId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'Proprietário' | 'Contratante';
}

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contrato', icon: FileCheck },
  { value: 'design', label: 'Design/Projeto', icon: FileImage },
  { value: 'engineering', label: 'Engenharia', icon: FileCog },
  { value: 'permit', label: 'Licenças/Alvarás', icon: FileText },
  { value: 'other', label: 'Outros', icon: File }
];

export function DocumentManagement({
  projectId,
  currentUserId,
  currentUserName,
  currentUserRole
}: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<string>('other');
  const [uploadDescription, setUploadDescription] = useState('');
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchDocuments(projectId);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 50MB');
        return;
      }
      setUploadFile(file);
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) {
      toast.error('Selecione um arquivo e forneça um nome');
      return;
    }

    try {
      setIsUploading(true);
      
      const newDocument = await api.uploadDocument(projectId, {
        file: uploadFile,
        name: uploadName,
        type: uploadType as Document['type'],
        description: uploadDescription,
        requiresSignature,
        uploadedBy: currentUserName,
        uploadedAt: new Date().toISOString(),
        status: requiresSignature ? 'pending' : 'signed'
      });

      setDocuments([newDocument, ...documents]);
      toast.success('Documento enviado com sucesso!');
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadType('other');
    setUploadDescription('');
    setRequiresSignature(false);
  };

  const handleSign = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Check if already signed
      const alreadySigned = document.signatures?.some(s => s.userId === currentUserId);
      if (alreadySigned) {
        toast.info('Você já assinou este documento');
        return;
      }

      const signature = {
        userId: currentUserId,
        userName: currentUserName,
        signedAt: new Date().toISOString(),
        role: currentUserRole
      };

      await api.signDocument(projectId, documentId, signature);

      setDocuments(documents.map(doc => {
        if (doc.id === documentId) {
          const newSignatures = [...(doc.signatures || []), signature];
          return {
            ...doc,
            signatures: newSignatures,
            status: 'signed' as const
          };
        }
        return doc;
      }));

      toast.success('Documento assinado com sucesso!');
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Erro ao assinar documento');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await api.deleteDocument(projectId, documentId);
      setDocuments(documents.filter(d => d.id !== documentId));
      toast.success('Documento excluído com sucesso');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await api.downloadDocument(document.fileUrl);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (!doc || !doc.name) return false;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.icon || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documentos do Projeto</h2>
          <p className="text-sm text-gray-600 mt-1">
            Contratos, designs, documentos de engenharia e mais
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="size-4 mr-2" />
          Enviar Documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs mb-2 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 block">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente Assinatura</SelectItem>
                  <SelectItem value="signed">Assinado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando documentos...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhum documento encontrado</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Comece enviando seu primeiro documento'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const Icon = getDocumentIcon(doc.type);
            const userSigned = doc.signatures?.some(s => s.userId === currentUserId);
            const allSigned = doc.requiresSignature && doc.status === 'signed';

            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Icon className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label}
                      </p>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Tamanho: {formatFileSize(doc.fileSize)}</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Enviado por: {doc.uploadedBy}
                    </div>
                  </div>

                  {/* Signatures */}
                  {doc.requiresSignature && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {allSigned ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <Clock className="size-4 text-orange-600" />
                        )}
                        <span className="text-xs font-medium">
                          {allSigned ? 'Documento Assinado' : 'Aguardando Assinatura'}
                        </span>
                      </div>
                      {doc.signatures && doc.signatures.length > 0 && (
                        <div className="space-y-1">
                          {doc.signatures.map((sig, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                              <CheckCircle className="size-3 text-green-600" />
                              {sig.userName} ({sig.role})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                      className="flex-1"
                    >
                      <Eye className="size-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="size-4" />
                    </Button>
                    {doc.requiresSignature && !userSigned && (
                      <Button
                        size="sm"
                        onClick={() => handleSign(doc.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FileCheck className="size-4 mr-1" />
                        Assinar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Faça upload de contratos, designs, documentos técnicos e mais
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Arquivo *</Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
              />
              {uploadFile && (
                <p className="text-xs text-gray-600 mt-1">
                  {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </p>
              )}
            </div>

            <div>
              <Label>Nome do Documento *</Label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Ex: Contrato de Construção"
              />
            </div>

            <div>
              <Label>Tipo *</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Descrição opcional do documento"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresSignature"
                checked={requiresSignature}
                onChange={(e) => setRequiresSignature(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="requiresSignature" className="cursor-pointer">
                Requer assinatura dos membros do projeto
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
            <DialogDescription>
              {DOCUMENT_TYPES.find(t => t.value === selectedDocument?.type)?.label}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
                {selectedDocument.fileName.endsWith('.pdf') ? (
                  <iframe
                    src={selectedDocument.fileUrl}
                    className="w-full h-[500px] rounded"
                    title={selectedDocument.name}
                  />
                ) : selectedDocument.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="size-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Visualização não disponível</p>
                    <Button onClick={() => handleDownload(selectedDocument)}>
                      <Download className="size-4 mr-2" />
                      Baixar Documento
                    </Button>
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tamanho:</span>
                  <span className="ml-2 font-medium">
                    {formatFileSize(selectedDocument.fileSize)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Enviado em:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedDocument.uploadedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Enviado por:</span>
                  <span className="ml-2 font-medium">{selectedDocument.uploadedBy}</span>
                </div>
                {selectedDocument.description && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Descrição:</span>
                    <p className="mt-1">{selectedDocument.description}</p>
                  </div>
                )}
              </div>

              {/* Signatures Section */}
              {selectedDocument.requiresSignature && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Assinaturas</h4>
                  {selectedDocument.signatures && selectedDocument.signatures.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDocument.signatures.map((sig, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                          <CheckCircle className="size-5 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium">{sig.userName}</div>
                            <div className="text-xs text-gray-600">
                              {sig.role} • Assinado em{' '}
                              {new Date(sig.signedAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhuma assinatura ainda</p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedDocument?.requiresSignature &&
              !selectedDocument.signatures?.some(s => s.userId === currentUserId) && (
                <Button
                  onClick={() => {
                    handleSign(selectedDocument.id);
                    setIsViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileCheck className="size-4 mr-2" />
                  Assinar Documento
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}