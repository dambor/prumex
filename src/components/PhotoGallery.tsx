import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Trash2,
  Search,
  Calendar,
  MapPin,
  User,
  Grid3x3,
  List,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight
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

export interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  phase?: string;
  location?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
}

interface PhotoGalleryProps {
  projectId: string;
  currentUserName: string;
}

const CONSTRUCTION_PHASES = [
  'Terreno Inicial',
  'Fundação',
  'Estrutura',
  'Alvenaria',
  'Cobertura',
  'Instalações',
  'Revestimentos',
  'Acabamentos',
  'Paisagismo',
  'Finalização'
];

export function PhotoGallery({ projectId, currentUserName }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPhase, setUploadPhase] = useState<string>('');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [projectId]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchPhotos(projectId);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles = files.filter(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return false;
      }
      // Check file size (max 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo: 10MB`);
        return false;
      }
      return true;
    });

    setUploadFiles(validFiles);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Selecione pelo menos uma foto');
      return;
    }

    try {
      setIsUploading(true);

      const uploadPromises = uploadFiles.map(file =>
        api.uploadPhoto(projectId, {
          file,
          caption: uploadCaption,
          phase: uploadPhase,
          location: uploadLocation,
          tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
          uploadedBy: currentUserName,
          uploadedAt: new Date().toISOString()
        })
      );

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos([...newPhotos, ...photos]);
      
      toast.success(`${newPhotos.length} foto(s) enviada(s) com sucesso!`);
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Erro ao enviar fotos');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setUploadCaption('');
    setUploadPhase('');
    setUploadLocation('');
    setUploadTags('');
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }

    try {
      await api.deletePhoto(projectId, photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success('Foto excluída com sucesso');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const handleView = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
    setIsViewDialogOpen(true);
  };

  const handleNext = () => {
    const filteredPhotos = getFilteredPhotos();
    const nextIndex = (selectedPhotoIndex + 1) % filteredPhotos.length;
    setSelectedPhotoIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevious = () => {
    const filteredPhotos = getFilteredPhotos();
    const prevIndex = selectedPhotoIndex === 0 ? filteredPhotos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const blob = await api.downloadPhoto(photo.imageUrl);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `foto-${photo.id}.jpg`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast.error('Erro ao baixar foto');
    }
  };

  const getFilteredPhotos = () => {
    return photos.filter(photo => {
      if (!photo || !photo.caption) return false;
      const matchesSearch = photo.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhase = filterPhase === 'all' || photo.phase === filterPhase;
      
      let matchesDate = true;
      if (filterDate !== 'all') {
        const photoDate = new Date(photo.uploadedAt);
        const now = new Date();
        if (filterDate === 'today') {
          matchesDate = photoDate.toDateString() === now.toDateString();
        } else if (filterDate === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = photoDate >= weekAgo;
        } else if (filterDate === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = photoDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesPhase && matchesDate;
    });
  };

  const filteredPhotos = getFilteredPhotos();

  // Group photos by date
  const photosByDate = filteredPhotos.reduce((acc, photo) => {
    const date = new Date(photo.uploadedAt).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fotos da Obra</h2>
          <p className="text-sm text-gray-600 mt-1">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} • Documentação visual do progresso
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="size-4 mr-2" />
            Adicionar Fotos
          </Button>
        </div>
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
                  placeholder="Buscar por descrição ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 block">Fase da Obra</Label>
              <Select value={filterPhase} onValueChange={setFilterPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fases</SelectItem>
                  {CONSTRUCTION_PHASES.map(phase => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-2 block">Período</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Display */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando fotos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma foto encontrada</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filterPhase !== 'all' || filterDate !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Comece adicionando fotos do progresso da obra'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {Object.entries(photosByDate).map(([date, datePhotos]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="size-4" />
                {date}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {datePhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleView(photo, photos.indexOf(photo))}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="text-sm font-medium line-clamp-2">{photo.caption}</p>
                        {photo.phase && (
                          <Badge className="mt-1 bg-white/20 text-white text-xs">
                            {photo.phase}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="size-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(photo, photos.indexOf(photo));
                        }}
                      >
                        <ZoomIn className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map((photo, index) => (
            <Card key={photo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.caption}
                    className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => handleView(photo, index)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2">{photo.caption}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {photo.phase && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{photo.phase}</Badge>
                        </div>
                      )}
                      {photo.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          {photo.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        {photo.uploadedBy}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        {new Date(photo.uploadedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {photo.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(photo)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(photo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Fotos</DialogTitle>
            <DialogDescription>
              Documente o progresso da obra com fotos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fotos *</Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                multiple
              />
              {uploadFiles.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {uploadFiles.length} {uploadFiles.length === 1 ? 'foto selecionada' : 'fotos selecionadas'}
                </p>
              )}
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Ex: Estrutura do segundo andar concluída"
              />
            </div>

            <div>
              <Label>Fase da Obra</Label>
              <Select value={uploadPhase} onValueChange={setUploadPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent>
                  {CONSTRUCTION_PHASES.map(phase => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Local/Área</Label>
              <Input
                value={uploadLocation}
                onChange={(e) => setUploadLocation(e.target.value)}
                placeholder="Ex: Sala de estar, Quarto principal"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="Ex: elétrica, pintura, piso (separadas por vírgula)"
              />
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
              {isUploading ? 'Enviando...' : 'Adicionar Fotos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          {selectedPhoto && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsViewDialogOpen(false)}
              >
                <X className="size-4" />
              </Button>

              {/* Navigation buttons */}
              {filteredPhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="size-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="size-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="bg-black flex items-center justify-center" style={{ height: '70vh' }}>
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Info panel */}
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{selectedPhoto.caption}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {selectedPhoto.phase && (
                        <Badge>{selectedPhoto.phase}</Badge>
                      )}
                      {selectedPhoto.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          {selectedPhoto.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedPhoto)}
                    >
                      <Download className="size-4 mr-2" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDelete(selectedPhoto.id);
                        setIsViewDialogOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Enviado por:</span>
                    <span className="ml-2 font-medium">{selectedPhoto.uploadedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedPhoto.uploadedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-600 mb-2 block">Tags:</span>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPhoto.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Foto {selectedPhotoIndex + 1} de {filteredPhotos.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}