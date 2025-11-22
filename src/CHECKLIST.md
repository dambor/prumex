# ✅ Checklist - Setup e Deploy

Use este checklist para garantir que tudo está funcionando!

---

## 📋 Fase 1: Setup Local

### Pré-requisitos
- [ ] Node.js 18+ instalado (`node -v`)
- [ ] npm instalado (`npm -v`)
- [ ] Git instalado (`git --version`)
- [ ] Editor de código (VS Code recomendado)
- [ ] Conta no Supabase criada

### Instalação
- [ ] Clonar/baixar o repositório
- [ ] Abrir terminal na pasta do projeto
- [ ] Executar `npm install`
- [ ] Aguardar instalação completa (pode levar 1-2 minutos)
- [ ] Verificar se `node_modules` foi criado

### Configuração do Supabase
- [ ] Criar projeto no Supabase Dashboard
- [ ] Aguardar projeto ficar pronto (2-3 minutos)
- [ ] Ir em Settings → API
- [ ] Copiar Project URL
- [ ] Copiar anon/public key
- [ ] Revelar e copiar service_role key

### Variáveis de Ambiente
- [ ] Executar `cp .env.example .env`
- [ ] Abrir arquivo `.env`
- [ ] Colar `VITE_SUPABASE_URL`
- [ ] Colar `VITE_SUPABASE_ANON_KEY`
- [ ] Colar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Salvar arquivo `.env`

### Backend (Edge Functions)
- [ ] Instalar Supabase CLI: `npm i -g supabase`
- [ ] Fazer login: `supabase login`
- [ ] Link ao projeto: `supabase link --project-ref SEU_PROJECT_REF`
- [ ] Deploy: `supabase functions deploy server`
- [ ] Testar: Acessar URL do health endpoint
- [ ] Verificar resposta: `{"status":"ok",...}`

### Primeiro Run
- [ ] Executar `npm run dev`
- [ ] Ver mensagem: "Local: http://localhost:3000"
- [ ] Abrir navegador em http://localhost:3000
- [ ] Ver landing page da aplicação
- [ ] Nenhum erro no console (F12)

---

## 👤 Fase 2: Primeiro Uso

### Criar Conta
- [ ] Clicar em "Começar Agora" ou "Login"
- [ ] Clicar em "Criar Conta"
- [ ] Preencher email
- [ ] Preencher senha (min 6 caracteres)
- [ ] Preencher nome
- [ ] Selecionar papel (Proprietário/Contratante)
- [ ] Clicar em "Criar Conta"
- [ ] Ver mensagem de sucesso

### Fazer Login
- [ ] Inserir email e senha
- [ ] Clicar em "Entrar"
- [ ] Ver dashboard principal
- [ ] Verificar nome do usuário no canto superior

### Criar Primeiro Projeto
- [ ] Clicar no botão "+" no sidebar
- [ ] Preencher nome do projeto
- [ ] Preencher descrição
- [ ] Clicar em "Criar Projeto"
- [ ] Ver projeto criado no sidebar
- [ ] Projeto está selecionado (destacado)

### Adicionar Primeira Despesa
- [ ] Estar na aba "Controle de Despesas"
- [ ] Clicar em "Adicionar Despesa"
- [ ] Preencher descrição
- [ ] Selecionar categoria
- [ ] Inserir valor
- [ ] Selecionar data de vencimento
- [ ] Clicar em "Adicionar"
- [ ] Ver despesa na lista

### Testar Upload de Documento
- [ ] Ir para aba "Documentos"
- [ ] Clicar em "Upload Documento"
- [ ] Selecionar arquivo
- [ ] Preencher nome
- [ ] Selecionar tipo
- [ ] Clicar em "Upload"
- [ ] Ver documento na lista

### Testar Upload de Foto
- [ ] Ir para aba "Fotos"
- [ ] Clicar em "Adicionar Fotos"
- [ ] Selecionar imagem
- [ ] Preencher descrição
- [ ] Selecionar fase
- [ ] Clicar em "Upload"
- [ ] Ver foto na galeria

---

## 🎨 Fase 3: Testar Funcionalidades

### Dashboard
- [ ] Ver gráfico de gastos vs orçamento
- [ ] Ver lista de despesas recentes
- [ ] Ver estatísticas (total gasto, pendente, etc)
- [ ] Botões funcionam

### Progresso da Obra
- [ ] Ver fases da obra
- [ ] Ver timeline
- [ ] Ver percentuais de conclusão
- [ ] Gráficos carregam

