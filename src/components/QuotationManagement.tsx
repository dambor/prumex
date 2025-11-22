import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, FileText, TrendingDown, CheckCircle, Pencil, Trash2, Search, Users, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export interface QuotationSupplier {
  id: string;
  supplierName: string;
  supplierContact: string;
  price: number;
  deliveryTime: string;
  notes?: string;
  isSelected: boolean;
}

export interface Quotation {
  id: string;
  item: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  requestDate: string;
  status: 'Em Cotação' | 'Aprovada' | 'Cancelada';
  suppliers: QuotationSupplier[];
  notes?: string;
}

interface QuotationManagementProps {
  quotations: Quotation[];
  onAddQuotation: (quotation: Omit<Quotation, 'id'>) => Promise<void>;
  onUpdateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
  onDeleteQuotation: (id: string) => Promise<void>;
}

export function QuotationManagement({
  quotations,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
}: QuotationManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    item: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'Em Cotação' as 'Em Cotação' | 'Aprovada' | 'Cancelada',
    notes: '',
  });

  const [supplierFormData, setSupplierFormData] = useState({
    supplierName: '',
    supplierContact: '',
    price: '',
    deliveryTime: '',
    notes: '',
  });

  // Stats
  const activeQuotations = quotations.filter(q => q.status === 'Em Cotação');
  const approvedQuotations = quotations.filter(q => q.status === 'Aprovada');
  const totalSavings = quotations
    .filter(q => q.status === 'Aprovada' && q.suppliers.length > 1)
    .reduce((sum, q) => {
      const prices = q.suppliers.map(s => s.price * q.quantity).filter(p => p > 0);
      if (prices.length < 2) return sum;
      const highest = Math.max(...prices);
      const selected = q.suppliers.find(s => s.isSelected);
      const selectedPrice = selected ? selected.price * q.quantity : 0;
      return sum + (highest - selectedPrice);
    }, 0);

  const filteredQuotations = quotations.filter(quotation =>
    quotation.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddDialog = () => {
    setFormData({
      item: '',
      description: '',
      category: '',
      quantity: '',
      unit: '',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Em Cotação',
      notes: '',
    });
    setEditingQuotation(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (quotation: Quotation) => {
    setFormData({
      item: quotation.item,
      description: quotation.description,
      category: quotation.category,
      quantity: String(quotation.quantity),
      unit: quotation.unit,
      requestDate: quotation.requestDate,
      status: quotation.status,
      notes: quotation.notes || '',
    });
    setEditingQuotation(quotation);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const quotationData = {
        item: formData.item,
        description: formData.description,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        requestDate: formData.requestDate,
        status: formData.status,
        suppliers: editingQuotation?.suppliers || [],
        notes: formData.notes || undefined,
      };

      if (editingQuotation) {
        await onUpdateQuotation(editingQuotation.id, quotationData);
        toast.success('Cotação atualizada com sucesso!');
      } else {
        await onAddQuotation(quotationData);
        toast.success('Cotação criada com sucesso!');
      }

      setIsAddDialogOpen(false);
      setEditingQuotation(null);
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Erro ao salvar cotação. Tente novamente.');
    }
  };

  const handleOpenSupplierDialog = (quotation: Quotation) => {
    if (quotation.suppliers.length >= 5) {
      toast.error('Máximo de 5 fornecedores por cotação');
      return;
    }
    setViewingQuotation(quotation);
    setSupplierFormData({
      supplierName: '',
      supplierContact: '',
      price: '',
      deliveryTime: '',
      notes: '',
    });
    setIsSupplierDialogOpen(true);
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!viewingQuotation) return;

    try {
      const newSupplier: QuotationSupplier = {
        id: crypto.randomUUID(),
        supplierName: supplierFormData.supplierName,
        supplierContact: supplierFormData.supplierContact,
        price: parseFloat(supplierFormData.price),
        deliveryTime: supplierFormData.deliveryTime,
        notes: supplierFormData.notes || undefined,
        isSelected: false,
      };

      const updatedSuppliers = [...viewingQuotation.suppliers, newSupplier];
      await onUpdateQuotation(viewingQuotation.id, { suppliers: updatedSuppliers });
      
      toast.success('Fornecedor adicionado com sucesso!');
      setIsSupplierDialogOpen(false);
      setViewingQuotation(null);
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Erro ao adicionar fornecedor. Tente novamente.');
    }
  };

  const handleSelectSupplier = async (quotation: Quotation, supplierId: string) => {
    try {
      const updatedSuppliers = quotation.suppliers.map(s => ({
        ...s,
        isSelected: s.id === supplierId,
      }));
      
      await onUpdateQuotation(quotation.id, { 
        suppliers: updatedSuppliers,
        status: 'Aprovada'
      });
      
      toast.success('Fornecedor selecionado!');
    } catch (error) {
      console.error('Error selecting supplier:', error);
      toast.error('Erro ao selecionar fornecedor. Tente novamente.');
    }
  };

  const handleRemoveSupplier = async (quotation: Quotation, supplierId: string) => {
    if (!confirm('Tem certeza que deseja remover este fornecedor?')) {
      return;
    }

    try {
      const updatedSuppliers = quotation.suppliers.filter(s => s.id !== supplierId);
      await onUpdateQuotation(quotation.id, { suppliers: updatedSuppliers });
      toast.success('Fornecedor removido com sucesso!');
    } catch (error) {
      console.error('Error removing supplier:', error);
      toast.error('Erro ao remover fornecedor. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta cotação?')) {
      return;
    }

    try {
      await onDeleteQuotation(id);
      toast.success('Cotação removida com sucesso!');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Erro ao remover cotação. Tente novamente.');
    }
  };

  const getBestPrice = (quotation: Quotation) => {
    if (quotation.suppliers.length === 0) return null;
    const prices = quotation.suppliers.map(s => s.price);
    return Math.min(...prices);
  };

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'Em Cotação':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprovada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Cotações com Fornecedores</h1>
          <p className="text-gray-600">Compare preços e selecione os melhores fornecedores</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="size-4 mr-2" />
          Nova Cotação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Cotações Ativas</CardTitle>
            <FileText className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{activeQuotations.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {quotations.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Aprovadas</CardTitle>
            <CheckCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{approvedQuotations.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Fornecedores selecionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Economia Total</CardTitle>
            <TrendingDown className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Comparado ao maior preço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar por item ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm ? 'Nenhuma cotação encontrada' : 'Nenhuma cotação cadastrada'}
            </p>
            {!searchTerm && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Crie cotações para comparar preços de fornecedores
                </p>
                <Button onClick={handleOpenAddDialog} variant="outline">
                  <Plus className="size-4 mr-2" />
                  Criar Primeira Cotação
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{quotation.item}</CardTitle>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{quotation.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Categoria: {quotation.category}</span>
                      <span>•</span>
                      <span>Quantidade: {quotation.quantity} {quotation.unit}</span>
                      <span>•</span>
                      <span>
                        Data: {new Date(quotation.requestDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(quotation)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quotation.id)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {quotation.suppliers.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Users className="size-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Nenhum fornecedor adicionado ainda
                    </p>
                    <Button
                      onClick={() => handleOpenSupplierDialog(quotation)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="size-4 mr-2" />
                      Adicionar Fornecedor
                    </Button>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotation.suppliers.map((supplier) => {
                          const totalPrice = supplier.price * quotation.quantity;
                          const isBestPrice = supplier.price === getBestPrice(quotation);
                          
                          return (
                            <TableRow 
                              key={supplier.id}
                              className={supplier.isSelected ? 'bg-green-50' : ''}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {supplier.supplierName}
                                  {isBestPrice && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      Melhor preço
                                    </Badge>
                                  )}
                                  {supplier.isSelected && (
                                    <Badge className="bg-green-600">
                                      Selecionado
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{supplier.supplierContact}</TableCell>
                              <TableCell className="text-right">
                                R$ {supplier.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>{supplier.deliveryTime}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  {!supplier.isSelected && quotation.status !== 'Aprovada' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectSupplier(quotation, supplier.id)}
                                      title="Selecionar este fornecedor"
                                    >
                                      <CheckCircle className="size-4 text-green-600" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSupplier(quotation, supplier.id)}
                                  >
                                    <Trash2 className="size-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {quotation.suppliers.length < 5 && quotation.status !== 'Cancelada' && (
                      <div className="mt-4">
                        <Button
                          onClick={() => handleOpenSupplierDialog(quotation)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="size-4 mr-2" />
                          Adicionar Fornecedor ({quotation.suppliers.length}/5)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Quotation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuotation ? 'Editar Cotação' : 'Nova Cotação'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do item que deseja cotar
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item/Produto *</Label>
                <Input
                  id="item"
                  placeholder="Ex: Cimento CP-II 50kg"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes adicionais do item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    placeholder="Ex: Material de Construção"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestDate">Data da Solicitação *</Label>
                  <Input
                    id="requestDate"
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade *</Label>
                  <Input
                    id="unit"
                    placeholder="Ex: sacos, m³, un"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Em Cotação' | 'Aprovada' | 'Cancelada') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Cotação">Em Cotação</SelectItem>
                    <SelectItem value="Aprovada">Aprovada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingQuotation ? 'Salvar Alterações' : 'Criar Cotação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Fornecedor</DialogTitle>
            <DialogDescription>
              Adicione os dados da proposta do fornecedor
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSupplier}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Nome do Fornecedor *</Label>
                <Input
                  id="supplierName"
                  placeholder="Ex: Materiais Silva Ltda"
                  value={supplierFormData.supplierName}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, supplierName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Contato *</Label>
                <Input
                  id="supplierContact"
                  placeholder="Telefone ou email"
                  value={supplierFormData.supplierContact}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, supplierContact: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço Unitário (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={supplierFormData.price}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Prazo de Entrega *</Label>
                  <Input
                    id="deliveryTime"
                    placeholder="Ex: 5 dias úteis"
                    value={supplierFormData.deliveryTime}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, deliveryTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierNotes">Observações</Label>
                <Textarea
                  id="supplierNotes"
                  placeholder="Condições de pagamento, frete, etc..."
                  value={supplierFormData.notes}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSupplierDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Adicionar Fornecedor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
