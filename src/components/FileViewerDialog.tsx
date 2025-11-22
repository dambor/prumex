import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { FileText, Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl?: string;
  fileName?: string;
  fileType: 'invoice' | 'receipt';
}

export function FileViewerDialog({ 
  open, 
  onOpenChange, 
  fileUrl,
  fileName,
  fileType
}: FileViewerDialogProps) {
  const titleMap = {
    'invoice': 'Nota Fiscal',
    'receipt': 'Boleto/Comprovante de Pagamento'
  };
  
  const title = titleMap[fileType] || 'Documento';
  
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {title}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Visualização do documento: {fileName || title}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
          {fileUrl ? (
            <iframe 
              src={fileUrl} 
              className="w-full h-full rounded-lg"
              title={title}
            />
          ) : (
            <div className="text-center text-gray-500">
              <FileText className="size-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum arquivo disponível</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}