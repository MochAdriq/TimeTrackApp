// src/navigation/CustomDrawerContent.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Share, // <<< 1. IMPORT Share API
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

// --- Import Supabase (hanya untuk logout) ---
import { supabase } from '../services/supabaseClient';

// --- Import Context ---
import { useProfile } from '../context/ProfileContext';

// --- Import Ikon SVG ---
import CartIcon from '../assets/icon/CartIcon.svg';
import SettingIcon from '../assets/icon/SettingIcon.svg';
import ChatIcon from '../assets/icon/ChatIcon.svg';
import InfoIcon from '../assets/icon/InfoIcon.svg';
import FriendIcon from '../assets/icon/FriendIcon.svg';
import BackDrawerIcon from '../assets/icon/BackDrawerIcon.svg';
import LougOutIcon from '../assets/icon/log-out.svg';
const fallbackImage = require('../assets/images/dummyImage2.png');

// Komponen Item Menu (Tidak diubah)
const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = props => {
  const { navigation } = props;
  const { profile } = useProfile();

  const handleNavigation = screenName => {
    navigation.navigate(screenName);
    navigation.closeDrawer();
  };

  // --- (Fungsi handleLogout tetap sama) ---
  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Logout Gagal', error.message);
            } else {
              navigation.closeDrawer();
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  // <<< 2. BUAT FUNGSI BARU UNTUK SHARE >>>
  const handleShareApp = async () => {
    try {
      // Gunakan link website yang Boss berikan
      const websiteUrl = 'https://web-time-track.vercel.app/';

      await Share.share({
        title: 'Gabung Yuk di TimeTrackApp!',
        message: `Ayo belajar sejarah dengan cara yang seru di TimeTrackApp! 🚀\n\nCek di sini: ${websiteUrl}`,
        url: websiteUrl, // url (untuk iOS)
      });
    } catch (error) {
      Alert.alert('Gagal Membagikan', error.message);
    }
  };

  // --- (Logika avatarSource dan handleProfileTap tetap sama) ---
  const avatarSource = profile.avatar_url
    ? { uri: profile.avatar_url }
    : fallbackImage;

  const handleProfileTap = () => {
    navigation.navigate('Profil');
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* ... (Bagian ProfileSection tetap sama) ... */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={handleProfileTap}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.closeDrawer()}
        >
          <BackDrawerIcon
            width={24}
            height={24}
            fill="#FFF"
            style={styles.backIconSvg}
          />
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <View style={styles.profilePicWrapper}>
            <Image source={avatarSource} style={styles.profilePicImage} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              Hi, {profile.full_name || profile.username}
            </Text>
            <Text style={styles.profileSubtext}>Good Morning</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {profile.level}</Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>
                  {profile.points.toLocaleString('id-ID')}
                </Text>
                <View style={styles.coinIconPlaceholder} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ... (Bagian customButtonsContainer tetap sama) ... */}
        <View style={styles.customButtonsContainer}>
          <TouchableOpacity
            style={styles.customButton}
            // onPress={() => handleNavigation('Premium')}
          >
            <Text style={styles.customButtonText}>Daftar Member</Text>
            <Text style={styles.customButtonArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Daftar Menu Utama */}
        <View style={styles.menuList}>
          <DrawerItem
            icon={<CartIcon width={24} height={24} fill="#fff" />}
            label="Pembelian"
            onPress={() => handleNavigation('MarketPlace')}
          />
          <DrawerItem
            icon={<SettingIcon width={24} height={24} fill="#fff" />}
            label="Pengaturan"
            // onPress={() => handleNavigation('PlaceholderScreen')}
          />
          {/* <<< 3. HUBUNGKAN onPress KE FUNGSI BARU >>> */}
          <DrawerItem
            icon={<FriendIcon width={24} height={24} fill="#fff" />}
            label="Share ke Teman"
            onPress={handleShareApp}
          />
          <DrawerItem
            icon={<ChatIcon width={24} height={24} fill="#fff" />}
            label="Diskusi"
            onPress={() => handleNavigation('DiscussionChoice')}
          />
          <DrawerItem
            icon={<InfoIcon width={24} height={24} fill="#fff" />}
            label="Bantuan"
            onPress={() => handleNavigation('SupportChat')}
          />
        </View>
      </DrawerContentScrollView>

      {/* ... (Bagian bottomSection (Logout) tetap sama) ... */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LougOutIcon style={styles.logoutIconPlaceholder} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- (Styles tetap sama) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    backgroundColor: '#6A453C',
    paddingTop: (StatusBar.currentHeight || 20) + 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 20) + 5,
    left: 15,
    padding: 5,
    zIndex: 1,
  },
  backIconSvg: {},
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  profilePicWrapper: {
    marginRight: 15,
  },
  profilePicImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#E0E0E0',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSubtext: {
    color: '#E0E0E0',
    fontSize: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointsText: {
    color: '#4A2F2F',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinIconPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  scrollContainer: {
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  customButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  customButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  customButtonText: {
    fontSize: 13,
    color: '#555',
  },
  customButtonArrow: {
    fontSize: 16,
    color: '#AAA',
  },
  menuList: {
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
  },
  menuLabel: {
    fontSize: 15,
    color: '#444',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  logoutIconPlaceholder: {
    width: 20,
    height: 20,
    marginRight: 15,
    // backgroundColor: '#888',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 14,
    color: '#888',
  },
});

export default CustomDrawerContent;
