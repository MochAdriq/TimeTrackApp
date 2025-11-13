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

// PASTIKAN navigationRef DI-IMPORT
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

  // --- useEffect DENGAN LOGIKA NAVIGASI YANG DIPERBAIKI ---
  useEffect(() => {
    setLoading(true);

    // 1. Cek sesi awal
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log(
        'DEBUG (App.tsx): Sesi awal saat load:',
        initialSession ? 'Ada Sesi' : 'NULL',
      );
      setSession(initialSession);
      setLoading(false);
    });

    // 2. Listener AuthStateChange
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('DEBUG (App.tsx): Event AuthStateChange terdeteksi!');
      console.log('DEBUG (App.tsx): Event Type:', _event);

      // --- INI PERBAIKANNYA ---
      // A. Jika event-nya SIGNED_OUT (setelah update password)
      if (_event === 'SIGNED_OUT') {
        console.log(
          'DEBUG (App.tsx): SIGNED_OUT terdeteksi. Set session null DULU, lalu RESET.',
        );

        // 1. SET SESI DULU
        // Ini akan memicu AppNavigator untuk me-render ulang dan menampilkan stack 'Auth'.
        setSession(newSession); // newSession is null here

        // 2. LAKUKAN RESET
        // Kita tunda reset ke tick berikutnya (setelah re-render)
        // menggunakan setTimeout(..., 0)
        setTimeout(() => {
          if (navigationRef.isReady()) {
            console.log('DEBUG (App.tsx): Menjalankan reset...');
            navigationRef.reset({
              index: 0,
              routes: [
                {
                  name: 'Auth', // Nama stack Auth di AppNavigator
                  state: {
                    index: 0,
                    routes: [{ name: 'Login' }], // Nama layar Login di dalam Auth
                  },
                },
              ],
            });
          }
        }, 0); // Penundaan 0ms (next tick)
        // --- BATAS PERBAIKAN ---

        return; // Hentikan (agar tidak setSession lagi di bawah)
      }
      // --- BATAS PERBAIKAN ---

      // B. Jika event-nya SIGNED_IN (dari deep link ATAU login biasa)
      if (_event === 'SIGNED_IN') {
        console.log('DEBUG (App.tsx): SIGNED_IN terdeteksi.');

        // Cek apakah kita *sudah* berada di NewPasswordScreen?
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute?.name === 'NewPassword') {
          console.log(
            'DEBUG (App.tsx): Sedang di NewPasswordScreen. Abaikan navigasi, CUKUP set session.',
          );
          setSession(newSession); // CUKUP set session agar updateUser berfungsi
          return; // JANGAN lakukan navigasi standar
        }
      }

      // Untuk event lain (SIGNED_IN biasa, INITIAL_SESSION, USER_UPDATED)
      // cukup update sesi seperti biasa.
      setSession(newSession);
    });

    // 3. Listener Deep Link (INI YANG MENANGANI RECOVERY)
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      console.log('DEBUG (App.tsx): Deep link terdeteksi:', url);

      const sessionData = parseUrlHash(url);

      if (sessionData) {
        // Jika tipenya 'recovery', kita HARUS set session DAN navigasi
        if (sessionData.type === 'recovery') {
          console.log(
            'DEBUG (App.tsx): Tipe "recovery". Set session DAN navigasi...',
          );

          // 1. Set session agar updateUser() berfungsi
          supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
          });

          // 2. Navigasi ke NewPasswordScreen
          // Kita perlu pastikan navigator sudah siap
          const checkAndNavigate = () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('NewPassword');
            } else {
              setTimeout(checkAndNavigate, 100); // Coba lagi jika belum siap
            }
          };
          checkAndNavigate();

          return; // Selesai
        }

        // Jika BUKAN recovery (misal. konfirmasi email), baru atur sesi
        console.log(
          'DEBUG (App.tsx): Token ditemukan (bukan recovery), mengatur sesi manual...',
        );
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
      linkingSubscription.remove();
    };
  }, []);
  // --- BATAS PERBAIKAN useEffect ---

  // ... (sisa file App.tsx tetap sama) ...
  if (loading) {
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
            {/* AppNavigator akan menerima 'ref' */}
            <AppNavigator session={session} />
          </ProfileProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
