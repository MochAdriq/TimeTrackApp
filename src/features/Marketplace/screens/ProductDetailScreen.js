import React, { useState, useEffect, useCallback } from 'react'; // <<< IMPORT useCallback
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
  ActivityIndicator,
} from 'react-native';

// --- Impor Aset & Modal ---
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
// --- HAPUS: CheckoutModal ---

const placeholderImage = require('../../../../src/assets/images/dummyImage.png');
const { width: screenWidth } = Dimensions.get('window');
const imageHeight = screenWidth;

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId, itemData: initialItemData } = route.params;

  const [item, setItem] = useState(initialItemData);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('Detail');
  // --- HAPUS: isCheckoutModalVisible ---

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- (INI PERBAIKANNYA) Bungkus dengan useCallback ---
  const fetchProductDetail = useCallback(async () => {
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
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setItem(data);
        // Set varian default jika ada
        if (data.variants && data.variants.length > 0) {
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
        showError('Error', 'Produk tidak ditemukan atau sudah dihapus.', true);
      }
    } catch (error) {
      showError('Gagal Memuat', `Terjadi kesalahan: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  }, [productId, showError]); // Tambahkan navigation jika showError menggunakannya
  // --- (BATAS PERBAIKAN) ---

  // --- (INI PERBAIKANNYA) Panggil fetchProductDetail ---
  useEffect(() => {
    fetchProductDetail();
  }, [productId, fetchProductDetail]); // <-- Tambahkan fetchProductDetail

  // --- (INI FUNGSI BARU) showError dipisah ---
  const showError = useCallback(
    (title, message, goBack = false) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalVisible(true);
      if (goBack) {
        setTimeout(() => {
          setModalVisible(false);
          navigation.goBack();
        }, 2500);
      }
    },
    [navigation],
  ); // Tambahkan navigation
  // --- (BATAS FUNGSI BARU) ---

  // --- HAPUS: handleAddToCart ---

  // --- (INI PERUBAHAN UTAMA) ---
  const handleBuyNow = () => {
    console.log('Buy Now pressed, navigasi ke Checkout...');

    // Validasi: Cek jika ada varian, tapi belum dipilih
    if (item.variants && !selectedVariant) {
      showError('Pilih Varian', 'Silakan pilih varian produk terlebih dahulu.');
      return;
    }

    // Buat "keranjang palsu" (Array berisi 1 item)
    // Ini agar CheckoutScreen.js (langkah B) bisa menerima data
    // dalam format yang konsisten (array of items)
    const cartItems = [
      {
        ...item,
        selectedVariant: selectedVariant,
        quantity: 1, // Asumsi beli 1
      },
    ];

    // Navigasi langsung ke CheckoutScreen, kirim data produk
    navigation.navigate('Checkout', {
      cartItems: cartItems,
    });
  };
  // --- (BATAS PERUBAHAN) ---

  // --- HAPUS: closeCheckoutModal ---
  const handleSeeMore = () => console.log('See More Description');

  // --- (Tampilan Loading & Error tetap sama) ---
  if (loading) {
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
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      </SafeAreaView>
    );
  }

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
            navigation.goBack();
          }}
          title={modalTitle}
          message={modalMessage}
        />
      </SafeAreaView>
    );
  }

  // --- (renderVariants tetap sama) ---
  const renderVariants = () => {
    if (!item.variants) return null;
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
  // --- (Batas renderVariants) ---

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
            {/* <View style={styles.ratingContainer}>
              <View style={styles.starPlaceholder}>
                <Text style={{ color: '#F9A825' }}>⭐</Text>
              </View>
              <Text style={styles.metaText}>{itemRating}</Text>
            </View> */}
          </View>

          <Text style={styles.price}>
            Rp{itemPrice.toLocaleString('id-ID')}
          </Text>

          {/* Varian */}
          {renderVariants()}

          {/* --- (INI PERBAIKAN TOMBOL) --- */}
          {/* Tombol Aksi (Hanya Beli Sekarang) */}
          <View style={styles.actionButtonContainer}>
            {/* Tombol Keranjang Dihapus Sesuai Permintaan */}
            <TouchableOpacity
              style={[styles.actionButton, styles.buyButton]}
              onPress={handleBuyNow}
            >
              <Text style={[styles.actionButtonText, styles.buyButtonText]}>
                Beli Sekarang
              </Text>
            </TouchableOpacity>
          </View>
          {/* --- (BATAS PERBAIKAN TOMBOL) --- */}

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
            <Text style={styles.descriptionText}>
              {activeTab === 'Detail' ? itemDescription : itemInfoPenting}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- HAPUS: Render Modal Checkout --- */}

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

// --- (INI PERBAIKAN STYLE) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
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
  variantGroup: {
    marginBottom: 15,
  },
  variantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  variantContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  variantButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  variantButtonSelected: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  variantText: { fontSize: 13, color: '#555' },
  variantTextSelected: { color: '#6A453C', fontWeight: 'bold' },

  // --- (PERBAIKAN STYLE TOMBOL) ---
  actionButtonContainer: {
    flexDirection: 'row', // Tetap row
    marginBottom: 25,
    // Hapus 'gap'
  },
  actionButton: {
    flex: 1, // 'flex: 1' akan membuat tombol 'Beli' jadi 100% width
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  // HAPUS: cartButton & cartButtonText
  buyButton: {
    backgroundColor: '#C8A870',
  },
  buyButtonText: {
    color: '#FFFFFF',
  },
  actionButtonText: { fontSize: 15, fontWeight: 'bold' },
  // --- (BATAS PERBAIKAN STYLE) ---

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
  tabContent: {},
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
