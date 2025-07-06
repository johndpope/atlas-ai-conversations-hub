<div align="center">

# Atlas AI 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)](https://capacitorjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

A modern and intuitive AI assistant for your daily conversations

</div>

## About the Project

**Attention**: This project uses license: [LICENSE](./LICENSE)

Atlas AI is an artificial intelligence assistant developed with modern technologies, offering a friendly and responsive interface for natural interactions. Available for both web and mobile devices through Capacitor, Atlas AI is always ready to help with your questions and needs.

## Features

- 💬 Intuitive and modern chat interface  
- 🎨 Responsive and adaptive design  
- 📱 Cross-platform support (Web and Mobile)  
- 🔄 Integration with multiple AI APIs (Groq, Google AI, Grok)  
- 🚀 Grok AI support with streaming responses  
- 🧪 Mock server for testing Grok AI without authentication  
- 💾 Local storage with SQLite (Dexie)  
- 🎯 Custom UI components with Radix UI  

## Technologies

The project was developed using the following technologies:

- **React**: JavaScript library for building user interfaces  
- **TypeScript**: JavaScript superset with static typing  
- **Capacitor**: Framework for hybrid mobile app development  
- **Radix UI**: Accessible primitive UI components library  
- **SQLite**: Relational database management system  
- **Grok API**: Integration with X's AI model for advanced conversations  

## Installation

Add your API keys in `variables.json`:
- Groq API Key
- Google AI API Key  
- Grok API credentials (optional, can use mock server)

```bash
# Clone the repository
git clone https://github.com/speNillusion/atlas-ai-conversations-hub.git

# Enter the directory
cd atlas-ai-conversations-hub

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

## Development with Grok AI

### Using Real Grok API
Configure your Grok API credentials in `variables.json` and start the development server:

```bash
pnpm run dev
```

### Using Mock Grok Server
For testing without real API authentication, use the mock server:

```bash
# Start development with mock Grok server
pnpm run dev:with-mock

# Or run components separately
pnpm run mock-server  # Start mock server on port 3001
pnpm run dev          # Start main app on port 5173
```

The mock server provides:
- Simulated streaming responses
- Conversation management
- Health check endpoint at `http://localhost:3001/health`
- Full API compatibility for testing

## Mobile Build

```bash
# Build the project
pnpm run build

# Add Android platform
npx cap add android

# Sync files
npx cap sync

# Open project in Android Studio
npx cap open android
```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run dev:with-mock` - Start development with mock Grok server
- `pnpm run mock-server` - Start only the mock Grok server
- `pnpm run build` - Build for production
- `pnpm run build:dev` - Build for development
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## API Integration

The app supports multiple AI providers:

1. **Groq API** - Fast inference with various models
2. **Google AI** - Integration with Gemini models
3. **Grok AI** - X's AI model with streaming support
4. **Mock Grok** - Testing environment without API costs

Each provider can be selected from the model dropdown in the chat interface.

---