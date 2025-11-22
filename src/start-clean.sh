#!/bin/bash

echo "🧹 Limpando cache do Vite e arquivos temporários..."

# 1. Remover cache do Vite
rm -rf node_modules/.vite
rm -rf .vite

# 2. Remover dist
rm -rf dist

# 3. Remover arquivos temporários .mjs
find . -name "*.timestamp-*.mjs" -delete 2>/dev/null

# 4. Limpar cache do navegador (se existir)
rm -rf .cache

echo "✅ Cache limpo!"
echo ""
echo "🚀 Iniciando servidor..."
echo ""

npm run dev
