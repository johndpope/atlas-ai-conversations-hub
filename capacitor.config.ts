import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atlas.ai',
  appName: 'atlas ai',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    cleartext: true
  }
};

export default config;
