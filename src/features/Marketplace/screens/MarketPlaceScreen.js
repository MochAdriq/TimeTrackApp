// src/features/Marketplace/screens/MarketPlaceScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList, // <<< Pakai FlatList
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import ProductCard from '../components/ProductCard'; // Import kartu produk
// import MarketplaceHeader from '../components/MarketplaceHeader'; // Nanti

// --- Data Dummy ---
const dummyProducts = [
  {
    id: '1',
    title: 'Buku Sejarah Sumatera',
    price: 200000,
    rating: 4.9,
    soldCount: '786',
    location: 'Kota Bandung',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Buku+1',
    discount: '-79%',
  },
  {
    id: '2',
    title: 'Buku Sejarah Sumatera',
    price: 1257000,
    rating: 4.9,
    soldCount: '245',
    location: 'Kab. Tangerang',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Buku+2',
    discount: '-79%',
  },
  {
    id: '3',
    title: 'Buku Sejarah Sumatera',
    price: 1257000,
    rating: 4.7,
    soldCount: '100',
    location: 'Jakarta Pusat',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Buku+3',
    discount: '-79%',
  },
  {
    id: '4',
    title: 'Buku Sejarah Sumatera',
    price: 1250000,
    rating: 4.8,
    soldCount: '290',
    location: 'Bekasi',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Buku+4',
    discount: '-79%',
  },
  {
    id: '5',
    title: 'Dispenser Multifung...',
    price: 1069000,
    rating: 4.9,
    soldCount: '215',
    location: 'Kab. Tangerang',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Dispenser',
    discount: '-79%',
  },
  {
    id: '6',
    title: 'Meja Belajar Aesthe...',
    price: 300000,
    rating: 4.9,
    soldCount: '99',
    location: 'Jakarta Utara',
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Meja',
    discount: '-79%',
  },
];

const MarketPlaceScreen = ({ navigation }) => {
  const handleProductPress = item => {
    console.log('Product pressed:', item.id);
    navigation.navigate('ProductDetail', {
      productId: item.id,
      itemData: item,
    });
  };

  const renderProductItem = ({ item }) => (
    <ProductCard item={item} onPress={handleProductPress} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* --- Header Kustom (Placeholder Dulu) --- */}
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
      {/* <MarketplaceHeader /> */}

      {/* --- Tab Rekomendasi (Placeholder) --- */}
      {/* <View style={styles.tabContainer}>
        <View style={styles.tabActive}>
          <Text style={styles.tabActiveText}>Rekomendasi untuk kamu</Text>
        </View>
      </View> */}

      {/* --- Grid Produk --- */}
      <FlatList
        data={dummyProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2} // <<< INI KUNCI UNTUK GRID 2 KOLOM
        style={styles.gridList}
        contentContainerStyle={styles.gridContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background abu muda
  },
  // --- Style Placeholder Header ---
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
  headerTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' }, // Judul placeholder
  // --- Akhir Placeholder Header ---

  tabContainer: {
    backgroundColor: '#6A453C', // Lanjutan header
    paddingBottom: 10,
    paddingHorizontal: 15,
    alignItems: 'flex-start', // Ratakan ke kiri
  },
  tabActive: {
    backgroundColor: '#D0AA7B', // Coklat muda (estimasi)
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  tabActiveText: {
    color: '#4A2F2F', // Coklat tua
    fontWeight: 'bold',
    fontSize: 13,
  },
  gridList: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background list
  },
  gridContent: {
    padding: 9, // Padding = (margin kartu * 2) - margin luar
  },
});

export default MarketPlaceScreen;
