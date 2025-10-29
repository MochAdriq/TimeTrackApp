// src/features/Marketplace/screens/ProductDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

// --- Impor Aset & Modal ---
// const starIcon = require('../../../assets/icons/StarIcon.svg');
// const backArrowIcon = require('../../../assets/icons/BackArrowIcon.svg');
const placeholderImage = require('../../../../src/assets/images/dummyImage.png'); // Sediakan placeholder
import CheckoutModal from '../components/CheckoutModal'; // <<<--- 1. IMPORT MODAL

const { width: screenWidth } = Dimensions.get('window');
const imageHeight = screenWidth;

// --- Data Dummy (Nanti diambil dari route.params) ---
const dummyProduct = {
  id: '1',
  title: 'Buku Sejarah',
  soldCount: '786+',
  rating: 4.9,
  price: 100000,
  variants: ['Part 1', 'Part 2', 'Part 3'],
  stock: 3, // Tambahkan info stock
  imageUrl: 'https://via.placeholder.com/400x400/EEEEEE/333?text=Buku+Detail',
  description: `Kondisi : Baru
Min. Pemesanan: 1 Buah
Etalase : Jaket Bulu Angsa

HARAP BACA SEBELUM ORDER YAH
Estmasi ukuran : 
all size M-XL

READY STOCK ( no po ) BARANG YANG HABIS AKAN
SEGERA KITA DELETE...
Tolong cek di katalog ready yah..
jangan di list product terjual......`,
  infoPenting:
    'Info pengiriman:\n- JNE: Senin - Jumat\n- Gojek: Setiap Hari\n\nGaransi 1 minggu.',
};

const ProductDetailScreen = ({ route, navigation }) => {
  // const { productId } = route.params;
  // const item = route.params.itemData || dummyProduct; // Ambil data dari navigasi

  // Untuk sekarang, kita pakai data dummy
  const item = dummyProduct;

  const [selectedVariant, setSelectedVariant] = useState(item.variants[0]);
  const [activeTab, setActiveTab] = useState('Detail');

  // --- 2. STATE UNTUK MODAL ---
  const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);

  const imageSource = item.imageUrl ? { uri: item.imageUrl } : placeholderImage;

  const handleAddToCart = () => {
    console.log('Add to Cart pressed');
    // Boss bisa pilih: mau langsung ke keranjang, atau buka modal juga
    setCheckoutModalVisible(true); // Contoh: Buka modal juga
  };

  const handleBuyNow = () => {
    // --- 3. BUKA MODAL ---
    console.log('Buy Now pressed, opening modal...');
    setCheckoutModalVisible(true); // <<< Buka modal
  };

  const handleSeeMore = () => console.log('See More Description');

  // --- 4. FUNGSI UNTUK MENUTUP MODAL ---
  const closeCheckoutModal = () => setCheckoutModalVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === Bagian Gambar (Atas) === */}
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
          {/* Tombol Kembali (Absolute) */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        {/* === Konten Putih (Overlap) === */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>{item.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>Terjual {item.soldCount}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starPlaceholder}>
                <Text style={{ color: '#F9A825' }}>⭐</Text>
              </View>
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>

          {/* Harga */}
          <Text style={styles.price}>
            Rp{item.price.toLocaleString('id-ID')}
          </Text>

          {/* Varian (Part 1, 2, 3) */}
          <View style={styles.variantContainer}>
            {item.variants.map(variant => (
              <TouchableOpacity
                key={variant}
                style={[
                  styles.variantButton,
                  selectedVariant === variant && styles.variantButtonSelected,
                ]}
                onPress={() => setSelectedVariant(variant)}
              >
                <Text
                  style={[
                    styles.variantText,
                    selectedVariant === variant && styles.variantTextSelected,
                  ]}
                >
                  {variant}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tombol Aksi (Keranjang & Beli) */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cartButton]}
              onPress={handleAddToCart}
            >
              <Text style={[styles.actionButtonText, styles.cartButtonText]}>
                Keranjang
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.buyButton]}
              onPress={handleBuyNow}
            >
              <Text style={[styles.actionButtonText, styles.buyButtonText]}>
                Beli Sekarang
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Detail / Info Penting */}
          <View style={styles.tabNavContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Detail' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('Detail')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Detail' && styles.tabTextActive,
                ]}
              >
                Detail
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Info Penting' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('Info Penting')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Info Penting' && styles.tabTextActive,
                ]}
              >
                Info Penting
              </Text>
            </TouchableOpacity>
          </View>

          {/* Konten Tab (Deskripsi / Info) */}
          <View style={styles.tabContent}>
            <Text
              style={styles.descriptionText}
              numberOfLines={activeTab === 'Detail' ? 10 : undefined}
            >
              {activeTab === 'Detail' ? item.description : item.infoPenting}
            </Text>
            {activeTab === 'Detail' && (
              <TouchableOpacity onPress={handleSeeMore}>
                <Text style={styles.seeMoreText}>Lihat Selengkapnya</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- 5. RENDER MODAL DI SINI (DI LUAR SCROLLVIEW) --- */}
      <CheckoutModal
        isVisible={isCheckoutModalVisible}
        onClose={closeCheckoutModal}
        itemData={item} // Kirim data produk ke modal
      />
      {/* --- AKHIR RENDER MODAL --- */}
    </SafeAreaView>
  );
};

// --- STYLES (Tetap sama) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollContent: { paddingBottom: 40 },
  imageContainer: {
    width: screenWidth,
    height: imageHeight,
    backgroundColor: '#E0E0E0',
  },
  image: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  contentArea: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  metaText: { fontSize: 13, color: '#777', marginRight: 15 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starPlaceholder: { marginRight: 4 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  variantContainer: { flexDirection: 'row', marginBottom: 20 },
  variantButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  variantButtonSelected: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  variantText: { fontSize: 13, color: '#555' },
  variantTextSelected: { color: '#6A453C', fontWeight: 'bold' },
  actionButtonContainer: { flexDirection: 'row', marginBottom: 25, gap: 10 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E3D5B8',
  },
  cartButtonText: {
    color: '#6A453C',
  },
  buyButton: {
    backgroundColor: '#C8A870',
  },
  buyButtonText: {
    color: '#FFFFFF',
  },
  actionButtonText: { fontSize: 15, fontWeight: 'bold' },
  tabNavContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#6A453C',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#333',
    fontWeight: 'bold',
  },
  tabContent: {
    // Konten tab
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  seeMoreText: {
    color: '#6A453C',
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default ProductDetailScreen;
