// src/features/Favorites/components/FavoriteInfo.js // Atau ganti nama file

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// --- Import Aset ---
import ProfilePict from '../../../assets/images/ProfilePict.svg'; // Asumsi pakai SVG
// --- Import SearchBar ---
// Pastikan path ini benar (keluar dari Favorites/components ke Home/components)
import SearchBar from '../../Home/components/SearchBar'; // <<<--- IMPORT SearchBar

// Terima userName dan onSearch handler
const FavoriteInfo = ({ userName = 'Alka Azzahra', onSearch }) => {
  // <<< Tambah onSearch
  const navigation = useNavigation();

  const handleProfilePress = () => {
    navigation.openDrawer();
  };

  return (
    // Container utama header
    <View style={styles.container}>
      {/* --- Blok Kiri (Teks + SearchBar) --- */}
      <View style={styles.leftBlock}>
        {/* Teks Sapaan */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hi, {userName}</Text>
          <Text style={styles.subGreeting}>Good Morning</Text>
        </View>

        {/* --- SearchBar di bawah teks --- */}
        {/* Beri wrapper untuk styling jika perlu */}
        <View style={styles.searchWrapper}>
          {/* Berikan prop onSearch */}
          <SearchBar onSearch={onSearch} />
        </View>
      </View>

      {/* --- Blok Kanan (Foto Profil) --- */}
      <TouchableOpacity
        onPress={handleProfilePress}
        activeOpacity={0.7}
        style={styles.profileButton}
      >
        <ProfilePict
          width={90} // <<< Ukuran profil (sesuaikan)
          height={90} // <<< Ukuran profil (sesuaikan)
          style={styles.profilePic}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // <<< Tengahkan item secara vertikal
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 5 : 20, // Kurangi padding atas sedikit
    paddingHorizontal: 15, // Kurangi padding samping
    paddingBottom: 10, // Kurangi padding bawah
    backgroundColor: '#FFFFFF',
  },
  leftBlock: {
    flex: 1, // <<< Agar blok kiri mengisi ruang
    marginRight: 15, // <<< Jarak ke foto profil
  },
  textContainer: {
    marginBottom: 20,
    paddingLeft: 25, // <<< Jarak dari teks ke search bar
  },
  greeting: {
    fontSize: 25, // Ukuran font greeting
    fontWeight: 'bold',
    color: '#333333',
  },
  subGreeting: {
    fontSize: 13, // Ukuran font sub-greeting
    color: '#888888',
  },
  searchWrapper: {
    // Styling untuk wrapper SearchBar jika perlu
    // Contoh: 'alignSelf' untuk mengatur lebar SearchBar jika leftBlock terlalu lebar
    // alignSelf: 'stretch', // Atau 'flex-start'
  },
  profileButton: {
    // Style untuk area sentuh profil jika perlu
  },
  profilePic: {
    // Style SVG profile pic
  },
});

export default FavoriteInfo;
