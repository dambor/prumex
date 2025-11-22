# 🔧 Troubleshooting - Solucionando Problemas

## 🚨 Erros Comuns e Soluções

### 1. "Cannot read properties of null (reading 'name')"

**Causa:** Dados de usuário não carregados completamente

**Solução:**
- ✅ **JÁ CORRIGIDO!** A versão atual tem null checks
- Faça refresh da página (F5)
- Verifique se está logado
- Limpe o cache: Ctrl+Shift+Delete

### 2. "SERVER_TIMEOUT" ou "Could not fetch user data"

**Causa:** Cold start do Supabase Edge Functions (primeira requisição)

**Solução:**
- ✅ **É NORMAL!** A aplicação usa fallback automático
- Aguarde 5-10 segundos
- Recarregue a página
- O sistema continua funcionando mesmo com timeout

**Como evitar:**
```bash
# Manter o servidor "aquecido" fazendo ping a cada 5 minutos
# (apenas em desenvolvimento)
```

### 3. "Failed to fetch" ou "Network Error"

**Causa:** Backend não está rodando ou .env não configurado

**Checklist:**
- [ ] Arquivo `.env` existe e está configurado?
- [ ] As credenciais estão corretas?
- [ ] Fez deploy do backend no Supabase?
- [ ] A URL do backend está acessível?

**Testar backend:**
```bash
# Substitua pelo seu project ID
curl https://eialseqcakhtczizukqr.supabase.co/functions/v1/make-server-c4e36501/health
```

Deve retornar: `{"status":"ok","timestamp":"..."}`

### 4. "Google OAuth not configured" ou erro no login Google

**Causa:** OAuth não configurado no Supabase

**Solução:**
- Use login com email/password (já funciona!)
- Ou configure OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google

**Passos resumidos:**
1. Google Cloud Console → Criar projeto
2. Ativar Google+ API
3. Criar credenciais OAuth 2.0
4. Callback URL: `https://SEU-PROJECT.supabase.co/auth/v1/callback`
5. Copiar Client ID e Secret para Supabase Dashboard

### 5. Página em branco

**Causa:** Erro de build ou dependências

**Solução:**
```bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json dist

# 2. Reinstalar
npm install

# 3. Tentar rodar
npm run dev
```

**Ainda em branco?**
- Abra Console do navegador (F12)
- Veja a aba "Console" para erros
- Veja a aba "Network" para requisições falhando

### 6. "Module not found" ou "Cannot find module"

**Causa:** Dependência não instalada

**Solução:**
```bash
npm install
```

**Erro específico:** `Cannot find module 'path'`
```bash
npm install --save-dev @types/node
```

### 7. "Port 3000 is already in use"

**Solução A:** Matar processo na porta 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solução B:** Usar outra porta

Edite `vite.config.ts`:
```typescript
server: {
  port: 3001, // ou qualquer porta livre
}
```

### 8. Erro de TypeScript no build

**Causa:** Tipos não reconhecidos

**Solução:**
```bash
# Limpar cache do TypeScript
rm -rf node_modules/.vite

# Reinstalar
npm install

# Tentar build novamente
npm run build
```

### 9. "403 Forbidden" ou "Unauthorized"

**Causa:** Token expirado ou permissões incorretas

**Solução:**
- Faça logout e login novamente
- Verifique se as keys do Supabase estão corretas
- Verifique se não expôs `SERVICE_ROLE_KEY` no frontend

### 10. Imagens não carregam

**Causa:** Bucket do Supabase não existe ou está privado

**Solução:**
1. Supabase Dashboard → **Storage**
2. Crie buckets se não existirem:
   - `make-c4e36501-invoices`
   - `make-c4e36501-receipts`
   - `make-c4e36501-documents`
   - `make-c4e36501-photos`
3. Configure como **Private** (o backend gera URLs assinadas)

---

## 🔍 Debugging Avançado

### Console do Navegador (F12)

**Verificar estado da aplicação:**
```javascript
// No console do navegador
window.debugSettings()  // Ver configurações atuais
```

**Ver dados no localStorage:**
```javascript
localStorage
```

### Logs do Backend

**Supabase Dashboard:**
1. Edge Functions → `server`
2. Clique em "Logs"
3. Veja erros em tempo real

**Via CLI:**
```bash
supabase functions logs server
```

### Verificar requisições

1. F12 → Aba "Network"
2. Filtre por "Fetch/XHR"
3. Veja quais requisições estão falhando
4. Clique para ver detalhes (Headers, Response, etc)

---

## 🆘 Ainda com Problemas?

### 1. Verifique as Issues no GitHub
Alguém pode ter tido o mesmo problema!

### 2. Abra uma Nova Issue
Inclua:
- Sistema operacional
- Versão do Node.js (`node -v`)
- Mensagem de erro completa
- Console logs (F12)
- Passos para reproduzir

### 3. Logs Completos

Rode com logs detalhados:
```bash
# Windows
set DEBUG=* && npm run dev

# Mac/Linux
DEBUG=* npm run dev
```

---

## ✅ Checklist de Saúde da Aplicação

Use este checklist para diagnosticar problemas:

- [ ] Node.js 18+ instalado? (`node -v`)
- [ ] Dependências instaladas? (`npm install`)
- [ ] Arquivo `.env` existe e está configurado?
- [ ] Credenciais do Supabase corretas?
- [ ] Backend deployado no Supabase?
- [ ] Health check do backend funciona?
- [ ] Consegue criar conta/fazer login?
- [ ] Console do navegador sem erros críticos?

---

## 🔗 Links Úteis

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com

---

**Lembre-se:** A maioria dos problemas são resolvidos com:
1. `npm install`
2. Verificar `.env`
3. Limpar cache do navegador
4. Recarregar a página

😊 Boa sorte!
