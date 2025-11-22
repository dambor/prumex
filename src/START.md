# 🎬 START - Como Rodar Esta Aplicação

## 🎯 Objetivo

Você está a **3 comandos** de ver sua aplicação funcionando!

---

## ⚡ Método Rápido (3 Comandos)

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```
*Aguarde 1-2 minutos...*

```bash
cp .env.example .env
```
*Arquivo .env criado!*

```bash
npm run dev
```

**Pronto!** Abra: http://localhost:3000

---

## ⚠️ IMPORTANTE

A aplicação vai rodar, mas você verá erros ao tentar usar porque:

❌ O arquivo `.env` está vazio  
❌ Você precisa de credenciais do Supabase

---

## 🔑 Obter Credenciais (5 Minutos)

### 1. Criar Conta no Supabase

Acesse: https://supabase.com

Clique em: **"Start your project"**

Faça login com GitHub (mais rápido)

### 2. Criar Projeto

No dashboard, clique: **"New Project"**

Preencha:
- **Name:** meu-projeto-construcao
- **Password:** Crie uma senha forte (anote!)
- **Region:** South America (São Paulo)
- **Plan:** Free

Clique: **"Create new project"**

⏳ Aguarde 2-3 minutos (Supabase está preparando tudo)

### 3. Copiar Credenciais

Quando o projeto estiver pronto:

1. No menu lateral: **Settings** ⚙️
2. Clique em: **API**
3. Você verá:

```
Project URL
https://abcd1234.supabase.co

Project API keys
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

service_role
[Clique em "Reveal" para ver]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

### 4. Colar no .env

Abra o arquivo `.env` no seu editor

Cole assim:

```env
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

**Salve o arquivo!** (Ctrl+S)

---

## 🚀 Configurar Backend (5 Minutos)

O backend precisa estar rodando no Supabase.

### Opção A: Via CLI (Mais Rápido)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link (substitua abcd1234 pelo SEU project-ref)
supabase link --project-ref abcd1234

# Deploy
supabase functions deploy server
```

✅ Pronto! Backend no ar!

### Opção B: Via Dashboard (Sem CLI)

1. No Supabase Dashboard, menu lateral: **Edge Functions**
2. Clique: **"Create a new function"**
3. Nome: `server`
4. Clique: **"Create function"**
5. No editor que abrir, APAGUE tudo
6. Abra o arquivo: `/supabase/functions/server/index.tsx`
7. **COPIE TODO O CONTEÚDO**
8. **COLE** no editor do Supabase
9. Clique: **"Deploy"** (botão verde no canto superior direito)

⏳ Aguarde 10-30 segundos

✅ Veja: "Deployment successful"

---

## ✅ Testar

### 1. Testar Backend

Cole esta URL no navegador (substitua `abcd1234`):

```
https://abcd1234.supabase.co/functions/v1/make-server-c4e36501/health
```

**Deve aparecer:**
```json
{"status":"ok","timestamp":"2024-11-22T..."}
```

✅ Backend funcionando!

### 2. Rodar Aplicação

No terminal:

```bash
npm run dev
```

Abra: http://localhost:3000

**Você deve ver:**
- Landing page bonita
- Botão "Começar Agora"
- Sem erros no console (F12)

✅ Frontend funcionando!

### 3. Criar Conta

1. Clique: **"Começar Agora"**
2. Clique: **"Criar Conta"**
3. Preencha:
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres
   - Nome: Seu Nome
   - Papel: Proprietário
4. Clique: **"Criar Conta"**

✅ Conta criada!

### 4. Criar Projeto

1. Após login, clique no **"+"** no sidebar esquerdo
2. Preencha:
   - Nome: Construção da Minha Casa
   - Descrição: Obra completa
3. Clique: **"Criar Projeto"**

✅ Tudo funcionando! 🎉

---

## 🎮 Usar a Aplicação

Agora você pode:

### ➕ Adicionar Despesas
- Botão "Adicionar Despesa"
- Preencha os dados
- Upload de nota fiscal (opcional)

### 📊 Ver Dashboard
- Gráficos de gastos
- Estatísticas
- Progresso da obra

### 📄 Gerenciar Documentos
- Aba "Documentos"
- Upload de contratos, projetos, etc
- Assinaturas digitais

### 📸 Adicionar Fotos
- Aba "Fotos"
- Upload de fotos da obra
- Organize por fase

### 👥 Gerenciar Equipe
- Aba "Equipe"
- Adicione funcionários
- Crie cotações

---

## ❓ Problemas?

### "Cannot connect to server"
→ Verifique se configurou o backend (passo 🚀 acima)

### "Google OAuth not configured"
→ Isso é opcional! Use email/senha

### "Page not loading"
→ Verifique se o `.env` está configurado corretamente

### Outros problemas
→ Veja: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Documentação Completa

- **🚀 Início Rápido:** [QUICKSTART.md](./QUICKSTART.md)
- **📋 Setup Detalhado:** [SETUP.md](./SETUP.md)
- **✅ Checklist:** [CHECKLIST.md](./CHECKLIST.md)
- **🎮 Comandos:** [COMANDOS.md](./COMANDOS.md)
- **🔧 Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **📖 README:** [README.md](./README.md)

---

## 🎉 Parabéns!

Se você chegou até aqui e está vendo a aplicação funcionando:

**Você é demais! 🎊**

Agora é só usar e aproveitar! 🚀

---

**Desenvolvido com ❤️ para facilitar sua gestão de construção**