### Orçamento
- [ ] Configurar orçamento por categoria
- [ ] Salvar configurações
- [ ] Ver orçamento refletido no dashboard

### Equipe
- [ ] Adicionar funcionário
- [ ] Editar funcionário
- [ ] Excluir funcionário

### Cotações
- [ ] Criar cotação
- [ ] Aprovar/rejeitar cotação
- [ ] Excluir cotação

### Documentos
- [ ] Upload funciona
- [ ] Download funciona
- [ ] Filtros funcionam
- [ ] Assinatura digital funciona

### Fotos
- [ ] Upload funciona
- [ ] Visualização funciona
- [ ] Filtros por fase funcionam
- [ ] Download funciona

---

## 🔐 Fase 4: Autenticação (Opcional)

### Google OAuth
- [ ] Acessar Google Cloud Console
- [ ] Criar projeto OAuth
- [ ] Configurar credenciais
- [ ] Adicionar callback URL
- [ ] Copiar Client ID e Secret
- [ ] Configurar no Supabase Dashboard
- [ ] Testar login com Google
- [ ] Login funciona corretamente

---

## 🚀 Fase 5: Deploy (Produção)

### Preparação
- [ ] Build local funciona: `npm run build`
- [ ] Preview funciona: `npm run preview`
- [ ] Sem erros de TypeScript
- [ ] Sem warnings críticos
- [ ] Todas as funcionalidades testadas

### GitHub
- [ ] Criar repositório no GitHub
- [ ] Adicionar remote: `git remote add origin ...`
- [ ] Commit: `git add . && git commit -m "Initial commit"`
- [ ] Push: `git push -u origin main`
- [ ] Verificar código no GitHub

### Vercel (Recomendado)
- [ ] Criar conta no Vercel
- [ ] Conectar GitHub
- [ ] Importar repositório
- [ ] Configurar variáveis de ambiente
- [ ] Deploy automático inicia
- [ ] Deploy completa com sucesso
- [ ] Acessar URL de produção
- [ ] Aplicação funciona em produção

### Configurações Pós-Deploy
- [ ] Configurar domínio customizado (opcional)
- [ ] Atualizar OAuth callbacks (se usar Google)
- [ ] Testar autenticação em produção
- [ ] Testar uploads em produção
- [ ] Verificar logs por erros

---

## 🔍 Fase 6: Verificação Final

### Funcionalidade
- [ ] Login/Logout funciona
- [ ] Criação de projetos funciona
- [ ] CRUD de despesas funciona
- [ ] Upload de arquivos funciona
- [ ] Downloads funcionam
- [ ] Filtros e buscas funcionam
- [ ] Gráficos renderizam
- [ ] Responsivo (mobile, tablet, desktop)

### Performance
- [ ] Página carrega em < 3 segundos
- [ ] Navegação é fluida
- [ ] Upload de imagens funciona bem
- [ ] Sem memory leaks
- [ ] Console sem erros

### Segurança
- [ ] `.env` não está no Git (verificar .gitignore)
- [ ] Service Role Key não exposta no frontend
- [ ] HTTPS ativo em produção
- [ ] Autenticação obrigatória
- [ ] Buckets de storage são privados

### UX
- [ ] Mensagens de erro são claras
- [ ] Toasts aparecem nas ações
- [ ] Loading states visíveis
- [ ] Formulários validam dados
- [ ] Botões têm estados (hover, disabled)

---

## 🎉 Conclusão

Se todos os itens acima estão marcados, parabéns! 🎊

Sua aplicação está:
- ✅ Funcionando localmente
- ✅ Todas as funcionalidades testadas
- ✅ Deployada em produção
- ✅ Segura e performática
- ✅ Pronta para uso!

---

## 📝 Próximos Passos (Opcional)

### Melhorias
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Adicionar analytics
- [ ] Otimizar imagens
- [ ] Configurar PWA
- [ ] Adicionar notificações
- [ ] Implementar chat

### Monitoramento
- [ ] Configurar Sentry para error tracking
- [ ] Configurar analytics (Google Analytics, Plausible)
- [ ] Monitorar logs do Supabase
- [ ] Configurar alertas

### Documentação
- [ ] Criar guia do usuário
- [ ] Documentar API
- [ ] Criar vídeo tutorial
- [ ] FAQ

---

**Boa sorte com seu projeto!** 🚀

Se encontrar problemas, consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
