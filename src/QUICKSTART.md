# ⚡ Quick Start - Rodar Localmente em 5 Minutos

## 📦 1. Instalar Dependências (30 segundos)

```bash
npm install
```

## ⚙️ 2. Configurar Variáveis de Ambiente (2 minutos)

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

**Edite o `.env` e adicione suas credenciais:**

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Como obter as credenciais:**

1. Acesse: https://supabase.com/dashboard
2. Crie um projeto (se não tiver)
3. Vá em **Settings** → **API**
4. Copie as chaves

## 🚀 3. Rodar (10 segundos)

```bash
npm run dev
```

Abra: **http://localhost:3000**

## ✅ Pronto!

Agora você pode:
- Criar uma conta
- Criar projetos
- Adicionar despesas
- Upload de documentos e fotos

---

## 🔧 Ainda não configurou o Supabase?

**Opção 1: Usar o projeto já configurado (apenas para testes)**

O código já vem com um projeto Supabase de demonstração configurado.
Você pode rodar `npm run dev` imediatamente!

**Opção 2: Criar seu próprio projeto (recomendado para produção)**

Siga o guia completo: [SETUP.md](./SETUP.md)

---

## 🎯 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Gera build de produção
npm run preview          # Testa build localmente

# Linting
npm run lint             # Verifica código
```

---

## 🐛 Problemas?

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"
Mate o processo na porta 3000 ou edite `vite.config.ts` para usar outra porta:

```typescript
server: {
  port: 3001,  // Mude aqui
}
```

### Página em branco
1. Abra o Console do navegador (F12)
2. Veja os erros
3. Verifique se o `.env` está configurado

---

## 📚 Documentação Completa

- **Setup detalhado:** [SETUP.md](./SETUP.md)
- **README:** [README.md](./README.md)
- **Deploy:** Ver seção de Deploy no README

---

**Dúvidas?** Consulte os arquivos de documentação ou abra uma issue! 😊
