// src/features/Marketplace/components/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// --- Impor Aset (Ganti path) ---
// const starIcon = require('../../../assets/icons/StarIcon.svg');
// const pinIcon = require('../../../assets/icons/PinIcon.svg');
// const placeholderImage = require('../../../assets/images/placeholder_image.png');

const ProductCard = ({ item, onPress }) => {
  const imageSource = item.imageUrl
    ? { uri: item.imageUrl }
    : require('../../../../src/assets/images/dummyImage.png'); // Fallback

  // Format harga (contoh)
  const formattedPrice = `Rp ${item.price.toLocaleString('id-ID')}`;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      {/* Gambar Produk */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      {/* Badge Diskon (Pojok kanan atas) */}
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}

      {/* Info Produk */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{formattedPrice}</Text>

        {/* Rating */}
        <View style={styles.metaRow}>
          {/* Ganti View dengan ikon Bintang */}
          <View style={styles.iconPlaceholder}>
            <Text style={{ color: '#F9A825' }}>⭐</Text>
          </View>
          <Text style={styles.metaText}>
            {item.rating} - {item.soldCount}+ terjual
          </Text>
        </View>

        {/* Lokasi */}
        <View style={styles.metaRow}>
          {/* Ganti View dengan ikon Pin Lokasi */}
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 10 }}>📍</Text>
          </View>
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconPlaceholder: {
    // Ganti dengan style ikon
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
