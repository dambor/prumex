import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c4e36501`;

export interface Expense {
  id: string;
  description: string;
  category: 'Material' | 'Mão de Obra' | 'Equipamento' | 'Outros';
  amount: number;
  dueDate: string;
  status: 'Pendente' | 'Pago';
  invoiceFile?: string;
  invoiceUrl?: string;
  receiptFile?: string;
  receiptUrl?: string;
  addedBy: 'Contratante' | 'Proprietário';
  paidDate?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

let accessToken: string | null = null;
let currentProjectId: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setCurrentProjectId(projectId: string | null) {
  currentProjectId = projectId;
}

export function getCurrentProjectId() {
  return currentProjectId;
}

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Só adicionar Authorization se tivermos accessToken
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  if (currentProjectId) {
    headers['X-Project-Id'] = currentProjectId;
  }
  
  return headers;
}

export async function getAllProjectsExpenses(): Promise<any> {
  const response = await fetch(`${API_BASE}/expenses/all-projects`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all projects expenses');
  }

  return response.json();
}

export async function migrateExpensesToProject(targetProjectId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/expenses/migrate-to-project`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ targetProjectId })
  });

  if (!response.ok) {
    throw new Error('Failed to migrate expenses');
  }

  return response.json();
}

export async function fetchExpenses(): Promise<Expense[]> {
  try {
    console.log('🔄 fetchExpenses - Calling API...');
    console.log('  - URL:', `${API_BASE}/expenses`);
    console.log('  - Token:', accessToken ? 'Present (****)' : 'Using publicAnonKey');
    
    const response = await fetch(`${API_BASE}/expenses`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000) // 5 second timeout (reduced from 10s)
    });

    console.log('  - Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Failed to fetch expenses:', response.status, error);
      
      // Se não houver despesas ainda, retornar array vazio
      if (response.status === 500) {
        return [];
      }
      
      throw new Error(error.error || 'Failed to fetch expenses');
    }

    const data = await response.json();
    console.log('✅ fetchExpenses - Received data:', data);
    console.log('  - Expenses array length:', data.expenses?.length || 0);
    
    if (data.expenses && data.expenses.length > 0) {
      console.log('  - First expense:', data.expenses[0]);
    }
    
    return data.expenses || [];
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('⚠️ Server timeout - Using offline mode');
      // Return empty array instead of throwing to allow offline mode
      return [];
    }
    console.error('❌ Exception fetching expenses:', error);
    throw error;
  }
}

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>): Promise<Expense> {
  console.log('Creating expense with token:', accessToken ? 'Token present' : 'No token');
  console.log('Expense data:', expense);
  
  const response = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(expense)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Failed to create expense:', response.status, errorData);
    throw new Error(errorData.details || errorData.error || 'Failed to create expense');
  }

  const data = await response.json();
  return data.expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense');
  }

  const data = await response.json();
  return data.expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
}

export async function uploadFile(file: File, type: 'invoice' | 'receipt', expenseId: string): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('expenseId', expenseId);

  const headers: Record<string, string> = {};
  
  // Só adicionar Authorization se tivermos accessToken
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to upload file:', error);
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return data;
}

export async function getFileUrl(path: string): Promise<string> {
  const response = await fetch(`${API_BASE}/file/${encodeURIComponent(path)}`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get file URL:', error);
    throw new Error('Failed to get file URL');
  }

  const data = await response.json();
  return data.url;
}

export async function fetchSettings() {
  try {
    console.log('🔍 API: fetchSettings called');
    console.log('  - Current Project ID:', currentProjectId);
    console.log('  - Headers:', getHeaders());
    
    const response = await fetch(`${API_BASE}/settings`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000) // 5 second timeout (reduced from 10s)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    
    const data = await response.json();
    console.log('  - Settings received:', data.settings);
    return data.settings;
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('⚠️ Server timeout - Using default settings');
      // Return default settings instead of throwing
      return { budget: 0, categoryBudgets: {} };
    }
    console.error('❌ Error loading settings:', error);
    throw error;
  }
}

export async function updateSettings(settings: { budget: number; categoryBudgets?: Record<string, number> }): Promise<{ settings: { budget: number; categoryBudgets?: Record<string, number> } }> {
  console.log('🔍 API: updateSettings called');
  console.log('  - Current Project ID:', currentProjectId);
  console.log('  - Settings to save:', settings);
  console.log('  - Headers:', getHeaders());
  
  const response = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
}

// Project Management
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Proprietário' | 'Contratante';
}

export async function fetchUserData(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/user`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(5000) // 5 second timeout (reduced from 10s)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('⚠️ Server timeout - Will use session data as fallback');
      throw new Error('SERVER_TIMEOUT');
    }
    throw error;
  }
}

export async function updateUserProfile(updates: { name?: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<any> {
  const response = await fetch(`${API_BASE}/user/change-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }

  return response.json();
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('❌ Request timeout - Server may not be running');
      throw new Error('O servidor não está respondendo. Por favor, aguarde alguns segundos e tente novamente.');
    }
    console.error('Error loading projects:', error);
    throw error;
  }
}

export async function createProject(name: string, description: string, members: any[]): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, description, members })
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  const data = await response.json();
  return data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
}

export async function updateProject(projectId: string, updates: { name?: string; description?: string }): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error('Failed to update project');
  }

  const data = await response.json();
  return data.project;
}

export async function addProjectMember(projectId: string, member: any): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ member })
  });

  if (!response.ok) {
    throw new Error('Failed to add member');
  }

  const data = await response.json();
  return data.project;
}

export async function removeProjectMember(projectId: string, memberEmail: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/members/${encodeURIComponent(memberEmail)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to remove member');
  }

  const data = await response.json();
  return data.project;
}

