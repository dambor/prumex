# 🔥 SOLUÇÃO DEFINITIVA - Erro npm 404

## O Problema

O npm está lendo algum cache ou configuração antiga que referencia pacotes JSR (do Deno) ao invés de NPM.

## ✅ SOLUÇÃO MÉTODO 1: Script Automático

```bash
# Dar permissão e executar
chmod +x clean-install.sh
./clean-install.sh
```

---

## ✅ SOLUÇÃO MÉTODO 2: Passo a Passo Manual

```bash
# 1. DELETAR TUDO relacionado ao npm
rm -rf node_modules
rm -f package-lock.json yarn.lock pnpm-lock.yaml

# 2. Limpar TODOS os caches
npm cache clean --force
npm cache verify
rm -rf ~/.npm/_cacache

# 3. Usar package.json limpo (sem versões flexíveis)
cp package-clean.json package.json

# 4. Garantir que .npmrc existe
echo "registry=https://registry.npmjs.org/" > .npmrc

# 5. Instalar com log verbose para debug
npm install --verbose 2>&1 | tee install.log
```

---

## ✅ SOLUÇÃO MÉTODO 3: Yarn (alternativa)

Se npm não funcionar, use Yarn:

```bash
# Instalar yarn
npm install -g yarn

# Limpar
rm -rf node_modules yarn.lock

# Instalar com yarn
yarn install

# Rodar com yarn
yarn dev
```

---

## ✅ SOLUÇÃO MÉTODO 4: Reinstalação Completa do Node

Se NADA funcionar:

### macOS (com Homebrew)

```bash
# Desinstalar Node atual
brew uninstall node

# Limpar tudo do npm
rm -rf ~/.npm
rm -rf /usr/local/lib/node_modules

# Reinstalar Node
brew install node@18

# Verificar versão
node -v  # Deve ser 18.x
npm -v   # Deve ser 9.x ou superior

# Agora tente instalar novamente
cd ~/prumex
rm -rf node_modules package-lock.json
npm install
```

### macOS (sem Homebrew)

```bash
# Baixar e instalar do site oficial
# https://nodejs.org/en/download/
# Escolha a versão LTS (18.x)

# Depois:
rm -rf ~/.npm
cd ~/prumex
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 DIAGNÓSTICO: Descobrir O Que Está Errado

### 1. Verificar versões

```bash
node -v    # Deve ser >= 18.0.0
npm -v     # Deve ser >= 8.0.0
```

### 2. Verificar registry do npm

```bash
npm config get registry
# Deve retornar: https://registry.npmjs.org/
```

Se não for isso:

```bash
npm config set registry https://registry.npmjs.org/
```

### 3. Verificar se há .npmrc em outros lugares

O npm lê .npmrc de vários lugares na ordem:

1. `/prumex/.npmrc` (projeto)
2. `~/.npmrc` (usuário)
3. `/usr/local/etc/npmrc` (global)

Verificar todos:

```bash
# Ver .npmrc do projeto
cat .npmrc

# Ver .npmrc do usuário (pode não existir)
cat ~/.npmrc

# Ver config global
npm config list
```

### 4. Procurar referências JSR no sistema

```bash
# Procurar em cache
grep -r "@jsr" ~/.npm 2>/dev/null | head -5

