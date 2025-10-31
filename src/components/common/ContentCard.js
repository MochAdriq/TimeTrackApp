// src/components/common/ContentCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// --- 1. Import Ikon Hati ---
import LoveIconActive from '../../assets/icon/LoveIconActive.svg';
import LoveIconInactive from '../../assets/icon/LoveIconInactive.svg';

// Gambar placeholder
const placeholderImage = require('../../assets/images/dummyImage.png');

// --- 2. Tambahkan 2 props baru: isFavorite dan onToggleFavorite ---
const ContentCard = ({
  item,
  onPress,
  isFavorite,
  onToggleFavorite,
  style,
}) => {
  const imageSource = item.image_url
    ? { uri: item.image_url }
    : placeholderImage;

  // --- 3. Buat fungsi untuk tombol Hati ---
  // Ini akan memanggil fungsi di HomeScreen, tapi menghentikan
  // event 'onPress' kartu agar tidak pindah layar.
  const handleFavoritePress = e => {
    e.stopPropagation(); // Hentikan event 'onPress' ke kartu
    if (onToggleFavorite) {
      onToggleFavorite(); // Jalankan fungsi toggle
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Image source={imageSource} style={styles.image} />

      {/* --- 4. Tombol Hati (Absolute Position) --- */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        {isFavorite ? (
          <LoveIconActive width={24} height={24} />
        ) : (
          <LoveIconInactive width={24} height={24} />
        )}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.category} numberOfLines={1}>
          {item.categories?.name || 'Kategori'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 220, // Lebar kartu
    marginRight: 15,
    overflow: 'hidden', // Penting agar border radius gambar bekerja
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120, // Tinggi gambar
    backgroundColor: '#EEE',
  },
  // --- 5. Style untuk Tombol Hati ---
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Background semi-transparan
    borderRadius: 20,
    padding: 4,
  },
  textContainer: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: '#6A453C',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    minHeight: 36, // Jaga 2 baris
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
  },
});

export default ContentCard;
