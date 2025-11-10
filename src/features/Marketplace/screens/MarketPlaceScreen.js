// src/features/Marketplace/screens/MarketPlaceScreen.js
import React, { useState, useEffect, useMemo } from 'react'; // <<< 1. Import useMemo
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
// <<< 2. IMPORT SEARCHBAR >>>
import SearchBar from '../../Home/components/SearchBar';

const MarketPlaceScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // <<< 3. TAMBAHKAN STATE UNTUK SEARCH QUERY >>>
  const [searchQuery, setSearchQuery] = useState('');

  const showError = (title, message) => {
    // ... (Fungsi tetap sama)
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setProducts(data || []);
    } catch (error) {
      setProducts([]);
      showError(
        'Gagal Memuat Produk',
        `Terjadi kesalahan saat mengambil data: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // <<< 4. BUAT LOGIKA FILTER DENGAN useMemo >>>
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products; // Kembalikan semua produk jika query kosong
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return products.filter(
      product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        (product.category &&
          product.category.toLowerCase().includes(lowerCaseQuery)),
    );
  }, [products, searchQuery]); // Dependensi: data asli dan query

  const handleProductPress = item => {
    // ... (Fungsi tetap sama)
    navigation.navigate('ProductDetail', {
      productId: item.id,
      itemData: item,
    });
  };

  const renderProductItem = ({ item }) => (
    <ProductCard item={item} onPress={handleProductPress} />
  );

  // <<< 5. BUAT KOMPONEN UNTUK LIST KOSONG >>>
  const renderEmptyComponent = () => {
    if (loading) {
      return null; // Jangan tampilkan apa-apa saat loading awal
    }
    // Jika ada query tapi tidak ada hasil
    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Produk "{searchQuery}" tidak ditemukan.
          </Text>
        </View>
      );
    }
    // Jika tidak ada query dan data memang kosong
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Belum ada produk yang dijual.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* --- Header Kustom (Tetap sama) --- */}
      <View style={styles.headerPlaceholder}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Market Place</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* <<< 6. TAMBAHKAN SEARCHBAR DI SINI >>> */}
      <View style={styles.searchBarWrapper}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Cari produk di marketplace..."
        />
      </View>

      {/* --- 7. Tampilkan Loading atau Grid Produk --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts} // <<< 8. GUNAKAN DATA YANG SUDAH DIFILTER
          renderItem={renderProductItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          style={styles.gridList}
          contentContainerStyle={styles.gridContent}
          onRefresh={fetchProducts}
          refreshing={loading}
          ListEmptyComponent={renderEmptyComponent} // <<< 9. Gunakan komponen empty
        />
      )}

      {/* --- Modal Error --- */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  headerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },

  // <<< 10. STYLE BARU UNTUK SEARCHBAR WRAPPER >>>
  searchBarWrapper: {
    paddingVertical: 8, // Beri jarak atas bawah
    backgroundColor: '#F4F4F4', // Samakan dengan background
    paddingBottom: 4,
  },

  gridList: {
    flex: 1,
  },
  gridContent: {
    padding: 9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default MarketPlaceScreen;
