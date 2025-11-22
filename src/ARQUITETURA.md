# 🏗️ Arquitetura do Sistema

Entenda como tudo funciona junto.

---

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              REACT APPLICATION                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Components (UI)                                │  │  │
│  │  │  - Dashboard, ExpenseList, DocumentManagement   │  │  │
│  │  │  - PhotoGallery, WorkProgress, etc.             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                        ▼                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Utils Layer                                    │  │  │
│  │  │  - api.ts (API calls)                          │  │  │
│  │  │  - client.ts (Supabase client)                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                            │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Auth Service    │  │  Storage         │                 │
│  │  - Email/Pass    │  │  - Documents     │                 │
│  │  - Google OAuth  │  │  - Photos        │                 │
│  │  - JWT Tokens    │  │  - Receipts      │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Edge Functions (Backend - Hono)                      │ │
│  │  /make-server-c4e36501                                │ │
│  │  - /expenses          - /documents                    │ │
│  │  - /projects          - /photos                       ││
│  │  - /settings          - /upload                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ▼                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                  │ │
│  │  - kv_store_c4e36501 (Key-Value table)               │ │
│  │    ├── expenses:project-id:expense-id                │ │
│  │    ├── projects:user-id:project-id                   │ │
│  │    ├── settings:project-id                           │ │
│  │    ├── documents:project-id:doc-id                   │ │
│  │    └── photos:project-id:photo-id                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Autenticação

```
User → Login Form → Supabase Auth → JWT Token
                                        ↓
                            Frontend stores in memory
                                        ↓
                            All API calls include token
```

### 2. Criar Despesa

```
User → AddExpenseDialog → api.createExpense()
                              ↓
                    POST /make-server-c4e36501/expenses
                              ↓
                    Edge Function validates token
                              ↓
                    Save to kv_store (PostgreSQL)
                              ↓
                    Return new expense with ID
                              ↓
                    Frontend updates state
                              ↓
                    UI refreshes automatically
```

### 3. Upload de Arquivo

```
User → File Input → api.uploadFile()
                         ↓
              POST /make-server-c4e36501/upload
                         ↓
              Edge Function receives file
                         ↓
              Upload to Supabase Storage (private bucket)
                         ↓
              Generate signed URL (1 hour expiry)
                         ↓
              Save metadata in kv_store
                         ↓
              Return file path + signed URL
                         ↓
              Frontend displays file
```

### 4. Multi-Project Data Isolation

```
User selects Project A
         ↓
api.setCurrentProjectId('project-a')
         ↓
All API calls include projectId
         ↓
Backend filters data: kv_store.getByPrefix('expenses:project-a:')
         ↓
Returns only Project A expenses
```

---

## 🗂️ Estrutura de Dados (KV Store)

### Key Format
```
{type}:{projectId}:{resourceId}
```

### Exemplos

```typescript
// Despesa
Key: "expenses:proj-123:exp-456"
Value: {
  id: "exp-456",
  description: "Cimento",
  amount: 500,
  category: "INFRA-ESTRUTURA",
  status: "Pendente",
  // ...
}

// Projeto
Key: "projects:user-789:proj-123"
Value: {
  id: "proj-123",
  name: "Construção Casa",
  description: "...",
  members: [...],
  // ...
}

// Configurações
Key: "settings:proj-123"
Value: {
  budget: 500000,
  categoryBudgets: {
    "INFRA-ESTRUTURA": 100000,
    "ACABAMENTO": 50000,
    // ...
  }
}

// Documento
Key: "documents:proj-123:doc-789"
Value: {
  id: "doc-789",
  name: "Contrato.pdf",
  type: "contract",
  filePath: "documents/...",
  signedUrl: "https://...",
  // ...
}
```

---

## 🔐 Segurança

### Três Tipos de Keys

```
┌─────────────────────────────────────────────────┐
│  VITE_SUPABASE_ANON_KEY                         │
│  ✅ Exposta no frontend                         │
│  ✅ Acesso limitado (RLS)                       │
│  ✅ Usada para auth e leitura                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Access Token (JWT)                             │
│  ✅ Gerado no login                             │
│  ✅ Armazenado em memória (não localStorage)   │
│  ✅ Enviado em cada requisição                  │
│  ✅ Validado no backend                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  SUPABASE_SERVICE_ROLE_KEY                      │
│  ❌ NUNCA no frontend                           │
│  ✅ Apenas no backend (Edge Functions)         │
│  ✅ Acesso total ao banco                       │
└─────────────────────────────────────────────────┘
```

### Row Level Security (RLS)

```
Bucket: make-c4e36501-documents
Policy: PRIVATE
Access: Via signed URLs only (1h expiry)

Todos os arquivos são privados e acessados via URLs temporárias.
```

---

## 📦 Componentes Principais

