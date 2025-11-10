// src/features/Marketplace/components/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProductCard = ({ item, onPress }) => {
  // <<< PERBAIKAN 1: Gunakan 'item.image_url' (dari database) >>>
  const imageSource = item.image_url
    ? { uri: item.image_url }
    : require('../../../../src/assets/images/dummyImage.png'); // Fallback

  // Format harga (Sudah Benar)
  const formattedPrice = `Rp ${item.price.toLocaleString('id-ID')}`;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      {/* Gambar Produk */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* <<< DIHILANGKAN: item.discount (tidak ada di DB) >>> */}

      {/* Info Produk */}
      <View style={styles.infoContainer}>
        {/* <<< PERBAIKAN 2: Gunakan 'item.name' (dari database) >>> */}
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formattedPrice}</Text>

        {/* <<< DIHILANGKAN: item.rating / soldCount (tidak ada di DB) >>> */}
        {/* <<< DIHILANGKAN: item.location (tidak ada di DB) >>> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1, // Penting untuk grid agar lebarnya sama
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 6, // Jarak antar kartu
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden', // Agar badge tidak keluar
  },
  image: {
    width: '100%',
    height: 150, // Tinggi gambar (sesuaikan)
    backgroundColor: '#E0E0E0',
  },
  // Style untuk badge diskon (dihapus dari render, tapi style bisa disimpan)
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700', // Kuning (estimasi)
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 10, // Lengkungan di sudut kiri bawah badge
  },
  discountText: {
    color: '#D32F2F', // Merah (estimasi)
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    minHeight: 34, // Jaga 2 baris
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  // Styles untuk meta data (dihapus dari render)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconPlaceholder: {
    width: 14,
    height: 14,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#777',
  },
});

export default ProductCard;
