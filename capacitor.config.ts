import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddaeaf50afc34acbb36178ccfca7baf8',
  appName: 'kora-identity-compass',
  webDir: 'dist',
  // Removed the server.url for production/local asset loading
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
