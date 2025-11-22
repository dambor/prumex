import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Building2,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import type { Expense } from '../App';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members?: Array<{
    email: string;
    name: string;
    role: 'Proprietário' | 'Contratante';
  }>;
}

interface UnifiedDashboardProps {
  projects: Project[];
  allExpenses: { projectId: string; expenses: Expense[] }[];
  allBudgets: { projectId: string; budget: number }[];
  onSelectProject: (project: Project) => void;
  currentUserRole: 'Proprietário' | 'Contratante';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function UnifiedDashboard({ 
  projects, 
  allExpenses, 
  allBudgets,
  onSelectProject,
  currentUserRole
}: UnifiedDashboardProps) {
  
  // Calcular totais gerais
  const totalProjects = projects.length;
  const activeProjects = projects.length; // Todos são ativos por enquanto
  
  // Calcular despesas totais consolidadas
  let totalSpentAll = 0;
  let totalPendingAll = 0;
  let totalExpensesCount = 0;
  
  allExpenses.forEach(({ expenses }) => {
    expenses.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      totalExpensesCount++;
      if (expense.status === 'Pago') {
        totalSpentAll += amount || 0;
      } else {
        totalPendingAll += amount || 0;
      }
    });
  });
  
  // Calcular orçamento total
  const totalBudget = allBudgets.reduce((sum, { budget }) => sum + budget, 0);
  const totalRemaining = totalBudget - totalSpentAll;
  const percentSpent = totalBudget > 0 ? (totalSpentAll / totalBudget) * 100 : 0;
  
  // Dados por projeto
  const projectsData = projects.map(project => {
    const projectExpenses = allExpenses.find(e => e.projectId === project.id)?.expenses || [];
    const projectBudget = allBudgets.find(b => b.projectId === project.id)?.budget || 0;
    
    const spent = projectExpenses
      .filter(e => e.status === 'Pago')
      .reduce((sum, e) => {
        const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
        return sum + (amount || 0);
      }, 0);
    
    const pending = projectExpenses
      .filter(e => e.status === 'Pendente')
      .reduce((sum, e) => {
        const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
        return sum + (amount || 0);
      }, 0);
    
    const remaining = projectBudget - spent;
    const percentUsed = projectBudget > 0 ? (spent / projectBudget) * 100 : 0;
    
    return {
      project,
      spent,
      pending,
      remaining,
      budget: projectBudget,
      percentUsed,
      totalExpenses: projectExpenses.length,
      paidExpenses: projectExpenses.filter(e => e.status === 'Pago').length,
      pendingExpenses: projectExpenses.filter(e => e.status === 'Pendente').length
    };
  });
  
  // Dados para gráfico de pizza - despesas por projeto
  const pieData = projectsData
    .filter(p => p.spent > 0)
    .map((p, index) => ({
      name: p.project.name,
      value: p.spent,
      color: COLORS[index % COLORS.length]
    }));
  
  // Dados para gráfico de barras - comparação de projetos
  const barData = projectsData.map((p, index) => ({
    name: p.project.name.length > 15 ? p.project.name.substring(0, 15) + '...' : p.project.name,
    Gasto: p.spent,
    Pendente: p.pending,
    Orçamento: p.budget
  }));
  
  // Projetos com alerta (acima de 80% do orçamento)
  const projectsWithAlert = projectsData.filter(p => p.percentUsed > 80);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-3">Visão Unificada</h1>
          <p className="text-lg text-blue-100 mb-6">
            Acesso imediato a todas as despesas de todos os projetos em uma única dashboard.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="size-6" />
              <div>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <div className="text-sm text-blue-100">Projetos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-6" />
              <div>
                <div className="text-2xl font-bold">{totalExpensesCount}</div>
                <div className="text-sm text-blue-100">Despesas</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="size-6" />
              <div>
                <div className="text-2xl font-bold">
                  R$ {totalSpentAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-blue-100">Total Gasto</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Global */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Orçamento Total</CardTitle>
            <DollarSign className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Soma de todos os projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gasto</CardTitle>
            <TrendingUp className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalSpentAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {percentSpent.toFixed(1)}% do orçamento total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contas Pendentes</CardTitle>
            <Clock className="size-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {totalPendingAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Disponível</CardTitle>
            <CheckCircle className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Restante para usar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {projectsWithAlert.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="size-5" />
              Projetos Requerem Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectsWithAlert.map(p => (
                <div key={p.project.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <div className="font-medium">{p.project.name}</div>
                    <div className="text-sm text-gray-600">
                      {p.percentUsed.toFixed(1)}% do orçamento utilizado
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {p.percentUsed >= 100 ? 'Excedido' : 'Crítico'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="size-5" />
              Distribuição de Gastos por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhuma despesa paga ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Comparação de Projetos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Comparação por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Bar dataKey="Gasto" fill="#10b981" />
                  <Bar dataKey="Pendente" fill="#f59e0b" />
                  <Bar dataKey="Orçamento" fill="#3b82f6" opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Todos os Projetos ({totalProjects})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectsData.map((p, index) => (
              <div 
                key={p.project.id}
                className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectProject(p.project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{p.project.name}</h3>
                      {p.percentUsed >= 100 && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Orçamento Excedido
                        </Badge>
                      )}
                      {p.percentUsed >= 80 && p.percentUsed < 100 && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{p.project.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(p.project);
                    }}
                  >
                    Ver Detalhes →
                  </Button>
                </div>
                
                {/* Métricas do Projeto */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Orçamento</div>
                    <div className="font-semibold text-sm">
                      R$ {p.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gasto</div>
                    <div className="font-semibold text-sm text-green-600">
                      R$ {p.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Pendente</div>
                    <div className="font-semibold text-sm text-orange-600">
                      R$ {p.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Restante</div>
                    <div className="font-semibold text-sm text-purple-600">
                      R$ {p.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Despesas</div>
                    <div className="font-semibold text-sm">
                      {p.paidExpenses}/{p.totalExpenses} pagas
                    </div>
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      p.percentUsed >= 100 ? 'bg-red-500' :
                      p.percentUsed >= 80 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(p.percentUsed, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {p.percentUsed.toFixed(1)}% do orçamento utilizado
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
