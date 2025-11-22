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
import { Label } from './ui/label';
import { Upload, CheckCircle, X, FileText } from 'lucide-react';
import type { Expense } from '../App';

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm: (receiptUrl?: string, receiptFile?: string) => Promise<void>;
  onUploadFile: (file: File, type: 'invoice' | 'receipt', expenseId: string) => Promise<{ path: string; url: string }>;
}

export function MarkAsPaidDialog({ 
  open, 
  onOpenChange, 
  expense,
  onConfirm,
  onUploadFile
}: MarkAsPaidDialogProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleConfirm = async () => {
    if (!expense) return;
    
    setUploading(true);
    try {
      let receiptUrl;
      let receiptFilePath;

      if (receiptFile) {
        const result = await onUploadFile(receiptFile, 'receipt', expense.id);
        receiptUrl = result.url;
        receiptFilePath = result.path;
      }

      await onConfirm(receiptUrl, receiptFilePath);
      setReceiptFile(null);
    } finally {
      setUploading(false);
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
          <DialogDescription>
            Marcar esta despesa como paga
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Descrição:</span>
              <span className="text-sm">{expense.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="text-sm">R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vencimento:</span>
              <span className="text-sm">{new Date(expense.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Anexar Comprovante de Pagamento</Label>
            {receiptFile ? (
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-green-600" />
                  <span className="text-sm">{receiptFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReceiptFile(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label htmlFor="receipt" className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer block">
                <input
                  id="receipt"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Clique para fazer upload do comprovante
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG ou JPG até 10MB</p>
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={uploading}>
            <CheckCircle className="size-4 mr-2" />
            {uploading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}