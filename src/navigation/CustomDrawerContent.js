// src/navigation/CustomDrawerContent.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  DrawerContentScrollView,
  // DrawerItemList, // Bisa dipakai jika ingin render item default
} from '@react-navigation/drawer';

import ProfilePict from '../assets/images/ProfilePict.svg';
import CartIcon from '../assets/icon/CartIcon.svg';
import SettingIcon from '../assets/icon/SettingIcon.svg';
import ChatIcon from '../assets/icon/ChatIcon.svg';
import InfoIcon from '../assets/icon/InfoIcon.svg';
import FriendIcon from '../assets/icon/FriendIcon.svg';
import BackDrawerIcon from '../assets/icon/BackDrawerIcon.svg';

// Data dummy (nanti diganti data asli)
const userData = {
  name: 'Alka Azzahra',
  level: 1,
  points: 100000,
  // profilePicUrl: '...', // Atau pakai require
};

// Komponen Item Menu (agar bisa dipakai ulang)
const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {/* Ganti View ini dengan Komponen Ikon */}
    <View style={styles.menuIconContainer}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = props => {
  const { navigation } = props; // Ambil navigation dari props

  const handleNavigation = screenName => {
    navigation.navigate(screenName); // Navigasi ke layar
    navigation.closeDrawer(); // Tutup drawer setelah navigasi
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    // Nanti tambahkan logika logout & navigasi ke Auth
    // navigation.replace('Auth');
    navigation.closeDrawer();
  };

  return (
    // SafeAreaView agar konten tidak terlalu mepet ke atas/bawah
    <SafeAreaView style={styles.safeArea}>
      {/* Bagian Atas Melengkung (Profil) */}
      <View style={styles.profileSection}>
        {/* Tombol Kembali */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.closeDrawer()}
        >
          {/* Ganti View ini dengan ikon panah */}
          <BackDrawerIcon style={styles.backIconPlaceholder}>
            <Text style={{ color: '#fff' }}>{'<'}</Text>
          </BackDrawerIcon>
          {/* <BackArrowIcon width={24} height={24} fill="#FFF" /> */}
        </TouchableOpacity>

        {/* Info Profil */}
        <View style={styles.profileInfo}>
          {/* Ganti View ini dengan Image/SVG profil */}
          <ProfilePict style={styles.profilePicPlaceholder} />
          {/* <ProfilePic width={70} height={70} style={styles.profilePic} /> */}
          <View style={styles.profileText}>
            <Text style={styles.profileName}>Hi, {userData.name}</Text>
            <Text style={styles.profileSubtext}>Good Morning</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {userData.level}</Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>
                  {userData.points.toLocaleString('id-ID')}
                </Text>
                {/* Ganti View ini dengan ikon koin */}
                <View style={styles.coinIconPlaceholder} />
                {/* <CoinIcon width={12} height={12} /> */}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Konten Scrollable (Menu) */}
      <DrawerContentScrollView
        {...props} // Penting untuk fungsionalitas drawer
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Tombol Custom (Beli Buku, Daftar Member) */}
        <View style={styles.customButtonsContainer}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => handleNavigation('BeliBuku')} // Ganti 'BeliBuku' dgn nama route
          >
            <Text style={styles.customButtonText}>Beli buku</Text>
            <Text style={styles.customButtonArrow}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => handleNavigation('DaftarMember')} // Ganti 'DaftarMember'
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
            onPress={() => handleNavigation('Pembelian')} // Ganti nama route
          />
          <DrawerItem
            icon={<SettingIcon width={24} height={24} fill="#fff" />}
            label="Pengaturan"
            onPress={() => handleNavigation('Pengaturan')}
          />
          <DrawerItem
            icon={<FriendIcon width={24} height={24} fill="#fff" />}
            label="Share ke Teman"
            onPress={() => console.log('Share pressed')} // Atau pakai Share API
          />
          <DrawerItem
            icon={<ChatIcon width={24} height={24} fill="#fff" />}
            label="Customer Service"
            onPress={() => handleNavigation('CustomerService')}
          />
          <DrawerItem
            icon={<InfoIcon width={24} height={24} fill="#fff" />}
            label="Bantuan"
            onPress={() => handleNavigation('Bantuan')}
          />
        </View>

        {/* Bisa render item default dari navigator jika perlu */}
        {/* <DrawerItemList {...props} /> */}
      </DrawerContentScrollView>

      {/* Bagian Bawah (Logout/Login) - Di luar ScrollView */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {/* Ganti View dengan ikon login/logout */}
          <View style={styles.logoutIconPlaceholder} />
          {/* <LoginIcon width={20} height={20} stroke="#888" /> */}
          <Text style={styles.logoutText}>Login</Text> {/* Atau Logout */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (Contoh, sesuaikan warna, font, spacing) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Background default putih
  },
  profileSection: {
    backgroundColor: '#6A453C', // Warna coklat gelap
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 40, // Padding bawah lebih besar untuk lengkungan
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 10 || 25,
    left: 15,
    padding: 5, // Area sentuh
    zIndex: 1,
  },
  backIconPlaceholder: {
    width: 24,
    height: 24,
    top: -35,
    left: -10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25, // Jarak dari atas (setelah back button)
  },
  profilePicPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  // profilePic: { ... },
  profileText: {
    flex: 1, // Agar nama bisa panjang
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
    paddingTop: 10, // Jarak dari profile section
    backgroundColor: '#FFFFFF',
  },
  customButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  customButton: {
    flex: 1, // Bagi ruang
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8', // Background abu muda
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5, // Jarak antar tombol
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
    paddingHorizontal: 10, // Padding untuk item menu
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    // borderBottomWidth: 1, // Garis pemisah (opsional)
    // borderBottomColor: '#EEE',
  },
  menuIconContainer: {
    width: 24, // Atau ukuran default
    height: 24, // Atau ukuran default
    marginRight: 20,
    alignItems: 'center', // Pastikan ikon di tengah jika wrapper lebih besar
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: '#444',
    // fontFamily: 'YourFont-Regular',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFFFFF', // Pastikan background putih
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
    // Ganti dengan style ikon
    width: 20,
    height: 20,
    marginRight: 15,
    // backgroundColor: '#CCC', // Placeholder
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    color: '#888', // Warna abu
  },
});

export default CustomDrawerContent;
