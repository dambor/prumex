# 🎮 Comandos Prontos - Copie e Cole

## 🚀 Setup Inicial Completo (Copie Tudo)

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de ambiente
cp .env.example .env

# 3. Editar .env (abra no seu editor favorito)
# Adicione suas credenciais do Supabase

# 4. Rodar aplicação
npm run dev
```

---

## 📦 Instalação de Dependências

```bash
# Instalação padrão
npm install

# Instalação limpa (se tiver problemas)
rm -rf node_modules package-lock.json
npm install

# Verificar se instalou tudo
npm list
```

---

## 🏃 Executar a Aplicação

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo desenvolvimento em outra porta
# (edite vite.config.ts primeiro)
npm run dev

# Build para produção
npm run build

# Testar build de produção localmente
npm run preview

# Verificar erros de código
npm run lint
```

---

## 🗄️ Supabase CLI

```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Login no Supabase
supabase login

# Link ao projeto (substitua pelo seu project-ref)
supabase link --project-ref eialseqcakhtczizukqr

# Deploy do backend
supabase functions deploy server

# Ver logs do backend
supabase functions logs server

# Ver logs em tempo real
supabase functions logs server --follow
```

---

## 🧹 Limpeza e Reset

```bash
# Limpar cache do Vite
rm -rf node_modules/.vite

# Limpar build
rm -rf dist

# Limpar tudo
rm -rf node_modules package-lock.json dist .vite
npm install
```

---

## 🔍 Debug e Testes

```bash
# Rodar com logs detalhados (Linux/Mac)
DEBUG=* npm run dev

# Rodar com logs detalhados (Windows CMD)
set DEBUG=* && npm run dev

# Rodar com logs detalhados (Windows PowerShell)
$env:DEBUG="*"; npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit

# Build com análise
npm run build -- --mode development
```

---

## 🌐 Git e GitHub

```bash
# Inicializar repositório (se ainda não fez)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit - Sistema de Gestão de Construção"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Push para GitHub
git push -u origin main

# Ver status
git status

# Ver diferenças
git diff

# Ver histórico
git log --oneline
```

---

## 🚀 Deploy

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (produção)
vercel --prod

# Ver logs
vercel logs
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy (produção)
netlify deploy --prod

# Ver logs
netlify logs
```

---

## 🔐 Variáveis de Ambiente

### Criar .env local

```bash
cp .env.example .env
```

### Conteúdo do .env (edite com suas credenciais)

```env
VITE_SUPABASE_URL=https://eialseqcakhtczizukqr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verificar se .env foi carregado

Adicione temporariamente em qualquer arquivo `.tsx`:

```typescript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
```

---

## 🧪 Testar Backend

```bash
# Testar health endpoint (substitua pelo seu project ID)
curl https://eialseqcakhtczizukqr.supabase.co/functions/v1/make-server-c4e36501/health

# Deve retornar algo como:
# {"status":"ok","timestamp":"2024-11-22T..."}
```

---

## 🛠️ Utilitários

### Verificar versões

```bash
node -v          # Versão do Node
npm -v           # Versão do npm
git --version    # Versão do Git
```

### Abrir projeto no VS Code

```bash
code .
```

### Abrir no navegador

```bash
# Mac
open http://localhost:3000

# Linux
xdg-open http://localhost:3000

# Windows
start http://localhost:3000
```

### Matar processo na porta 3000

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero_do_pid> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Alternativa Mac/Linux
kill -9 $(lsof -ti:3000)
```

---

## 📊 Pacotes Adicionais (se precisar)

```bash
# Adicionar nova dependência
npm install nome-do-pacote

# Adicionar dependência de desenvolvimento
npm install -D nome-do-pacote

# Remover dependência
npm uninstall nome-do-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated
```

---

## 🎯 Comandos Rápidos do Dia a Dia

```bash
# Começar a trabalhar
git pull
npm install
npm run dev

# Fazer commit
git add .
git commit -m "feat: sua mensagem aqui"
git push

# Atualizar e rodar
git pull
npm install
npm run dev
```

---

## 🔥 One-Liners Úteis

```bash
# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json dist && npm install

# Build e preview em um comando
npm run build && npm run preview

# Commit rápido
git add . && git commit -m "update" && git push

# Deploy no Vercel em um comando
vercel --prod

# Ver tamanho dos pacotes
npm ls --depth=0
```

---

## 💡 Dicas Pro

### Aliases úteis (adicione ao seu .bashrc ou .zshrc)

```bash
alias dev="npm run dev"
alias build="npm run build"
alias clean="rm -rf node_modules package-lock.json dist"
alias fresh="npm install && npm run dev"
```

### VS Code - Abrir terminal integrado
`Ctrl + `` (backtick)

### Chrome DevTools
`F12` ou `Ctrl+Shift+I` (Windows/Linux)  
`Cmd+Option+I` (Mac)

---

Copie os comandos que precisar e seja feliz! 😊
