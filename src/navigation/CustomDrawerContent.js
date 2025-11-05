// src/navigation/CustomDrawerContent.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert, // Import Alert untuk konfirmasi logout
} from 'react-native';
import {
  DrawerContentScrollView,
  // DrawerItemList,
} from '@react-navigation/drawer';

// --- Import Supabase ---
import { supabase } from '../services/supabaseClient';

import ProfilePict from '../assets/images/ProfilePict.svg';
import CartIcon from '../assets/icon/CartIcon.svg';
import SettingIcon from '../assets/icon/SettingIcon.svg';
import ChatIcon from '../assets/icon/ChatIcon.svg';
import InfoIcon from '../assets/icon/InfoIcon.svg';
import FriendIcon from '../assets/icon/FriendIcon.svg';
import BackDrawerIcon from '../assets/icon/BackDrawerIcon.svg';

// Komponen Item Menu (agar bisa dipakai ulang)
const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = props => {
  const { navigation } = props;

  // --- MODIFIKASI 1: State untuk data profil nyata ---
  const [profile, setProfile] = useState({
    name: 'Tamu',
    level: 0,
    points: 0,
    avatar_url: null,
  });

  // --- MODIFIKASI 2: Fetch Data Profil ---
  useEffect(() => {
    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, username, level, points, avatar_url')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setProfile({
            name: data.full_name || data.username || 'Pengguna',
            level: data.level || 1,
            points: data.points || 0,
            avatar_url: data.avatar_url,
          });
        }
      }
    };
    fetchProfileData();
  }, []); // Jalankan saat komponen dimuat

  const handleNavigation = screenName => {
    navigation.navigate(screenName);
    navigation.closeDrawer();
  };

  // --- MODIFIKASI 3: Logika Logout Nyata ---
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
              // Jika sukses, App.tsx akan otomatis pindah ke Auth stack
              navigation.closeDrawer();
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  // Menentukan sumber gambar avatar
  const avatarSource = profile.avatar_url
    ? { uri: profile.avatar_url }
    : ProfilePict;

  // Aksi saat bagian profil ditekan
  const handleProfileTap = () => {
    // handleNavigation('Profile'); // Navigasi ke main Profile Screen (bottom tab)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Bagian Atas Melengkung (Profil) */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={handleProfileTap} // MODIFIKASI 4: Profile bisa di-tap
        activeOpacity={0.8}
      >
        {/* Tombol Kembali (Close Drawer) */}
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

        {/* Info Profil */}
        <View style={styles.profileInfo}>
          {/* Ganti View/Placeholder dengan Image dinamis */}
          <View style={styles.profilePicWrapper}>
            <ProfilePict
              width={70}
              height={70}
              style={styles.profilePicPlaceholder}
            />
            {/* Jika Anda ingin menggunakan Image dari URL:
            <Image source={avatarSource} style={styles.profilePicImage} />
            */}
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              Hi, {profile.name}
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

      {/* Konten Scrollable (Menu) */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Tombol Custom (Beli Buku, Daftar Member) */}
        <View style={styles.customButtonsContainer}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => handleNavigation('MarketPlace')} // Rute yang paling mungkin
          >
            <Text style={styles.customButtonText}>Beli buku</Text>
            <Text style={styles.customButtonArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.customButton}
            // onPress={() => handleNavigation('Premium')} // Rute yang paling mungkin
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
            onPress={() => handleNavigation('MarketPlace')} // Rute Marketplace
          />
          <DrawerItem
            icon={<SettingIcon width={24} height={24} fill="#fff" />}
            label="Pengaturan"
            // onPress={() => handleNavigation('PlaceholderScreen')} // Rute Placeholder
          />
          <DrawerItem
            icon={<FriendIcon width={24} height={24} fill="#fff" />}
            label="Share ke Teman"
            onPress={() => console.log('Share pressed')} // Logika share API
          />
          <DrawerItem
            icon={<ChatIcon width={24} height={24} fill="#fff" />}
            label="Diskusi"
            onPress={() => handleNavigation('DiscussionChoice')} // Rute Discussion
          />
          <DrawerItem
            icon={<InfoIcon width={24} height={24} fill="#fff" />}
            label="Bantuan"
            // onPress={() => handleNavigation('PlaceholderScreen')} // Rute Placeholder
          />
        </View>
      </DrawerContentScrollView>

      {/* Bagian Bawah (Logout) */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutIconPlaceholder} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    backgroundColor: '#6A453C',
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 15,
    padding: 5,
    zIndex: 1,
  },
  backIconSvg: {
    // Gunakan style ini jika ikon svg Anda tidak memiliki offset
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  profilePicWrapper: {
    marginRight: 15,
  },
  profilePicPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
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
    // Background putih kecil agar ikon SVG terlihat jelas
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
    backgroundColor: '#888', // Placeholder untuk ikon
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 14,
    color: '#888',
  },
});

export default CustomDrawerContent;
