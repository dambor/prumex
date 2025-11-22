import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DollarSign, Clock, CheckCircle, TrendingUp, Plus, FileSpreadsheet, RefreshCw, Bug, Trash2 } from 'lucide-react';
import type { Expense } from '../App';
import * as api from '../utils/api';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  budget?: number;
  onAddExpense: () => void;
  onImportExcel: () => void;
  onRefresh?: () => void;
}

export function Dashboard({ expenses, budget, onAddExpense, onImportExcel, onRefresh }: DashboardProps) {
  // DEBUG: Verificar tipos dos valores
  console.log('📊 Dashboard - Total de despesas:', expenses.length);
  const pagas = expenses.filter(e => e.status === 'Pago');
  console.log('📊 Dashboard - Despesas pagas:', pagas.length);
  if (pagas.length > 0) {
    console.log('📊 Dashboard - Primeira despesa paga:', {
      description: pagas[0].description,
      amount: pagas[0].amount,
      amountType: typeof pagas[0].amount,
      status: pagas[0].status
    });
  }
  
  const totalSpent = expenses
    .filter(e => e.status === 'Pago')
    .reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
      console.log(`  + ${e.description}: R$ ${amount} (type: ${typeof e.amount})`);
      return sum + (amount || 0);
    }, 0);
  
  console.log('📊 Dashboard - Total Gasto calculado:', totalSpent);
  
  const totalPending = expenses
    .filter(e => e.status === 'Pendente')
    .reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
      return sum + (amount || 0);
    }, 0);
  
  const totalExpenses = expenses.length;
  const paidExpenses = expenses.filter(e => e.status === 'Pago').length;
  const budgetRemaining = budget - totalSpent;
  const budgetUsed = (totalSpent / budget) * 100;

  // Cores profissionais
  const COLORS = {
    primary: '#0ea5e9',    // Sky blue
    success: '#14b8a6',    // Teal
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    secondary: '#8b5cf6',  // Purple
    neutral: '#64748b'     // Slate
  };

  // Dados para gráfico de pizza - Distribuição do Orçamento
  const budgetData = [
    { name: 'Gasto', value: totalSpent, color: COLORS.danger },
    { name: 'Pendente', value: totalPending, color: COLORS.warning },
    { name: 'Disponível', value: Math.max(0, budgetRemaining - totalPending), color: COLORS.success }
  ].filter(item => item.value > 0);

  // Dados para gráfico de barras - Despesas por Categoria
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Outros';
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    
    if (!acc[category]) {
      acc[category] = { category, pago: 0, pendente: 0 };
    }
    
    if (expense.status === 'Pago') {
      acc[category].pago += amount || 0;
    } else {
      acc[category].pendente += amount || 0;
    }
    
    return acc;
  }, {} as Record<string, { category: string; pago: number; pendente: number }>);

  const categoryChartData = Object.values(categoryData)
    .sort((a, b) => (b.pago + b.pendente) - (a.pago + a.pendente))
    .slice(0, 5); // Top 5 categorias

  // Dados para gráfico de área - Evolução Temporal
  const timelineData = expenses
    .filter(e => e.paidDate)
    .sort((a, b) => new Date(a.paidDate!).getTime() - new Date(b.paidDate!).getTime())
    .reduce((acc, expense) => {
      const date = new Date(expense.paidDate!).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.total += amount || 0;
        existing.acumulado = acc[acc.length - 1]?.acumulado || 0 + (amount || 0);
      } else {
        const previousTotal = acc.length > 0 ? acc[acc.length - 1].acumulado : 0;
        acc.push({
          date,
          total: amount || 0,
          acumulado: previousTotal + (amount || 0)
        });
      }
      
      return acc;
    }, [] as { date: string; total: number; acumulado: number }[])
    .slice(-8); // Últimos 8 pontos

  // Status das contas
  const statusData = [
    { name: 'Pagas', value: paidExpenses, color: COLORS.success },
    { name: 'Pendentes', value: totalExpenses - paidExpenses, color: COLORS.warning }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border text-xs">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Cards compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Total Gasto</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  R$ {(totalSpent / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <DollarSign className="size-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600">A Pagar</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  R$ {(totalPending / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="size-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Contas Pagas</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {paidExpenses}/{totalExpenses}
                </p>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg">
                <CheckCircle className="size-4 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Orçamento</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  R$ {(budget / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="p-2 bg-sky-50 rounded-lg">
                <TrendingUp className="size-4 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Gráfico 1: Distribuição do Orçamento (Donut) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centro do donut */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {budgetUsed.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">usado</div>
              </div>
            </div>
            {/* Legenda compacta */}
            <div className="flex justify-center gap-4 mt-3 text-xs">
              {budgetData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Despesas por Categoria (Barras) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Categorias</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="h-[220px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      width={100}
                      tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                    />
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <Bar dataKey="pago" stackId="a" fill={COLORS.success} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pendente" stackId="a" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Sem dados
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.success }}></div>
                <span className="text-gray-600">Pago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.warning }}></div>
                <span className="text-gray-600">Pendente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3: Evolução dos Gastos (Área) - Largura Total */}
      <div className="grid grid-cols-1 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evolução de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="h-[220px]">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#d1d5db" 
                      fontSize={9}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#d1d5db" 
                      fontSize={9}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="acumulado" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAcumulado)"
                      name="Acumulado"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Sem pagamentos
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 mt-2 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: COLORS.primary }}></div>
                <span className="text-gray-600">Gasto Acumulado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}