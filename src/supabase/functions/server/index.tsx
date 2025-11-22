import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { verify } from 'npm:@tsndr/cloudflare-worker-jwt@2.5.2';
import ocrRoutes from './ocr.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Montar rotas de OCR
app.route('/make-server-c4e36501', ocrRoutes);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Wrapper para corrigir bug no kv.getByPrefix que retorna apenas values sem keys
const getExpensesByPrefix = async (prefix: string): Promise<Array<{ key: string; value: any }>> => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data, error } = await supabaseClient
    .from('kv_store_c4e36501')
    .select('key, value')
    .like('key', prefix + '%');
  
  if (error) {
    throw new Error(error.message);
  }
  
  // O value já vem como objeto JSONB do Postgres
  return data?.map((d) => ({ key: d.key, value: d.value })) ?? [];
};

// Criar bucket na inicialização
const BUCKET_NAME = 'make-c4e36501-construction-files';
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log('Storage bucket created:', BUCKET_NAME);
    }
  } catch (error) {
    console.log('Storage initialization error:', error);
  }
};
initStorage();

// Middleware de autenticação
const requireAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('🔐 requireAuth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
      console.error('  ❌ No access token in Authorization header');
      return c.json({ error: 'Unauthorized - No access token' }, 401);
    }
    
    console.log('  - Access token present (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('  - Decoding JWT payload...');
    
    try {
      // Decodificar o JWT sem verificar a assinatura (apenas para pegar o user ID)
      // O JWT tem 3 partes: header.payload.signature
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        console.error('  ❌ Invalid JWT format');
        return c.json({ error: 'Invalid token format' }, 401);
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('  - JWT payload decoded, user ID:', payload.sub);
      
      if (!payload.sub) {
        console.error('  ❌ No sub (user ID) in JWT payload');
        return c.json({ error: 'Invalid token - no user ID' }, 401);
      }
      
      // Buscar usuário usando o ID do JWT
      console.log('  - Fetching user from Supabase Auth using admin...');
      const { data: { user }, error } = await supabase.auth.admin.getUserById(payload.sub);
      
      if (error) {
        console.error('  ❌ Error fetching user:', error);
        return c.json({ error: 'User not found', details: error.message }, 401);
      }
      
      if (!user) {
        console.error('  ❌ User not found');
        return c.json({ error: 'User not found' }, 401);
      }
      
      console.log('  ✅ Auth successful - User:', user.email, 'ID:', user.id);
      
      c.set('userId', user.id);
      c.set('userEmail', user.email);
      c.set('userMetadata', user.user_metadata);
      c.set('user', user);
      await next();
    } catch (decodeError) {
      console.error('  ❌ Error decoding or validating JWT:', decodeError);
      return c.json({ error: 'Invalid token', details: decodeError instanceof Error ? decodeError.message : String(decodeError) }, 401);
    }
  } catch (err) {
    console.error('  ❌ requireAuth exception:', err);
    console.error('  ❌ Exception message:', err instanceof Error ? err.message : String(err));
    return c.json({ error: 'Authentication error', details: err instanceof Error ? err.message : String(err) }, 500);
  }
};

// ==== ROTAS DE AUTENTICAÇÃO ====

// Buscar dados do usuário logado
app.get('/make-server-c4e36501/user', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const user = c.get('user'); // Já temos o user do middleware requireAuth
    console.log('👤 GET /user - Fetching user data for ID:', userId);
    
    const kvUser = await kv.get(`user:${userId}`);
    console.log('  - KV lookup result:', kvUser ? 'FOUND' : 'NOT FOUND');
    
    if (kvUser) {
      const userData = typeof kvUser === 'string' ? JSON.parse(kvUser) : kvUser;
      console.log('  ✅ Returning user from KV:', userData.email);
      return c.json(userData);
    }
    
    // Se não encontrar no KV, usar dados do Auth que já temos do middleware
    console.log('  - User not found in KV, using data from Auth middleware');
    console.log('  - Auth user found:', user.email);
    console.log('  - Auth user metadata:', user.user_metadata);
    
    // Criar objeto de usuário a partir dos dados do Auth
    const userData = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      role: user.user_metadata?.role || 'Proprietário',
      createdAt: user.created_at
    };
    
    console.log('  - Created user data object:', userData);
    
    // Salvar no KV para próximas requisições (passar objeto direto, não string)
    try {
      await kv.set(`user:${userId}`, userData);
      console.log('  ✅ User data saved to KV successfully');
    } catch (kvError) {
      console.error('  ⚠️ Warning: Failed to save user to KV:', kvError);
      // Não falhar a requisição, apenas logar o aviso
    }
    
    console.log('  ✅ User data fetched from Supabase Auth and returned');
    
    return c.json(userData);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    console.error('  - Error message:', error instanceof Error ? error.message : String(error));
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ 
      error: 'Failed to fetch user data', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Atualizar perfil do usuário
