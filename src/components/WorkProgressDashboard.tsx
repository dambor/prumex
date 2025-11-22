import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Users,
  Wrench,
  MoreHorizontal,
  Target,
  Activity
} from 'lucide-react';
import type { Expense } from '../App';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface WorkProgressDashboardProps {
  expenses: Expense[];
  budget: number;
}

interface Phase {
  id: string;
  name: string;
  progress: number;
  budget: number;
  spent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
}

export function WorkProgressDashboard({ expenses, budget }: WorkProgressDashboardProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoadingPhases, setIsLoadingPhases] = useState(true);

  // Carregar fases do banco ao montar o componente
  useEffect(() => {
    loadPhases();
  }, []);

  const loadPhases = async () => {
    try {
      setIsLoadingPhases(true);
      const loadedPhases = await api.fetchPhases();
      
      if (loadedPhases.length > 0) {
        setPhases(loadedPhases);
      } else {
        // Se não houver fases salvas, inicializar com fases padrão
        const defaultPhases: Phase[] = [
          {
            id: '1',
            name: 'Fundação',
            progress: 0,
            budget: 15000,
            spent: 0,
            status: 'not_started',
          },
          {
            id: '2',
            name: 'Estrutura',
            progress: 0,
            budget: 25000,
            spent: 0,
            status: 'not_started',
          },
          {
            id: '3',
            name: 'Alvenaria',
            progress: 0,
            budget: 18000,
            spent: 0,
            status: 'not_started',
          },
          {
            id: '4',
            name: 'Instalações Elétricas',
            progress: 0,
            budget: 12000,
            spent: 0,
            status: 'not_started',
          },
          {
            id: '5',
            name: 'Instalações Hidráulicas',
            progress: 0,
            budget: 10000,
            spent: 0,
            status: 'not_started',
          },
          {
            id: '6',
            name: 'Acabamento',
            progress: 0,
            budget: 20000,
            spent: 0,
            status: 'not_started',
          },
        ];
        setPhases(defaultPhases);
        // Salvar fases padrão no banco
        await api.savePhases(defaultPhases);
      }
    } catch (error) {
      console.error('Error loading phases:', error);
      toast.error('Erro ao carregar fases da obra');
    } finally {
      setIsLoadingPhases(false);
    }
  };

  const handleSavePhases = async () => {
    try {
      await api.savePhases(phases);
      toast.success('Fases da obra salvas com sucesso!');
    } catch (error) {
      console.error('Error saving phases:', error);
      toast.error('Erro ao salvar fases da obra');
    }
  };

  // Calcular métricas
  const totalSpent = expenses
    .filter(e => e.status === 'Pago')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = expenses
    .filter(e => e.status === 'Pendente')
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetUsed = (totalSpent / budget) * 100;
  const overBudget = totalSpent > budget;

  // Gastos por categoria
  const categoryData = [
    {
      name: 'Material',
      value: expenses
        .filter(e => e.category === 'Material' && e.status === 'Pago')
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: 'Mão de Obra',
      value: expenses
        .filter(e => e.category === 'Mão de Obra' && e.status === 'Pago')
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: 'Equipamento',
      value: expenses
        .filter(e => e.category === 'Equipamento' && e.status === 'Pago')
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: 'Outros',
      value: expenses
        .filter(e => e.category === 'Outros' && e.status === 'Pago')
        .reduce((sum, e) => sum + e.amount, 0),
    },
  ].filter(item => item.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Gastos ao longo do tempo (últimos 6 meses)
  const monthlyData = (() => {
    const months: { [key: string]: number } = {};
    expenses
      .filter(e => e.status === 'Pago' && e.paidDate)
      .forEach(e => {
        const month = new Date(e.paidDate!).toLocaleDateString('pt-BR', { month: 'short' });
        months[month] = (months[month] || 0) + e.amount;
      });

    return Object.entries(months).map(([month, amount]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      valor: amount,
    }));
  })();

  // Progresso geral da obra
  const overallProgress = phases.reduce((sum, p) => sum + p.progress, 0) / phases.length;

  // Alertas
  const alerts = [
    ...(overBudget ? [{
      type: 'error' as const,
      message: `Orçamento ultrapassado em R$ ${(totalSpent - budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }] : []),
    ...(budgetUsed > 80 && !overBudget ? [{
      type: 'warning' as const,
      message: `${budgetUsed.toFixed(0)}% do orçamento já utilizado`
    }] : []),
    ...(totalPending > budget * 0.3 ? [{
      type: 'warning' as const,
      message: `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendentes de pagamento`
    }] : []),
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Material':
        return <Package className="size-4" />;
      case 'Mão de Obra':
        return <Users className="size-4" />;
      case 'Equipamento':
        return <Wrench className="size-4" />;
      default:
        return <MoreHorizontal className="size-4" />;
    }
  };

  const getPhaseStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Progresso Geral</CardTitle>
            <Activity className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {overallProgress.toFixed(0)}%
            </div>
            <Progress value={overallProgress} className="mt-2" />
            <p className="text-xs text-gray-600 mt-2">
              {phases.filter(p => p.status === 'completed').length} de {phases.length} fases concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Gasto</CardTitle>
            <DollarSign className="size-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {(totalSpent / 1000).toFixed(1)}k
            </div>
            <div className="flex items-center gap-1 text-xs mt-2">
              {overBudget ? (
                <>
                  <TrendingUp className="size-3 text-red-600" />
                  <span className="text-red-600">
                    {((totalSpent / budget - 1) * 100).toFixed(1)}% acima
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="size-3 text-green-600" />
                  <span className="text-green-600">
                    {budgetUsed.toFixed(1)}% do orçamento
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendente</CardTitle>
            <Clock className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {(totalPending / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {expenses.filter(e => e.status === 'Pendente').length} despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Orçamento Restante</CardTitle>
            <Target className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {((budget - totalSpent) / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-gray-600 mt-2">
              de R$ {(budget / 1000).toFixed(1)}k total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              <AlertTriangle className="size-4 flex-shrink-0" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="phases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phases">Fases da Obra</TabsTrigger>
          <TabsTrigger value="expenses">Análise de Gastos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Fases da Obra */}
        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso por Fase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getPhaseStatusColor(phase.status)}`} />
                      <div>
                        <p className="font-medium text-sm">{phase.name}</p>
                        <p className="text-xs text-gray-600">
                          R$ {phase.spent.toLocaleString('pt-BR')} de R$ {phase.budget.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{phase.progress}%</p>
                      {phase.status === 'in_progress' && phase.startDate && (
                        <p className="text-xs text-gray-600">
                          Início: {new Date(phase.startDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {phase.status === 'completed' && phase.endDate && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Concluída
                        </p>
                      )}
                    </div>
                  </div>
                  <Progress value={phase.progress} />
                  {phase.spent > phase.budget && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Orçamento ultrapassado
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Button
            className="mt-4"
            onClick={handleSavePhases}
            disabled={isLoadingPhases}
          >
            {isLoadingPhases ? 'Salvando...' : 'Salvar Fases'}
          </Button>
        </TabsContent>

        {/* Análise de Gastos */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gastos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {categoryData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{item.name}</p>
                            <p className="text-sm font-medium">
                              R$ {(item.value / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                    Nenhuma despesa paga ainda
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gastos Mensais */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) =>
                          `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        }
                      />
                      <Bar dataKey="valor" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                    Nenhum dado disponível ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Maiores Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Maiores Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses
                  .filter(e => e.status === 'Pago')
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-lg p-2">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{expense.description}</p>
                          <p className="text-xs text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {expense.paidDate ? new Date(expense.paidDate).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                {expenses.filter(e => e.status === 'Pago').length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhuma despesa paga ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses
                  .filter(e => e.status === 'Pendente')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 10)
                  .map((expense, index, arr) => {
                    const isOverdue = new Date(expense.dueDate) < new Date();
                    const daysUntil = Math.ceil(
                      (new Date(expense.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={expense.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isOverdue ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                          />
                          {index < arr.length - 1 && (
                            <div className="w-px h-full bg-gray-300 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{expense.description}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {expense.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOverdue ? 'text-red-600' : 'text-gray-600'
                                }`}
                              >
                                {isOverdue
                                  ? `Atrasado ${Math.abs(daysUntil)} dias`
                                  : daysUntil === 0
                                  ? 'Vence hoje'
                                  : `${daysUntil} dias`}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Vencimento: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {expenses.filter(e => e.status === 'Pendente').length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhuma despesa pendente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}