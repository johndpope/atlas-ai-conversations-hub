<div align="center">

# Atlas AI 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)](https://capacitorjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

Um assistente de IA moderno e intuitivo para suas conversas diárias

</div>

## Sobre o Projeto

**Atenção** projeto utiliza licença: [LICENSE](./LICENSE)

Atlas AI é um assistente de inteligência artificial desenvolvido com tecnologias modernas, oferecendo uma interface amigável e responsiva para interações naturais. Disponível tanto para web quanto para dispositivos móveis através do Capacitor, o Atlas AI está sempre pronto para ajudar com suas perguntas e necessidades.

## Funcionalidades

- 💬 Interface de chat intuitiva e moderna  
- 🎨 Design responsivo e adaptável  
- 📱 Suporte multiplataforma (Web e Mobile)  
- 🔄 Integração com múltiplas APIs de IA (Groq, Google AI, Grok)  
- 🚀 Suporte ao Grok AI com streaming de respostas  
- 🧪 Servidor mock para teste do Grok AI sem autenticação  
- 💾 Armazenamento local com SQLite (Dexie)  
- 🎯 Componentes UI personalizados com Radix UI  

## Tecnologias

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **React**: Biblioteca JavaScript para construção de interfaces  
- **TypeScript**: Superset JavaScript com tipagem estática  
- **Capacitor**: Framework para desenvolvimento de aplicações móveis híbridas  
- **Radix UI**: Biblioteca de componentes UI primitivos e acessíveis  
- **SQLite**: Sistema de gerenciamento de banco de dados relacional  
- **Grok API**: Integração com o modelo de IA da X para conversas avançadas  

## Instalação

Configure suas chaves de API em `variables.json`:
- Chave da API Groq
- Chave da API Google AI
- Credenciais da API Grok (opcional, pode usar servidor mock)

```bash
# Clone o repositório
git clone https://github.com/speNillusion/atlas-ai-conversations-hub.git

# Entre no diretório
cd atlas-ai-conversations-hub

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Desenvolvimento com Grok AI

### Usando API Real do Grok
Configure suas credenciais da API Grok em `variables.json` e inicie o servidor:

```bash
npm run dev
```

### Usando Servidor Mock do Grok
Para testar sem autenticação real da API, use o servidor mock:

```bash
# Inicie desenvolvimento com servidor mock do Grok
npm run dev:with-mock

# Ou execute componentes separadamente
npm run mock-server  # Inicia servidor mock na porta 3001
npm run dev          # Inicia app principal na porta 5173
```

O servidor mock fornece:
- Respostas streaming simuladas
- Gerenciamento de conversas
- Endpoint de verificação de saúde em `http://localhost:3001/health`
- Compatibilidade completa da API para testes

## Build Mobile

```bash
# Build do projeto
npm run build

# Adicione a plataforma Android
npx cap add android

# Sincronize os arquivos
npx cap sync

# Abra o projeto no Android Studio
npx cap open android
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run dev:with-mock` - Inicia desenvolvimento com servidor mock do Grok
- `npm run mock-server` - Inicia apenas o servidor mock do Grok
- `npm run build` - Build para produção
- `npm run build:dev` - Build para desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## Integração de APIs

O app suporta múltiplos provedores de IA:

1. **API Groq** - Inferência rápida com vários modelos
2. **Google AI** - Integração com modelos Gemini
3. **Grok AI** - Modelo de IA da X com suporte a streaming
4. **Mock Grok** - Ambiente de teste sem custos de API

Cada provedor pode ser selecionado no dropdown de modelos na interface do chat.

---
