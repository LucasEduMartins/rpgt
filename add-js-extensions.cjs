#!/usr/bin/env node

/**
 * Script pós-compilação: Adiciona extensão .js aos imports ES modules
 * Necessário pois o TypeScript compila sem extensões, mas o navegador precisa delas
 */

const fs = require('fs');
const path = require('path');

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addJsExtensions(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      // Substitui imports sem .js por imports com .js
      const regex = /from\s+["']([^"']+?)["']/g;
      content = content.replace(regex, (match, importPath) => {
        // Se não termina com .js e não é um path relativo especial, adiciona
        if (!importPath.endsWith('.js') && 
            !importPath.startsWith('.') && 
            !importPath.includes('/')) {
          // Deixa como está (é um package externo)
          return match;
        }
        if (!importPath.endsWith('.js') && importPath.startsWith('.')) {
          modified = true;
          return `from "${importPath}.js"`;
        }
        return match;
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
    }
  });
}

// Executa no diretório dist
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  addJsExtensions(distDir);
  console.log('✅ Extensões .js adicionadas aos imports ES modules');
} else {
  console.log('⚠️  Diretório dist não encontrado');
}
