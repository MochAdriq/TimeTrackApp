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
  TextInput,
  Alert,
  Platform,
  ActivityIndicator, // <<< 1. Import
} from 'react-native';

import { supabase } from '../../../services/supabaseClient'; // <<< 2. Import
import InfoModal from '../../../components/common/InfoModal'; // <<< 3. Import

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
      <Text style={[styles.valueText, valueStyle]} numberOfLines={3}>
        {value}
      </Text>
      {onPress && <Text style={styles.arrowText}> {'>'}</Text>}
    </View>
  </TouchableOpacity>
);

// --- Opsi Pembayaran (Masih hardcode, tidak apa-apa) ---
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
];

const CheckoutScreen = ({ route, navigation }) => {
  // --- 4. Ambil data WAJIB dari route.params ---
  const { product, quantity, variant } = route.params || {};

  // --- 5. State baru ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  // --- Modal Error State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- Alamat & Pengiriman (Masih Hardcode) ---
  const shippingCost = 0; // TODO: Integrasi API ongkir
  const userAddress =
    'National Rte 3 No.116, Sukamanah, Cisaat, Sukabumi City, West Java 43115'; // TODO: Ambil dari profil

  // --- 6. Fungsi Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          showError('Error', 'User tidak ditemukan.');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, mobile_no')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        showError('Gagal Memuat Profil', error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // --- 7. Fungsi showError ---
  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- Handle Aksi (Pilih Bayar, Alamat, dll) ---
  const handleSelectPayment = () => {
    // Tampilkan pilihan dalam Alert Action Sheet (Logika ini oke)
    Alert.alert(
      'Pilih Metode Pembayaran',
      '',
      PAYMENT_OPTIONS.map(opt => ({
        text: opt.name,
        onPress: () => setSelectedPayment(opt),
      })).concat([{ text: 'Batal', style: 'cancel' }]),
      { cancelable: true },
    );
  };

  const handleEditAddress = () => {
    showError('Fitur Belum Ada', 'Fitur ganti alamat akan segera hadir.');
  };

  const handleSelectShipping = () => {
    showError(
      'Fitur Belum Ada',
      'Fitur ganti opsi pengiriman akan segera hadir.',
    );
  };

  // --- 8. Fungsi Buat Pesanan (LOGIKA UTAMA) ---
  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      showError(
        'Perhatian',
        'Silakan pilih metode pembayaran terlebih dahulu.',
      );
      return;
    }

    if (!profile || !product) {
      showError('Error', 'Data user atau produk tidak lengkap.');
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Dapatkan User ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Kumpulkan data untuk tabel 'orders'
      const totalAmount = (product.price || 0) * quantity + shippingCost;
      const orderToInsert = {
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending_payment',
        shipping_address: userAddress, // TODO: Ganti dengan alamat asli
        shipping_cost: shippingCost,
        admin_fee: 0, // TODO: Tambah logika admin fee
        payment_method_name: selectedPayment.name,
        payment_account_info: selectedPayment.account,
        user_message: message,
      };

      // 3. Insert ke tabel 'orders' dan ambil ID order baru
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select('id, total_amount') // Ambil ID & total
        .single(); // Kita tahu ini hanya 1

      if (orderError) {
        throw orderError;
      }

      // 4. Kumpulkan data untuk tabel 'order_items'
      const itemToInsert = {
        order_id: newOrder.id,
        product_id: product.id,
        quantity: quantity,
        price_per_item: product.price,
        variant_info: { selected: variant }, // Simpan varian sebagai JSON
      };

      // 5. Insert ke tabel 'order_items'
      const { error: itemError } = await supabase
        .from('order_items')
        .insert(itemToInsert);

      if (itemError) {
        // Jika item gagal masuk, idealnya order utama di-rollback/dihapus
        throw itemError;
      }

      // 6. SUKSES! Siapkan data untuk layar berikutnya
      const orderDetails = {
        orderId: newOrder.id,
        productName: product.name,
        variant: variant,
        quantity: quantity,
        shipping: shippingCost,
        address: userAddress,
        message: message,
        total: newOrder.total_amount, // Ambil total pasti dari database
        paymentMethod: selectedPayment,
      };

      // 7. Navigasi ke Detail Transfer
      navigation.replace('TransferDetails', { orderDetails }); // Pakai replace agar tidak bisa kembali
    } catch (error) {
      showError('Gagal Membuat Pesanan', error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // --- 9. Validasi Data Awal ---
  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={styles.headerBackText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      </SafeAreaView>
    );
  }

  // Jika produk tidak ada (error navigasi)
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={styles.headerBackText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <InfoModal
          isVisible={true}
          onClose={() => navigation.goBack()}
          title="Error"
          message="Data produk tidak ditemukan."
        />
      </SafeAreaView>
    );
  }

  // --- 10. Persiapan data render (gunakan nama field yg benar) ---
  const qty = quantity || 1;
  const selectedVariant = variant || 'N/A';
  const totalOrder = (product.price || 0) * qty;
  const totalPayment = totalOrder + shippingCost;
  const imageSource = product.image_url
    ? { uri: product.image_url }
    : placeholderImage;

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
        {/* Kosongkan agar judul di tengah */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Penerima (BARU) */}
        <InfoCardRow
          title="Penerima"
          value={`${profile?.full_name || '...'} (${
            profile?.mobile_no || '...'
          })`}
          valueStyle={styles.addressText}
          onPress={handleEditAddress}
        />

        {/* Kartu Alamat */}
        <InfoCardRow
          title="Alamat"
          value={userAddress}
          valueStyle={styles.addressText}
          onPress={handleEditAddress}
        />

        {/* Kartu Produk */}
        <View style={[styles.card, styles.productCard]}>
          <Image source={imageSource} style={styles.thumbnail} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.name}
            </Text>
            {selectedVariant !== 'N/A' && (
              <Text style={styles.productVariant}>
                Variasi: {selectedVariant}
              </Text>
            )}
            <Text style={styles.productPrice}>
              Rp{product.price.toLocaleString('id-ID')}
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
        />

        {/* Kartu Metode Pembayaran */}
        <InfoCardRow
          title="Metode Pembayaran"
          value={selectedPayment ? selectedPayment.name : 'Pilih'}
          valueStyle={
            selectedPayment
              ? styles.paymentMethodSelectedText
              : styles.paymentMethodText
          }
          onPress={handleSelectPayment}
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
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handlePlaceOrder}
          disabled={placingOrder} // <<< Disable saat loading
        >
          {placingOrder ? (
            <ActivityIndicator color="#6A453C" />
          ) : (
            <Text style={styles.orderButtonText}>Buat Pesanan</Text>
          )}
        </TouchableOpacity>
      </View>

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
  safeArea: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12, // <<< Rapikan padding
    backgroundColor: '#6A453C',
  },
  headerButton: {
    padding: 5,
    minWidth: 40, // Beri lebar minimum agar seimbang
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 15,
    paddingBottom: 100, // Beri ruang untuk footer
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
    flex: 1, // <<< Tambahkan
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // <<< Tambahkan
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
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1, // <<< Tambahkan
    textAlign: 'right', // <<< Tambahkan
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
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  paymentMethodSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  arrowText: { fontSize: 18, color: '#AAA', fontWeight: 'bold', marginLeft: 5 },
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
    minWidth: 140, // <<< Tambahkan lebar minimum
    alignItems: 'center', // <<< Tambahkan
    justifyContent: 'center', // <<< Tambahkan
  },
  orderButtonText: {
    color: '#6A453C',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
