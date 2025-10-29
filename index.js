/**
 * @format
 */
import 'react-native-url-polyfill/auto'; // <<< WAJIB DI BARIS PERTAMA
import 'react-native-gesture-handler'; // <<< TAMBAHKAN BARIS INI DI PALING ATAS
import { AppRegistry } from 'react-native';
import App from './App'; // Ini merujuk ke App.tsx Boss
import { name as appName } from './app.json';

// Mendaftarkan App.tsx Boss (sudah benar)
AppRegistry.registerComponent(appName, () => App);