app.put('/make-server-c4e36501/user/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    console.log('📝 PUT /user/profile - Updating profile for user:', userId);
    console.log('  - Updates:', updates);
    
    // Buscar usuário atual
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const userData = typeof user === 'string' ? JSON.parse(user) : user;
    
    // Atualizar campos permitidos
    const updatedUser = {
      ...userData,
      name: updates.name || userData.name,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedUser);
    
    console.log('  ✅ Profile updated successfully');
    
    return c.json(updatedUser);
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Alterar senha
app.post('/make-server-c4e36501/user/change-password', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { currentPassword, newPassword } = await c.req.json();
    
    console.log('🔐 POST /user/change-password - Changing password for user:', userId);
    
    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current and new password are required' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    // Buscar dados do usuário do Supabase Auth para pegar o email
    const { data: { user: authUser }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !authUser) {
      console.error('  ❌ Error getting user from Supabase Auth:', getUserError);
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Verificar senha atual tentando fazer login com ela
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email!,
      password: currentPassword,
    });
    
    if (signInError) {
      console.error('  ❌ Current password verification failed:', signInError.message);
      return c.json({ error: 'Current password is incorrect' }, 401);
    }
    
    // Atualizar senha no Supabase Auth usando admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('  ❌ Error updating password in Supabase Auth:', updateError);
      return c.json({ error: 'Failed to update password' }, 500);
    }
    
    // Também atualizar no KV se existir (para compatibilidade)
    const user = await kv.get(`user:${userId}`);
    if (user) {
      const userData = typeof user === 'string' ? JSON.parse(user) : user;
      const updatedUser = {
        ...userData,
        password: newPassword,
        updatedAt: new Date().toISOString()
      };
      await kv.set(`user:${userId}`, updatedUser);
    }
    
    console.log('  ✅ Password changed successfully');
    
    return c.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

app.post('/make-server-c4e36501/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Email, password, name and role are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role }, // role: 'Proprietário' ou 'Contratante'
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Criar usuário a partir do OAuth (Google, etc)
app.post('/make-server-c4e36501/users/oauth', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { id, email, name, role } = await c.req.json();

    console.log('Creating user from OAuth:', { id, email, name, role });

    // Verificar se o usuário já existe
    const existingUser = await kv.get(`user:${id}`);
    if (existingUser) {
      console.log('User already exists in KV store');
      return c.json({ success: true, message: 'User already exists' });
    }

    // Salvar usuário no KV Store
    const userData = {
      id,
      email,
      name,
      role
    };

    await kv.set(`user:${id}`, userData);
    console.log('✅ User created from OAuth in KV store');

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.error('❌ Error creating user from OAuth:', error);
    return c.json({ error: 'Failed to create user from OAuth' }, 500);
  }
});

// ==== ROTAS DE DESPESAS ====

// Rota de diagnóstico - verificar todas as despesas no banco
app.get('/make-server-c4e36501/expenses/all-projects', requireAuth, async (c) => {
  try {
    console.log('🔍 GET /expenses/all-projects - Fetching ALL expenses from ALL projects');
    
    // Buscar TODAS as despesas, independente de projeto
    const allItems = await getExpensesByPrefix('expense:');
    console.log(`  - Found ${allItems.length} total expenses in database`);
    
    // Agrupar por projeto
    const byProject: Record<string, any[]> = {};
    allItems.forEach((item) => {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      const projectId = expense.projectId || 'unknown';
      if (!byProject[projectId]) {
        byProject[projectId] = [];
      }
      byProject[projectId].push(expense);
    });
    
    console.log('  - Projects found:', Object.keys(byProject));
    console.log('  - Expenses per project:', Object.entries(byProject).map(([pid, exps]) => `${pid}: ${exps.length}`).join(', '));
    
    return c.json({
      total: allItems.length,
      byProject: byProject,
      projects: Object.keys(byProject)
    });
  } catch (error) {
    console.error('❌ Error fetching all expenses:', error);
    return c.json({ error: 'Failed to fetch all expenses' }, 500);
  }
});

