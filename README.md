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

### Recent Major Updates 🆕

**✅ Grok-Inspired UI Overhaul (Dec 2024)**
- Complete dark mode redesign matching Grok's sophisticated aesthetic
- Extensive rounded corners (`rounded-xl`) throughout the interface
- Deep dark color palette for reduced eye strain
- Consistent design language across all components

**✅ GitHub Issues Integration**
- Structured task management with labeled workflow
- Claude AI development integration
- Automated issue tracking and project management
- Comprehensive development documentation

**🔄 Current Development Focus**
- Enhanced chat message styling
- Advanced file upload with drag & drop
- Keyboard shortcuts and accessibility improvements
- Theme toggle component

## Features

- 💬 Intuitive and modern chat interface  
- 🎨 Grok-inspired dark mode with sophisticated theming
- 🔄 Rounded corners throughout UI for modern aesthetic
- 📱 Cross-platform support (Web and Mobile)  
- 🔄 Integration with multiple AI APIs (Groq, Google AI, Grok)  
- 🚀 Grok AI support with streaming responses  
- 🧪 Mock server for testing Grok AI without authentication  
- 💾 Local storage with SQLite (Dexie)  
- 🎯 Custom UI components with Radix UI
- 🌙 Advanced dark mode with CSS custom properties
- 📋 GitHub Issues integration for task management  

## Technologies

The project was developed using the following technologies:

- **React**: JavaScript library for building user interfaces  
- **TypeScript**: JavaScript superset with static typing  
- **Tailwind CSS**: Utility-first CSS framework with dark mode support
- **Capacitor**: Framework for hybrid mobile app development  
- **Radix UI**: Accessible primitive UI components library  
- **SQLite**: Relational database management system  
- **Grok API**: Integration with X's AI model for advanced conversations
- **GitHub API**: Issue tracking and project management integration  

## Installation

### Prerequisites

Add your API keys in `variables.json`:
- Groq API Key
- Google AI API Key  
- Grok API credentials (optional, can use mock server)

### GitHub Integration (For Claude Development)

This project uses GitHub Issues for task management and development workflow:

