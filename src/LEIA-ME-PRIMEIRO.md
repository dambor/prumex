# 👋 LEIA-ME PRIMEIRO!

## O que é este projeto?

**Sistema completo de Gestão de Construção** 🏗️

Uma aplicação web para gerenciar **todos os aspectos** de projetos de construção:

✅ Controle de despesas e orçamento  
✅ Upload e gestão de documentos  
✅ Galeria de fotos da obra  
✅ Acompanhamento de progresso  
✅ Gestão de equipe  
✅ Sistema de cotações  
✅ Multi-projetos  
✅ Autenticação segura  

---

## 🎯 Você está em uma destas situações?

### 1️⃣ "Só quero rodar e ver funcionando!"

**→ Vá para:** [START.md](./START.md)

**Tempo:** 15 minutos  
**Comandos:** 3  
**Dificuldade:** ⭐ Fácil

---

### 2️⃣ "Sou desenvolvedor, já sei o que fazer"

**→ Vá para:** [QUICKSTART.md](./QUICKSTART.md)

**Tempo:** 5 minutos  
**Comandos:** 4  
**Dificuldade:** ⭐⭐ Intermediário

---

### 3️⃣ "Quero entender tudo antes de começar"

**→ Vá para:** [README.md](./README.md)

**Tempo:** 15-20 minutos de leitura  
**Depois vá para:** [SETUP.md](./SETUP.md)

---

### 4️⃣ "Já rodei mas deu erro"

**→ Vá para:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Procure seu erro na lista ou use Ctrl+F

---

### 5️⃣ "Preciso de um comando específico"

**→ Vá para:** [COMANDOS.md](./COMANDOS.md)

Todos os comandos organizados e prontos para copiar

---

### 6️⃣ "Vou fazer deploy em produção"

**→ Vá para:** [CHECKLIST.md](./CHECKLIST.md)

Use o checklist para não esquecer nada importante

---

## 🚀 Rota Expressa (Mais Rápida)

Se você quer ver funcionando **AGORA**, copie e cole:

```bash
# 0. Limpar (se já tentou instalar antes)
rm -rf node_modules package-lock.json

# 1. Instalar
npm install

# 2. Criar .env
cp .env.example .env

# 3. Rodar
npm run dev
```

Abra: http://localhost:3000

⚠️ **Se der erro 404 no npm install:** Veja [FIX-NPM-ERROR.md](./FIX-NPM-ERROR.md)

⚠️ **ATENÇÃO:** Vai funcionar mas com erros porque o `.env` está vazio.

**Próximo passo obrigatório:** Configurar Supabase  
→ Veja [START.md](./START.md) seção "Obter Credenciais"

---

## 📚 Toda a Documentação

Temos **8 guias completos:**

| Arquivo | O que é | Quando usar |
|---------|---------|-------------|
| [START.md](./START.md) | 🌟 Guia para iniciantes | Primeira vez |
| [QUICKSTART.md](./QUICKSTART.md) | ⚡ Guia rápido | Já tem experiência |
| [README.md](./README.md) | 📖 Visão geral | Entender o projeto |
| [SETUP.md](./SETUP.md) | 🔧 Setup detalhado | Instalação completa |
| [COMANDOS.md](./COMANDOS.md) | 🎮 Referência de comandos | Consulta diária |
| [CHECKLIST.md](./CHECKLIST.md) | ✅ Checklists | Deploy e setup |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 🔧 Resolução de problemas | Quando der erro |
| [DOCS-INDEX.md](./DOCS-INDEX.md) | 📚 Índice | Navegação |

---

## ⏱️ Quanto Tempo Vai Levar?

### Setup Inicial
- **Mínimo (só rodar):** 5 minutos
- **Completo (com Supabase):** 30-45 minutos
- **Primeira vez (nunca usou):** 1-2 horas

### Primeiro Uso
- **Criar conta e testar:** 10 minutos
- **Testar todas as funcionalidades:** 30 minutos

### Deploy
- **Deploy básico:** 15 minutos
- **Deploy completo com domínio:** 1 hora

---

## 🎓 Pré-requisitos

### Obrigatórios
- Node.js 18+ ([Download](https://nodejs.org))
- Conta no Supabase ([Criar grátis](https://supabase.com))

### Recomendados
- Git
- VS Code
- Conhecimento básico de terminal

### Opcionais
- Conta no Vercel (para deploy)
- Google Cloud (para OAuth)

---

## 🛣️ Caminho Recomendado

```
┌─────────────────────────────────────────────┐
│  1. Ler este arquivo (LEIA-ME-PRIMEIRO.md) │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  2. Escolher sua rota acima (1️⃣ a 6️⃣)       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  3. Seguir o guia escolhido                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  4. Aplicação funcionando! 🎉               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  5. Usar COMANDOS.md como referência        │
└─────────────────────────────────────────────┘
```

---

## ⚡ Quick Commands

### Rodar Localmente
```bash
npm run dev
```

### Fazer Build
```bash
npm run build
```

### Ver Todos os Comandos
```bash
# Abra: COMANDOS.md
```

---

## 🆘 Precisa de Ajuda?

### Problema com instalação
→ [SETUP.md](./SETUP.md)

### Erro ao rodar
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Não sabe um comando
→ [COMANDOS.md](./COMANDOS.md)

### Quer fazer deploy
→ [CHECKLIST.md](./CHECKLIST.md) Fase 5

### Dúvida geral
→ [README.md](./README.md)

---

## 💡 Dicas Importantes

1. **Não pule o .env!** Sem ele nada funciona
2. **Backend é obrigatório!** Precisa fazer deploy no Supabase
3. **Google OAuth é opcional!** Use email/senha se preferir
4. **Consulte COMANDOS.md sempre!** Todos os comandos estão lá
5. **Use os checklists!** Eles garantem que nada foi esquecido

---

## 🎯 Objetivo Final

Ao terminar, você terá:

✅ Aplicação rodando localmente  
✅ Conta criada e funcionando  
✅ Primeiro projeto criado  
✅ Despesas, documentos e fotos funcionando  
✅ (Opcional) Deploy em produção  
✅ (Opcional) Domínio customizado  

---

## 🚀 Próximo Passo

**Escolha sua rota acima (1️⃣ a 6️⃣) e comece!**

Se estiver em dúvida, vá para: [START.md](./START.md)

---

## 📞 Suporte

- **Documentação:** Você está nela! 📚
- **Issues:** Abra uma issue no GitHub
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Boa sorte! Você consegue! 💪**

*Desenvolvido com ❤️ para facilitar a gestão de construções*