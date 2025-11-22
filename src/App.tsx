import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import * as api from './utils/api';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Dashboard } from './components/Dashboard';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseDialog } from './components/AddExpenseDialog';
import { ImportExcelDialog } from './components/ImportExcelDialog';
import { AuthPage } from './components/AuthPage';
import { AuthDialog } from './components/AuthDialog';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectManagement } from './components/ProjectManagement';
import { WorkProgressDashboard } from './components/WorkProgressDashboard';
import { BudgetSettings } from './components/BudgetSettings';
import { UserSettingsDialog } from './components/UserSettingsDialog';
import { Landing } from './components/Landing';
import { EmployeeManagement, type Employee } from './components/EmployeeManagement';
import { QuotationManagement, type Quotation } from './components/QuotationManagement';
import { DocumentManagement, type Document } from './components/DocumentManagement';
import { PhotoGallery, type Photo } from './components/PhotoGallery';
import { GoogleSetupDialog } from './components/GoogleSetupDialog';
import { UserMenu } from './components/UserMenu';
import { TopBar } from './components/TopBar';
import { Button } from './components/ui/button';

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

export interface Expense {
  id: string;
  description: string;
  category: 'ADMINISTRAÇÃO' | 'SERVIÇOS PRELIMINARES' | 'SERVIÇOS GERAIS' | 'INFRA-ESTRUTURA' | 'SUPRA-ESTRUTURA' | 
             'ALVENARIA' | 'COBERTURAS E PROTEÇÕES' | 'REVESTIMENTOS, ELEMENTOS DECORATIVOS E PINTURA' | 
             'PAVIMENTAÇÃO' | 'INSTALAÇÕES E APARELHOS' | 'MÃO DE OBRA E ASSOCIADOS' | 
             'COMPLEMENTAÇÃO DA OBRA' | 'Material' | 'Mão de Obra' | 'Equipamento' | 'Outros';
  amount: number;
  dueDate: string;
  status: 'Pendente' | 'Pago';
  addedBy: 'Proprietário' | 'Contratante';
  notes?: string;
  invoiceUrl?: string;
  invoiceFile?: string;
  boletoUrl?: string;
  boletoFile?: string;
  pixKey?: string;
  receiptUrl?: string;
  receiptFile?: string;
  paidDate?: string;
  paymentMethod?: string;
  phase?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Proprietário' | 'Contratante';
}

