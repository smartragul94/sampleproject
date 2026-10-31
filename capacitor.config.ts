import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // IMPORTANT: choose your final package name BEFORE the first Play Store upload. It can never be changed later.
  appId: 'com.vedanthika.clinic',
  appName: 'Vedanthika',
  webDir: 'dist',
  backgroundColor: '#f4f8fc',
  android: {
    allowMixedContent: false,
  },
};

export default config;
