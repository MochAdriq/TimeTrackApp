// App.tsx
import 'react-native-url-polyfill/auto'; // <<< Tetap di baris 1
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabaseClient';
import AppNavigator from './src/navigation/AppNavigator';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationProvider } from './src/context/NotificationContext';
// <<< 1. IMPORT PROFILE PROVIDER BARU >>>
import { ProfileProvider } from './src/context/ProfileContext';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (Logika auth Anda tetap sama) ...
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

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
          {/* <<< 2. BUNGKUS DENGAN PROFILE PROVIDER >>> */}
          <ProfileProvider session={session}>
            <AppNavigator session={session} />
          </ProfileProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