export default function App() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isGoogleSetupDialogOpen, setIsGoogleSetupDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'progress' | 'budget' | 'employees' | 'quotations' | 'expenses' | 'documents' | 'photos'>('overview');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allProjectsExpenses, setAllProjectsExpenses] = useState<{ projectId: string; expenses: Expense[] }[]>([]);
  const [allProjectsBudgets, setAllProjectsBudgets] = useState<{ projectId: string; budget: number }[]>([]);
  const [isUnifiedView, setIsUnifiedView] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [budget, setBudget] = useState(0); // Começa em 0, não 500000
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Verificar sessão existente
  useEffect(() => {
    console.log('🔵 Initial useEffect - Starting session check...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Hash:', window.location.hash);
    console.log('📍 Search:', window.location.search);
    
    checkSession();

    // Listener para mudanças na autenticação (OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);
      console.log('  - Session:', session ? 'Present' : 'None');
      console.log('  - User:', session?.user?.email);
      console.log('  - Access Token:', session?.access_token ? 'Present' : 'None');
      console.log('  - Full session object:', JSON.stringify(session, null, 2));
      console.log('  - Event type:', event);
      console.log('  - Current URL after event:', window.location.href);
      console.log('  - Current hash after event:', window.location.hash);
      console.log('  - Current search after event:', window.location.search);
      
      if (event === 'SIGNED_IN' && session?.access_token) {
        console.log('✅ User signed in via OAuth');
        console.log('  - Access token:', session.access_token.substring(0, 20) + '...');
        api.setAccessToken(session.access_token);
        
        try {
          // Tentar buscar dados completos do usuário do backend
          console.log('  - Fetching user data from backend...');
          const userData = await api.fetchUserData();
          console.log('  ✅ User data received:', userData);
          setUser(userData);
          toast.success('Login realizado com sucesso!');
        } catch (error) {
          console.warn('Could not fetch user data from backend, using session data:', error);
          // Fallback: usar dados da sessão do Supabase
          if (session.user) {
            // Para OAuth, se não houver dados no backend, criar automaticamente
            const newUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              role: 'Proprietário' as const
            };
            
            setUser(newUser);
            
            // Tentar criar o usuário no backend para futuras sessões
            try {
              await api.createUserFromOAuth(newUser);
            } catch (createError) {
              console.warn('Could not create user in backend:', createError);
            }
            
            toast.success('Bem-vindo! Login realizado com sucesso!');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carregar projetos e selecionar o primeiro quando usuário está logado
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Carregar despesas quando projeto atual muda
  useEffect(() => {
    if (user && currentProject) {
      loadExpenses();
      loadSettings();
    }
  }, [currentProject]);

  const checkSession = async () => {
    try {
      console.log('🔍 checkSession - Checking for existing session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error getting session:', sessionError);
        setConnectionStatus('error');
        setIsLoading(false);
        return;
      }
      
      console.log('  - Session exists:', !!session);
      
      if (session?.access_token) {
        console.log('  - Access token found, setting in API...');
        api.setAccessToken(session.access_token);
        
        try {
          // Buscar dados do usuário (backend agora busca do Auth se não estiver no KV)
          console.log('  - Fetching user data from backend...');
          const userData = await api.fetchUserData();
          console.log('  ✅ User data received:', userData.email);
          setUser(userData);
          
          setConnectionStatus('connected');
        } catch (fetchError) {
          console.warn('⚠️ Backend not available - using session data');
          
          // Usar dados da sessão do Supabase como fallback
          const fallbackUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            role: (session.user.user_metadata?.role || 'Proprietário') as 'Proprietário' | 'Contratante'
          };
          
          setUser(fallbackUser);
          setConnectionStatus('error'); // Indica que está em modo offline
        }
      } else {
        console.log('  ℹ️ No active session found');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      console.error('  - Error message:', error instanceof Error ? error.message : String(error));
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await api.fetchProjects();
      setProjects(data);
      if (data.length > 0) {
        setCurrentProject(data[0]);
        api.setCurrentProjectId(data[0].id); // Define o primeiro projeto como atual
      }
      
      // Carregar dados unificados de todos os projetos
      await loadAllProjectsData(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      if (error instanceof Error && error.message.includes('não está respondendo')) {
        // Servidor não disponível - não fazer nada, usuário já foi informado
        setProjects([]);
      } else {
        setConnectionStatus('error');
      }
    }
  };

  const loadAllProjectsData = async (projectsList: Project[]) => {
    try {
      console.log('🔄 Loading unified data for all projects...');
      
      const allExpensesData: { projectId: string; expenses: Expense[] }[] = [];
      const allBudgetsData: { projectId: string; budget: number }[] = [];
      
      for (const project of projectsList) {
        try {
          // Temporariamente definir o projeto para buscar seus dados
          api.setCurrentProjectId(project.id);
          
          // Buscar despesas do projeto
          const projectExpenses = await api.fetchExpenses();
          allExpensesData.push({
            projectId: project.id,
            expenses: projectExpenses
          });
          
          // Buscar configurações/orçamento do projeto
          const settings = await api.fetchSettings();
          let totalBudget = 0;
          if (settings.categoryBudgets && typeof settings.categoryBudgets === 'object') {
            totalBudget = Object.values(settings.categoryBudgets).reduce((sum: number, val) => {
              const value = typeof val === 'string' ? parseFloat(val) : val;
              return sum + (value || 0);
            }, 0);
          }
          
          allBudgetsData.push({
            projectId: project.id,
            budget: totalBudget
          });
        } catch (error) {
          console.warn(`Failed to load data for project ${project.id}:`, error);
        }
      }
      
      setAllProjectsExpenses(allExpensesData);
      setAllProjectsBudgets(allBudgetsData);
      
      // Restaurar o projeto atual
      if (currentProject) {
        api.setCurrentProjectId(currentProject.id);
      } else if (projectsList.length > 0) {
        api.setCurrentProjectId(projectsList[0].id);
      }
      
      console.log('✅ Unified data loaded:', {
        projects: projectsList.length,
        expenses: allExpensesData.reduce((sum, p) => sum + p.expenses.length, 0),
        totalBudget: allBudgetsData.reduce((sum, p) => sum + p.budget, 0)
      });
    } catch (error) {
      console.error('Error loading unified data:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      console.log('🔄 Loading expenses from database...');
      console.log('  - User:', user?.email);
      console.log('  - Token:', api.getAccessToken() ? 'Present' : 'Missing');
      
      const data = await api.fetchExpenses();
      
      console.log(`✅ Loaded ${data.length} expenses from database:`, data);
      console.log('  - Setting expenses state with:', data);
      setExpenses(data);
      console.log('  - State updated');
      setConnectionStatus('connected');
      
      // Forçar re-render logando o estado após um tick
      setTimeout(() => {
        console.log('  - Current expenses in state:', expenses.length);
      }, 100);
    } catch (error) {
      console.error('❌ Error loading expenses:', error);
      setConnectionStatus('error');
      // Não mostrar erro se for apenas falta de dados
      setExpenses([]);
    }
  };

  const testKVStore = async () => {
    try {
      console.log('🧪 Testing KV Store connection...');
      const result = await api.testKVStore();
      console.log('KV Store test result:', result);
      
      if (result.success) {
        toast.success(`✅ KV Store funcionando! ${result.expensesCount} despesas encontradas`);
        console.log('Expenses keys in KV:', result.expensesKeys);
        
        // Recarregar despesas após teste
        await loadExpenses();
      } else {
        toast.error('❌ KV Store com erro: ' + result.error);
      }
    } catch (error) {
      console.error('KV Store test failed:', error);
      toast.error('Erro ao testar KV Store');
    }
  };

  const diagnoseExpenses = async () => {
    try {
      console.log('🔍 Diagnosing expenses...');
      console.log('  - Current project:', currentProject);
      console.log('  - Current project ID:', api.getCurrentProjectId());
      
      const allData = await api.getAllProjectsExpenses();
      console.log('All expenses in database:', allData);
      
      toast.success(
        `Total: ${allData.total} despesas | ` +
        `Projetos: ${allData.projects.join(', ') || 'Nenhum'} | ` +
        `Projeto atual: ${currentProject?.name || 'Nenhum'}`
      );
      
      // Mostrar detalhes por projeto
      Object.entries(allData.byProject).forEach(([projectId, expenses]: [string, any]) => {
        console.log(`  Project ${projectId}: ${expenses.length} despesas`);
      });
    } catch (error) {
      console.error('Error diagnosing expenses:', error);
      toast.error('Erro ao diagnosticar despesas');
    }
  };

  const migrateExpensesToCurrentProject = async () => {
    try {
      if (!currentProject) {
        toast.error('Nenhum projeto selecionado');
        return;
      }

      console.log('🔄 Migrating expenses to project:', currentProject.id);
      
      const result = await api.migrateExpensesToProject(currentProject.id);
      
      if (result.success) {
        toast.success(`✅ ${result.migratedCount} despesas migradas para "${currentProject.name}"!`);
        // Recarregar as despesas
        await loadExpenses();
      } else {
        toast.error('Erro ao migrar despesas');
      }
    } catch (error) {
      console.error('Error migrating expenses:', error);
      toast.error('Erro ao migrar despesas');
    }
  };

  const loadSettings = async () => {
    try {
      console.log('📥 loadSettings: Loading settings...');
      const settings = await api.fetchSettings();
      console.log('  - Settings received:', settings);
      console.log('  - Budget from settings:', settings.budget);
      console.log('  - Category budgets:', settings.categoryBudgets);
      
      // Calcular o budget total a partir dos categoryBudgets
      let totalFromCategories = 0;
      if (settings.categoryBudgets && typeof settings.categoryBudgets === 'object') {
        totalFromCategories = Object.values(settings.categoryBudgets).reduce((sum: number, val) => {
          const value = typeof val === 'string' ? parseFloat(val) : val;
          return sum + (value || 0);
        }, 0);
      }
      
      console.log('  - Total calculated from categories:', totalFromCategories);
      
      // Usar o orçamento calculado das categorias
      // Se não houver categorias definidas, o orçamento é 0 (não definido)
      setBudget(totalFromCategories);
      
      console.log('  - Final budget to use:', totalFromCategories);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      // Em caso de erro, orçamento é 0
      setBudget(0);
    }
  };

  // Função helper para resetar configurações de todos os projetos (executar no console se necessário)
  const resetAllProjectSettings = async () => {
    try {
      console.log('🧹 Resetting all project settings...');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c4e36501/settings/reset-all-projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }
      
      const result = await response.json();
      console.log('✅ Settings reset result:', result);
      toast.success(result.message || 'Configurações resetadas com sucesso!');
      
      // Recarregar configurações do projeto atual
      if (currentProject) {
        await loadSettings();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      toast.error('Erro ao resetar configurações');
      throw error;
    }
  };

  // Expor função globalmente para debug (pode ser chamada no console do navegador)
  useEffect(() => {
    (window as any).resetAllProjectSettings = resetAllProjectSettings;
    (window as any).debugSettings = async () => {
      console.log('🔍 DEBUG SETTINGS:');
      console.log('  - Current Project:', currentProject);
      console.log('  - API Project ID:', api.getCurrentProjectId());
      console.log('  - Budget in state:', budget);
      
      const settings = await api.fetchSettings();
      console.log('  - Settings from server:', settings);
      
      return { currentProject, apiProjectId: api.getCurrentProjectId(), budget, settings };
    };
    console.log('💡 Debug helpers available:');
    console.log('  - window.resetAllProjectSettings()');
    console.log('  - window.debugSettings()');
  }, [currentProject, budget]);

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      api.setAccessToken(data.session.access_token);
      
      try {
        // Tentar buscar dados completos do usuário do backend
        const userData = await api.fetchUserData();
        setUser(userData);
      } catch (error) {
        console.warn('Could not fetch user data from backend, using session data:', error);
        // Fallback: usar dados da sessão do Supabase
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            role: data.user.user_metadata?.role || 'Proprietário'
          });
        }
      }
      
      toast.success('Login realizado com sucesso!');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔵 Starting Google OAuth login...');
      console.log('  - Current URL:', window.location.href);
      console.log('  - Origin:', window.location.origin);
      console.log('  - Redirect will be:', window.location.origin);
      console.log('  - Current dialog state:', isGoogleSetupDialogOpen);
      
      // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        }
      });

      console.log('🔵 OAuth response received:');
      console.log('  - Full data object:', JSON.stringify(data, null, 2));
      console.log('  - Full error object:', JSON.stringify(error, null, 2));
      console.log('  - Has error:', !!error);
      console.log('  - Has data:', !!data);
      console.log('  - Has URL:', !!data?.url);
      console.log('  - Redirect URL:', data?.url);

      if (error) {
        console.error('❌ OAuth error detected - opening setup dialog');
        console.log('  - Error code:', error.code);
        console.log('  - Error message:', error.message);
        console.log('  - Error status:', error.status);
        console.log('  - Before setState - isGoogleSetupDialogOpen:', isGoogleSetupDialogOpen);
        
        setIsGoogleSetupDialogOpen(true);
        
        console.log('  - After setState called');
        
        toast.info('Google OAuth não configurado. Veja as instruções.', {
          duration: 5000
        });
        return;
      }
      
      // Se chegou aqui sem erro e sem redirecionamento, também pode ser problema de config
      if (!data?.url) {
        console.log('⚠️ No redirect URL - opening setup dialog');
        console.log('  - Before setState - isGoogleSetupDialogOpen:', isGoogleSetupDialogOpen);
        
        setIsGoogleSetupDialogOpen(true);
        
        console.log('  - After setState called');
        
        toast.info('Google OAuth não configurado. Veja as instruções.', {
          duration: 5000
        });
        return;
      }
      
      console.log('✅ OAuth initiated successfully, browser will redirect to Google');
      console.log('  - After successful Google auth, user will return to:', window.location.origin);
    } catch (error) {
      console.error('❌ Exception caught during OAuth:');
      console.error('  - Error:', error);
      console.error('  - Error type:', typeof error);
      console.error('  - Error constructor:', error?.constructor?.name);
      console.log('  - Before setState - isGoogleSetupDialogOpen:', isGoogleSetupDialogOpen);
      
      setIsGoogleSetupDialogOpen(true);
      
      console.log('  - After setState called');
      
      toast.info('Google OAuth não configurado. Veja as instruções.', {
        duration: 5000
      });
    }
  };

  const handleSignup = async (email: string, password: string, name: string, role: 'Proprietário' | 'Contratante') => {
    await api.signup(email, password, name, role);
    toast.success('Conta criada! Faça login para continuar.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    api.setAccessToken(null);
    setExpenses([]);
    toast.success('Logout realizado com sucesso!');
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        toast.error('Você precisa estar logado para adicionar despesas');
        throw new Error('Unauthorized');
      }

      console.log('📝 Creating expense in database...');
      const newExpense = await api.createExpense(expense);
      console.log('✅ Expense created with ID:', newExpense.id);
      
      // Recarrega as despesas do banco de dados
      await loadExpenses();
      
      toast.success('Despesa adicionada e salva no banco!');
      
      return newExpense; // Retorna a despesa criada com o ID
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar despesa');
      throw error;
    }
  };

  const handleImportExpenses = async (importedExpenses: Omit<Expense, 'id'>[]) => {
    try {
      console.log(`Starting import of ${importedExpenses.length} expenses...`);
      
      // Verificar se o usuário está autenticado
      if (!user) {
        toast.error('Você precisa estar logado para importar despesas');
        return;
      }

      // Verificar se o token está configurado
      const token = api.getAccessToken();
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        setUser(null);
        return;
      }
      
      // Importa todas as despesas em lote
      const promises = importedExpenses.map(expense => api.createExpense(expense));
      const newExpenses = await Promise.all(promises);
      
      console.log(`Successfully imported ${newExpenses.length} expenses to database`);
      
      // Recarrega as despesas do banco de dados para garantir sincronização
      await loadExpenses();
      
      toast.success(`${newExpenses.length} despesas importadas e salvas no banco!`);
    } catch (error) {
      console.error('Error importing expenses:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao importar despesas');
      throw error;
    }
  };

  const handleMarkAsPaid = async (id: string, paidDate: string, paymentMethod: string) => {
    try {
      console.log(`Marking expense ${id} as paid in database...`);
      await api.updateExpense(id, { 
        status: 'Pago', 
        paidDate,
        notes: `Pago via ${paymentMethod}`
      });
      
      // Recarrega as despesas do banco de dados
      await loadExpenses();
      
      toast.success('Pagamento registrado no banco!');
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const handlePaymentComplete = async (id: string, paymentMethod: string, receiptData: any) => {
    try {
      // Quando o pagamento é feito, substituir o boleto/PIX pelo comprovante
      const updatedExpense = await api.updateExpense(id, {
        status: 'Pago',
        paidDate: new Date().toISOString().split('T')[0],
        notes: `Pagamento via ${paymentMethod}`,
        // O comprovante será adicionado posteriormente via MarkAsPaidDialog
      });
      
      setExpenses(expenses.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
      
      toast.success(`Pagamento via ${paymentMethod} realizado com sucesso! Aguardando confirmação.`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      console.log(`Deleting expense ${id} from database...`);
      await api.deleteExpense(id);
      
      // Recarrega as despesas do banco de dados
      await loadExpenses();
      
      toast.success('Despesa excluída do banco!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  const handleUploadFile = async (file: File, type: 'invoice' | 'receipt', expenseId: string) => {
    try {
      console.log(`Uploading ${type} file for expense ${expenseId}...`);
      const { path, url } = await api.uploadFile(file, type, expenseId);
      
      const updateData = type === 'invoice' 
        ? { invoiceFile: path, invoiceUrl: url }
        : { receiptFile: path, receiptUrl: url };

      await api.updateExpense(expenseId, updateData);
      
      // Recarrega as despesas do banco de dados
      await loadExpenses();
      
      toast.success('Arquivo enviado e salvo no banco!');
      
      return { path, url };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
      throw error;
    }
  };

  const handleCreateProject = async (name: string, description: string, members: any[]) => {
    try {
      const newProject = await api.createProject(name, description, members);
      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
      api.setCurrentProjectId(newProject.id);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    }
  };

  const handleSelectProject = async (project: Project) => {
    console.log('🔄 handleSelectProject - Starting project switch...');
    console.log('  - From:', currentProject?.name);
    console.log('  - To:', project.name, `(ID: ${project.id})`);
    
    setCurrentProject(project);
    setCurrentTab('overview'); // Ao selecionar projeto, vai para Controle de Despesas
    
    console.log('  - Setting project ID in API...');
    api.setCurrentProjectId(project.id); // Define o projeto atual na API
    console.log('  - Project ID set:', api.getCurrentProjectId());
    
    // Limpar estado anterior
    console.log('  - Clearing previous state...');
    setExpenses([]);
    setBudget(0);
    
    // Carregar dados do novo projeto
    console.log('  - Loading new project data...');
    await loadExpenses();
    await loadSettings();
    
    console.log('  ✅ Project switch completed!');
    toast.success(`Projeto "${project.name}" selecionado!`);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // Se o projeto excluído era o atual, selecionar o primeiro
      if (currentProject?.id === projectId && updatedProjects.length > 0) {
        setCurrentProject(updatedProjects[0]);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const handleAddMember = async (projectId: string, member: any) => {
    try {
      const updatedProject = await api.addProjectMember(projectId, member);
      // Atualizar a lista de projetos
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      // Atualizar o projeto atual se for o mesmo
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Erro ao adicionar membro');
      throw error;
    }
  };

  const handleRemoveMember = async (projectId: string, memberEmail: string) => {
    try {
      const updatedProject = await api.removeProjectMember(projectId, memberEmail);
      // Atualizar a lista de projetos
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      // Atualizar o projeto atual se for o mesmo
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
      throw error;
    }
  };

  const filteredExpenses = filterStatus === 'Todos' 
    ? expenses 
    : expenses.filter(expense => expense.status === filterStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar landing page com AuthDialog se não houver usuário
  if (!user) {
    return (
      <>
        <Landing 
          onGetStarted={() => setIsAuthDialogOpen(true)} 
          onLoginClick={() => setIsAuthDialogOpen(true)}
        />
        <AuthDialog 
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onSignup={handleSignup}
        />
        <GoogleSetupDialog
          open={isGoogleSetupDialogOpen}
          onOpenChange={setIsGoogleSetupDialogOpen}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Full Width */}
      <TopBar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onCreateProject={() => {
          // Open create project dialog from sidebar
          const createBtn = document.querySelector('[data-create-project]');
          if (createBtn) (createBtn as HTMLElement).click();
        }}
        onProjectClick={() => setCurrentTab('overview')}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        onProjectManagement={() => setIsProjectManagementOpen(true)}
        onSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16">
        <ProjectSidebar
          projects={projects}
          currentProject={currentProject}
          currentTab={currentTab}
          onSelectProject={handleSelectProject}
          onSelectTab={setCurrentTab}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onProjectManagementOpen={() => setIsProjectManagementOpen(true)}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!currentProject && !isUnifiedView ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Nenhum projeto selecionado</p>
                <p className="text-sm text-gray-500 mb-6">Crie ou selecione um projeto na barra lateral</p>
                {projects.length > 1 && (
                  <Button 
                    onClick={() => setIsUnifiedView(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ver Visão Unificada de Todos os Projetos
                  </Button>
                )}
              </div>
            </div>
          ) : isUnifiedView ? (
            <div>
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUnifiedView(false)}
                  className="mb-4"
                >
                  ← Voltar para Projeto Individual
                </Button>
              </div>
              <UnifiedDashboard
                projects={projects}
                allExpenses={allProjectsExpenses}
                allBudgets={allProjectsBudgets}
                onSelectProject={(project) => {
                  setIsUnifiedView(false);
                  handleSelectProject(project);
                }}
                currentUserRole={user.role}
              />
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <Dashboard 
                  expenses={expenses}
                  budget={budget}
                  onAddExpense={() => setIsAddDialogOpen(true)}
                  onImportExcel={() => setIsImportDialogOpen(true)}
                  onRefresh={loadExpenses}
                />
              )}

              {currentTab === 'progress' && (
                <WorkProgressDashboard 
                  expenses={expenses}
                  budget={budget}
                />
              )}

              {currentTab === 'budget' && (
                <BudgetSettings 
                  budget={budget}
                  expenses={expenses}
                  onBudgetUpdate={(newBudget) => setBudget(newBudget)}
                  projectName={currentProject.name}
                  projectId={currentProject.id}
                />
              )}

              {currentTab === 'employees' && (
                <EmployeeManagement
                  employees={employees}
                  onAddEmployee={async (employee) => {
                    const newEmployee = { ...employee, id: crypto.randomUUID() };
                    setEmployees([...employees, newEmployee]);
                  }}
                  onUpdateEmployee={async (id, updates) => {
                    setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
                  }}
                  onDeleteEmployee={async (id) => {
                    setEmployees(employees.filter(emp => emp.id !== id));
                  }}
                />
              )}

              {currentTab === 'quotations' && (
                <QuotationManagement
                  quotations={quotations}
                  onAddQuotation={async (quotation) => {
                    const newQuotation = { ...quotation, id: crypto.randomUUID() };
                    setQuotations([...quotations, newQuotation]);
                  }}
                  onUpdateQuotation={async (id, updates) => {
                    setQuotations(quotations.map(quo => quo.id === id ? { ...quo, ...updates } : quo));
                  }}
                  onDeleteQuotation={async (id) => {
                    setQuotations(quotations.filter(quo => quo.id !== id));
                  }}
                />
              )}

              {currentTab === 'expenses' && (
                <ExpenseList 
                  expenses={filteredExpenses}
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                  onMarkAsPaid={handleMarkAsPaid}
                  onDeleteExpense={handleDeleteExpense}
                  onUploadFile={handleUploadFile}
                  onPaymentComplete={handlePaymentComplete}
                  onAddExpense={() => setIsAddDialogOpen(true)}
                  onImportExcel={() => setIsImportDialogOpen(true)}
                />
              )}

              {currentTab === 'documents' && currentProject && user && user.id && user.name && (
                <DocumentManagement
                  projectId={currentProject.id}
                  currentUserId={user.id}
                  currentUserName={user.name}
                  currentUserRole={user.role}
                />
              )}

              {currentTab === 'photos' && currentProject && user && user.name && (
                <PhotoGallery
                  projectId={currentProject.id}
                  currentUserName={user.name}
                />
              )}
            </>
          )}
        </div>
      </div>

      <AddExpenseDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddExpense={handleAddExpense}
        onUploadFile={handleUploadFile}
      />

      <ImportExcelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportExpenses}
      />

      {isProjectManagementOpen && (
        <ProjectManagement
          onClose={() => setIsProjectManagementOpen(false)}
          currentUser={{
            email: user.email,
            name: user.name,
            role: user.role
          }}
          onProjectsChanged={() => {
            loadProjects();
          }}
        />
      )}

      {isSettingsOpen && (
        <UserSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      )}

      <GoogleSetupDialog
        open={isGoogleSetupDialogOpen}
        onOpenChange={setIsGoogleSetupDialogOpen}
      />

      <Toaster position="top-right" />
    </div>
  );
}