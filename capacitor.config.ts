import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Audyos',
  webDir: '.next',
  server: {
    androidScheme: 'https'
  }
};

export default config;
