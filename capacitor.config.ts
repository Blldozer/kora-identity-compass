
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddaeaf50afc34acbb36178ccfca7baf8',
  appName: 'kora-identity-compass',
  webDir: 'dist',
  server: {
    url: 'https://ddaeaf50-afc3-4acb-b361-78ccfca7baf8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
