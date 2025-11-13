// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// --- Import semua layar Anda ---
import AppTabs from './AppTabs';
import CustomDrawerContent from './CustomDrawerContent';

// Layar Auth
import WelcomeScreen from '../features/Auth/screens/WelcomeScreen';
import LoginScreen from '../features/Auth/screens/LoginScreen';
import RegisterScreen from '../features/Auth/screens/RegisterScreen';
import NewPasswordScreen from '../features/Auth/screens/NewPasswordScreen';

// ... (Semua import layar lain tetap sama) ...
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
import TransferDetailsScreen from '../features/Marketplace/screens/TransferDetailsScreen';
import DiscussionChoiceScreen from '../features/Discussion/screens/DiscussionChoiceScreen';
import AskExpertListScreen from '../features/Discussion/screens/AskExpertListScreen';
import CommunityGroupListScreen from '../features/Discussion/screens/CommunityGroupListScreen';
import ChatScreen from '../features/Discussion/screens/ChatScreen';
import NotificationScreen from '../features/Notification/screens/NotificationScreen';
import FavoriteScreen from '../features/Favorites/screens/FavoriteScreen';
import ChangePasswordScreen from '../features/Profiles/screens/ChangePasswordScreen';
import DeveloperScreen from '../screens/DeveloperScreen';
import MyChatListScreen from '../features/Discussion/screens/MyChatListScreen';
import CreateGroupScreen from '../features/Discussion/screens/CreateGroupScreen';
import GroupInfoScreen from '../features/Discussion/screens/GroupInfoScreen';
import SupportChatScreen from '../features/Support/screens/SupportChatScreen';
import PaymentStatusScreen from '../features/Marketplace/screens/PaymentStatusScreen';
import PremiumCheckoutScreen from '../features/Premium/screens/PremiumCheckoutScreen';

// --- KEMBALIKAN IMPORT INI ---
import { navigationRef } from './navigationRef';
import PremiumTransferScreen from '../features/Premium/screens/PremiumTransferScreen';
import MateriListScreen from '../features/Materi/screens/MateriListScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Ini Stack untuk SEBELUM LOGIN ---
const AuthNavigator = () => (
  <AuthStack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false }}
  >
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    {/* Pastikan NewPasswordScreen TIDAK ADA di sini */}
  </AuthStack.Navigator>
);

// --- Ini Drawer untuk SESUDAH LOGIN ---
// (Tidak ada perubahan di sini)
function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
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

// --- HAPUS KONFIGURASI LINKING ---
/*
const linking = {
  ...
};
*/
// --- BATAS PENGHAPUSAN ---

// --- INI BAGIAN PENTING ---
// Navigator Utama sekarang menerima 'session' sebagai prop
const AppNavigator = ({ session }) => {
  return (
    // --- HAPUS 'linking' DAN TAMBAHKAN 'ref' ---
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // --- GRUP LAYAR JIKA SUDAH LOGIN ---
          <RootStack.Group>
            <RootStack.Screen name="MainApp" component={AppDrawer} />
            {/* ... (Semua layar Boss yang lain tetap di sini) ... */}
            <RootStack.Screen name="MateriDetail" component={MateriScreen} />
            <RootStack.Screen name="MateriList" component={MateriListScreen} />
            <RootStack.Screen name="RedeemPoin" component={RedeemPoinScreen} />
            <RootStack.Screen
              name="EditProfile"
              component={EditProfileScreen}
            />
            <RootStack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <RootStack.Screen name="QuizList" component={QuizListScreen} />
            <RootStack.Screen name="QuizDetail" component={QuizDetailScreen} />
            <RootStack.Screen name="QuizScreen" component={QuizScreen} />
            <RootStack.Screen
              name="QuizCongrats"
              component={QuizCongratsScreen}
            />
            <RootStack.Screen
              name="MarketPlace"
              component={MarketPlaceScreen}
            />
            <RootStack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
            />
            <RootStack.Screen name="Checkout" component={CheckoutScreen} />
            <RootStack.Screen
              name="TransferDetails"
              component={TransferDetailsScreen}
            />
            <RootStack.Screen
              name="PaymentStatus"
              component={PaymentStatusScreen}
            />
            <RootStack.Screen
              name="DiscussionChoice"
              component={DiscussionChoiceScreen}
            />
            <RootStack.Screen
              name="AskExpertList"
              component={AskExpertListScreen}
            />
            <RootStack.Screen
              name="CommunityGroupList"
              component={CommunityGroupListScreen}
            />
            <RootStack.Screen name="ChatScreen" component={ChatScreen} />
            <RootStack.Screen name="MyChatList" component={MyChatListScreen} />
            <RootStack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
            />
            <RootStack.Screen name="GroupInfo" component={GroupInfoScreen} />
            <RootStack.Screen
              name="SupportChat"
              component={SupportChatScreen}
            />
            <RootStack.Screen
              name="PremiumCheckout"
              component={PremiumCheckoutScreen}
            />
            <RootStack.Screen
              name="PremiumTransfer"
              component={PremiumTransferScreen}
            />
            <RootStack.Screen
              name="DeveloperScreen"
              component={DeveloperScreen}
            />
          </RootStack.Group>
        ) : (
          // --- GRUP LAYAR JIKA BELUM LOGIN ---
          <RootStack.Group>
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </RootStack.Group>
        )}

        {/* Layar ini harus bisa diakses kapanpun oleh deep link */}
        <RootStack.Screen name="NewPassword" component={NewPasswordScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
