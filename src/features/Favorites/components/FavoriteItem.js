// src/features/Favorites/components/FavoriteItem.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// --- Impor Aset ---
// const playIcon = require('../../../assets/icons/PlayIcon.svg'); // Atau .png
// const placeholderImage = require('../../../assets/images/placeholder_image.png'); // Placeholder

const FavoriteItem = ({ imageUrl, title, subtitle, duration, onPress }) => {
  // Gunakan URL dummy jika imageUrl tidak ada
  const imageSource = imageUrl
    ? { uri: imageUrl }
    : { uri: 'https://picsum.photos/200/300' }; // <-- Ganti baris ini

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
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>

      {/* Tombol Play */}
      <TouchableOpacity style={styles.playButton} onPress={onPress}>
        {/* Ganti View ini dengan ikon Play */}
        <View style={styles.playIconPlaceholder}>
          <Text style={{ fontSize: 16 }}>▶</Text>
        </View>
        {/* <PlayIcon width={20} height={20} fill="#333" /> */}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Background item putih
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 60, // Ukuran thumbnail
    height: 60,
    borderRadius: 10, // Sudut thumbnail
    marginRight: 15,
    backgroundColor: '#E0E0E0', // Warna placeholder
  },
  textContainer: {
    flex: 1, // Agar mengisi ruang sisa
    justifyContent: 'center',
    marginRight: 10,
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
    marginBottom: 4,
  },
  duration: {
    fontSize: 11,
    color: '#AAA',
  },
  playButton: {
    padding: 10, // Area sentuh tombol play
  },
  playIconPlaceholder: {
    // Ganti dengan style ikon asli
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // playIcon: { width: 20, height: 20 },
});

export default FavoriteItem;
