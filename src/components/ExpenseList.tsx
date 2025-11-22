import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  FileText, 
  Receipt, 
  MoreVertical,
  CheckCircle,
  Trash2,
  CreditCard,
  Eye,
  Copy,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { MarkAsPaidDialog } from './MarkAsPaidDialog';
import { FileViewerDialog } from './FileViewerDialog';
import { PaymentDialog } from './PaymentDialog';
import { useState } from 'react';
import type { Expense } from '../App';
import { toast } from 'sonner';

interface ExpenseListProps {
  expenses: Expense[];
  filterStatus: 'Todos' | 'Pendente' | 'Pago';
  onFilterChange: (status: 'Todos' | 'Pendente' | 'Pago') => void;
  onMarkAsPaid: (id: string, receiptUrl?: string, receiptFile?: string) => void;
  onDeleteExpense: (id: string) => void;
  onUploadFile: (file: File, type: 'invoice' | 'receipt', expenseId: string) => Promise<{ path: string; url: string }>;
  onPaymentComplete?: (id: string, paymentMethod: string, receiptData: any) => void;
  onAddExpense?: () => void;
  onImportExcel?: () => void;
}

type SortOption = 'date-asc' | 'date-desc' | 'amount-asc' | 'amount-desc' | 'status' | 'category';

