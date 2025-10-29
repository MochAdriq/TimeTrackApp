// src/features/Marketplace/screens/CheckoutScreen.js
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
  TextInput, // Untuk "Pesan"
  Alert, // Untuk notifikasi
} from 'react-native';

// --- Impor Aset (Ganti path) ---
// const settingsIcon = require('../../../assets/icons/SettingsIcon.svg');
const placeholderImage = require('../../../../src/assets/images/dummyImage.png'); // Sediakan placeholder

// --- Komponen kecil untuk baris info (agar rapi) ---
const InfoCardRow = ({ title, value, valueColor, onPress }) => (
  <TouchableOpacity
    style={[styles.card, styles.row]}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.row}>
      <Text style={[styles.valueText, { color: valueColor || '#333' }]}>
        {value}
      </Text>
      {onPress && <Text style={styles.paymentArrow}> {'>'}</Text>}
    </View>
  </TouchableOpacity>
);

const CheckoutScreen = ({ route, navigation }) => {
  // --- 1. Ambil Data Beneran dari route.params ---
  // (Data ini dikirim dari CheckoutModal saat 'Beli Sekarang' ditekan)
  const { product, quantity, variant } = route.params || {};

  // --- Fallback (jika data gagal terkirim) ---
  const item = product || {
    title: 'Barang Gagal Dimuat',
    price: 0,
    imageUrl: null,
    variant: 'N/A',
  };
  const qty = quantity || 1;
  const selectedVariant = variant || item.variant;

  // --- 2. State untuk Input "Pesan" ---
  const [message, setMessage] = useState('');

  // --- Data Dummy (Hanya untuk yang belum ada) ---
  const shippingCost = 0; // TODO: Nanti ambil dari API/pilihan user
  const userAddress = 'National Rte 3 No.116, Sukamanah, Cisaat...'; // TODO: Nanti ambil dari profil

  // --- 3. Perhitungan Total (Berdasarkan data beneran) ---
  const totalOrder = (item.price || 0) * qty;
  const totalPayment = totalOrder + shippingCost;
  const imageSource = item.imageUrl ? { uri: item.imageUrl } : placeholderImage;

  // --- 4. Fungsi Beneran (Kumpulkan data) ---
  const handlePlaceOrder = () => {
    // Kumpulkan semua data pesanan
    const orderDetails = {
      productId: item.id,
      productName: item.title,
      variant: selectedVariant,
      quantity: qty,
      shipping: shippingCost,
      address: userAddress,
      message: message, // Ambil 'Pesan' dari state
      total: totalPayment,
    };

    console.log('--- MEMBUAT PESANAN ---', orderDetails);

    // --- TODO: Kirim 'orderDetails' ke Supabase (Tabel 'orders') ---

    Alert.alert(
      'Pesanan Dibuat (Dummy)',
      'Terima kasih! Pesanan Anda sedang diproses.',
      [
        // Arahkan kembali ke Home setelah OK
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainApp', { screen: 'Jelajah' }),
        },
      ],
    );
  };

  const handleSelectPayment = () => {
    console.log('Pilih Metode Pembayaran');
    // TODO: navigation.navigate('PaymentMethodScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom (Coklat) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
          {/* Ganti dengan Ikon Panah SVG/Image */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity
          onPress={() => console.log('Settings')}
          style={styles.headerButton}
        >
          {/* Ganti View dengan ikon Settings */}
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Kartu Produk (Data Beneran) --- */}
        <View style={styles.card}>
          <Image source={imageSource} style={styles.thumbnail} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productVariant}>
              Variasi: {selectedVariant}
            </Text>
            <Text style={styles.productPrice}>
              Rp{item.price.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Kartu Opsi Pengiriman */}
        <InfoCardRow
          title="Opsi Pengiriman"
          value={`Rp${shippingCost.toLocaleString('id-ID')}`}
          // onPress={...} // Bisa tambahkan onPress untuk ganti kurir
        />
        {/* Detail Pengiriman (di bawah kartu, opsional) */}
        <View style={styles.detailTextContainer}>
          <Text style={styles.textRegular}>Reguler</Text>
          <Text style={styles.textSmall}>Jasa Kirim Toko</Text>
        </View>

        {/* Kartu Alamat */}
        <InfoCardRow
          title="Alamat"
          value={userAddress}
          // onPress={...} // Bisa tambahkan onPress untuk ganti alamat
        />

        {/* Kartu Pesan (Sekarang Fungsional) */}
        <View style={[styles.card, styles.row]}>
          <Text style={styles.cardTitle}>Pesan</Text>
          <TextInput
            placeholder="Tinggalkan pesan......"
            style={styles.messageInput}
            placeholderTextColor="#AAA"
            value={message} // <<< Dihubungkan ke state
            onChangeText={setMessage} // <<< Update state
          />
        </View>

        {/* Kartu Total Pesanan (Data Beneran) */}
        <InfoCardRow
          title={`Total Pesanan (${qty} Produk):`}
          value={`Rp${totalOrder.toLocaleString('id-ID')}`}
          valueColor="#D32F2F" // Warna oranye/merah
        />

        {/* Kartu Metode Pembayaran */}
        <InfoCardRow
          title="Metode Pembayaran"
          value="Pilih"
          valueColor="#AAA"
          onPress={handleSelectPayment} // <<< Fungsional
        />
      </ScrollView>

      {/* --- Footer Pembayaran (Fixed) --- */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerLabel}>Total Pembayaran</Text>
          <Text style={styles.footerPrice}>
            Rp{totalPayment.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={styles.orderButtonText}>Buat Pesanan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' }, // BG abu-abu
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
    // Shadow di header (opsional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  iconPlaceholder: {
    /* Style ikon setting */
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 15,
    paddingBottom: 100, // Padding bawah agar tidak tertutup footer
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 12, // Jarak antar kartu
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EEE',
    marginRight: 15,
  },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '500', color: '#333' },
  productVariant: { fontSize: 13, color: '#888', marginVertical: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardTitle: { fontSize: 15, fontWeight: '500', color: '#333' }, // Dibuat 500 (medium)
  textRegular: { fontSize: 14, color: '#444' },
  textSmall: { fontSize: 12, color: '#888', marginTop: 2 },
  textBold: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  valueText: {
    // Style umum untuk nilai di kanan
    fontSize: 14,
    fontWeight: '500',
  },
  detailTextContainer: {
    // Container untuk detail (Jasa Kirim Toko)
    paddingHorizontal: 15,
    marginTop: -8, // Tarik ke atas agar nempel card
    marginBottom: 12,
  },
  messageInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  paymentText: { fontSize: 14, color: '#AAA', marginRight: 5 },
  paymentArrow: { fontSize: 16, color: '#AAA', fontWeight: 'bold' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    paddingBottom: 25, // Padding bawah lebih banyak untuk gesture nav
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 10,
  },
  footerTextContainer: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: '#777',
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  orderButton: {
    backgroundColor: '#C8A870',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
