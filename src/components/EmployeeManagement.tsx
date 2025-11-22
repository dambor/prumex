import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, UserPlus, Users, Pencil, Trash2, Search } from 'lucide-react';
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
import { toast } from 'sonner';

export interface Employee {
  id: string;
  name: string;
  role: string;
  document: string; // CPF
  phone: string;
  salary: number;
  startDate: string;
  status: 'Ativo' | 'Inativo';
  notes?: string;
}

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  onUpdateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

export function EmployeeManagement({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    document: '',
    phone: '',
    salary: '',
    startDate: '',
    status: 'Ativo' as 'Ativo' | 'Inativo',
    notes: '',
  });

  const activeEmployees = employees.filter(e => e.status === 'Ativo');
  const totalMonthlySalaries = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.document.includes(searchTerm)
  );

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      role: '',
      document: '',
      phone: '',
      salary: '',
      startDate: '',
      status: 'Ativo',
      notes: '',
    });
    setEditingEmployee(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (employee: Employee) => {
    setFormData({
      name: employee.name,
      role: employee.role,
      document: employee.document,
      phone: employee.phone,
      salary: String(employee.salary),
      startDate: employee.startDate,
      status: employee.status,
      notes: employee.notes || '',
    });
    setEditingEmployee(employee);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const employeeData = {
        name: formData.name,
        role: formData.role,
        document: formData.document,
        phone: formData.phone,
        salary: parseFloat(formData.salary),
        startDate: formData.startDate,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, employeeData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await onAddEmployee(employeeData);
        toast.success('Funcionário adicionado com sucesso!');
      }

      setIsAddDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Erro ao salvar funcionário. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) {
      return;
    }

    try {
      await onDeleteEmployee(id);
      toast.success('Funcionário removido com sucesso!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erro ao remover funcionário. Tente novamente.');
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Gestão de Pessoal</h1>
          <p className="text-gray-600">Gerencie os funcionários da obra</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <UserPlus className="size-4 mr-2" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Funcionários</CardTitle>
            <Users className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{employees.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {activeEmployees.length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Folha de Pagamento Mensal</CardTitle>
            <UserPlus className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              R$ {totalMonthlySalaries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {activeEmployees.length} funcionários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Salário Médio</CardTitle>
            <Users className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              R$ {activeEmployees.length > 0 
                ? (totalMonthlySalaries / activeEmployees.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : '0,00'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Média salarial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, cargo ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-gray-500 mb-4">
                  Adicione funcionários para gerenciar a equipe da obra
                </p>
              )}
              {!searchTerm && (
                <Button onClick={handleOpenAddDialog} variant="outline">
                  <UserPlus className="size-4 mr-2" />
                  Adicionar Primeiro Funcionário
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCPF(employee.document)}
                    </TableCell>
                    <TableCell>{formatPhone(employee.phone)}</TableCell>
                    <TableCell className="text-right">
                      R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'Ativo' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(employee)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do funcionário
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Cargo *</Label>
                  <Input
                    id="role"
                    placeholder="Pedreiro, Servente, etc."
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document">CPF *</Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário (R$) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Admissão *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Ativo' | 'Inativo') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  placeholder="Informações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                {editingEmployee ? 'Salvar Alterações' : 'Adicionar Funcionário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