// Migração: Associar despesas antigas (sem projectId) a um projeto
app.post('/make-server-c4e36501/expenses/migrate-to-project', requireAuth, async (c) => {
  try {
    const { targetProjectId } = await c.req.json();
    console.log('🔄 POST /expenses/migrate-to-project - Migrating expenses to project:', targetProjectId);
    
    if (!targetProjectId) {
      return c.json({ error: 'Target project ID is required' }, 400);
    }
    
    // Buscar TODAS as despesas
    const allItems = await getExpensesByPrefix('expense:');
    console.log(`  - Found ${allItems.length} total expenses`);
    
    // Filtrar despesas sem projectId
    const expensesWithoutProject = allItems.filter((item) => {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      return !expense.projectId || expense.projectId === 'unknown';
    });
    
    console.log(`  - Found ${expensesWithoutProject.length} expenses without project ID`);
    
    if (expensesWithoutProject.length === 0) {
      return c.json({ 
        success: true, 
        migratedCount: 0,
        message: 'No expenses to migrate' 
      });
    }
    
    // Migrar cada despesa
    let migratedCount = 0;
    for (const item of expensesWithoutProject) {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      const oldKey = item.key;
      
      // Deletar a chave antiga
      await kv.del(oldKey);
      
      // Adicionar projectId à despesa
      expense.projectId = targetProjectId;
      
      // Criar nova chave com formato: expense:{projectId}:{expenseId}
      const newKey = `expense:${targetProjectId}:${expense.id}`;
      await kv.set(newKey, expense);
      
      migratedCount++;
      console.log(`  ✅ Migrated expense ${expense.id} from "${oldKey}" to "${newKey}"`);
    }
    
    console.log(`  ✅ Migration complete: ${migratedCount} expenses migrated to project ${targetProjectId}`);
    
    return c.json({ 
      success: true, 
      migratedCount,
      targetProjectId,
      message: `${migratedCount} despesas migradas com sucesso` 
    });
  } catch (error) {
    console.error('❌ Error migrating expenses:', error);
    return c.json({ error: 'Failed to migrate expenses' }, 500);
  }
});

