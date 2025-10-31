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
  ActivityIndicator, // <<< 1. Import
} from 'react-native';

// --- Impor Aset & Modal ---
import { supabase } from '../../../services/supabaseClient'; // <<< 2. Import Supabase
import InfoModal from '../../../components/common/InfoModal'; // <<< 3. Import Modal Error
import CheckoutModal from '../components/CheckoutModal';

const placeholderImage = require('../../../../src/assets/images/dummyImage.png');
const { width: screenWidth } = Dimensions.get('window');
const imageHeight = screenWidth;

// --- Hapus Data Dummy ---
// const dummyProduct = { ... };

const ProductDetailScreen = ({ route, navigation }) => {
  // --- 4. Ambil data awal dari parameter navigasi ---
  const { productId, itemData: initialItemData } = route.params;

  // --- 5. State untuk data lengkap, loading, dan error ---
  const [item, setItem] = useState(initialItemData); // Tampilkan data awal dulu
  const [loading, setLoading] = useState(true); // Set true untuk fetch detail
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('Detail');
  const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false);

  // --- Modal Error State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- 6. Fungsi untuk fetch data detail dari Supabase ---
  const fetchProductDetail = async () => {
    if (!productId) {
      showError('Error', 'ID Produk tidak ditemukan.', true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single(); // Ambil satu data saja

      if (error) {
        throw error;
      }

      if (data) {
        setItem(data);
        // Set varian default jika ada
        if (data.variants && data.variants.length > 0) {
          // Cek tipe data variants, jika JSON, ambil key pertama
          if (
            typeof data.variants === 'object' &&
            !Array.isArray(data.variants)
          ) {
            const variantKeys = Object.keys(data.variants);
            if (variantKeys.length > 0) {
              const firstVariantName = variantKeys[0];
              const firstVariantValue = data.variants[firstVariantName][0];
              setSelectedVariant(firstVariantValue || null);
            }
          } else if (Array.isArray(data.variants)) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } else {
        // Produk tidak ditemukan
        showError('Error', 'Produk tidak ditemukan atau sudah dihapus.', true);
      }
    } catch (error) {
      showError('Gagal Memuat', `Terjadi kesalahan: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // --- 7. Panggil fetchProductDetail saat komponen dimuat ---
  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  // --- 8. Fungsi untuk menampilkan modal error ---
  const showError = (title, message, goBack = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    // Jika 'goBack' true, arahkan user kembali saat modal ditutup
    if (goBack) {
      setTimeout(() => {
        setModalVisible(false);
        navigation.goBack();
      }, 2500); // Tampilkan error 2.5 detik lalu kembali
    }
  };

  // --- Fungsi Modal (tidak berubah) ---
  const handleAddToCart = () => {
    console.log('Add to Cart pressed');
    setCheckoutModalVisible(true);
  };

  const handleBuyNow = () => {
    console.log('Buy Now pressed, opening modal...');
    setCheckoutModalVisible(true);
  };

  const closeCheckoutModal = () => setCheckoutModalVisible(false);
  const handleSeeMore = () => console.log('See More Description');

  // --- 9. Render Loading jika data belum siap ---
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        {/* Header minimalis saat loading */}
        <View style={styles.headerPlaceholder}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonLoading}
          >
            <Text style={styles.backButtonTextLoading}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      </SafeAreaView>
    );
  }

  // --- 10. Tampilkan "Produk tidak ditemukan" jika item null (setelah loading) ---
  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.headerPlaceholder}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonLoading}
          >
            <Text style={styles.backButtonTextLoading}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Produk tidak ditemukan.</Text>
        </View>
        <InfoModal
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            navigation.goBack(); // Kembali saat modal ditutup
          }}
          title={modalTitle}
          message={modalMessage}
        />
      </SafeAreaView>
    );
  }

  // --- 11. Render Varian dengan aman (dari data JSON) ---
  const renderVariants = () => {
    if (!item.variants) return null;

    // Jika variants adalah OBJEK (JSONB)
    if (typeof item.variants === 'object' && !Array.isArray(item.variants)) {
      return Object.keys(item.variants).map(variantName => (
        <View key={variantName} style={styles.variantGroup}>
          <Text style={styles.variantName}>{variantName}:</Text>
          <View style={styles.variantContainer}>
            {item.variants[variantName].map(variantValue => (
              <TouchableOpacity
                key={variantValue}
                style={[
                  styles.variantButton,
                  selectedVariant === variantValue &&
                    styles.variantButtonSelected,
                ]}
                onPress={() => setSelectedVariant(variantValue)}
              >
                <Text
                  style={[
                    styles.variantText,
                    selectedVariant === variantValue &&
                      styles.variantTextSelected,
                  ]}
                >
                  {variantValue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ));
    }

    // Jika variants adalah ARRAY (data lama)
    if (Array.isArray(item.variants)) {
      return (
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
      );
    }

    return null;
  };

  const imageSource = item.image_url
    ? { uri: item.image_url }
    : placeholderImage;
  const itemPrice = item.price || 0;
  const itemSoldCount = item.sold_count || '0';
  const itemRating = item.rating || 0;
  const itemDescription = item.description || 'Tidak ada deskripsi.';
  const itemInfoPenting = item.info_penting || 'Tidak ada info penting.';

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        {/* === Konten Putih (Overlap) === */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>Terjual {itemSoldCount}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starPlaceholder}>
                <Text style={{ color: '#F9A825' }}>⭐</Text>
              </View>
              <Text style={styles.metaText}>{itemRating}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            Rp{itemPrice.toLocaleString('id-ID')}
          </Text>

          {/* Varian (Part 1, 2, 3) */}
          {renderVariants()}

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
              // numberOfLines={activeTab === 'Detail' ? 10 : undefined} // Hapus batasan baris sementara
            >
              {activeTab === 'Detail' ? itemDescription : itemInfoPenting}
            </Text>
            {/* {activeTab === 'Detail' && (
              <TouchableOpacity onPress={handleSeeMore}>
                <Text style={styles.seeMoreText}>Lihat Selengkapnya</Text>
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </ScrollView>

      {/* --- Render Modal Checkout --- */}
      <CheckoutModal
        isVisible={isCheckoutModalVisible}
        onClose={closeCheckoutModal}
        itemData={item}
        selectedVariant={selectedVariant} // Kirim varian terpilih
      />

      {/* --- Render Modal Error --- */}
      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  // --- Style Header Loading ---
  headerPlaceholder: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  backButtonLoading: {
    backgroundColor: '#F0F0F0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonTextLoading: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  // --- Style Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  // ---
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
  // --- Style Varian Baru ---
  variantGroup: {
    marginBottom: 15,
  },
  variantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  variantContainer: { flexDirection: 'row', flexWrap: 'wrap' }, // Tambah flexWrap
  // ---
  variantButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10, // Tambah margin bottom
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