```
/App.tsx (Root)
├── /Landing.tsx (Not authenticated)
├── /AuthDialog.tsx (Login/Signup)
└── Authenticated:
    ├── /TopBar.tsx (Header com user menu)
    ├── /ProjectSidebar.tsx (Projects + Navigation)
    └── Main Content:
        ├── /UnifiedDashboard.tsx (Multi-project view)
        ├── /Dashboard.tsx (Single project overview)
        ├── /ExpenseList.tsx (Expenses management)
        ├── /WorkProgressDashboard.tsx (Progress tracking)
        ├── /BudgetSettings.tsx (Budget configuration)
        ├── /EmployeeManagement.tsx (Team management)
        ├── /QuotationManagement.tsx (Quotations)
        ├── /DocumentManagement.tsx (Documents + signatures)
        └── /PhotoGallery.tsx (Photos gallery)
```

---

## 🌐 Rotas do Backend

```
Base: https://{project-id}.supabase.co/functions/v1/make-server-c4e36501

GET    /health                    - Health check
POST   /signup                    - Create new user

GET    /projects                  - List user projects
POST   /projects                  - Create project
DELETE /projects/:id              - Delete project
POST   /projects/:id/members      - Add member
DELETE /projects/:id/members/:email - Remove member

GET    /expenses                  - List project expenses
POST   /expenses                  - Create expense
PUT    /expenses/:id              - Update expense
DELETE /expenses/:id              - Delete expense

GET    /settings                  - Get project settings
PUT    /settings                  - Update settings

POST   /upload                    - Upload file
GET    /download/:fileId          - Download file

GET    /documents                 - List documents
POST   /documents                 - Create document
PUT    /documents/:id             - Update document
DELETE /documents/:id             - Delete document
POST   /documents/:id/sign        - Add signature

GET    /photos                    - List photos
POST   /photos                    - Create photo
PUT    /photos/:id                - Update photo
DELETE /photos/:id                - Delete photo
```

---

## 🔄 State Management

### React State (Local)
```typescript
// Global app state
const [user, setUser] = useState<User | null>(null);
const [projects, setProjects] = useState<Project[]>([]);
const [currentProject, setCurrentProject] = useState<Project | null>(null);
const [expenses, setExpenses] = useState<Expense[]>([]);

// Component state
const [isLoading, setIsLoading] = useState(false);
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

### Supabase Auth State
```typescript
// Managed by Supabase SDK
supabase.auth.onAuthStateChange((event, session) => {
  // Auto-updates when auth state changes
});
```

---

## 🎨 Styling

```
Tailwind CSS 4.0 (Config-free)
    ↓
/styles/globals.css (Custom tokens)
    ↓
Components use utility classes
    ↓
@layer utilities for custom styles
```

---

## 📱 Responsividade

```css
/* Mobile First */
Base: Mobile layout

/* Breakpoints */
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Desktops
2xl: 1536px - Large screens
```

---

## ⚡ Performance

### Build
```
Vite
├── TypeScript compilation
├── Tree shaking
├── Code splitting
├── Minification
└── Asset optimization
```

### Runtime
```
React 18
├── Concurrent rendering
├── Automatic batching
├── Lazy loading (dialogs)
└── Memoization where needed
```

### Backend
```
Edge Functions (Deno)
├── V8 Isolates (fast cold starts)
├── Global CDN deployment
└── Auto-scaling
```

---

## 🔧 Desenvolvimento

```
Local:
npm run dev → Vite Dev Server → http://localhost:3000
                                      ↓
                              Hot Module Replacement
                                      ↓
                              Instant updates
```

```
Production Build:
npm run build → TypeScript Check → Vite Build → /dist
                                                   ↓
                                            Static files
                                                   ↓
                                    Ready for deployment
```

---

## 🚀 Deploy

```
GitHub Repository
    ↓
Vercel/Netlify detects push
    ↓
Automatic build
    ↓
Deploy to CDN
    ↓
Application live!
```

---

## 📊 Fluxo Completo de Uso

```
1. User acessa app
   ↓
2. Vê Landing Page
   ↓
3. Clica "Começar Agora"
   ↓
4. Cria conta (email/senha ou Google)
   ↓
5. Supabase Auth valida e retorna JWT
   ↓
6. Frontend armazena token e user data
   ↓
7. Redireciona para dashboard
   ↓
8. Carrega projetos do backend
   ↓
9. User cria novo projeto
   ↓
10. Adiciona despesas, documentos, fotos
    ↓
11. Tudo sincronizado em tempo real
    ↓
12. Dados persistidos no Supabase
```

---

## 🔍 Debugging

### Frontend
```
Browser DevTools (F12)
├── Console: Logs e erros
├── Network: Requisições HTTP
├── Application: Storage e cache
└── React DevTools: Component tree
```

### Backend
```
Supabase Dashboard
├── Edge Functions → Logs
├── Database → Query editor
└── Storage → File browser
```

---

Esta é a arquitetura completa do sistema! 🎉

Para mais detalhes sobre como rodar, veja [START.md](./START.md)
