import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Upload, X, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { extractInvoiceData } from '../utils/api';
import type { Expense } from '../App';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>; // Retorna a despesa criada
  onUploadFile: (file: File, type: 'invoice' | 'receipt', expenseId: string) => Promise<{ path: string; url: string }>;
}

export function AddExpenseDialog({ open, onOpenChange, onAddExpense, onUploadFile }: AddExpenseDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    category: 'ADMINISTRAÇÃO' as Expense['category'],
    amount: '',
    dueDate: '',
    notes: '',
    pixKey: '', // Campo para chave PIX
    addedBy: 'Contratante' as Expense['addedBy']
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [boletoFile, setBoletoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [extractedDataTimestamp, setExtractedDataTimestamp] = useState(0); // Para forçar re-render

  const handleExtractInvoice = async () => {
    if (!invoiceFile) {
      toast.error('Primeiro faça upload da nota fiscal');
      return;
    }

    // Verificar se é PDF antes de tentar extrair
    if (invoiceFile.type === 'application/pdf' || invoiceFile.name.toLowerCase().endsWith('.pdf')) {
      toast.warning('📄 PDFs não podem ser processados automaticamente', {
        description: '💡 Dica: Abra o PDF e tire um screenshot (Print Screen) da nota fiscal. Depois faça upload da imagem PNG/JPG.',
        duration: 8000
      });
      return;
    }

    setExtracting(true);
    try {
      toast.info('🤖 Analisando nota fiscal com IA...', { duration: 5000 });
      const extractedData = await extractInvoiceData(invoiceFile);
      
      console.log('📊 ===== DEBUG OCR =====');
      console.log('Dados extraídos pela IA:', extractedData);
      console.log('Tipo de extractedData:', typeof extractedData);
      console.log('Chaves:', Object.keys(extractedData));
      console.log('extractedData.amount:', extractedData.amount);
      console.log('extractedData.description:', extractedData.description);
      console.log('extractedData.dueDate:', extractedData.dueDate);
      console.log('extractedData.category:', extractedData.category);
      console.log('extractedData.pixKey:', extractedData.pixKey);
      console.log('======================');
      
      // Construir o objeto de atualização manualmente para debug
      const updates: any = {};
      
      if (extractedData.amount !== undefined && extractedData.amount !== null) {
        updates.amount = String(extractedData.amount);
        console.log('✅ Preenchendo amount:', updates.amount);
      }
      
      if (extractedData.description) {
        updates.description = extractedData.description;
        console.log('✅ Preenchendo description:', updates.description);
      }
      
      if (extractedData.dueDate) {
        updates.dueDate = extractedData.dueDate;
        console.log('✅ Preenchendo dueDate:', updates.dueDate);
      }
      
      if (extractedData.category) {
        updates.category = extractedData.category;
        console.log('✅ Preenchendo category:', updates.category);
      }
      
      if (extractedData.pixKey) {
        updates.pixKey = extractedData.pixKey;
        console.log('✅ Preenchendo pixKey:', updates.pixKey);
      }
      
      console.log('🔄 Objeto de updates final:', updates);
      
      // Atualizar o formulário E o timestamp para forçar re-render
      setFormData(prev => {
        const newData = { ...prev, ...updates };
        console.log('🔄 Estado anterior:', prev);
        console.log('🔄 Novo estado:', newData);
        return newData;
      });
      
      // Forçar re-render dos inputs
      setExtractedDataTimestamp(Date.now());
      
      const confidence = Math.round((extractedData.confidence || 0.8) * 100);
      toast.success(`✅ Dados extraídos com sucesso! Confiança: ${confidence}%`, { duration: 5000 });
      
      // Feedback adicional sobre os campos preenchidos
      const filledFields = Object.keys(updates);
      if (filledFields.length > 0) {
        console.log('✅ Campos que serão preenchidos:', filledFields.join(', '));
        toast.info(`📝 Campos preenchidos: ${filledFields.join(', ')}`, { duration: 4000 });
      } else {
        console.warn('⚠️ Nenhum campo foi preenchido!');
        toast.warning('⚠️ Nenhum dado foi extraído. Tente uma imagem mais clara.', { duration: 5000 });
      }
    } catch (error) {
      console.error('❌ Error extracting invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao extrair dados. Verifique se a imagem está legível.';
      
      // Se for a mensagem sobre PDF, mostrar como warning
      if (errorMessage.includes('DICA') || errorMessage.includes('PDF')) {
        toast.warning('📄 Formato não suportado', {
          description: 'Use imagens PNG ou JPG para extração automática. PDFs precisam ser convertidos em screenshot.',
          duration: 7000
        });
      } else {
        toast.error(errorMessage, { duration: 7000 });
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceFile(file);
    }
  };

  const handleBoletoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBoletoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setUploading(true);

    try {
      // 1. PRIMEIRO: Criar a despesa no banco (sem arquivos)
      const expenseData: any = {
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        status: 'Pendente',
        addedBy: formData.addedBy,
        notes: formData.notes || undefined,
        pixKey: formData.pixKey || undefined
      };

      console.log('📝 Step 1: Creating expense without files...');
      const createdExpense = await onAddExpense(expenseData);
      console.log('✅ Expense created with ID:', createdExpense.id);

      // 2. DEPOIS: Fazer upload dos arquivos usando o ID real da despesa
      if (invoiceFile) {
        console.log('📤 Step 2: Uploading invoice file...');
        await onUploadFile(invoiceFile, 'invoice', createdExpense.id);
        console.log('✅ Invoice uploaded');
      }

      if (boletoFile) {
        console.log('📤 Step 3: Uploading boleto file...');
        await onUploadFile(boletoFile, 'receipt', createdExpense.id);
        console.log('✅ Boleto uploaded');
      }

      // Reset form
      setFormData({
        description: '',
        category: 'ADMINISTRAÇÃO',
        amount: '',
        dueDate: '',
        notes: '',
        pixKey: '',
        addedBy: 'Contratante'
      });
      setInvoiceFile(null);
      setBoletoFile(null);
      setError('');
      
      onOpenChange(false);
      toast.success('Despesa adicionada com sucesso!');
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar despesa. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta a pagar para a obra
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                key={`description-${extractedDataTimestamp}`}
                id="description"
                placeholder="Ex: Cimento e areia - 50 sacos"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  key={`category-${extractedDataTimestamp}`}
                  value={formData.category} 
                  onValueChange={(value: Expense['category']) => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRAÇÃO">ADMINISTRAÇÃO</SelectItem>
                    <SelectItem value="SERVIÇOS PRELIMINARES">SERVIÇOS PRELIMINARES</SelectItem>
                    <SelectItem value="SERVIÇOS GERAIS">SERVIÇOS GERAIS</SelectItem>
                    <SelectItem value="INFRA-ESTRUTURA">INFRA-ESTRUTURA</SelectItem>
                    <SelectItem value="SUPRA-ESTRUTURA">SUPRA-ESTRUTURA</SelectItem>
                    <SelectItem value="ALVENARIA">ALVENARIA</SelectItem>
                    <SelectItem value="COBERTURAS E PROTEÇÕES">COBERTURAS E PROTEÇÕES</SelectItem>
                    <SelectItem value="REVESTIMENTOS, ELEMENTOS DECORATIVOS E PINTURA">REVESTIMENTOS, ELEMENTOS DECORATIVOS E PINTURA</SelectItem>
                    <SelectItem value="PAVIMENTAÇÃO">PAVIMENTAÇÃO</SelectItem>
                    <SelectItem value="INSTALAÇÕES E APARELHOS">INSTALAÇÕES E APARELHOS</SelectItem>
                    <SelectItem value="MÃO DE OBRA E ASSOCIADOS">MÃO DE OBRA E ASSOCIADOS</SelectItem>
                    <SelectItem value="COMPLEMENTAÇÃO DA OBRA">COMPLEMENTAÇÃO DA OBRA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  key={`amount-${extractedDataTimestamp}`}
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento *</Label>
                <Input
                  key={`dueDate-${extractedDataTimestamp}`}
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addedBy">Adicionado por</Label>
                <Select 
                  value={formData.addedBy} 
                  onValueChange={(value: Expense['addedBy']) => 
                    setFormData({ ...formData, addedBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contratante">Contratante</SelectItem>
                    <SelectItem value="Proprietário">Proprietário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações importantes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Documentos e Informações de Pagamento</h3>
              
              <div className="space-y-2">
                <Label htmlFor="invoice">
                  Nota Fiscal * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (PDF, PNG ou JPG)
                  </span>
                </Label>
                {invoiceFile ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between bg-blue-50">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{invoiceFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(invoiceFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setInvoiceFile(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="invoice" className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer block">
                    <input
                      id="invoice"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleInvoiceChange}
                      required
                    />
                    <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para fazer upload da nota fiscal
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, PNG ou JPG até 10MB</p>
                  </label>
                )}
                {invoiceFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExtractInvoice}
                    disabled={extracting}
                    className="w-full border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
                  >
                    <Sparkles className="size-4 mr-2 text-purple-600" />
                    {extracting ? '🤖 Analisando com IA...' : '✨ Extrair Dados com IA'}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="boleto">
                  Boleto * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (PDF, PNG ou JPG)
                  </span>
                </Label>
                {boletoFile ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between bg-blue-50">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{boletoFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(boletoFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBoletoFile(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="boleto" className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer block">
                    <input
                      id="boleto"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleBoletoChange}
                      required
                    />
                    <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para fazer upload do boleto
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, PNG ou JPG até 10MB</p>
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">
                  Chave PIX para Pagamento * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (CPF, CNPJ, E-mail, Telefone ou Chave Aleatória)
                  </span>
                </Label>
                <Textarea
                  id="pixKey"
                  placeholder="Cole a chave PIX aqui (ex: 12345678900, email@exemplo.com, +5511999999999, ou chave aleatória)"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500">
                  💡 Esta é a chave PIX que o proprietário usará para fazer o pagamento
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Adicionando...' : 'Adicionar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}