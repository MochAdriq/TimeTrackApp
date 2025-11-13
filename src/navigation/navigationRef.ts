import { createNavigationContainerRef } from '@react-navigation/native';

// Definisikan semua rute yang ada di RootStack (AppNavigator.js)
export type RootStackParamList = {
  // Rute jika session = false
  Auth: { screen: string } | undefined;

  // Rute jika session = true
  MainApp: undefined;
  MateriDetail: undefined;
  RedeemPoin: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  QuizList: undefined;
  QuizDetail: undefined;
  QuizScreen: undefined;
  QuizCongrats: undefined;
  MarketPlace: undefined;
  ProductDetail: undefined;
  Checkout: undefined;
  TransferDetails: undefined;
  DiscussionChoice: undefined;
  AskExpertList: undefined;
  CommunityGroupList: undefined;
  ChatScreen: undefined;
  MyChatList: undefined;
  CreateGroup: undefined;
  GroupInfo: undefined;
  SupportChat: undefined;
  DeveloperScreen: undefined;

  // Rute bersama
  NewPassword: undefined;
};

// Buat ref dengan tipe yang sudah kita definisikan
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
