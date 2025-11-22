# 🚀 Guia de Setup Rápido

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Supabase

### 2.1 Criar conta no Supabase (se não tiver)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub)

### 2.2 Criar um novo projeto

1. No dashboard, clique em "New Project"
2. Preencha:
   - **Name:** gestao-construcao (ou qualquer nome)
   - **Database Password:** Crie uma senha forte (guarde-a!)
   - **Region:** South America (São Paulo) - mais próximo do Brasil
   - **Pricing Plan:** Free
3. Clique em "Create new project"
4. Aguarde 2-3 minutos (Supabase está criando seu banco de dados)

### 2.3 Obter as credenciais

Após o projeto ser criado:

1. Vá em **Settings** (⚙️ no menu lateral)
2. Clique em **API**
3. Você verá:

```
Project URL: https://eialseqcakhtczizukqr.supabase.co
anon public: eyJhbGci...
service_role: eyJhbGci... (clique em "Reveal" para ver)
```

### 2.4 Criar arquivo .env

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` e cole suas credenciais:

```env
VITE_SUPABASE_URL=https://eialseqcakhtczizukqr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 3: Deploy do Backend (Edge Functions)

### Opção A: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto (pegar project-ref no dashboard, ex: eialseqcakhtczizukqr)
supabase link --project-ref eialseqcakhtczizukqr

# 4. Deploy da função
supabase functions deploy server
```

### Opção B: Via Dashboard (Mais Fácil para Iniciantes)

1. No Supabase Dashboard, vá em **Edge Functions** (menu lateral)
2. Clique em "Create a new function"
3. Nome: `server`
4. Clique em "Create function"
5. Copie todo o conteúdo de `/supabase/functions/server/index.tsx`
6. Cole no editor do dashboard
7. Clique em "Deploy" (botão verde no canto superior direito)

**⚠️ IMPORTANTE:** Você também precisa fazer deploy dos arquivos auxiliares:

**Arquivo 1: kv_store.tsx**
1. No editor, clique no "+" ao lado de "server"
2. Crie novo arquivo: `kv_store.tsx`
3. Cole o conteúdo de `/supabase/functions/server/kv_store.tsx`
4. Salve

**Arquivo 2: ocr.tsx**
1. Repita o processo
2. Crie novo arquivo: `ocr.tsx`
3. Cole o conteúdo de `/supabase/functions/server/ocr.tsx`
4. Salve

5. Clique em "Deploy" novamente

### Verificar se funcionou

Acesse no navegador (substitua pelo seu project-ref):

```
https://eialseqcakhtczizukqr.supabase.co/functions/v1/make-server-c4e36501/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Passo 4: Configurar Autenticação

### 4.1 Email/Password (Já funciona!)

Não precisa configurar nada, já está pronto! ✅

### 4.2 Google OAuth (Opcional)

Se quiser permitir login com Google:

1. No Supabase Dashboard → **Authentication** → **Providers**
2. Encontre "Google" e clique em "Enable"
3. Siga o guia: https://supabase.com/docs/guides/auth/social-login/auth-google

**Resumo rápido:**
- Vá em https://console.cloud.google.com
- Crie um projeto
- Ative "Google+ API"
- Crie credenciais OAuth 2.0
- Adicione callback URL: `https://eialseqcakhtczizukqr.supabase.co/auth/v1/callback`
- Cole Client ID e Client Secret no Supabase

**Para desenvolvimento local:**
- Adicione também: `http://localhost:3000`

## Passo 5: Rodar a Aplicação

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## Passo 6: Criar sua Primeira Conta

1. Na tela inicial, clique em "Começar Agora"
2. Clique em "Criar Conta"
3. Preencha:
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres
   - Nome: Seu Nome
   - Papel: Proprietário ou Contratante
4. Clique em "Criar Conta"
5. Depois faça login

## Passo 7: Criar seu Primeiro Projeto

1. Após login, clique no botão "+" no sidebar
2. Preencha:
   - Nome do Projeto: Construção da Minha Casa
   - Descrição: Reforma completa
3. Clique em "Criar Projeto"

Pronto! 🎉 Agora você pode:
- Adicionar despesas
- Fazer upload de documentos
- Adicionar fotos da obra
- Acompanhar o progresso

## 🐛 Problemas Comuns

### "Erro ao conectar com servidor"
- Verifique se fez deploy do backend (Passo 3)
- Verifique as variáveis de ambiente no `.env`
- Teste a URL: `https://SEU-PROJECT.supabase.co/functions/v1/make-server-c4e36501/health`

### "SERVER_TIMEOUT"
- Normal na primeira requisição (cold start)
- Aguarde 5-10 segundos e tente novamente
- O sistema usa fallback automático

### "Google OAuth não configurado"
- É opcional! Use email/password
- Ou siga o Passo 4.2

### Página em branco
- Abra o Console (F12)
- Veja os erros
- Verifique se o `.env` está configurado corretamente

## 🎯 Próximos Passos

Após tudo funcionando localmente:

1. ✅ Teste todas as funcionalidades
2. ✅ Faça commit no GitHub
3. ✅ Deploy em produção (Vercel/Netlify)

**Dúvidas?** Abra uma issue no GitHub! 😊
