import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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