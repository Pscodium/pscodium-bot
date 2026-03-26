# 🧪 Testes do EmbedBuilder - Discord.js

Este diretório contém testes unitários e exemplos práticos para o **EmbedBuilder** do Discord.js, especialmente focado no contexto do bot de jogos Pscodium.

## 📁 Estrutura

```
tests/
├── embedBuilder.test.ts           # Testes unitários completos
├── examples/
│   └── embedBuilder-examples.ts   # Exemplos práticos e interativos
└── README.md                      # Este arquivo
```

## 🚀 Como Executar

### Testes Unitários
```bash
# Executar todos os testes
npm test

# Executar com watch mode (re-executa automaticamente)
npm run test:watch

# Executar com relatório de cobertura
npm run test:coverage
```

### Exemplos Práticos
```bash
# Executar exemplos interativos
npx ts-node tests/examples/embedBuilder-examples.ts
```

## 📋 Testes Incluídos

### ✅ Propriedades Básicas
- ✓ Criação de embed vazio
- ✓ Configuração de título
- ✓ Configuração de descrição
- ✓ Configuração de URL
- ✓ Configuração de timestamp

### 🎨 Testes de Cores
- ✓ Cores hexadecimais (ex: `0x57f287`)
- ✓ Cores por string (ex: `'Green'`)
- ✓ Sistema de cores baseado em rating de jogos:
  - 🟢 Verde (`0x57f287`) - Rating ≥ 8.0 (Excelente)
  - 🔵 Azul (`0x5865f2`) - Rating ≥ 6.5 (Muito bom)
  - 🟡 Amarelo (`0xfee75c`) - Rating ≥ 5.0 (Bom)
  - 🟠 Laranja (`0xffa500`) - Rating < 5.0 (Aceitável)

### 🖼️ Imagens e Mídia
- ✓ Configuração de thumbnail
- ✓ Configuração de imagem principal
- ✓ Tratamento de URLs nulas
- ✓ Validação de URLs

### 👤 Autor e Footer
- ✓ Configuração de autor com nome, URL e ícone
- ✓ Configuração de footer com texto e ícone
- ✓ Footer apenas com texto

### 📝 Campos (Fields)
- ✓ Adição de múltiplos campos
- ✓ Campos inline e não-inline
- ✓ Configuração de array de campos
- ✓ Limpeza de campos

### 🎮 Simulação de Embeds de Jogos
- ✓ Embed completo simulando o `gameQueueJob`
- ✓ Diferentes ratings e cores correspondentes
- ✓ Informações de multiplayer/co-op
- ✓ URLs do IGDB
- ✓ Imagens de capa e background

### 🔍 Casos Extremos e Validação
- ✓ Descrições longas (limite de 4096 caracteres)
- ✓ Strings vazias
- ✓ Caracteres especiais e emojis
- ✓ Serialização para JSON
- ✓ Embeds com múltiplos componentes

## 🎯 Exemplos Práticos

O arquivo `examples/embedBuilder-examples.ts` inclui:

### 1. Embeds de Jogos
Testa diferentes jogos com ratings variados:
- **The Witcher 3** (8.7/10) - Verde 🏆
- **Among Us** (7.2/10) - Azul ⭐
- **Cyberpunk 2077** (6.1/10) - Amarelo
- **Pong** (4.8/10) - Laranja

### 2. Embeds Simples
- Sucesso (verde)
- Aviso (amarelo)
- Erro (vermelho)
- Informação (azul)

### 3. Embed com Campos
Estatísticas de servidor com 6 campos diferentes (inline/não-inline)

### 4. Validação de Tamanhos
Teste com descrição de 4096 caracteres (limite do Discord)

### 5. Embed Completo
Inclui todos os componentes possíveis:
- Título, descrição, cor
- URL, autor, thumbnail, imagem
- Múltiplos campos
- Footer com ícone
- Timestamp

## 🎨 Cores do Sistema

O sistema usa cores baseadas no rating dos jogos (igual ao `gameQueueJob.ts`):

```typescript
const color = rating >= 8
    ? 0x57f287 // 🟢 Verde - Excelente (8-10)
    : rating >= 6.5
        ? 0x5865f2 // 🔵 Azul - Muito bom (6.5-8)
        : rating >= 5
            ? 0xfee75c // 🟡 Amarelo - Bom (5-6.5)
            : 0xffa500; // 🟠 Laranja - Aceitável (3-5)
```

## 📊 Estatísticas dos Testes

- **Total de testes:** 27
- **Taxa de sucesso:** 100%
- **Categorias testadas:** 7
- **Tempo médio:** ~3s

## 🔧 Configuração

### Dependências Necessárias
```json
{
  "jest": "^29.x.x",
  "@types/jest": "^29.x.x", 
  "ts-jest": "^29.x.x",
  "discord.js": "^14.x.x"
}
```

### Jest Config (`jest.config.js`)
```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    // ... outras configurações
};
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "types": ["node", "express", "jest"]
  },
  "include": ["app", "api", "tests", "app/structs/types/*.d.ts"]
}
```

## 🎯 Casos de Uso

### Para Desenvolvedores
- Validar novos formatos de embed antes do deploy
- Testar diferentes cenários de dados
- Verificar limites e validações do Discord
- Debuggar problemas com embeds

### Para QA/Testes
- Verificar consistência visual
- Testar edge cases
- Validar integração com dados reais
- Performance testing

### Para Novos Contribuidores
- Entender como funciona o EmbedBuilder
- Ver exemplos práticos de implementação
- Aprender padrões de cores e formatação
- Praticar com dados seguros

## 🚀 Próximos Passos

1. **Testes de Integração:** Testar com dados reais da API IGDB
2. **Testes de Performance:** Medir tempo de criação de embeds
3. **Testes Visuais:** Screenshots automatizados dos embeds
4. **Testes de Localização:** Testar com diferentes idiomas

## 📝 Contribuindo

Para adicionar novos testes:

1. Siga o padrão de nomenclatura: `describe` → `test`
2. Use dados realistas nos exemplos
3. Teste tanto casos normais quanto edge cases
4. Documente o propósito de cada teste
5. Execute `npm test` antes de fazer commit

---

**💡 Dica:** Use `npm run test:watch` durante o desenvolvimento para feedback instantâneo!