# Se encontrar, deletar:
rm -rf ~/.npm
```

### 5. Verificar logs do npm

```bash
# Ver último erro detalhado
cat ~/.npm/_logs/*debug*.log | tail -100
```

---

## 🎯 TESTE FINAL

Depois de aplicar UMA das soluções acima:

```bash
# 1. Verificar que instalou corretamente
npm list @supabase/supabase-js

# Deve mostrar:
# construcao-manager@1.0.0
# └── @supabase/supabase-js@2.39.0

# 2. Verificar que node_modules foi criado
ls -la node_modules/@supabase/supabase-js

# 3. Rodar a aplicação
npm run dev
```

---

## ❓ Por Que Isso Acontece?

### Contexto

Neste projeto temos:
- **Frontend (npm):** Usa `@supabase/supabase-js` (pacote NPM normal)
- **Backend (Deno):** Usa `jsr:@supabase/supabase-js` (pacote JSR)

São ambientes **separados**:
```
/package.json              ← NPM (npm install aqui)
/supabase/functions/       ← DENO (não afeta npm)
```

### O Que Pode Ter Acontecido

1. **Cache corrompido:** npm guardou referência JSR em cache antigo
2. **Lock file antigo:** `package-lock.json` de versão anterior tinha JSR
3. **Registry errado:** npm configurado para buscar em registry JSR
4. **Versão antiga do npm:** Algumas versões antigas tinham bugs com registries

### Por Que o .npmrc Resolve

O arquivo `.npmrc` força o npm a usar **apenas** o registry NPM:

```
registry=https://registry.npmjs.org/
```

---

## 🆘 SE NADA FUNCIONAR

### Última tentativa - Instalar pacotes um por um

```bash
# Limpar tudo
rm -rf node_modules package-lock.json

# Criar package.json mínimo
cat > package.json << 'EOF'
{
  "name": "construcao-manager",
  "private": true,
  "type": "module",
  "dependencies": {}
}
EOF

# Instalar APENAS o Supabase primeiro
npm install @supabase/supabase-js@2.39.0

# Se funcionar, instalar o resto
npm install react@18.2.0 react-dom@18.2.0
npm install sonner@1.3.1 lucide-react@0.303.0
npm install recharts@2.10.3 date-fns@3.0.6
npm install xlsx@0.18.5
npm install class-variance-authority@0.7.0 clsx@2.1.0 tailwind-merge@2.2.0

# Dev dependencies
npm install -D @types/react@18.2.43 @types/react-dom@18.2.17
npm install -D @typescript-eslint/eslint-plugin@6.14.0
npm install -D @typescript-eslint/parser@6.14.0
npm install -D @vitejs/plugin-react@4.2.1
npm install -D autoprefixer@10.4.16 postcss@8.4.32
npm install -D eslint@8.55.0
npm install -D eslint-plugin-react-hooks@4.6.0
npm install -D eslint-plugin-react-refresh@0.4.5
npm install -D tailwindcss@4.0.0
npm install -D typescript@5.2.2
npm install -D vite@5.0.8

# Depois copiar o package.json completo de volta
cp package-clean.json package.json
```

---

## 📞 Debug Avançado

### Rodar npm com máximo de logs

```bash
npm install --loglevel silly 2>&1 | tee full-install.log
```

Depois procurar por "jsr" ou "404":

```bash
grep -i "jsr\|404" full-install.log
```

### Verificar o que npm está tentando buscar

```bash
npm view @supabase/supabase-js versions --json
# Deve listar versões disponíveis no NPM

npm info @supabase/supabase-js
# Deve mostrar informações do pacote
```

Se esses comandos falharem, o problema é na **configuração do npm**, não no projeto.

---

## ✅ Checklist de Verificação

Antes de pedir ajuda, confirme que fez TUDO:

- [ ] Node.js versão >= 18.0.0
- [ ] npm versão >= 8.0.0
- [ ] Deletou `node_modules`
- [ ] Deletou `package-lock.json`
- [ ] Executou `npm cache clean --force`
- [ ] Arquivo `.npmrc` existe com `registry=https://registry.npmjs.org/`
- [ ] `npm config get registry` retorna `https://registry.npmjs.org/`
- [ ] Está na **raiz do projeto** (onde está package.json)
- [ ] `package.json` NÃO tem `@jsr` ou `jsr:` em nenhum lugar

---

**Se seguir MÉTODO 1 ou MÉTODO 2 e ainda der erro, me envie:**

1. Saída do comando: `node -v && npm -v`
2. Saída do comando: `npm config get registry`
3. Conteúdo de: `cat ~/.npm/_logs/*debug*.log | tail -50`
4. Sistema operacional e versão

Vamos resolver juntos! 💪
