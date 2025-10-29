// src/features/Favorites/components/FavoriteHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// Import ikon back jika punya (opsional)
// import BackArrowIcon from '../../../assets/icons/BackArrowIcon.svg'; // Sesuaikan path

// Terima title dan navigation (atau onBackPress)
const FavoriteHeader = ({ title = 'Favorite', navigation }) => {
  const handleGoBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback jika tidak bisa kembali (misal navigasi ke Home)
      navigation.navigate('Jelajah'); // Asumsi nama route Home di tab bar
    }
  };

  return (
    <View style={styles.container}>
      {/* Tombol Kembali (Opsional) */}
      {navigation && ( // Tampilkan hanya jika navigation ada
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          {/* Ganti dengan ikon panah */}
          <Text style={styles.backButtonText}>{'<'}</Text>
          {/* <BackArrowIcon width={24} height={24} fill="#333" /> */}
        </TouchableOpacity>
      )}

      {/* Judul Halaman */}
      <Text style={styles.title}>{title}</Text>

      {/* Spacer agar judul tetap di tengah jika ada tombol kembali */}
      {navigation && <View style={{ width: 40 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // Pusatkan item jika TIDAK ADA tombol kembali
    // justifyContent: 'center',
    // Beri ruang jika ADA tombol kembali
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF', // Background putih
    borderBottomWidth: 1, // Garis bawah tipis
    borderBottomColor: '#EEE',
    height: 60, // Sesuaikan tinggi jika perlu
  },
  backButton: {
    padding: 5, // Area sentuh
    // Atur posisi absolut jika perlu agar tidak mendorong judul
    // position: 'absolute',
    // left: 15,
    // top: 12, // Sesuaikan
    // zIndex: 1,
  },
  backButtonText: {
    // Ganti dengan style ikon
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    // Hapus textAlign jika pakai space-between
    // textAlign: 'center',
  },
});

export default FavoriteHeader;