// ==== FUNÇÕES DE FASES DA OBRA ====

export async function fetchPhases(): Promise<any[]> {
  try {
    console.log('🔄 fetchPhases - Calling API...');
    
    const response = await fetch(`${API_BASE}/phases`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch phases');
    }

    const data = await response.json();
    console.log('✅ fetchPhases - Received:', data.phases.length, 'phases');
    
    return data.phases || [];
  } catch (error) {
    console.error('❌ Exception fetching phases:', error);
    return [];
  }
}

export async function savePhases(phases: any[]): Promise<any[]> {
  try {
    console.log('💾 savePhases - Saving', phases.length, 'phases...');
    
    const response = await fetch(`${API_BASE}/phases`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ phases })
    });

    if (!response.ok) {
      throw new Error('Failed to save phases');
    }

    const data = await response.json();
    console.log('✅ Phases saved successfully');
    
    return data.phases || [];
  } catch (error) {
    console.error('❌ Exception saving phases:', error);
    throw error;
  }
}

export async function signup(email: string, password: string, name: string, role: string): Promise<void> {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ email, password, name, role })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Signup error:', error);
    throw new Error(error.error || 'Failed to signup');
  }
}

export async function createUserFromOAuth(user: { id: string; email: string; name: string; role: string }): Promise<void> {
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE}/users/oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Create user from OAuth error:', error);
    throw new Error(error.error || 'Failed to create user from OAuth');
  }
}

export async function testKVStore(): Promise<any> {
  const response = await fetch(`${API_BASE}/debug/kv-test`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('KV Store test failed');
  }

  return response.json();
}

export async function clearAllExpenses() {
  try {
    console.log('🗑️ clearAllExpenses - Calling DELETE /expenses/clear-all');
    console.log('  - API_BASE:', API_BASE);
    console.log('  - Access token:', accessToken ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE}/expenses/clear-all`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    console.log('  - Response status:', response.status);
    console.log('  - Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('  ❌ Server returned error:', errorText);
      
      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch {
        errorObj = { error: errorText };
      }
      
      throw new Error(errorObj.error || `HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('  ✅ Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Exception in clearAllExpenses:', error);
    throw error;
  }
}

// OCR - Extrair dados de nota fiscal usando IA
export async function extractInvoiceData(file: File): Promise<any> {
  try {
    console.log('📄 extractInvoiceData - Starting OCR extraction...');
    console.log('  - File type:', file.type);
    console.log('  - File name:', file.name);
    
    // Converter arquivo para base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const imageBase64 = await base64Promise;
    console.log('  - Image converted to base64');
    console.log('  - Base64 preview:', imageBase64.substring(0, 100) + '...');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Só adicionar Authorization se tivermos accessToken
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/extract-invoice`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        imageBase64,
        mimeType: file.type 
      }),
    });

    console.log('  - Response status:', response.status);
    console.log('  - Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OCR API error:', errorData);
      
      throw new Error(errorData.error || 'Falha ao processar imagem com IA');
    }

    const result = await response.json();
    console.log('  ✅ OCR extraction successful');
    console.log('  - Full result:', result);
    console.log('  - result.success:', result.success);
    console.log('  - result.data:', result.data);
    console.log('  - Type of result.data:', typeof result.data);
    
    if (result.data) {
      console.log('  - result.data.amount:', result.data.amount);
      console.log('  - result.data.description:', result.data.description);
      console.log('  - result.data.dueDate:', result.data.dueDate);
      console.log('  - result.data.category:', result.data.category);
      console.log('  - result.data.pixKey:', result.data.pixKey);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    throw error;
  }
}

// Quotation API
export async function saveQuotation(quotation: any): Promise<any> {
  const response = await fetch(`${API_BASE}/quotations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(quotation)
  });

  if (!response.ok) {
    throw new Error('Failed to save quotation');
  }

  return response.json();
}

// Documents API
export async function fetchDocuments(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/documents`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function uploadDocument(projectId: string, docData: any): Promise<any> {
  const formData = new FormData();
  formData.append('file', docData.file);
  formData.append('name', docData.name);
  formData.append('type', docData.type);
  formData.append('description', docData.description || '');
  formData.append('requiresSignature', String(docData.requiresSignature));
  formData.append('uploadedBy', docData.uploadedBy);
  formData.append('uploadedAt', docData.uploadedAt);
  formData.append('status', docData.status);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (currentProjectId) {
    headers['X-Project-Id'] = currentProjectId;
  }

  const response = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
}

export async function signDocument(projectId: string, documentId: string, signature: any): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${documentId}/sign`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ signature })
  });

  if (!response.ok) {
    throw new Error('Failed to sign document');
  }
}

export async function deleteDocument(projectId: string, documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
}

export async function downloadDocument(fileUrl: string): Promise<Blob> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error('Failed to download document');
  }
  return response.blob();
}

// Photos API
export async function fetchPhotos(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/photos`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export async function uploadPhoto(projectId: string, photoData: any): Promise<any> {
  const formData = new FormData();
  formData.append('file', photoData.file);
  formData.append('caption', photoData.caption);
  formData.append('phase', photoData.phase || '');
  formData.append('location', photoData.location || '');
  formData.append('tags', JSON.stringify(photoData.tags || []));
  formData.append('uploadedBy', photoData.uploadedBy);
  formData.append('uploadedAt', photoData.uploadedAt);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (currentProjectId) {
    headers['X-Project-Id'] = currentProjectId;
  }

  const response = await fetch(`${API_BASE}/photos`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload photo');
  }

  return response.json();
}

export async function deletePhoto(projectId: string, photoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/photos/${photoId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete photo');
  }
}

export async function downloadPhoto(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to download photo');
  }
  return response.blob();
}