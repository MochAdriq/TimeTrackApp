import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
  Switch, // <<< 1. Import Switch
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import { useProfile } from '../../../context/ProfileContext'; // <<< 2. Import useProfile

const placeholderImage = require('../../../../src/assets/images/dummyImage.png');

// --- (FungSI BARU) Helper untuk format Rupiah ---
const formatCurrency = value => `Rp ${value.toLocaleString('id-ID')}`;

// --- (KOMPONEN DIREVISI) InfoCardRow ---
// (Dihapus 'onPress' dari Alamat, karena kita pakai TextInput)
const InfoCardRow = ({ title, value, valueStyle }) => (
  <View style={[styles.card, styles.row]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.rowEndContainer}>
      <Text style={[styles.valueText, valueStyle]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  </View>
);

// --- HAPUS: PAYMENT_OPTIONS (Kita ambil dari DB) ---
// (Kita akan ambil 1 pembayaran default dari TransferDetailsScreen.js)
const DEFAULT_PAYMENT = {
  name: 'Transfer Bank (Admin)',
  account: 'Akan diinfokan di halaman selanjutnya',
};

const CheckoutScreen = ({ route, navigation }) => {
  // --- 4. Ambil data 'cartItems' (BUKAN 'product') ---
  const { cartItems } = route.params || {};

  // --- 5. State baru ---
  // Ambil profil dari Context
  const { profile, loading: loadingProfile, fetchProfile } = useProfile();

  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState('');

  // (PERBAIKAN) Set alamat & pembayaran
  const [shippingAddress, setShippingAddress] = useState(
    profile?.address || '',
  ); // State untuk alamat
  const [selectedPayment, setSelectedPayment] = useState(DEFAULT_PAYMENT);

  // (STATE BARU) Untuk Diskon Poin
  const [usePoints, setUsePoints] = useState(false);

  // --- Modal Error State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- HAPUS: shippingCost & userAddress (Hardcoded) ---

  // --- 6. Fungsi Fetch Profile (MODIFIKASI: Ambil 'points') ---
  useEffect(() => {
    // Kita panggil fetchProfile dari context
    // Pastikan ProfileContext.js mengambil 'points'
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  // --- 7. Fungsi showError (Tetap sama) ---
  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- HAPUS: handleSelectPayment, handleEditAddress, handleSelectShipping ---

  // --- 8. Hitung Total (LOGIKA BARU) ---
  const { totalOrder, totalQuantity } = useMemo(() => {
    if (!cartItems) return { totalOrder: 0, totalQuantity: 0 };
    let total = 0;
    let qty = 0;
    cartItems.forEach(item => {
      total += (item.price || 0) * (item.quantity || 1);
      qty += item.quantity || 1;
    });
    return { totalOrder: total, totalQuantity: qty };
  }, [cartItems]);

  const userPoints = profile?.points || 0;
  const pointsConversionRate = 1; // ASUMSI: 1 Poin = Rp 1
  const maxDiscount = Math.min(userPoints / pointsConversionRate, totalOrder);

  const discountAmount = usePoints ? maxDiscount : 0;
  const pointsUsed = usePoints ? maxDiscount * pointsConversionRate : 0;
  const totalPayment = totalOrder - discountAmount; // Hapus shippingCost
  // --- (BATAS LOGIKA BARU) ---

  // --- 9. Fungsi Buat Pesanan (LOGIKA UTAMA DIMODIFIKASI) ---
  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      showError('Perhatian', 'Metode pembayaran tidak valid.');
      return;
    }

    // (PERBAIKAN) Validasi Alamat
    if (!shippingAddress || shippingAddress.trim().length < 10) {
      showError(
        'Perhatian',
        'Silakan isi alamat pengiriman yang lengkap (minimal 10 karakter).',
      );
      return;
    }

    if (!profile || !cartItems || cartItems.length === 0) {
      showError('Error', 'Data user atau produk tidak lengkap.');
      return;
    }

    setPlacingOrder(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Kumpulkan data untuk tabel 'orders'
      const orderToInsert = {
        user_id: user.id,
        total_amount: totalPayment,
        status: 'pending_payment',
        shipping_address: shippingAddress.trim(), // <-- Alamat dari state
        shipping_cost: 0, // <-- Dihapus
        admin_fee: 0,
        payment_method_name: selectedPayment.name,
        payment_account_info: selectedPayment.account,
        user_message: message,
        points_used: pointsUsed, // <-- (FITUR BARU) Simpan poin
      };

      // 3. Insert ke tabel 'orders'
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select('id, total_amount')
        .single();

      if (orderError) throw orderError;

      // 4. Kumpulkan data untuk tabel 'order_items' (Looping)
      const itemsToInsert = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price_per_item: item.price,
        variant_info: { selected: item.selectedVariant || null },
      }));

      // 5. Insert ke tabel 'order_items'
      const { error: itemError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemError) throw itemError;

      // 6. SUKSES! Siapkan data untuk layar berikutnya
      // (PERBAIKAN: Kirim 'orderId' saja, sesuai logika baru kita)
      navigation.replace('TransferDetails', {
        orderId: newOrder.id,
      });
    } catch (error) {
      showError('Gagal Membuat Pesanan', error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // --- 10. Validasi Data Awal ---
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
  if (!cartItems || cartItems.length === 0) {
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
          message="Keranjang Anda kosong."
        />
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu Penerima (Data dari Profil) */}
        <InfoCardRow
          title="Penerima"
          value={`${profile?.full_name || '...'} (${
            profile?.mobile_no || '...'
          })`}
          valueStyle={styles.addressText}
        />

        {/* (INI PERBAIKAN) Kartu Alamat (Jadi TextInput) */}
        <View style={[styles.card, styles.addressCard]}>
          <Text style={styles.cardTitle}>Alamat Pengiriman</Text>
          <TextInput
            placeholder="Masukkan alamat lengkap (Jalan, No. Rumah, Kecamatan, Kota/Kab, Kode Pos)"
            style={styles.addressInput}
            placeholderTextColor="#AAA"
            value={shippingAddress}
            onChangeText={setShippingAddress}
            multiline
          />
        </View>
        {/* (BATAS PERBAIKAN) */}

        {/* (INI PERBAIKAN) Kartu Produk (Looping) */}
        {cartItems.map((item, index) => {
          const imageSource = item.image_url
            ? { uri: item.image_url }
            : placeholderImage;
          return (
            <View key={index} style={[styles.card, styles.productCard]}>
              <Image source={imageSource} style={styles.thumbnail} />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.selectedVariant && (
                  <Text style={styles.productVariant}>
                    Variasi: {item.selectedVariant}
                  </Text>
                )}
                <Text style={styles.productPrice}>
                  {formatCurrency(item.price)}
                </Text>
                {item.quantity > 1 && (
                  <Text style={styles.productQuantity}>
                    Jumlah: {item.quantity}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        {/* (BATAS PERBAIKAN) */}

        {/* --- HAPUS: Kartu Opsi Pengiriman --- */}

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

        {/* (INI FITUR BARU) Kartu Diskon Poin */}
        <View style={[styles.card, styles.row]}>
          <View>
            <Text style={styles.cardTitle}>Gunakan Poin</Text>
            <Text style={styles.pointsAvailable}>
              Boss punya {userPoints.toLocaleString('id-ID')} Poin
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#C8A870' }}
            thumbColor={usePoints ? '#6A453C' : '#f4f3f4'}
            onValueChange={setUsePoints}
            value={usePoints}
            disabled={userPoints === 0}
          />
        </View>
        {/* (BATAS FITUR BARU) */}

        {/* Ringkasan Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              Total Pesanan ({totalQuantity} Produk)
            </Text>
            <Text style={styles.itemValue}>{formatCurrency(totalOrder)}</Text>
          </View>
          {/* (PERBAIKAN) Hapus 'shippingCost' */}
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Diskon Poin</Text>
            <Text style={[styles.itemValue, styles.discountText]}>
              - {formatCurrency(discountAmount)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalPayment)}
            </Text>
          </View>
        </View>

        {/* Kartu Metode Pembayaran (Sederhana) */}
        <InfoCardRow
          title="Metode Pembayaran"
          value={selectedPayment.name}
          valueStyle={styles.paymentMethodSelectedText}
        />
      </ScrollView>

      {/* Footer Pembayaran */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerLabel}>Total Pembayaran</Text>
          <Text style={styles.footerPrice}>{formatCurrency(totalPayment)}</Text>
        </View>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#6A453C" />
          ) : (
            <Text style={styles.orderButtonText}>Buat Pesanan</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Error */}
      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </SafeAreaView>
  );
};

// --- (INI STYLE BARU) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  headerButton: {
    padding: 5,
    minWidth: 40,
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
  rowEndContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  cardTitle: { fontSize: 15, fontWeight: '500', color: '#333' },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  addressText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  // (STYLE BARU) Alamat
  addressCard: {
    paddingVertical: 12, // Padding lebih kecil
  },
  addressInput: {
    fontSize: 14,
    color: '#333',
    paddingTop: 10,
    paddingBottom: 0,
    textAlignVertical: 'top',
    minHeight: 60, // Tinggi minimal
  },
  // (STYLE BARU) Poin
  pointsAvailable: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  // (STYLE BARU) Ringkasan
  itemLabel: {
    fontSize: 15,
    color: '#555',
  },
  itemValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#2E7D32', // Hijau
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#6A453C',
    fontWeight: 'bold',
  },
  // (BATAS STYLE BARU)
  messageInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    paddingVertical: 0,
  },
  paymentMethodSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
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
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    color: '#6A453C',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
