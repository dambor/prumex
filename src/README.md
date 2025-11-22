# 🏗️ Sistema de Gestão de Construção

Aplicação web completa para gerenciar despesas, documentos, fotos e progresso de projetos de construção.

## 🚀 Características

- ✅ **Gestão Financeira** - Controle de despesas, orçamentos e pagamentos
- ✅ **Multi-Projetos** - Gerencie múltiplos projetos simultaneamente
- ✅ **Dashboard Unificado** - Visão consolidada de todos os projetos
- ✅ **Equipe** - Gerenciamento de funcionários e cotações
- ✅ **Progresso da Obra** - Fases, timeline e percentuais
- ✅ **📄 Documentos** - Contratos, designs, engenharia com assinaturas digitais
- ✅ **📸 Fotos** - Galeria organizada por fase, local e tags
- ✅ **Autenticação** - Login com Google OAuth e email/senha
- ✅ **Armazenamento** - Supabase Storage + KV Store

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

## 🔧 Instalação Local

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd construcao-manager
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Como obter as credenciais:**

1. Acesse https://supabase.com/dashboard
2. Crie um novo projeto (se ainda não tiver)
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure o Supabase Edge Functions (Backend)

O backend já está configurado em `/supabase/functions/server/index.tsx`.

Para fazer deploy do backend:

```bash
# Instale o Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link ao seu projeto
supabase link --project-ref seu-project-ref

# Deploy das Edge Functions
supabase functions deploy server
```

**Ou use o dashboard do Supabase:**

1. Vá em **Edge Functions** no dashboard
2. Crie uma nova função chamada `server`
3. Cole o conteúdo de `/supabase/functions/server/index.tsx`
4. Salve e faça deploy

### 5. Configure a autenticação

**Email/Password:**
- Já está configurado automaticamente

**Google OAuth (Opcional):**

1. No Supabase Dashboard → **Authentication** → **Providers**
2. Ative **Google**
3. Siga as instruções em: https://supabase.com/docs/guides/auth/social-login/auth-google
4. Configure a URL de callback: `http://localhost:3000`

### 6. Rode a aplicação

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 🏗️ Build para Produção

```bash
# Gerar build otimizado
npm run build

# Testar build localmente
npm run preview
```

## 📦 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel login
vercel
```

Ou conecte seu repositório GitHub em: https://vercel.com/new

**Não esqueça de adicionar as variáveis de ambiente no dashboard da Vercel!**

### Netlify

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### Cloudflare Pages

1. Acesse https://pages.cloudflare.com
2. Conecte seu repositório GitHub
3. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS 4.0
- **Backend:** Supabase Edge Functions (Hono)
- **Database:** Supabase (PostgreSQL + KV Store)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Toast:** Sonner

## 📁 Estrutura do Projeto

```
/
├── components/           # Componentes React
│   ├── ui/              # Componentes de UI reutilizáveis
│   └── ...              # Componentes específicos da aplicação
├── supabase/
│   └── functions/
│       └── server/      # Backend (Edge Functions)
├── utils/               # Utilitários e helpers
├── styles/              # Estilos globais
├── App.tsx              # Componente principal
└── src/
    └── main.tsx         # Entry point
```

## 🔒 Segurança

- ⚠️ **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
- ✅ Use apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no frontend
- ✅ Todas as operações sensíveis são feitas no backend (Edge Functions)
- ✅ Arquivos são armazenados em buckets privados com URLs assinadas

## 🐛 Troubleshooting

### Erro: "Cannot read properties of null"
- Certifique-se de que está logado e tem um projeto selecionado

### Erro: "SERVER_TIMEOUT"
- Normal no primeiro acesso (cold start do Supabase)
- A aplicação usa fallback automático com dados da sessão

### Erro: "Google OAuth não configurado"
- Siga as instruções em: https://supabase.com/docs/guides/auth/social-login/auth-google
- Configure a URL de callback no Google Cloud Console

### Backend não responde
- Verifique se fez deploy das Edge Functions
- Verifique as variáveis de ambiente no Supabase Dashboard

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para simplificar a gestão de construções
