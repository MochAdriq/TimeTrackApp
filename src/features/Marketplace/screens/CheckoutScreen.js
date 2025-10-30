// src/features/Marketplace/screens/CheckoutScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform, // <<< Import Platform
} from 'react-native';

// --- Impor Aset ---
// import SettingsIcon from '../../../assets/icon/SettingsIcon.svg';
const placeholderImage = require('../../../../src/assets/images/dummyImage.png');

// --- Komponen kecil InfoCardRow (Tetap sama) ---
const InfoCardRow = ({ title, value, valueStyle, onPress }) => (
  <TouchableOpacity
    style={[styles.card, styles.row, !onPress && styles.disabledCard]}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.rowEndContainer}>
      <Text style={[styles.valueText, valueStyle]}>{value}</Text>
      {onPress && <Text style={styles.arrowText}> {'>'}</Text>}
    </View>
  </TouchableOpacity>
);
// --- Akhir Komponen InfoCardRow ---

// --- Opsi Pembayaran (Contoh) ---
const PAYMENT_OPTIONS = [
  {
    key: 'bca',
    name: 'Transfer Bank BCA',
    account: '1234567890 (a/n Toko Keren)',
  },
  {
    key: 'mandiri',
    name: 'Transfer Bank Mandiri',
    account: '0987654321 (a/n Toko Keren)',
  },
  // Tambahkan opsi lain jika perlu
];