export function ExpenseList({ 
  expenses, 
  filterStatus, 
  onFilterChange, 
  onMarkAsPaid,
  onDeleteExpense,
  onUploadFile,
  onPaymentComplete,
  onAddExpense,
  onImportExcel
}: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewFile, setViewFile] = useState<{ url: string; name: string; type: 'invoice' | 'receipt' } | null>(null);

  // Debug: Log quando o componente recebe novas props
  console.log('🎨 ExpenseList rendered with', expenses.length, 'expenses');
  console.log('  - Expenses:', expenses.map(e => ({ id: e.id, description: e.description })));

  const handleViewFile = (expense: Expense, type: 'invoice' | 'receipt') => {
    const url = type === 'invoice' ? expense.invoiceUrl : expense.receiptUrl;
    if (url) {
      setViewFile({
        url,
        name: `${type === 'invoice' ? 'Nota Fiscal' : 'Comprovante'} - ${expense.description}`,
        type
      });
      setFileViewerOpen(true);
    }
  };

  const handlePayNow = (expense: Expense) => {
    setSelectedExpense(expense);
    setPaymentDialogOpen(true);
  };

  const handleMarkAsPaid = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsPayDialogOpen(true);
  };

  const confirmPayment = async (paidDate: string, receiptUrl?: string, receiptFile?: string) => {
    if (selectedExpense) {
      await onMarkAsPaid(selectedExpense.id, paidDate, 'Manual');
      setIsPayDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handlePaymentComplete = (paymentMethod: string, receiptData: any) => {
    if (selectedExpense && onPaymentComplete) {
      onPaymentComplete(selectedExpense.id, paymentMethod, receiptData);
      setPaymentDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Material':
        return 'bg-blue-100 text-blue-800';
      case 'Mão de Obra':
        return 'bg-purple-100 text-purple-800';
      case 'Equipamento':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedExpenses = expenses.slice().sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'date-desc':
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const filteredExpenses = sortedExpenses.filter(expense => {
    if (filterStatus === 'Todos') return true;
    return expense.status === filterStatus;
  });

  const searchedExpenses = filteredExpenses.filter(expense => {
    return expense.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Contas a Pagar</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Tabs value={filterStatus} onValueChange={(v) => onFilterChange(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3">
                  <TabsTrigger value="Todos">Todos</TabsTrigger>
                  <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
                  <TabsTrigger value="Pago">Pagos</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                {onImportExcel && (
                  <Button onClick={onImportExcel} variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <FileSpreadsheet className="size-4 sm:mr-2" />
                    <span className="hidden sm:inline">Importar Excel</span>
                  </Button>
                )}
                {onAddExpense && (
                  <Button onClick={onAddExpense} size="sm" className="flex-1 sm:flex-none">
                    <Plus className="size-4 sm:mr-2" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="size-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                  <ArrowDown className="size-4 mr-2" />
                  Data (Mais recente)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                  <ArrowUp className="size-4 mr-2" />
                  Data (Mais antiga)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount-desc')}>
                  <ArrowDown className="size-4 mr-2" />
                  Valor (Maior primeiro)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount-asc')}>
                  <ArrowUp className="size-4 mr-2" />
                  Valor (Menor primeiro)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('status')}>
                  <CheckCircle className="size-4 mr-2" />
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('category')}>
                  <FileText className="size-4 mr-2" />
                  Categoria
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {searchedExpenses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 border-b grid grid-cols-[2fr_1fr_1fr_1fr_120px_150px_100px] gap-4 px-4 py-3 text-xs font-medium text-gray-700">
                  <div>Descrição</div>
                  <div>Categoria</div>
                  <div>Valor</div>
                  <div>Vencimento</div>
                  <div>Adicionado por</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y">
                  {searchedExpenses.map(expense => (
                    <div 
                      key={expense.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_120px_150px_100px] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors items-center"
                    >
                      {/* Description */}
                      <div className="min-w-0">
                        <h3 className="text-gray-900 truncate text-sm font-medium">{expense.description}</h3>
                        {expense.notes && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{expense.notes}</p>
                        )}
                      </div>
                      
                      {/* Category */}
                      <div>
                        <Badge className={getCategoryColor(expense.category)}>
                          {expense.category}
                        </Badge>
                      </div>
                      
                      {/* Amount */}
                      <div className="text-gray-900 text-sm font-medium">
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      
                      {/* Due Date */}
                      <div className="text-xs text-gray-600">
                        {new Date(expense.dueDate).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      
                      {/* Added By */}
                      <div className="text-xs text-gray-600">
                        {expense.addedBy}
                      </div>
                      
                      {/* Status */}
                      <div>
                        {expense.status === 'Pago' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <CheckCircle className="size-3 mr-1" />
                            Pago
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                            <span className="size-2 rounded-full bg-orange-500 inline-block mr-1.5" />
                            Pendente
                          </Badge>
                        )}
                        {expense.paidDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(expense.paidDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        {expense.status === 'Pendente' && (
                          <Button 
                            size="sm"
                            onClick={() => handlePayNow(expense)}
                            className="h-7 text-xs"
                          >
                            <CreditCard className="size-3 mr-1" />
                            Pagar
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {expense.invoiceUrl && (
                              <DropdownMenuItem onClick={() => handleViewFile(expense, 'invoice')}>
                                <Eye className="size-4 mr-2" />
                                Ver Nota Fiscal
                              </DropdownMenuItem>
                            )}
                            {expense.boletoUrl && expense.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => window.open(expense.boletoUrl, '_blank')}>
                                <FileText className="size-4 mr-2" />
                                Ver Boleto
                              </DropdownMenuItem>
                            )}
                            {expense.receiptUrl && expense.status === 'Pago' && (
                              <DropdownMenuItem onClick={() => handleViewFile(expense, 'receipt')}>
                                <Receipt className="size-4 mr-2" />
                                Ver Comprovante
                              </DropdownMenuItem>
                            )}
                            {expense.pixKey && expense.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(expense.pixKey!);
                                toast.success('Chave PIX copiada!');
                              }}>
                                <Copy className="size-4 mr-2" />
                                Copiar Chave PIX
                              </DropdownMenuItem>
                            )}
                            {expense.status === 'Pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => handlePayNow(expense)}>
                                  <CreditCard className="size-4 mr-2" />
                                  Pagar Agora
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(expense)}>
                                  <CheckCircle className="size-4 mr-2" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => onDeleteExpense(expense.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {searchedExpenses.map(expense => (
                  <div
                    key={expense.id}
                    className="bg-white border rounded-lg p-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{expense.description}</h3>
                        <Badge className={getCategoryColor(expense.category) + " text-xs"}>
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {expense.invoiceUrl && (
                              <DropdownMenuItem onClick={() => handleViewFile(expense, 'invoice')}>
                                <Eye className="size-4 mr-2" />
                                Ver Nota Fiscal
                              </DropdownMenuItem>
                            )}
                            {expense.boletoUrl && expense.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => window.open(expense.boletoUrl, '_blank')}>
                                <FileText className="size-4 mr-2" />
                                Ver Boleto
                              </DropdownMenuItem>
                            )}
                            {expense.receiptUrl && expense.status === 'Pago' && (
                              <DropdownMenuItem onClick={() => handleViewFile(expense, 'receipt')}>
                                <Receipt className="size-4 mr-2" />
                                Ver Comprovante
                              </DropdownMenuItem>
                            )}
                            {expense.pixKey && expense.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(expense.pixKey!);
                                toast.success('Chave PIX copiada!');
                              }}>
                                <Copy className="size-4 mr-2" />
                                Copiar Chave PIX
                              </DropdownMenuItem>
                            )}
                            {expense.status === 'Pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => handlePayNow(expense)}>
                                  <CreditCard className="size-4 mr-2" />
                                  Pagar Agora
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(expense)}>
                                  <CheckCircle className="size-4 mr-2" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => onDeleteExpense(expense.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Amount - Prominent */}
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-gray-500 text-xs">Vencimento</div>
                        <div className="text-gray-900">
                          {new Date(expense.dueDate).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Adicionado por</div>
                        <div className="text-gray-900">{expense.addedBy}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {expense.notes && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{expense.notes}</p>
                    )}

                    {/* Status and Action */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        {expense.status === 'Pago' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="size-3 mr-1" />
                            Pago
                            {expense.paidDate && (
                              <span className="ml-1">
                                · {new Date(expense.paidDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <span className="size-2 rounded-full bg-orange-500 inline-block mr-1.5" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                      {expense.status === 'Pendente' && (
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(expense);
                          }}
                          className="h-8"
                        >
                          <CreditCard className="size-3.5 mr-1.5" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <MarkAsPaidDialog 
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        expense={selectedExpense}
        onConfirm={confirmPayment}
        onUploadFile={onUploadFile}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        expense={selectedExpense}
        onPaymentComplete={handlePaymentComplete}
      />

      <FileViewerDialog
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileUrl={viewFile?.url}
        fileName={viewFile?.name}
        fileType={viewFile?.type || 'invoice'}
      />
    </>
  );
}