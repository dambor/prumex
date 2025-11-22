#!/bin/bash

echo "🔍 Procurando referências JSR em TODOS os arquivos..."
echo ""

# 1. Procurar em todos arquivos JSON
echo "📄 Arquivos JSON:"
find . -name "*.json" -type f -not -path "./node_modules/*" -exec echo "  {}" \; -exec grep -l "@jsr\|jsr:" {} \; 2>/dev/null

echo ""

# 2. Procurar package-lock.json escondidos
echo "🔒 Lock files:"
find . -name "package-lock.json" -o -name "yarn.lock" -o -name "pnpm-lock.yaml" -o -name "npm-shrinkwrap.json" -o -name ".npmrc" 2>/dev/null

echo ""

# 3. Procurar em node_modules (caso exista)
echo "📦 Em node_modules:"
if [ -d "node_modules" ]; then
    grep -r "@jsr/supabase" node_modules 2>/dev/null | head -5
else
    echo "  ✅ node_modules não existe (correto!)"
fi

echo ""

# 4. Ver conteúdo do package.json atual
echo "📋 package.json atual:"
cat package.json | grep -A 2 -B 2 "supabase"

echo ""

# 5. Ver se existe .npmrc
echo "⚙️  .npmrc:"
if [ -f ".npmrc" ]; then
    cat .npmrc
else
    echo "  ⚠️  .npmrc NÃO EXISTE!"
fi

echo ""

# 6. Ver config do npm
echo "🔧 Configuração do npm:"
npm config get registry
npm config get @jsr:registry 2>/dev/null || echo "  (sem config JSR - correto!)"

echo ""
echo "✅ Busca completa!"