const CheckoutScreen = ({ route, navigation }) => {
  const { product, quantity, variant } = route.params || {};

  const item = product || {
    id: 'dummy',
    title: 'Jaket Bulu Angsa Tebal Musim dingin',
    price: 100000,
    imageUrl: null,
    variants: ['Hitam'],
  };
  const qty = quantity || 1;
  const selectedVariant =
    variant || (item.variants && item.variants[0]) || 'N/A';

  const [message, setMessage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null); // <<< State untuk metode pembayaran terpilih
  const shippingCost = 0;
  const userAddress =
    'National Rte 3 No.116, Sukamanah, Cisaat, Sukabumi City, West Java 43115';

  const totalOrder = (item.price || 0) * qty;
  const totalPayment = totalOrder + shippingCost;
  const imageSource = item.imageUrl ? { uri: item.imageUrl } : placeholderImage;

  // --- Fungsi untuk memilih metode pembayaran (Contoh: pakai Alert) ---
  const handleSelectPayment = () => {
    // Tampilkan pilihan dalam Alert Action Sheet
    const options = PAYMENT_OPTIONS.map(opt => opt.name);
    options.push('Batal'); // Tambah opsi batal

    Alert.alert(
      'Pilih Metode Pembayaran', // Judul Alert
      '', // Pesan (kosongkan saja)
      PAYMENT_OPTIONS.map((opt, index) => ({
        text: opt.name,
        onPress: () => setSelectedPayment(opt), // <<< Set state saat dipilih
      })).concat([{ text: 'Batal', style: 'cancel' }]), // Tambah tombol Batal
      { cancelable: true }, // Bisa ditutup dengan klik di luar
    );

    // Alternatif: Navigasi ke layar baru (PaymentMethodScreen)
    // navigation.navigate('PaymentMethodScreen', { currentSelection: selectedPayment });
    // Anda perlu handle callback dari PaymentMethodScreen untuk update state di sini
  };

  // --- Fungsi Buat Pesanan (Navigasi ke Detail Transfer) ---
  const handlePlaceOrder = () => {
    // Cek apakah metode pembayaran sudah dipilih
    if (!selectedPayment) {
      Alert.alert(
        'Perhatian',
        'Silakan pilih metode pembayaran terlebih dahulu.',
      );
      return;
    }

    // Generate Order ID (contoh sederhana)
    const orderId = `INV-${Date.now()}`;

    // Kumpulkan detail pesanan
    const orderDetails = {
      orderId: orderId, // <<< Tambahkan Order ID
      productId: item.id,
      productName: item.title,
      variant: selectedVariant,
      quantity: qty,
      shipping: shippingCost,
      address: userAddress,
      message: message,
      total: totalPayment,
      paymentMethod: selectedPayment, // <<< Sertakan info pembayaran
    };

    console.log('--- NAVIGASI KE DETAIL TRANSFER ---', orderDetails);

    // --- Navigasi ke halaman baru: TransferDetailsScreen ---
    navigation.navigate('TransferDetails', { orderDetails }); // Kirim semua detail

    // Hapus alert sebelumnya jika tidak diperlukan lagi
    /*
    Alert.alert(
      'Pesanan Dibuat',
      'Lanjutkan ke detail pembayaran.',
      [{ text: 'OK' }]
    );
    */
  };

  const handleEditAddress = () => {
    console.log('Edit Alamat');
    // navigation.navigate('AddressScreen');
  };

  const handleSelectShipping = () => {
    console.log('Pilih Opsi Pengiriman');
    // navigation.navigate('ShippingScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity
          onPress={() => console.log('Settings')}
          style={styles.headerButton}
        >
          {/* <SettingsIcon width={24} height={24} fill="#FFF" /> */}
          <Text style={{ color: '#FFF', fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Produk */}
        <View style={[styles.card, styles.productCard]}>
          <Image source={imageSource} style={styles.thumbnail} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {selectedVariant !== 'N/A' && (
              <Text style={styles.productVariant}>
                Variasi: {selectedVariant}
              </Text>
            )}
            <Text style={styles.productPrice}>
              Rp{item.price.toLocaleString('id-ID')}
            </Text>
            {qty > 1 && (
              <Text style={styles.productQuantity}>Jumlah: {qty}</Text>
            )}
          </View>
        </View>

        {/* Kartu Opsi Pengiriman */}
        <TouchableOpacity style={styles.card} onPress={handleSelectShipping}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>Opsi Pengiriman</Text>
            <View style={styles.rowEndContainer}>
              <Text style={styles.shippingPrice}>
                Rp{shippingCost.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.arrowText}> {'>'}</Text>
            </View>
          </View>
          <View style={styles.shippingDetailsContainer}>
            <Text style={styles.textRegular}>Reguler</Text>
            <Text style={styles.textSmall}>Jasa Kirim Toko</Text>
          </View>
        </TouchableOpacity>

        {/* Kartu Alamat */}
        <InfoCardRow
          title="Alamat"
          value={userAddress}
          valueStyle={styles.addressText}
          onPress={handleEditAddress}
        />

        {/* Kartu Pesan */}
        <View style={[styles.card, styles.row]}>
          <Text style={styles.cardTitle}>Pesan</Text>
          <TextInput
            placeholder="Tinggalkan pesan......"
            style={styles.messageInput}
            placeholderTextColor="#AAA"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Kartu Total Pesanan */}
        <InfoCardRow
          title={`Total Pesanan (${qty} Produk):`}
          value={`Rp.${totalOrder.toLocaleString('id-ID')}`}
          valueStyle={styles.totalOrderPrice}
          // Tidak ada onPress untuk total pesanan
        />

        {/* Kartu Metode Pembayaran (Tampilkan nama bank jika sudah dipilih) */}
        <InfoCardRow
          title="Metode Pembayaran"
          // Tampilkan nama metode pembayaran jika sudah dipilih, atau 'Pilih'
          value={selectedPayment ? selectedPayment.name : 'Pilih'}
          // Ubah style teks jika sudah dipilih
          valueStyle={
            selectedPayment
              ? styles.paymentMethodSelectedText
              : styles.paymentMethodText
          }
          onPress={handleSelectPayment} // <<< Tetap panggil fungsi
        />
      </ScrollView>

      {/* Footer Pembayaran */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerLabel}>Total Pembayaran</Text>
          <Text style={styles.footerPrice}>
            Rp.{totalPayment.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={styles.orderButtonText}>Buat Pesanan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (Tambahkan style untuk teks metode pembayaran terpilih) ---
const styles = StyleSheet.create({
  // ... (style header, scrollView, card, productCard, row, dll tetap sama) ...
  safeArea: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#6A453C',
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingTop: 20,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledCard: {},
  rowEndContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#EEE',
    marginRight: 15,
  },
  productInfo: { flex: 1 },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productVariant: { fontSize: 13, color: '#888', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  productQuantity: { fontSize: 13, color: '#888', marginTop: 4 },

  shippingPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  shippingDetailsContainer: {
    marginTop: 8,
    paddingLeft: 5,
  },

  cardTitle: { fontSize: 15, fontWeight: '500', color: '#333' },
  textRegular: { fontSize: 14, color: '#555' },
  textSmall: { fontSize: 12, color: '#999', marginTop: 3 },
  valueText: {
    // Style umum untuk value di kanan InfoCardRow
    fontSize: 14,
    fontWeight: '500', // Default medium
  },
  addressText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  messageInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    paddingVertical: 0,
  },
  totalOrderPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  paymentMethodText: {
    // Saat belum dipilih ('Pilih')
    fontSize: 14,
    fontWeight: '500',
    color: '#999', // Abu-abu
  },
  paymentMethodSelectedText: {
    // <<< Style BARU: Saat sudah dipilih
    fontSize: 14,
    fontWeight: '500',
    color: '#333', // Warna teks normal
  },
  arrowText: { fontSize: 18, color: '#AAA', fontWeight: 'bold', marginLeft: 5 },

  // Footer (Tetap sama)
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 15,
  },
  footerLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  orderButton: {
    backgroundColor: '#E3D5B8',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  orderButtonText: {
    color: '#6A453C',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
