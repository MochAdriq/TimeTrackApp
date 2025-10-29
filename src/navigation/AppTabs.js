// src/navigation/AppTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Hapus import StyleSheet, View, Text jika tidak dipakai lagi di sini

// Import Ikon TIDAK DIPERLUKAN LAGI DI SINI
// Import Screens
import HomeScreen from '../features/Home/screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceHolderScreen';

// --- Import Custom Tab Bar ---
import CustomTabBar from './CustomTabBar'; // <<<--- IMPORT
import FavoriteScreen from '../features/Favorites/screens/FavoriteScreen';
import ProfileScreen from '../features/Profiles/screens/ProfileScreen';
import PremiumScreen from '../features/Premium/screens/PremiumScreen';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      // Berikan komponen CustomTabBar ke prop tabBar
      tabBar={props => <CustomTabBar {...props} />} // <<<--- GUNAKAN CUSTOM TAB BAR
      initialRouteName="Jelajah"
      screenOptions={{
        headerShown: false, // Opsi ini bisa tetap di sini
        // HAPUS tabBarShowLabel, tabBarStyle, tabBarIcon dari sini
      }}
    >
      {/* Daftarkan layar (tetap sama) */}
      <Tab.Screen name="Scan" component={PlaceholderScreen} />
      <Tab.Screen name="Favorites" component={FavoriteScreen} />
      <Tab.Screen name="Jelajah" component={HomeScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
