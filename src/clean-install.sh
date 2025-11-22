#!/bin/bash

echo "🧹 Limpando TUDO antes de instalar..."

# 1. Remover node_modules e locks
echo "📁 Removendo node_modules e lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# 2. Limpar cache do npm
echo "🗑️  Limpando cache do npm..."
npm cache clean --force

# 3. Limpar cache global do npm (se existir)
echo "🗑️  Limpando cache global..."
rm -rf ~/.npm/_cacache 2>/dev/null || true

# 4. Verificar .npmrc
echo "📝 Verificando .npmrc..."
if [ ! -f .npmrc ]; then
    echo "⚠️  Criando .npmrc..."
    echo "registry=https://registry.npmjs.org/" > .npmrc
fi

# 5. Mostrar conteúdo do package.json
echo ""
echo "📦 Conteúdo do package.json (dependencies):"
cat package.json | grep -A 20 '"dependencies"'

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "🚀 Agora rodando: npm install"
echo ""

# 6. Instalar
npm install

# 7. Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO! Instalação concluída!"
    echo ""
    echo "📦 Pacotes instalados:"
    npm list --depth=0 2>/dev/null | grep @supabase
    echo ""
    echo "✅ Próximo passo: npm run dev"
else
    echo ""
    echo "❌ ERRO na instalação!"
    echo ""
    echo "🔍 Verifique o log completo acima"
    echo "💡 Tente: cat ~/.npm/_logs/*debug*.log | tail -50"
fi
