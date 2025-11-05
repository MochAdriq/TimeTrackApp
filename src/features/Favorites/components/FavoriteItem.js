// src/features/Favorites/components/FavoriteItem.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const FavoriteItem = ({ item, onPress }) => {
  // --- Gunakan data dari prop 'item' ---
  const imageSource = item.image_url
    ? { uri: item.image_url }
    : { uri: 'https://via.placeholder.com/150/E0E0E0/FFFFFF?text=?' }; // Placeholder

  // --- Tampilkan Kategori sebagai Subtitle ---
  // Fallback ke subtitle materi jika kategori tidak ada
  const subtitleText = item.categories?.name || item.subtitle || 'Materi';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Gambar Thumbnail */}
      <Image source={imageSource} style={styles.thumbnail} />

      {/* Info Teks */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitleText} {/* --- Menampilkan Kategori --- */}
        </Text>
      </View>

      {/* --- Tombol Play Dihapus --- */}
      {/* Seluruh item sudah bisa diklik */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#E0E0E0',
  },
  textContainer: {
    flex: 1, // Mengisi ruang
    justifyContent: 'center',
    // Hapus marginRight karena tombol play tidak ada
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    // Hapus marginBottom
  },
  // --- Style untuk duration dan playButton dihapus ---
});

export default FavoriteItem;
