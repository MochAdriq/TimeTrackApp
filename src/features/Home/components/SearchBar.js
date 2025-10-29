// src/features/Home/components/SearchBar.js

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

import SearchIcon from '../../../assets/icon/SearchIcon.svg';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearchPress = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    // Container utama (relative positioning context)
    <View style={styles.container}>
      {/* Wrapper untuk Input dan Ikon */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Jelajahi Sejarah..."
          placeholderTextColor="#B0B0B0"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchPress}
        />
        {/* Ikon Search */}
        <View style={styles.iconContainer}>
          {/* Ganti dengan Image */}
          <View style={styles.iconPlaceholder}>
            <SearchIcon />
          </View>
        </View>
      </View>

      {/* Tombol Cari (Diposisikan Absolut) */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
        <Text style={styles.searchButtonText}>Cari</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Tetap row
    alignItems: 'center', // Pusatkan item secara vertikal
    marginHorizontal: 15, // Margin samping
    height: 55, // Tinggi total
    position: 'relative', // Konteks untuk positioning absolut tombol
    // Hapus background & border radius dari sini
  },
  inputWrapper: {
    flex: 1, // Mengisi ruang sisa
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Background putih
    borderRadius: 30, // Sudut melengkung penuh
    paddingLeft: 20, // Padding kiri input
    height: '100%', // Tinggi sama dengan container
    // Shadow untuk input wrapper
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    // Beri sedikit ruang di kanan agar tombol tidak terlalu menempel
    paddingRight: 50, // Sesuaikan angka ini agar pas
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    marginRight: 5, // Jarak kecil ke ikon
  },
  iconContainer: {
    paddingHorizontal: 10,
  },
  iconPlaceholder: {
    right: 24,
  },
  searchButton: {
    position: 'absolute', // Positioning absolut
    right: 16, // Tempel ke kanan container
    justifyContent: 'center', // Pusatkan teks tombol secara vertikal
    backgroundColor: '#E3D5B8', // Warna krem/coklat muda
    paddingHorizontal: 20, // Padding horizontal tombol
    borderRadius: 30, // Sudut melengkung penuh
    height: 40,
    // Shadow untuk tombol agar terlihat mengambang
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 }, // Sedikit offset shadow
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5, // Elevation lebih tinggi dari input wrapper
    marginLeft: -40, // Tarik sedikit ke kiri agar 'overlap' (SESUAIKAN ANGKA INI)
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SearchBar;