app.get('/make-server-c4e36501/expenses/debug', requireAuth, async (c) => {
  try {
    console.log('🔍 DEBUG /expenses/debug');
    
    const items = await getExpensesByPrefix('expense:');
    
    // Contar status
    const statusCount = items.reduce((acc, item) => {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      acc[expense.status] = (acc[expense.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calcular totais
    const totals = items.reduce((acc, item) => {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      if (expense.status === 'Pago') {
        acc.totalPago += expense.amount || 0;
      } else {
        acc.totalPendente += expense.amount || 0;
      }
      return acc;
    }, { totalPago: 0, totalPendente: 0 });
    
    // Amostras
    const samples = items.slice(0, 5).map(item => {
      const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      return {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        status: expense.status,
        category: expense.category
      };
    });
    
    return c.json({
      totalExpenses: items.length,
      statusCount,
      totals,
      samples,
      uniqueKeys: items.length
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-c4e36501/expenses/clear-all', requireAuth, async (c) => {
  try {
    console.log('🗑️ DELETE /expenses/clear-all - Deleting ALL expenses');
    
    // Buscar diretamente do Supabase para obter as KEYS
    const { data, error } = await supabase
      .from('kv_store_c4e36501')
      .select('key')
      .like('key', 'expense:%');
    
    if (error) {
      console.error('  ❌ Error fetching keys:', error);
      throw new Error(error.message);
    }
    
    console.log(`  - Found ${data?.length || 0} expenses to delete`);
    
    if (!data || data.length === 0) {
      console.log('  - No expenses to delete');
      return c.json({ 
        success: true, 
        deletedCount: 0,
        message: 'Nenhuma despesa para deletar' 
      });
    }
    
    // Extrair as keys
    const keys = data.map(item => item.key);
    console.log(`  - Keys to delete:`, keys.slice(0, 5), `... (${keys.length} total)`);
    
    // Deletar todas as despesas
    await kv.mdel(keys);
    console.log(`  ✅ Deleted ${keys.length} expenses`);
    
    return c.json({ 
      success: true, 
      deletedCount: keys.length,
      message: `${keys.length} despesas deletadas com sucesso` 
    });
  } catch (error) {
    console.error('❌ Error clearing expenses:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('  - Error message:', errorMessage);
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: errorMessage, details: 'Failed to clear expenses' }, 500);
  }
});

app.get('/make-server-c4e36501/expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.header('X-Project-Id');
    
    console.log('📥 GET /expenses - Fetching expenses');
    console.log('  - UserId:', userId);
    console.log('  - ProjectId:', projectId);
    
    if (!projectId) {
      console.error('  ❌ No project ID provided');
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    // Buscar despesas do projeto específico
    console.log(`  - Calling getExpensesByPrefix("expense:${projectId}:")...`);
    const items = await getExpensesByPrefix(`expense:${projectId}:`);
    console.log(`  - KV Store returned ${items.length} raw items for project ${projectId}`);
    if (items.length > 0) {
      console.log('  - First 5 keys:', items.slice(0, 5).map(i => i.key));
      console.log('  - First item value type:', typeof items[0].value);
      console.log('  - First item value:', items[0].value);
    }
    
    const expenseList = items
      .map((item, index) => {
        try {
          if (!item.value) {
            console.error(`  ❌ [${index}] No value for key:`, item.key);
            return null;
          }
          
          // O value já vem como objeto do JSONB, não precisa parsear
          const expense = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
          
          if (index < 3) {
            console.log(`  ✅ [${index}] Expense ${item.key}:`, expense.description);
          }
          return expense;
        } catch (e) {
          console.error(`  ❌ [${index}] Error processing expense:`, item.key, e);
          return null;
        }
      })
      .filter(Boolean); // Remover valores null
    
    // Ordenar por data de criação (mais recentes primeiro)
    expenseList.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    console.log(`✅ Returning ${expenseList.length} valid expenses to frontend`);
    if (expenseList.length > 0) {
      console.log('  - First 3 expenses:', expenseList.slice(0, 3).map(e => ({ id: e.id, description: e.description })));
    }
    return c.json({ expenses: expenseList });
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    console.error('  - Error details:', error instanceof Error ? error.message : String(error));
    console.error('  - Stack:', error instanceof Error ? error.stack : 'No stack');
    // Retornar array vazio em vez de erro se não houver despesas
    return c.json({ expenses: [] });
  }
});

app.post('/make-server-c4e36501/expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userMetadata = c.get('userMetadata');
    const projectId = c.req.header('X-Project-Id');
    const expense = await c.req.json();

    console.log('📥 POST /expenses - Creating new expense');
    console.log('  - UserId:', userId);
    console.log('  - ProjectId:', projectId);
    console.log('  - User role:', userMetadata?.role);
    console.log('  - Expense data:', JSON.stringify(expense, null, 2));

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const newExpense = {
      ...expense,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      addedBy: userMetadata?.role || 'Contratante',
      projectId // Adicionar projectId ao objeto da despesa
    };

    const expenseKey = `expense:${projectId}:${newExpense.id}`;
    console.log('  - Generated expense ID:', newExpense.id);
    console.log('  - KV key will be:', expenseKey);
    console.log('  - Calling kv.set()...');
    
    await kv.set(expenseKey, newExpense); // Passar objeto direto, não string
    
    console.log('  ✅ Expense saved to KV successfully');
    console.log('  - Verifying: Calling kv.get() to confirm...');
    
    const verification = await kv.get(expenseKey);
    console.log('  - Verification result:', verification ? 'FOUND' : 'NOT FOUND');
    if (verification) {
      const verifiedData = typeof verification === 'string' ? JSON.parse(verification) : verification;
      console.log('  - Verified data matches:', verifiedData.id === newExpense.id);
    }

    return c.json({ expense: newExpense });
  } catch (error) {
    console.error('❌ Error creating expense - Full error:', error);
    console.error('  - Error message:', error instanceof Error ? error.message : String(error));
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to create expense', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.put('/make-server-c4e36501/expenses/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const projectId = c.req.header('X-Project-Id');
    const updates = await c.req.json();

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const expenseKey = `expense:${projectId}:${id}`;
    const existing = await kv.get(expenseKey);
    if (!existing) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    const expense = typeof existing === 'string' ? JSON.parse(existing) : existing;
    const updatedExpense = {
      ...expense,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(expenseKey, updatedExpense); // Passar objeto direto, não string

    return c.json({ expense: updatedExpense });
  } catch (error) {
    console.log('Error updating expense:', error);
    return c.json({ error: 'Failed to update expense' }, 500);
  }
});

app.delete('/make-server-c4e36501/expenses/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const projectId = c.req.header('X-Project-Id');
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const expenseKey = `expense:${projectId}:${id}`;
    const existing = await kv.get(expenseKey);
    if (!existing) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    // Deletar arquivos associados se existirem
    const expense = typeof existing === 'string' ? JSON.parse(existing) : existing;
    if (expense.invoiceFile) {
      await supabase.storage.from(BUCKET_NAME).remove([expense.invoiceFile]);
    }
    if (expense.receiptFile) {
      await supabase.storage.from(BUCKET_NAME).remove([expense.receiptFile]);
    }

    await kv.del(expenseKey);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting expense:', error);
    return c.json({ error: 'Failed to delete expense' }, 500);
  }
});

// ==== ROTAS DE UPLOAD DE ARQUIVOS ====

app.post('/make-server-c4e36501/upload', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'invoice' ou 'receipt'
    const expenseId = formData.get('expenseId') as string;

    if (!file || !type || !expenseId) {
      return c.json({ error: 'File, type and expenseId are required' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${expenseId}/${type}-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.log('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Criar URL assinada válida por 1 ano
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 31536000); // 1 ano em segundos

    return c.json({ 
      path: fileName,
      url: signedUrlData?.signedUrl 
    });
  } catch (error) {
    console.log('Upload exception:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

app.get('/make-server-c4e36501/file/:path', requireAuth, async (c) => {
  try {
    const path = c.req.param('path');
    
    // Criar URL assinada válida por 1 hora
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(decodeURIComponent(path), 3600);

    if (error) {
      console.log('Get file URL error:', error);
      return c.json({ error: 'Failed to get file URL' }, 500);
    }

    return c.json({ url: data.signedUrl });
  } catch (error) {
    console.log('Get file exception:', error);
    return c.json({ error: 'Failed to get file' }, 500);
  }
});

// ==== ROTAS DE PROJETOS ====

app.get('/make-server-c4e36501/projects', requireAuth, async (c) => {
  try {
    console.log('📥 GET /projects - Fetching projects...');
    const user = c.get('user');
    const userMetadata = c.get('userMetadata');
    
    // Buscar todos os projetos onde o usuário é membro
    const allProjectsData = await getExpensesByPrefix('project:');
    console.log(`  - Found ${allProjectsData.length} total projects in database`);
    
    const userProjects = [];
    
    for (const item of allProjectsData) {
      const project = item.value;
      // Verificar se o usuário é membro deste projeto
      if (project.members && Array.isArray(project.members) && project.members.some((m: any) => m.email === user.email)) {
        userProjects.push(project);
      }
    }
    
    console.log(`  - User is member of ${userProjects.length} projects`);
    
    // Se não houver projetos, criar um projeto padrão
    if (userProjects.length === 0) {
      console.log('  ℹ️ No projects found, creating default project...');
      const defaultProject = {
        id: crypto.randomUUID(),
        name: 'Meu Projeto',
        description: 'Projeto padrão',
        createdAt: new Date().toISOString(),
        members: [{
          email: user.email,
          name: userMetadata?.name || user.email,
          role: userMetadata?.role || 'Proprietário'
        }]
      };
      userProjects.push(defaultProject);
      await kv.set(`project:${defaultProject.id}`, defaultProject);
      console.log('  ✅ Default project created:', defaultProject.id);
    }
    
    console.log(`  ✅ Returning ${userProjects.length} projects`);
    return c.json({ projects: userProjects });
  } catch (error) {
    console.log('❌ Error fetching projects:', error);
    console.log('  - Error message:', error instanceof Error ? error.message : String(error));
    console.log('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.post('/make-server-c4e36501/projects', requireAuth, async (c) => {
  try {
    const { name, description, members } = await c.req.json();
    console.log('📝 POST /projects - Creating project...');
    console.log('  - Name:', name);
    console.log('  - Description:', description);
    console.log('  - Members:', members);
    
    const user = c.get('user');
    console.log('  - Current user:', user?.email);
    
    // Criar novo projeto
    const newProject = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      members: members || []
    };
    
    console.log('  - Generated project ID:', newProject.id);
    console.log('  - Project object:', JSON.stringify(newProject));
    
    // Salvar projeto (kv.set salva como JSONB diretamente, NÃO fazer JSON.stringify)
    const projectKey = `project:${newProject.id}`;
    console.log('  - Saving to key:', projectKey);
    
    try {
      await kv.set(projectKey, newProject); // Passar objeto direto, não string
      console.log('  ✅ kv.set completed successfully');
    } catch (kvError) {
      console.error('  ❌ kv.set failed:', kvError);
      console.error('  ❌ kvError details:', kvError instanceof Error ? kvError.message : String(kvError));
      throw kvError;
    }
    
    // Verificar se foi salvo
    const verification = await kv.get(projectKey);
    console.log('  - Verification:', verification ? 'FOUND' : 'NOT FOUND');
    if (verification) {
      console.log('  - Verified project name:', verification.name);
    }
    
    console.log('  ✅ Project created:', newProject.id);
    return c.json({ project: newProject });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    console.error('  - Error message:', error instanceof Error ? error.message : String(error));
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.delete('/make-server-c4e36501/projects/:projectId', requireAuth, async (c) => {
  try {
    const projectId = c.req.param('projectId');
    console.log('🗑️ DELETE /projects/:id - Deleting project:', projectId);
    
    // Deletar o projeto
    await kv.del(`project:${projectId}`);
    
    console.log('  ✅ Project deleted:', projectId);
    return c.json({ success: true });
  } catch (error) {
    console.log('❌ Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Atualizar projeto (nome e/ou descrição)
app.patch('/make-server-c4e36501/projects/:projectId', requireAuth, async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const updates = await c.req.json();
    console.log('📝 PATCH /projects/:id - Updating project:', projectId);
    console.log('  - Updates:', updates);
    
    // Carregar projeto existente
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Atualizar campos permitidos
    if (updates.name !== undefined) {
      project.name = updates.name;
    }
    if (updates.description !== undefined) {
      project.description = updates.description;
    }
    
    // Salvar projeto atualizado
    await kv.set(`project:${projectId}`, project);
    
    console.log('  ✅ Project updated successfully');
    return c.json({ project });
  } catch (error) {
    console.log('❌ Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// Adicionar membro ao projeto
app.post('/make-server-c4e36501/projects/:projectId/members', requireAuth, async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const { member } = await c.req.json();
    
    console.log('➕ POST /projects/:id/members - Adding member to project:', projectId);
    console.log('  - Member:', member);
    
    // Carregar projeto
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Adicionar membro
    if (!project.members) {
      project.members = [];
    }
    
    // Verificar se já existe
    if (project.members.some((m: any) => m.email === member.email)) {
      return c.json({ error: 'Member already exists' }, 400);
    }
    
    project.members.push(member);
    
    // Salvar projeto atualizado
    await kv.set(`project:${projectId}`, project);
    
    console.log('  ✅ Member added successfully');
    return c.json({ project });
  } catch (error) {
    console.log('❌ Error adding member:', error);
    return c.json({ error: 'Failed to add member' }, 500);
  }
});

// Remover membro do projeto
app.delete('/make-server-c4e36501/projects/:projectId/members/:memberEmail', requireAuth, async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const memberEmail = decodeURIComponent(c.req.param('memberEmail'));
    
    console.log('➖ DELETE /projects/:id/members/:email - Removing member from project:', projectId);
    console.log('  - Member email:', memberEmail);
    
    // Carregar projeto
    const project = await kv.get(`project:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Verificar se não é o último membro
    if (project.members && project.members.length <= 1) {
      return c.json({ error: 'Cannot remove the last member' }, 400);
    }
    
    // Remover membro
    project.members = project.members.filter((m: any) => m.email !== memberEmail);
    
    // Salvar projeto atualizado
    await kv.set(`project:${projectId}`, project);
    
    console.log('  ✅ Member removed successfully');
    return c.json({ project });
  } catch (error) {
    console.log('❌ Error removing member:', error);
    return c.json({ error: 'Failed to remove member' }, 500);
  }
});

// ==== ROTA DE CONFIGURAÇÕES ====

// Endpoint para limpar configurações antigas globais e resetar todos os projetos
app.post('/make-server-c4e36501/settings/reset-all-projects', requireAuth, async (c) => {
  try {
    console.log('🧹 POST /settings/reset-all-projects - Resetting all project settings...');
    
    // 1. Deletar a chave antiga global (se existir)
    await kv.del('settings:budget');
    console.log('  ✅ Deleted old global settings:budget key');
    
    // 2. Buscar todos os projetos
    const allProjects = await getExpensesByPrefix('project:');
    console.log(`  - Found ${allProjects.length} projects`);
    
    // 3. Resetar as configurações de cada projeto para o padrão
    let resetCount = 0;
    for (const item of allProjects) {
      const project = item.value;
      const settingsKey = `settings:project:${project.id}`;
      
      // Deletar configurações existentes do projeto
      await kv.del(settingsKey);
      console.log(`  ✅ Reset settings for project: ${project.name} (${project.id})`);
      resetCount++;
    }
    
    console.log(`  ✅ Reset complete! ${resetCount} projects now have independent settings`);
    
    return c.json({ 
      success: true, 
      message: `Configurações resetadas para ${resetCount} projetos`,
      projectsReset: resetCount
    });
  } catch (error) {
    console.error('❌ Error resetting settings:', error);
    return c.json({ error: 'Failed to reset settings' }, 500);
  }
});

app.get('/make-server-c4e36501/settings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.header('X-Project-Id');
    
    console.log('📥 GET /settings - Fetching settings...');
    console.log('  - User ID:', userId);
    console.log('  - Project ID:', projectId);
    
    if (!projectId) {
      console.log('  ❌ ERROR: No project ID provided!');
      return c.json({ error: 'Project ID required' }, 400);
    }
    
    const settingsKey = `settings:project:${projectId}`;
    console.log('  - Looking for key:', settingsKey);
    let settingsData = await kv.get(settingsKey);
    
    // Se não encontrar settings do projeto, retornar configurações padrão (NÃO migrar mais)
    if (!settingsData) {
      console.log('  ℹ️ No settings found for this project, returning defaults');
      const defaultSettings = { budget: 500000, categoryBudgets: {} };
      // Salvar as configurações padrão para este projeto
      await kv.set(settingsKey, JSON.stringify(defaultSettings));
      console.log('  ✅ Default settings saved for project:', projectId);
      return c.json({ settings: defaultSettings });
    }
    
    const settings = typeof settingsData === 'string' ? JSON.parse(settingsData) : settingsData;
    console.log('  ✅ Settings loaded:', settings);
    
    return c.json({ settings });
  } catch (error) {
    console.log('❌ Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put('/make-server-c4e36501/settings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.header('X-Project-Id');
    const settings = await c.req.json();
    
    console.log('💾 PUT /settings - Saving settings...');
    console.log('  - User ID:', userId);
    console.log('  - Project ID:', projectId);
    console.log('  - Budget:', settings.budget);
    console.log('  - Category Budgets:', settings.categoryBudgets ? Object.keys(settings.categoryBudgets).length + ' categories' : 'None');
    
    if (!projectId) {
      return c.json({ error: 'Project ID required' }, 400);
    }
    
    const settingsKey = `settings:project:${projectId}`;
    await kv.set(settingsKey, JSON.stringify(settings));
    console.log('  ✅ Settings saved successfully to:', settingsKey);
    
    return c.json({ settings });
  } catch (error) {
    console.log('❌ Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ==== ROTAS DE FASES DA OBRA ====

app.get('/make-server-c4e36501/phases', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    
    console.log('📥 GET /phases - Fetching work phases');
    console.log('  - Project ID:', projectId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID required' }, 400);
    }
    
    const phasesKey = `phases:project:${projectId}`;
    const phasesData = await kv.get(phasesKey);
    const phases = phasesData ? JSON.parse(phasesData) : [];
    
    console.log(`✅ Returning ${phases.length} phases to frontend from key: ${phasesKey}`);
    return c.json({ phases });
  } catch (error) {
    console.error('❌ Error fetching phases:', error);
    return c.json({ error: 'Failed to fetch phases' }, 500);
  }
});

app.put('/make-server-c4e36501/phases', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    const { phases } = await c.req.json();
    
    console.log('📥 PUT /phases - Saving work phases');
    console.log('  - Project ID:', projectId);
    console.log('  - Phases count:', phases.length);
    
    if (!projectId) {
      return c.json({ error: 'Project ID required' }, 400);
    }
    
    const phasesKey = `phases:project:${projectId}`;
    await kv.set(phasesKey, JSON.stringify(phases));
    
    console.log(`✅ Phases saved successfully to key: ${phasesKey}`);
    return c.json({ phases });
  } catch (error) {
    console.error('❌ Error saving phases:', error);
    return c.json({ error: 'Failed to save phases' }, 500);
  }
});

app.get('/make-server-c4e36501/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint para testar o KV Store
app.get('/make-server-c4e36501/debug/kv-test', requireAuth, async (c) => {
  try {
    console.log('🧪 Testing KV Store...');
    
    // Teste 1: Escrever um valor de teste
    const testKey = 'debug:test-' + Date.now();
    const testValue = { message: 'Hello KV Store', timestamp: new Date().toISOString() };
    console.log('  - Writing test value:', testKey);
    await kv.set(testKey, JSON.stringify(testValue));
    
    // Teste 2: Ler o valor de volta
    console.log('  - Reading test value back...');
    const readValue = await kv.get(testKey);
    console.log('  - Read result:', readValue);
    
    // Teste 3: Listar todos os items com prefixo 'expense:'
    console.log('  - Listing all expenses...');
    const allExpenses = await kv.getByPrefix('expense:');
    console.log('  - Found expenses:', allExpenses.length);
    
    // Teste 4: Deletar o valor de teste
    await kv.del(testKey);
    
    return c.json({
      success: true,
      kvStoreWorking: readValue !== null,
      testValue: readValue ? JSON.parse(readValue) : null,
      expensesCount: allExpenses.length,
      expensesKeys: allExpenses.map(e => e.key)
    });
  } catch (error) {
    console.error('❌ KV Store test failed:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    }, 500);
  }
});

// ============================================
// DOCUMENTS ROUTES
// ============================================

app.get('/make-server-c4e36501/documents', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    console.log('📄 GET /documents - Fetching documents for project:', projectId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const documentsData = await kv.getByPrefix(`documents:${projectId}:`);
    const documents = documentsData.map((item: any) => item.value);
    
    console.log(`  ✅ Returning ${documents.length} documents`);
    return c.json({ documents });
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

app.post('/make-server-c4e36501/documents', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    console.log('📄 POST /documents - Uploading document for project:', projectId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const requiresSignature = formData.get('requiresSignature') === 'true';
    const uploadedBy = formData.get('uploadedBy') as string;
    const uploadedAt = formData.get('uploadedAt') as string;
    const status = formData.get('status') as string;
    
    if (!file) {
      return c.json({ error: 'File is required' }, 400);
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${projectId}/documents/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('  ❌ Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: uploadError.message }, 500);
    }
    
    // Create signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    // Save document metadata
    const documentId = crypto.randomUUID();
    const document = {
      id: documentId,
      name,
      type,
      fileUrl: urlData?.signedUrl || '',
      fileName: file.name,
      fileSize: file.size,
      uploadedBy,
      uploadedAt,
      description,
      requiresSignature,
      status,
      signatures: []
    };
    
    await kv.set(`documents:${projectId}:${documentId}`, document);
    
    console.log('  ✅ Document uploaded:', documentId);
    return c.json(document);
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

app.post('/make-server-c4e36501/documents/:documentId/sign', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    const documentId = c.req.param('documentId');
    const { signature } = await c.req.json();
    
    console.log('✍️ POST /documents/:id/sign - Signing document:', documentId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const documentKey = `documents:${projectId}:${documentId}`;
    const document = await kv.get(documentKey);
    
    if (!document) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    // Add signature
    if (!document.signatures) {
      document.signatures = [];
    }
    document.signatures.push(signature);
    
    await kv.set(documentKey, document);
    
    console.log('  ✅ Document signed');
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error signing document:', error);
    return c.json({ error: 'Failed to sign document' }, 500);
  }
});

app.delete('/make-server-c4e36501/documents/:documentId', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    const documentId = c.req.param('documentId');
    
    console.log('🗑️ DELETE /documents/:id - Deleting document:', documentId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const documentKey = `documents:${projectId}:${documentId}`;
    await kv.del(documentKey);
    
    console.log('  ✅ Document deleted');
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

// ============================================
// PHOTOS ROUTES
// ============================================

app.get('/make-server-c4e36501/photos', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    console.log('📸 GET /photos - Fetching photos for project:', projectId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const photosData = await kv.getByPrefix(`photos:${projectId}:`);
    const photos = photosData.map((item: any) => item.value);
    
    console.log(`  ✅ Returning ${photos.length} photos`);
    return c.json({ photos });
  } catch (error) {
    console.error('❌ Error fetching photos:', error);
    return c.json({ error: 'Failed to fetch photos' }, 500);
  }
});

app.post('/make-server-c4e36501/photos', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    console.log('📸 POST /photos - Uploading photo for project:', projectId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const phase = formData.get('phase') as string;
    const location = formData.get('location') as string;
    const tagsJson = formData.get('tags') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const uploadedAt = formData.get('uploadedAt') as string;
    
    if (!file) {
      return c.json({ error: 'File is required' }, 400);
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${projectId}/photos/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('  ❌ Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: uploadError.message }, 500);
    }
    
    // Create signed URLs (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    // Save photo metadata
    const photoId = crypto.randomUUID();
    const photo = {
      id: photoId,
      imageUrl: urlData?.signedUrl || '',
      thumbnailUrl: urlData?.signedUrl || '', // Same URL for now, could generate thumbnail
      caption,
      phase,
      location,
      tags: tagsJson ? JSON.parse(tagsJson) : [],
      uploadedBy,
      uploadedAt
    };
    
    await kv.set(`photos:${projectId}:${photoId}`, photo);
    
    console.log('  ✅ Photo uploaded:', photoId);
    return c.json(photo);
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

app.delete('/make-server-c4e36501/photos/:photoId', requireAuth, async (c) => {
  try {
    const projectId = c.req.header('X-Project-Id');
    const photoId = c.req.param('photoId');
    
    console.log('🗑️ DELETE /photos/:id - Deleting photo:', photoId);
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const photoKey = `photos:${projectId}:${photoId}`;
    await kv.del(photoKey);
    
    console.log('  ✅ Photo deleted');
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
});

Deno.serve(app.fetch);