1. **Create GitHub Personal Access Token**: Visit [GitHub Settings](https://github.com/settings/personal-access-tokens/new)
2. **Configure Environment**:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
   source ~/.zshrc
   ```
3. **Install GitHub MCP Server**:
   ```bash
   claude mcp add github-server -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
   ```

#### Current Project Status
- **Repository**: `johndpope/atlas-ai-conversations-hub`
- **Issues**: 10 issues created with organized labels
- **Completed**: Grok-style dark mode, GitHub Issues integration
- **High Priority**: Chat message styling (#4), File upload enhancement (#8), Accessibility (#9)
- **Medium Priority**: Theme toggle (#3), Conversation history (#5), Typing indicators (#6), Settings panel (#7)

#### Issue Labels System
- `claude-todo` - Pending tasks for Claude
- `claude-in-progress` - Currently being worked on
- `claude-completed` - Finished work
- `ui-enhancement` - User interface improvements
- `dark-mode` - Theming and dark mode related
- `development-workflow` - Developer tools and processes

See [CLAUDE.md](./CLAUDE.md) for complete development guidelines and issue management workflow.

### Quick Start

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
- Simulated streaming responses with realistic delays
- Conversation management with unique IDs
- Health check endpoint at `http://localhost:3001/health`
- Full API compatibility for testing
- Browser-compatible implementation using native fetch API

### Testing the Mock Integration

1. Start the development server with mock: `pnpm run dev:with-mock`
2. Open the app in your browser at `http://localhost:3000`
3. Select "Grok AI (Mock)" from the model dropdown
4. Send a test message to see the streaming response simulation
5. Check the browser console for any integration logs

The mock server simulates the real Grok API response structure:
```json
{"result":{"response":{"token":"Hello! ","responseId":"mock-resp-123"}}}
```

### Troubleshooting Grok Integration

If you encounter `MockGrokAPI is not defined` errors:
- Ensure the mock server is running on port 3001
- Check that the browser can access `http://localhost:3001/health`
- Verify the Vite proxy configuration is working
- Use browser developer tools to monitor network requests

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
- `pnpm run typecheck` - Check TypeScript types

## Project Management Commands

For developers working with GitHub Issues:

```bash
# Check current Claude tasks
gh issue list --label="claude-todo"

# View work in progress
gh issue list --label="claude-in-progress"

# See completed work
gh issue list --label="claude-completed"

# Start working on an issue
gh issue edit 3 --add-label="claude-in-progress" --remove-label="claude-todo"

# Complete an issue
gh issue edit 3 --add-label="claude-completed" --remove-label="claude-in-progress"

# Create new issue with labels
gh issue create --title "New Feature" --label "claude-todo,ui-enhancement"
```

## API Integration

The app supports multiple AI providers:

1. **Groq API** - Fast inference with various models
2. **Google AI** - Integration with Gemini models
3. **Grok AI** - X's AI model with streaming support
4. **Mock Grok** - Testing environment without API costs

Each provider can be selected from the model dropdown in the chat interface.

## UI/UX Design

### Grok-Inspired Dark Mode
The application features a sophisticated dark mode inspired by Grok's design:

- **Deep Dark Palette**: Rich dark backgrounds (#1A1A1A style) for reduced eye strain
- **Rounded UI Elements**: Extensive use of `rounded-xl` for modern, friendly appearance
- **Design Consistency**: Unified theming across all components
- **CSS Custom Properties**: Scalable theming system with design tokens
- **Seamless Transitions**: Smooth animations between light and dark themes
- **Component Harmony**: All UI elements follow the same design language

### Recent UI Improvements ✨
- **Updated Color Scheme**: Deeper, more sophisticated dark colors matching Grok
- **Border Radius**: Consistent `rounded-xl` applied to all interactive elements
- **Input Styling**: Chat input, file upload, and form elements with rounded design
- **Button Updates**: All buttons use rounded styling with proper hover states
- **Sidebar Enhancement**: Clean, modern sidebar with rounded menu items
- **Card Components**: Elevated appearance with consistent rounded corners

### Component Styling
- **Input Fields**: Rounded with subtle borders and focus states
- **Buttons**: Consistent rounded styling with hover animations
- **Cards & Panels**: Elevated appearance with rounded corners
- **Sidebar**: Clean, modern layout with rounded menu items

### Responsive Design
- Mobile-first approach with touch-friendly interfaces
- Adaptive layouts for different screen sizes
- Keyboard navigation support
- Screen reader accessibility

## Development Workflow

### Task Management
- **GitHub Issues**: Primary task tracking system with structured labels
- **Claude Integration**: Automated workflow for AI development
- **Label System**: `claude-todo`, `claude-in-progress`, `claude-completed`
- **Project Boards**: Visual workflow management  
- **Issue Templates**: Standardized bug reports and feature requests
- **Automated Linking**: Issues automatically close with PR merges

#### Quick Issue Commands
```bash
# Check current Claude tasks
gh issue list --label="claude-todo"

# View work in progress  
gh issue list --label="claude-in-progress"

# See completed work
gh issue list --label="claude-completed"
```

### Code Quality
- **TypeScript**: Strict type checking for reliability
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Git Hooks**: Pre-commit quality checks

See [CLAUDE.md](./CLAUDE.md) for complete development guidelines.

## Architecture & Recent Improvements

### Browser-Compatible Mock API
The Grok AI integration has been optimized for browser compatibility:

- **SimpleMockGrokAPI**: Custom implementation using browser-native `fetch()` API
- **No Node.js dependencies**: Removed `got-scraping` and other Node.js-specific packages
- **Real-time streaming**: Proper handling of Server-Sent Events (SSE) responses
- **Error handling**: Comprehensive error handling and fallback mechanisms

### Proxy Configuration
The application uses Vite proxy for API routing:

```typescript
// vite.config.ts
proxy: {
  '/grok-mock': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/grok-mock/, '')
  },
  '/grok-api': {
    target: 'http://localhost:3003',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/grok-api/, '')
  }
}
```

### Development Workflow
1. **Mock Development**: Use `pnpm run dev:with-mock` for safe testing
2. **Real API Testing**: Configure credentials and use `pnpm run dev`
3. **Chrome Debugging**: Automated Chrome launch with debugging enabled
4. **Hot Reload**: Real-time updates during development

---