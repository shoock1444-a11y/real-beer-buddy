import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ua.realbeer.app',
  appName: 'Real Beer',
  webDir: 'dist/client',
  backgroundColor: '#1a140d',
  android: {
    allowMixedContent: false,
  },
};

export default config;
