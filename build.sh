#!/bin/bash

echo "🔨 Starting build process..."
echo ""

# Limpar dist anterior
echo "🧹 Cleaning old build..."
rm -rf dist

# Rodar TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found!"
  exit 1
fi

# Rodar build do Vite
echo "📦 Building with Vite..."
npx vite build

# Verificar se dist foi criado
if [ -d "dist" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Output directory: dist/"
  ls -lh dist/
else
  echo "❌ Build failed: dist directory not created"
  exit 1
fi
