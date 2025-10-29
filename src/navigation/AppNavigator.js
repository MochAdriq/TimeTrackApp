// src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer'; // <<< 1. Import Drawer

// Import screen Auth
import WelcomeScreen from '../features/Auth/screens/WelcomeScreen';
import LoginScreen from '../features/Auth/screens/LoginScreen';
import RegisterScreen from '../features/Auth/screens/RegisterScreen';

// Import Tab Navigator kita
import AppTabs from './AppTabs';

// <<< 2. Import Komponen Konten Drawer Kustom Boss >>>
import CustomDrawerContent from './CustomDrawerContent'; // <<< Pastikan path ini benar

// Instance Navigator
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator(); // <<< 3. Buat Instance Drawer

import NotificationScreen from '../features/Notification/screens/NotificationScreen'; // <<< Import
import FavoriteScreen from '../features/Favorites/screens/FavoriteScreen';

import MateriScreen from '../features/Materi/screens/MateriScreen';
import RedeemPoinScreen from '../features/Profiles/screens/RedeemPoinScreen';
import EditProfileScreen from '../features/Profiles/screens/EditProfileScreen';

import QuizListScreen from '../features/Quiz/screens/QuizListScreen';
import QuizDetailScreen from '../features/Quiz/screens/QuizDetailScreen';
import QuizScreen from '../features/Quiz/screens/QuizScreen';
import QuizCongratsScreen from '../features/Quiz/screens/QuizCongratsScreen';
import MarketPlaceScreen from '../features/Marketplace/screens/MarketPlaceScreen';
import ProductDetailScreen from '../features/Marketplace/screens/ProductDetailScreen';
import CheckoutScreen from '../features/Marketplace/screens/CheckoutScreen';

// Komponen Navigator Terpisah untuk Stack Auth (Tetap Sama)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// <<< 4. Buat Komponen Baru untuk Drawer Navigator >>>
function AppDrawer() {
  return (
    <Drawer.Navigator
      // Gunakan komponen kustom untuk tampilan drawer
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Sembunyikan header default drawer
        drawerPosition: 'left', // Drawer muncul dari kiri
        drawerStyle: {
          width: '80%',
          backgroundColor: '#FFFFFF',
          borderTopRightRadius: 90,
          borderBottomRightRadius: 90,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={AppTabs} />
      <Drawer.Screen name="Notifications" component={NotificationScreen} />
      <Drawer.Screen name="Favorites" component={FavoriteScreen} />
    </Drawer.Navigator>
  );
}

// Komponen Navigator Utama (Root)
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}
      >
        {/* Grup Layar Auth */}
        <RootStack.Screen name="Auth" component={AuthNavigator} />

        <RootStack.Screen name="MainApp" component={AppDrawer} />
        <RootStack.Screen name="MateriDetail" component={MateriScreen} />
        <RootStack.Screen name="RedeemPoin" component={RedeemPoinScreen} />
        <RootStack.Screen name="EditProfile" component={EditProfileScreen} />

        <RootStack.Screen name="QuizList" component={QuizListScreen} />
        <RootStack.Screen name="QuizDetail" component={QuizDetailScreen} />
        <RootStack.Screen name="QuizScreen" component={QuizScreen} />
        <RootStack.Screen name="QuizCongrats" component={QuizCongratsScreen} />

        <RootStack.Screen name="MarketPlace" component={MarketPlaceScreen} />
        <RootStack.Screen name="Checkout" component={CheckoutScreen} />
        <RootStack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
