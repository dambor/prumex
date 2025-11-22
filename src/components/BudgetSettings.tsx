import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DollarSign, Save, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface BudgetSettingsProps {
  budget: number;
  expenses: any[];
  onBudgetUpdate: (newBudget: number) => void;
  projectName?: string;
  projectId: string;
}

const BUDGET_CATEGORIES = [
  'ADMINISTRAÇÃO',
  'SERVIÇOS PRELIMINARES',
  'SERVIÇOS GERAIS',
  'INFRA-ESTRUTURA',
  'SUPRA-ESTRUTURA',
  'ALVENARIA',
  'COBERTURAS E PROTEÇÕES',
  'REVESTIMENTOS, ELEMENTOS DECORATIVOS E PINTURA',
  'PAVIMENTAÇÃO',
  'INSTALAÇÕES E APARELHOS',
  'MÃO DE OBRA E ASSOCIADOS',
  'COMPLEMENTAÇÃO DA OBRA'
];

interface CategoryBudget {
  category: string;
  budget: number;
  spent: number;
  pending: number;
}

export function BudgetSettings({ budget, expenses, onBudgetUpdate, projectName, projectId }: BudgetSettingsProps) {
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Recarregar quando o projectId muda (troca de projeto)
  useEffect(() => {
    console.log('🔄 BudgetSettings: Project changed, reloading budget data...');
    console.log('  - New Project ID:', projectId);
    loadCategoryBudgets();
  }, [projectId]);

  const loadCategoryBudgets = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading category budgets from server...');
      console.log('  - Project indicator (budget prop):', budget);
      const response = await api.fetchSettings();
      console.log('  - Response:', response);
      
      const budgets = response?.categoryBudgets || {};
      console.log('  - Category budgets:', budgets);
      
      // Inicializar com valores salvos ou zero
      const initialBudgets: Record<string, string> = {};
      BUDGET_CATEGORIES.forEach(cat => {
        const value = budgets[cat] || 0;
        initialBudgets[cat] = value.toString();
      });
      
      setCategoryBudgets(initialBudgets);
      console.log('  ✅ Category budgets loaded successfully');
    } catch (error) {
      console.error('❌ Error loading category budgets:', error);
      console.error('  - Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Se o erro for de servidor não disponível, apenas usar valores padrão silenciosamente
      if (error instanceof Error && error.message.includes('não está respondendo')) {
        console.warn('⚠️ Server not available, using default budget values');
        // Não mostrar toast de erro para não assustar o usuário
      } else {
        // Apenas mostrar erro para outros tipos de erro
        toast.error('Erro ao carregar orçamentos. Usando valores padrão.');
      }
      
      // Inicializar com zeros em caso de erro
      const initialBudgets: Record<string, string> = {};
      BUDGET_CATEGORIES.forEach(cat => {
        initialBudgets[cat] = '0';
      });
      setCategoryBudgets(initialBudgets);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryData = (): CategoryBudget[] => {
    return BUDGET_CATEGORIES.map(category => {
      const categoryExpenses = expenses.filter(e => 
        e.category?.toUpperCase() === category || 
        e.phase?.toUpperCase() === category
      );

      const spent = categoryExpenses
        .filter(e => e.status === 'Pago')
        .reduce((sum, e) => {
          const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
          return sum + (amount || 0);
        }, 0);

      const pending = categoryExpenses
        .filter(e => e.status === 'Pendente')
        .reduce((sum, e) => {
          const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount;
          return sum + (amount || 0);
        }, 0);

      const budgetValue = parseCurrencyInput(categoryBudgets[category] || '0');

      return {
        category,
        budget: budgetValue,
        spent,
        pending
      };
    });
  };

  const handleBudgetChange = (category: string, value: string) => {
    // Permitir números, vírgula e ponto
    const sanitizedValue = value.replace(/[^\d.,]/g, '');
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: sanitizedValue
    }));
  };

  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    // Substituir vírgula por ponto e remover pontos de milhar
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      console.log('💾 BudgetSettings: Saving budget...');
      console.log('  - Project ID from prop:', projectId);
      console.log('  - Current Project ID in API:', api.getCurrentProjectId());
      
      // Converter para números
      const budgetsToSave: Record<string, number> = {};
      let totalBudget = 0;

      BUDGET_CATEGORIES.forEach(cat => {
        const value = parseCurrencyInput(categoryBudgets[cat] || '0');
        budgetsToSave[cat] = value;
        totalBudget += value;
      });

      console.log('  - Total Budget:', totalBudget);
      console.log('  - Category Budgets:', budgetsToSave);

      const result = await api.updateSettings({ 
        budget: totalBudget,
        categoryBudgets: budgetsToSave 
      });
      
      console.log('  ✅ Save successful, result:', result);
      
      onBudgetUpdate(totalBudget);
      toast.success('Orçamento atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      
      // Se o erro for de servidor não disponível, mostrar mensagem específica
      if (error instanceof Error && error.message.includes('não está respondendo')) {
        toast.error('Servidor não disponível', {
          description: 'Por favor, faça o deploy da Edge Function no Supabase para salvar os dados.'
        });
      } else {
        toast.error('Erro ao salvar orçamento');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const categoryData = calculateCategoryData();
  const totalBudgetCalculated = categoryData.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPending = categoryData.reduce((sum, cat) => sum + cat.pending, 0);
  const remaining = totalBudgetCalculated - totalSpent;
  const percentageUsed = totalBudgetCalculated > 0 ? (totalSpent / totalBudgetCalculated) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Orçamento por Categoria</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Defina o orçamento para cada etapa da construção
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Save className="size-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Orçamento'}
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orçamento Total</p>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(totalBudgetCalculated)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {remaining < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-800 font-medium">⚠️ Orçamento Excedido!</p>
            <p className="text-red-600 text-sm mt-1">
              O total comprometido ultrapassou o orçamento em {formatCurrency(Math.abs(remaining))}.
            </p>
          </div>
        </div>
      )}

      {remaining >= 0 && percentageUsed >= 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">⚠️ Atenção: Próximo do Limite</p>
            <p className="text-yellow-600 text-sm mt-1">
              Você já utilizou {percentageUsed.toFixed(1)}% do orçamento. Restam {formatCurrency(remaining)}.
            </p>
          </div>
        </div>
      )}

      {/* Categorias de Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamento por Etapa da Obra</CardTitle>
          <CardDescription>
            Defina valores específicos para cada categoria de serviço
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categoryData.map((cat, index) => {
            const committed = cat.spent + cat.pending;
            const categoryRemaining = cat.budget - committed;
            const categoryPercentage = cat.budget > 0 ? (committed / cat.budget) * 100 : 0;
            const isOverBudget = categoryRemaining < 0;
            const isNearLimit = categoryRemaining >= 0 && categoryPercentage >= 80;

            return (
              <div key={cat.category} className="space-y-3">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <Label htmlFor={`budget-${index}`} className="text-sm font-medium">
                    {cat.category}
                  </Label>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-xs text-gray-600">Gasto</div>
                      <div className="font-medium text-red-600">{formatCurrency(cat.spent)}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <div className="text-xs text-gray-600">Pendente</div>
                      <div className="font-medium text-yellow-600">{formatCurrency(cat.pending)}</div>
                    </div>
                  </div>

                  {/* Budget Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      R$
                    </span>
                    <Input
                      id={`budget-${index}`}
                      type="text"
                      value={categoryBudgets[cat.category] || '0'}
                      onChange={(e) => handleBudgetChange(cat.category, e.target.value)}
                      onBlur={() => {
                        const num = parseFloat(categoryBudgets[cat.category] || '0');
                        if (!isNaN(num)) {
                          handleBudgetChange(cat.category, num.toString());
                        }
                      }}
                      className="pl-8 text-right"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`budget-${index}`} className="text-sm font-medium">
                      {cat.category}
                    </Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-600">
                        Gasto: <span className="font-medium text-red-600">{formatCurrency(cat.spent)}</span>
                      </div>
                      <div className="text-gray-600">
                        Pendente: <span className="font-medium text-yellow-600">{formatCurrency(cat.pending)}</span>
                      </div>
                    </div>
                    <div className="relative w-48">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        R$
                      </span>
                      <Input
                        id={`budget-${index}`}
                        type="text"
                        value={categoryBudgets[cat.category] || '0'}
                        onChange={(e) => handleBudgetChange(cat.category, e.target.value)}
                        onBlur={() => {
                          const num = parseFloat(categoryBudgets[cat.category] || '0');
                          if (!isNaN(num)) {
                            handleBudgetChange(cat.category, num.toString());
                          }
                        }}
                        className="pl-8 text-right"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Barra de progresso da categoria */}
                {cat.budget > 0 && (
                  <div className="space-y-1">
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full transition-all duration-500 ${
                          isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-600">
                      <span>
                        {categoryPercentage.toFixed(1)}% utilizado
                      </span>
                      <span className={categoryRemaining < 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {categoryRemaining >= 0 ? 'Disponível: ' : 'Excedido: '}
                        {formatCurrency(Math.abs(categoryRemaining))}
                      </span>
                    </div>
                  </div>
                )}

                {index < categoryData.length - 1 && <div className="border-t" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Barra de Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Utilização Geral do Orçamento</CardTitle>
          <CardDescription>
            Progresso consolidado de todas as categorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de progresso */}
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min((totalSpent / totalBudgetCalculated) * 100, 100)}%` }}
              />
              <div
                className="absolute h-full bg-yellow-500 transition-all duration-500"
                style={{ 
                  left: `${Math.min((totalSpent / totalBudgetCalculated) * 100, 100)}%`,
                  width: `${Math.min((totalPending / totalBudgetCalculated) * 100, 100 - (totalSpent / totalBudgetCalculated) * 100)}%` 
                }}
              />
            </div>

            {/* Legenda - Mobile */}
            <div className="md:hidden space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Gasto</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Pendente</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(totalPending)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Disponível</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(Math.max(remaining, 0))}</span>
              </div>
            </div>

            {/* Legenda - Desktop */}
            <div className="hidden md:flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Gasto: {formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Pendente: {formatCurrency(totalPending)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Disponível: {formatCurrency(Math.max(remaining, 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}