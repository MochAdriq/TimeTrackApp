// src/features/Marketplace/screens/MarketPlaceScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator, // <<< 1. Import
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { supabase } from '../../../services/supabaseClient'; // <<< 2. Import Supabase
import InfoModal from '../../../components/common/InfoModal'; // <<< 3. Import Modal Error

const MarketPlaceScreen = ({ navigation }) => {
  // --- 4. State untuk data, loading, dan error ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- 5. Fungsi untuk menampilkan error ---
  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- 6. Fungsi fetch data dari Supabase ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Ambil data dari tabel 'products'
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Urutkan berdasarkan terbaru

      if (error) {
        throw error; // Lempar error jika ada
      }

      // Pastikan data adalah array
      setProducts(data || []);
    } catch (error) {
      setProducts([]); // Kosongkan data jika gagal
      showError(
        'Gagal Memuat Produk',
        `Terjadi kesalahan saat mengambil data: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 7. Panggil fetchProducts saat komponen dimuat ---
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi navigasi (tidak berubah)
  const handleProductPress = item => {
    navigation.navigate('ProductDetail', {
      productId: item.id,
      itemData: item, // Kirim data lengkap ke detail
    });
  };

  // Render item (tidak berubah)
  const renderProductItem = ({ item }) => (
    <ProductCard item={item} onPress={handleProductPress} />
  );

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

      {/* --- 8. Tampilkan Loading atau Grid Produk --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      ) : (
        <FlatList
          data={products} // <<< Gunakan data dari state
          renderItem={renderProductItem}
          keyExtractor={item => item.id.toString()} // Pastikan ID jadi string
          numColumns={2}
          style={styles.gridList}
          contentContainerStyle={styles.gridContent}
          // Tambahkan ini untuk refresh
          onRefresh={fetchProducts}
          refreshing={loading}
          // Tampilkan pesan jika data kosong
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Belum ada produk yang dijual.
              </Text>
            </View>
          }
        />
      )}

      {/* --- 9. Modal Error --- */}
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
  gridList: {
    flex: 1,
  },
  gridContent: {
    padding: 9,
  },
  // --- 10. Tambahkan style baru ---
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
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  // Style lama (dihapus karena tidak dipakai)
  // tabContainer: { ... },
  // tabActive: { ... },
  // tabActiveText: { ... },
});

export default MarketPlaceScreen;
