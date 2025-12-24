# Análise do tsconfig.json Otimizado

## Opções MANTIDAS e POR QUÊ:

### `"target": "ES2020"`
- **Por quê**: Define a versão JavaScript de saída. ES2020 é suportado por navegadores modernos e oferece recursos como optional chaining, nullish coalescing, etc.
- **Necessário**: SIM - Vite respira o compilador TypeScript

### `"module": "ES2020"`
- **Por quê**: Gera módulos ES6 nativos. Vite trabalha com ES modules.
- **Necessário**: SIM - Para que Vite faça tree-shaking e bundling otimizado

### `"lib": ["ES2020"]`
- **Por quê**: Define quais APIs globais estão disponíveis (Promise, Array.at(), etc.)
- **Necessário**: SIM - Evita erros de TypeScript com APIs modernas

### `"strict": true`
- **Por quê**: Ativa verificações rigorosas de tipo (strictNullChecks, noImplicitAny, etc.)
- **Necessário**: SIM - Garante code quality e menos bugs em produção

### `"esModuleInterop": true`
- **Por quê**: Permite importar módulos CommonJS com sintaxe ES6
- **Necessário**: NÃO (não usamos CommonJS), mas não prejudica

### `"skipLibCheck": true`
- **Por quê**: Pula type-checking das bibliotecas em node_modules
- **Necessário**: SIM - Acelera compilação, bibliotecas já checam seus tipos

### `"forceConsistentCasingInFileNames": true`
- **Por quê**: Força consistência de maiúsculas em imports (evita bugs em Windows/Mac)
- **Necessário**: SIM - Portabilidade entre SOs

### `"moduleResolution": "node"`
- **Por quê**: Usa algoritmo de resolução de módulos do Node.js
- **Necessário**: SIM - Necessário para encontrar dependências corretamente

### `"resolveJsonModule": true`
- **Por quê**: Permite importar arquivos .json
- **Necessário**: NÃO (não usamos JSON imports), mas não custa

## Opções REMOVIDAS e POR QUÊ:

### ~~`"outDir": "dist"`~~ ❌
- **Por quê foi removido**: Vite gerencia seu próprio outDir. Deixar isso causaria conflitos.
- **Agora**: Vite controla via `vite.config.ts`

### ~~`"rootDir": "src"`~~ ❌
- **Por quê foi removido**: Sem outDir, rootDir não é necessário. Vite já sabe o root.
- **Agora**: Especificado em vite.config.ts via `build.lib.entry`

### ~~`"declaration": false`~~ ❌
- **Por quê foi removido**: Vite não gera .d.ts por padrão. Era redundante.
- **Necessário**: NÃO - Vite cuida disso

### ~~`"sourceMap": false`~~ ❌
- **Por quê foi removido**: Vite já não gera sourcemaps por padrão em prod. Era redundante.
- **Necessário**: NÃO

### ~~`"allowUnusedLabels": true`~~ ❌
- **Por quê foi removido**: Nunca usamos labels em TypeScript. Era inútil.
- **Necessário**: NÃO - Cria confusão

### ~~`"allowImportingTsExtensions": false`~~ ❌
- **Por quê foi removido**: Não faz sentido com Vite, que compila .ts para .js.
- **Necessário**: NÃO

### ~~`"ts-node"`~~ ❌
- **Por quê foi removido**: Não usamos ts-node com Vite. Vite tem seu próprio dev server.
- **Necessário**: NÃO - ts-node é para rodar .ts diretamente, Vite compila antes

### ~~`"exclude": ["**/*.d.ts"]`~~ ❌
- **Por quê foi removido**: Vite já ignora esses arquivos. Era redundante.
- **Necessário**: NÃO

## Resumo Final:
```json
{
  "compilerOptions": {
    "target": "ES2020",           // Versão JS alvo
    "module": "ES2020",           // Formato de módulo (ES6)
    "lib": ["ES2020"],            // APIs disponíveis
    "strict": true,               // Type checking rigoroso
    "esModuleInterop": true,      // Compatibilidade CommonJS (seguro manter)
    "skipLibCheck": true,         // Não check node_modules (mais rápido)
    "forceConsistentCasingInFileNames": true,  // Portabilidade Windows/Mac
    "moduleResolution": "node",   // Algoritmo de resolução
    "resolveJsonModule": true     // Permite JSON imports (seguro manter)
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Benefícios da Mudança para Vite:
✅ **Sem script pós-compilação** - Vite cuida de tudo
✅ **Imports automáticos com .js** - Vite resolve isso
✅ **Um único arquivo bundled** - rpgt.mjs contém tudo
✅ **Desenvolvimento mais rápido** - HMR (Hot Module Replacement)
✅ **Build menor** - Tree-shaking automático
