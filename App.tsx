// App.tsx
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabaseClient'; // <<< Import Supabase
import AppNavigator from './src/navigation/AppNavigator'; // <<< Import navigator Anda
import { View, ActivityIndicator, StatusBar } from 'react-native'; // <<< Untuk loading
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // <<< Tetap pakai ini
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <<< Tetap pakai ini

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi yang sudah ada saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Selesai loading
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session); // Update state session
      },
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []); // [] = Jalankan sekali

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#6A453C', // Warna background
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
        <AppNavigator session={session} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
