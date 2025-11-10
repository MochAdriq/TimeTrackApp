// App.tsx
import 'react-native-url-polyfill/auto'; // <<< Tetap di baris 1
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabaseClient';
import AppNavigator from './src/navigation/AppNavigator';
import { View, ActivityIndicator, StatusBar, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './src/context/NotificationContext';
import { ProfileProvider } from './src/context/ProfileContext';

import { navigationRef } from './src/navigation/navigationRef';

// --- FUNGSI HELPER (Tetap sama) ---
const parseUrlHash = (url: string) => {
  const hash = url.split('#')[1];
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const type = params.get('type');

  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token, type };
};
// --- BATAS FUNGSI HELPER ---

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --- MODIFIKASI TOTAL useEffect (STRATEGI FINAL) ---
  useEffect(() => {
    setLoading(true);

    // 1. Cek sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        'DEBUG (App.tsx): Sesi awal saat load:',
        session ? 'Ada Sesi' : 'NULL',
      );
      setSession(session);
      setLoading(false);
    });

    // 2. Listener AuthStateChange (INI UNTUK NAVIGASI OTOMATIS)
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('DEBUG (App.tsx): Event AuthStateChange terdeteksi!');
      console.log('DEBUG (App.tsx): Event Type:', _event);

      // --- INI LOGIKA KUNCI YANG BARU ---

      // A. Jika event-nya PASSWORD_RECOVERY
      if (_event === 'PASSWORD_RECOVERY') {
        console.log(
          'DEBUG (App.tsx): PASSWORD_RECOVERY terdeteksi, navigasi ke NewPassword...',
        );
        navigationRef.navigate('NewPassword');
        return; // Jangan setSessi on, biarkan di state recovery
      }

      // B. Jika event-nya SIGNED_OUT (setelah update password)
      if (_event === 'SIGNED_OUT') {
        console.log(
          'DEBUG (App.tsx): SIGNED_OUT terdeteksi, navigasi ke Login...',
        );
        // Navigasi manual ke tumpukan Auth, layar Login
        navigationRef.navigate('Auth', { screen: 'Login' });
      }

      // --- BATAS LOGIKA KUNCI ---

      // Untuk event lain (SIGNED_IN, INITIAL_SESSION, USER_UPDATED)
      // cukup update sesi seperti biasa.
      setSession(session);
    });

    // 3. Listener Deep Link (INI UNTUK MEMICU EVENT)
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      console.log('DEBUG (App.tsx): Deep link terdeteksi:', url);

      const sessionData = parseUrlHash(url);

      if (sessionData) {
        console.log(
          'DEBUG (App.tsx): Token ditemukan di URL, mengatur sesi manual...',
        );

        // Atur sesi. Ini akan memicu onAuthStateChange di atas
        // dengan event 'PASSWORD_RECOVERY'
        supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
      }
    };

    // Cek apakah aplikasi dibuka dari deep link (cold start)
    Linking.getInitialURL().then(handleDeepLink);

    // Dengarkan deep link baru saat aplikasi sudah berjalan
    const linkingSubscription = Linking.addEventListener('url', e =>
      handleDeepLink(e.url),
    );

    return () => {
      authListener?.unsubscribe();
      linkingSubscription.remove(); // Hapus listener Linking
    };
  }, []);
  // --- BATAS MODIFIKASI useEffect ---

  if (loading) {
    // ... (Loading UI tetap sama) ...
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#6A453C',
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotificationProvider session={session}>
          <ProfileProvider session={session}>
            <AppNavigator session={session} />
          </ProfileProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
