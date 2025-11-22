# 🔧 Como Corrigir o Erro npm 404

## O Erro

```
npm error 404 Not Found - GET https://registry.npmjs.org/@jsr%2fsupabase__supabase-js
npm error 404  '@jsr/supabase__supabase-js@^2.49.8' is not in this registry.
```

## Por que acontece?

O npm está tentando instalar um pacote com formato JSR (JavaScript Registry) que é usado apenas no **backend Deno**, não no frontend.

## ✅ Solução Rápida

Execute estes comandos **NA ORDEM**:

```bash
# 1. Remover cache e locks antigos
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml

# 2. Limpar cache do npm
npm cache clean --force

# 3. Instalar novamente
npm install
```

### No Windows (PowerShell)

```powershell
# 1. Remover node_modules e locks
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# 2. Limpar cache
npm cache clean --force

# 3. Instalar
npm install
```

## 🔍 Verificação

Após instalar, confirme que funcionou:

```bash
# Deve mostrar a versão instalada
npm list @supabase/supabase-js
```

Deve aparecer algo como:
```
construcao-manager@1.0.0
└── @supabase/supabase-js@2.39.0
```

## 🚀 Rodar a Aplicação

```bash
npm run dev
```

## ❓ Se o Erro Persistir

### Opção 1: Verificar .npmrc

Confirme que o arquivo `.npmrc` existe com:

```
registry=https://registry.npmjs.org/
```

### Opção 2: Reinstalação Total

```bash
# Remover TUDO
rm -rf node_modules package-lock.json .npmrc

# Criar novo .npmrc
echo "registry=https://registry.npmjs.org/" > .npmrc

# Limpar cache global
npm cache clean --force

# Instalar com verbose para ver o que está acontecendo
npm install --verbose
```

### Opção 3: Usar Yarn (alternativa)

Se npm continuar com problemas:

```bash
# Instalar yarn globalmente
npm install -g yarn

# Usar yarn ao invés de npm
yarn install

# Rodar com yarn
yarn dev
```

## 📝 Explicação Técnica

### O que é JSR?

- **JSR** é o JavaScript Registry usado pelo **Deno** (ambiente de backend)
- **NPM** é o Node Package Manager usado pelo **Node.js** (ambiente frontend)

### Nossa Estrutura

```
/package.json                    ← NPM (usa @supabase/supabase-js)
/supabase/functions/server/      ← DENO (usa jsr:@supabase/...)
```

Os dois ambientes são **separados** e não devem interferir um no outro.

### Por que aconteceu?

Possíveis causas:
1. Um `package-lock.json` antigo tinha referência JSR
2. Cache do npm estava corrompido
3. Configuração incorreta do registry

### Arquivos Criados para Prevenir

Criei dois arquivos para evitar esse problema:

**`.npmrc`** - Força uso do registry NPM
```
registry=https://registry.npmjs.org/
```

**`.gitignore`** - Ignora locks (permite regenerar limpo)
```
package-lock.json
yarn.lock
pnpm-lock.yaml
```

## ✅ Checklist de Solução

- [ ] Deletou `node_modules`
- [ ] Deletou `package-lock.json`
- [ ] Limpou cache: `npm cache clean --force`
- [ ] Arquivo `.npmrc` existe
- [ ] Executou `npm install`
- [ ] Sem erros 404
- [ ] `npm run dev` funciona

## 🆘 Ainda com Problemas?

### Mostrar versões

```bash
node -v    # Deve ser 18+
npm -v     # Deve ser 8+
```

### Se Node < 18

Atualize o Node.js:
- https://nodejs.org (baixe a versão LTS)

### Verificar package.json

Abra `package.json` e confirme que tem:

```json
"dependencies": {
  "@supabase/supabase-js": "^2.39.0",
  ...
}
```

**NÃO deve ter:**
- `@jsr/supabase__supabase-js`
- `jsr:@supabase/supabase-js`

## 💡 Dica Pro

Para evitar problemas futuros, sempre rode:

```bash
# Antes de instalar
npm cache clean --force
rm -rf node_modules package-lock.json

# Depois instalar
npm install
```

---

**Isso deve resolver! Se continuar com erro, me avise e investigamos mais a fundo.** 😊
