#!/bin/bash

echo "🔥 CORREÇÃO DEFINITIVA - Removendo TODAS as referências JSR"
echo ""

# 1. Deletar TUDO relacionado ao npm/yarn
echo "🗑️  Deletando node_modules, locks, e caches..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml
rm -f npm-shrinkwrap.json
rm -rf ~/.npm/_cacache
rm -rf .npm

# 2. Limpar cache npm
echo "🧹 Limpando cache do npm..."
npm cache clean --force
npm cache verify

# 3. Remover qualquer configuração JSR do npm
echo "🔧 Removendo configurações JSR..."
npm config delete @jsr:registry 2>/dev/null || true
npm config delete jsr:registry 2>/dev/null || true

# 4. Garantir registry correto
echo "✅ Configurando registry NPM..."
npm config set registry https://registry.npmjs.org/

# 5. Criar .npmrc no projeto
echo "📝 Criando .npmrc..."
cat > .npmrc << 'EOF'
registry=https://registry.npmjs.org/
package-lock=true
EOF

# 6. Usar package.json limpo (sem ^ nas versões)
echo "📦 Usando package.json limpo..."
if [ -f "package-clean.json" ]; then
    cp package.json package.json.backup
    cp package-clean.json package.json
    echo "  ✅ package.json atualizado (backup em package.json.backup)"
fi

# 7. Verificar que package.json está correto
echo ""
echo "🔍 Verificando package.json:"
if grep -q "@jsr" package.json; then
    echo "  ❌ ERRO: package.json contém referências JSR!"
    grep "@jsr" package.json
    exit 1
else
    echo "  ✅ package.json está limpo (sem JSR)"
fi

# 8. Mostrar dependências
echo ""
echo "📋 Dependências que serão instaladas:"
cat package.json | jq -r '.dependencies | keys[]' 2>/dev/null || cat package.json | grep -A 20 '"dependencies"'

echo ""
echo "🚀 Iniciando instalação..."
echo ""

# 9. Instalar com flags para evitar cache
npm install --prefer-online --no-audit --loglevel=info

# 10. Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "✅✅✅ SUCESSO! ✅✅✅"
    echo ""
    echo "📦 Pacotes instalados:"
    npm list --depth=0 2>/dev/null | grep -E "supabase|react|vite"
    echo ""
    echo "🎉 Próximo passo: npm run dev"
else
    echo ""
    echo "❌❌❌ ERRO! ❌❌❌"
    echo ""
    echo "🔍 Verificando configuração:"
    echo ""
    echo "Registry:"
    npm config get registry
    echo ""
    echo "Node version:"
    node -v
    echo ""
    echo "npm version:"
    npm -v
    echo ""
    echo "📝 Último log de erro:"
    cat ~/.npm/_logs/*debug*.log 2>/dev/null | tail -30
    echo ""
    echo "💡 Tente manualmente:"
    echo "   npm install @supabase/supabase-js@2.39.0"
fi
