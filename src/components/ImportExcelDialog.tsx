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
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import type { Expense } from '../App';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (expenses: Omit<Expense, 'id'>[]) => void;
}

interface ParsedRow {
  description?: string;
  amount?: number;
  dueDate?: string;
  status?: string;
}

export function ImportExcelDialog({ 
  open, 
  onOpenChange,
  onImport
}: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [validRows, setValidRows] = useState(0);
  const [invalidRows, setInvalidRows] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (file: File) => {
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Pega a primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converte para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: ''
      });

      // Mapeia as colunas (aceita variações de nomes)
      const parsed = jsonData.map((row: any, index: number) => {
        console.log(`Processando linha ${index + 1}:`, row);
        
        const description = findColumn(row, ['descricao', 'descrição', 'description', 'desc']);
        const amountStr = findColumn(row, ['valor', 'amount', 'preco', 'preço', 'price']);
        const amount = parseAmount(amountStr);
        const dueDateStr = findColumn(row, ['vencimento', 'data', 'date', 'due_date', 'duedate']);
        const dueDate = parseDate(dueDateStr);
        const status = findColumn(row, ['status', 'situacao', 'situação']);
        
        console.log(`  - Descrição: "${description}"`);
        console.log(`  - Valor original: "${amountStr}" → Parseado: ${amount}`);
        console.log(`  - Vencimento original: "${dueDateStr}" → Parseado: ${dueDate}`);
        console.log(`  - Status: "${status}"`);
        
        return {
          description,
          amount,
          dueDate,
          status
        };
      });

      // Valida os dados
      let valid = 0;
      let invalid = 0;

      const validatedData = parsed.filter((row, index) => {
        const hasDescription = row.description && row.description.trim().length > 0;
        const hasValidAmount = row.amount && row.amount > 0;
        const isValid = hasDescription && hasValidAmount;
        
        if (!isValid) {
          console.log(`Linha ${index + 1} INVÁLIDA:`, {
            hasDescription,
            hasValidAmount,
            description: row.description,
            amount: row.amount
          });
          invalid++;
        } else {
          console.log(`Linha ${index + 1} VÁLIDA`);
          valid++;
        }
        
        return isValid;
      });

      setParsedData(validatedData);
      setValidRows(valid);
      setInvalidRows(invalid);
      setStep('preview');
      
      toast.success(`${valid} linhas válidas encontradas`);
      if (invalid > 0) {
        toast.warning(`${invalid} linhas ignoradas (dados incompletos)`);
      }
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Erro ao ler arquivo Excel. Verifique o formato.');
    } finally {
      setImporting(false);
    }
  };

  const findColumn = (row: any, possibleNames: string[]): string => {
    // Primeiro, tenta encontrar pela chave exata (case-insensitive)
    for (const name of possibleNames) {
      const key = Object.keys(row).find(k => 
        k.toLowerCase().trim() === name.toLowerCase()
      );
      if (key && row[key] != null && row[key] !== '') {
        return String(row[key]).trim();
      }
    }
    
    // Se não encontrou, tenta busca parcial (caso a coluna tenha nome diferente)
    for (const name of possibleNames) {
      const key = Object.keys(row).find(k => 
        k.toLowerCase().includes(name.toLowerCase())
      );
      if (key && row[key] != null && row[key] !== '') {
        return String(row[key]).trim();
      }
    }
    
    return '';
  };

  const parseAmount = (value: string): number => {
    if (!value) return 0;
    
    // Se já for um número, retorna direto (mas multiplicado por 1000 se for menor que 100)
    if (typeof value === 'number') {
      // Se o número é menor que 100, provavelmente perdeu os zeros (2.5 em vez de 2500)
      // Multiplicamos por 1000
      if (value > 0 && value < 100) {
        console.warn(`⚠️ Valor suspeito detectado: ${value} - Multiplicando por 1000`);
        return value * 1000;
      }
      return value;
    }
    
    // Remove espaços e símbolo R$
    let cleaned = String(value).replace(/[R$\s]/g, '');
    
    // Detecta o formato baseado na presença de vírgula e ponto
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');
    
    if (hasComma && hasDot) {
      // Formato brasileiro: 1.000,00
      // Remove pontos (separador de milhar) e converte vírgula para ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (hasComma && !hasDot) {
      // Só vírgula: 1000,00 (formato brasileiro)
      cleaned = cleaned.replace(',', '.');
    } else if (hasDot && !hasComma) {
      // Só ponto: pode ser 1000.00 (formato americano) ou 1.000 (milhar brasileiro)
      // Se tem 2 dígitos após o ponto, é decimal. Se tem 3, é milhar
      const parts = cleaned.split('.');
      if (parts.length === 2 && parts[1].length === 2) {
        // É decimal (ex: 200.00)
        // Mantém como está
      } else {
        // É separador de milhar (ex: 1.000)
        cleaned = cleaned.replace(/\./g, '');
      }
    }
    
    return parseFloat(cleaned) || 0;
  };

  const parseDate = (value: string): string => {
    if (!value) return new Date().toISOString().split('T')[0];
    
    const str = String(value).trim();
    console.log(`Parsing date: "${str}"`);
    
    // Tenta vários formatos
    
    // Formato: DD/MM/YYYY ou DD-MM-YYYY
    const brDateMatch = str.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (brDateMatch) {
      const [, day, month, year] = brDateMatch;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log(`  → Formato BR detectado: ${date}`);
      return date;
    }
    
    // Formato: YYYY-MM-DD
    const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log(`  → Formato ISO detectado: ${date}`);
      return date;
    }
    
    // Excel às vezes exporta datas como números (serial date)
    const num = parseFloat(str);
    if (!isNaN(num) && num > 40000) { // Datas após ~2009 no formato Excel
      // Converter serial date do Excel para data JS
      const date = new Date((num - 25569) * 86400 * 1000);
      const formatted = date.toISOString().split('T')[0];
      console.log(`  → Serial date Excel detectado: ${formatted}`);
      return formatted;
    }
    
    // Tenta criar data diretamente
    try {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const formatted = parsed.toISOString().split('T')[0];
        console.log(`  → Parsing direto: ${formatted}`);
        return formatted;
      }
    } catch (e) {
      console.log(`  → Erro ao parsear, usando data atual`);
    }
    
    console.log(`  → Não conseguiu parsear, usando data atual`);
    return new Date().toISOString().split('T')[0];
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      console.log('🚀 Starting import process...');
      console.log('  - Number of expenses to import:', parsedData.length);
      console.log('  - Expenses data:', parsedData);
      
      const expensesToImport = parsedData.map((data) => ({
        description: data.description,
        category: 'Outros' as const,
        amount: data.amount,
        dueDate: data.dueDate,
        status: (data.status === 'Pago' ? 'Pago' : 'Pendente') as const,
        addedBy: 'Contratante' as const,
      }));
      
      console.log('  - Formatted expenses:', expensesToImport);
      
      await onImport(expensesToImport);
      
      console.log('✅ Import completed successfully');
      
      setStep('upload');
      setParsedData([]);
      setValidRows(0);
      setInvalidRows(0);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error during import:', error);
      toast.error('Erro ao importar despesas');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Cria um template de exemplo
    const template = [
      {
        'Vencimento': '20/12/2024',
        'Descrição': 'Cimento 50kg',
        'Valor': '35,00',
        'Status': 'Pendente'
      },
      {
        'Vencimento': '25/12/2024',
        'Descrição': 'Pintura externa',
        'Valor': '1500,00',
        'Status': 'Pago'
      },
      {
        'Vencimento': '30/12/2024',
        'Descrição': 'Areia para construção',
        'Valor': '250,00',
        'Status': 'Pendente'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
    
    // Define largura das colunas
    ws['!cols'] = [
      { wch: 15 }, // Vencimento
      { wch: 35 }, // Descrição
      { wch: 12 }, // Valor
      { wch: 12 }  // Status
    ];
    
    XLSX.writeFile(wb, 'template-despesas.xlsx');
    toast.success('Template baixado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Importar Despesas do Excel</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel (.xlsx ou .xls) com suas despesas
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-900 font-medium">Formato do arquivo</p>
                  <p className="text-xs text-blue-700">
                    Seu arquivo Excel deve conter as seguintes colunas (nesta ordem):
                  </p>
                  <ul className="text-xs text-blue-700 list-disc ml-4 space-y-1">
                    <li><strong>Vencimento</strong> (obrigatório) - Ex: 25/12/2024 ou 2024-12-25</li>
                    <li><strong>Descrição</strong> (obrigatório) - Descrição da despesa</li>
                    <li><strong>Valor</strong> (obrigatório) - Ex: 100,00 ou R$ 100,00</li>
                    <li><strong>Status</strong> (opcional) - Pendente ou Pago</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    💡 <strong>Dica:</strong> Baixe o template para ver o formato correto
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="size-4 mr-2" />
                Baixar Template
              </Button>
            </div>

            {file ? (
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="size-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{file.name}</p>
                      <p className="text-sm text-green-700">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParsedData([]);
                      setStep('upload');
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {importing && (
                  <div className="mt-4 flex items-center gap-2 text-green-700">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Processando arquivo...</span>
                  </div>
                )}
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer block">
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={importing}
                />
                <Upload className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-900 mb-1">
                  Clique para fazer upload do arquivo Excel
                </p>
                <p className="text-sm text-gray-500">
                  Formatos aceitos: .xlsx, .xls, .csv
                </p>
              </label>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Arquivo processado com sucesso!
                </p>
              </div>
              <div className="flex gap-4 text-sm text-green-700">
                <span>✅ {validRows} linhas válidas</span>
                {invalidRows > 0 && (
                  <span>⚠️ {invalidRows} linhas ignoradas</span>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-700">
                  Preview dos dados ({parsedData.length} despesas)
                </p>
              </div>
              <div className="max-h-[300px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Vencimento</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {row.dueDate ? new Date(row.dueDate).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-4 py-2">{row.description}</td>
                        <td className="px-4 py-2 text-right">
                          R$ {row.amount?.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            row.status?.toLowerCase().includes('pago')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {row.status?.toLowerCase().includes('pago') ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="px-4 py-2 text-center text-sm text-gray-500 bg-gray-50">
                    + {parsedData.length - 10} linhas adicionais...
                  </div>
                )}
              </div>
            </div>

            {invalidRows > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900 font-medium">
                      Algumas linhas foram ignoradas
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Linhas sem descrição ou valor válido não serão importadas
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setFile(null);
              setParsedData([]);
              setStep('upload');
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          
          {step === 'preview' && (
            <Button 
              onClick={handleImport}
              disabled={importing || parsedData.length === 0}
            >
              {importing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar {parsedData.length} Despesas
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}