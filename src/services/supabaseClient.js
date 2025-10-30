// src/services/supabaseClient.js
// import 'react-native-url-polyfill/auto'; // Pastikan ini ada di atas
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbxwnuahsljkvpfrkfcd.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieHdudWFoc2xqa3ZwZnJrZmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU3ODYsImV4cCI6MjA3NzMxMTc4Nn0.HYsRLQT_WlItxiMK_Z7ZGDIMkEHA2n3bX1jtJJHtmFI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Gunakan AsyncStorage React Native yang ASLI
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
