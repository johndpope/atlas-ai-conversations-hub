import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    exclude: [
      'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
      'chromium-bidi/lib/cjs/cdp/CdpConnection',
      'patchright-core',
      'patchright',
      'grok-api-ts'
    ]
  },
  build: {
    rollupOptions: {
      external: [
        'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
        'chromium-bidi/lib/cjs/cdp/CdpConnection',
        'patchright-core',
        'patchright',
        'grok-api-ts'
      ]
    }
  },
  server: {
    host: "::",
    port: 3000,
    cleartext: true,
    proxy: {
      '/wp-admin/admin-ajax.php': {
        target: 'https://chatgptdemo.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wp-admin\/admin-ajax.php/, '/wp-admin/admin-ajax.php'),
        secure: false,
      },
      '/openai/v1/chat/completions': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai\/v1\/chat\/completions/, '/openai/v1/chat/completions'),
        secure: false,
      },
      '/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate': {
        target: 'https://gemini.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_\/BardChatUi\/data\/assistant.lamda.BardFrontendService\/StreamGenerate/, '/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate'),
        secure: false,
      },
      "/novita/v3/openai/chat/completions": {
        target: "https://router.huggingface.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/novita\/v3\/openai\/chat\/completions/, '/novita/v3/openai/chat/completions'),
        secure: false,
      },
      "/fireworks-ai/inference/v1/chat/completions": {
        target: "https://router.huggingface.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fireworks-ai\/inference\/v1\/chat\/completions/, '/fireworks-ai/inference/v1/chat/completions'),
        secure: false,
      },
      "/hyperbolic/v1/chat/completions": {
        target: "https://router.huggingface.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hyperbolic\/v1\/chat\/completions/, '/hyperbolic/v1/chat/completions'),
        secure: false,
      },
      "/grok-mock": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grok-mock/, ''),
        secure: false,
      },
      "/grok-api": {
        target: "http://localhost:3003",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grok-api/, ''),
        secure: false,
      }
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));