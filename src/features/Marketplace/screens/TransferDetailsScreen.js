import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import InfoModal from '../../../components/common/InfoModal';

const placeholderImage = require('../../../../src/assets/images/dummyImage.png');

// --- Helper untuk format Rupiah ---
const formatCurrency = value => `Rp ${value.toLocaleString('id-ID')}`;

const TransferDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};

  // --- (PERBAIKAN 1) Pisahkan state loading ---
  const [loading, setLoading] = useState(true); // Loading data halaman
  const [isConfirming, setIsConfirming] = useState(false); // Loading tombol
  // ---
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Helper untuk navigasi kembali
  const handleBackToHome = () => {
    navigation.navigate('MainApp', { screen: 'Jelajah' });
  };

  // --- (PERBAIKAN 2) Logika Opsi B: Tutup Modal & Navigasi ---
  const closeModalAndNavigate = () => {
    setModalVisible(false);
    // Hanya navigasi jika modal yang ditutup adalah modal sukses
    if (modalTitle === 'Konfirmasi Terkirim') {
      handleBackToHome();
    }
  };
  // ---

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- (PERBAIKAN 3) Fungsi Fetch Data (Query Diperbaiki) ---
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      showError('Error', 'ID Pesanan tidak ditemukan.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          total_amount,
          user_message,
          shipping_address,
          points_used,
          created_at,
          status, 
          payment_methods ( bank_name, account_number, account_name ),
          order_items (
            quantity,
            price_per_item,
            variant_info,
            products ( name, price, image_url )
          )
        `,
        )
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Data pesanan tidak ada.');

      setOrder(data);
    } catch (error) {
      showError('Gagal Memuat Pesanan', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);
  // --- (BATAS PERBAIKAN 3) ---

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrderDetails();
    }, [fetchOrderDetails]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  // --- (PERBAIKAN 4) Fungsi Konfirmasi Pembayaran (Logika Opsi B) ---
  const handleConfirmPayment = async () => {
    setIsConfirming(true); // Gunakan state baru
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pending_verification' })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Tampilkan modal sukses (Tanpa navigasi otomatis)
      setModalTitle('Konfirmasi Terkirim');
      setModalMessage(
        'Terima kasih. Pesanan akan segera diproses setelah pembayaran diverifikasi oleh Admin.',
      );
      setModalVisible(true);

      // Refresh data lokal agar status tombol update
      fetchOrderDetails();
    } catch (error) {
      setModalTitle('Konfirmasi Gagal');
      setModalMessage(error.message);
      setModalVisible(true);
    } finally {
      setIsConfirming(false); // Gunakan state baru
    }
  };
  // --- (BATAS PERBAIKAN 4) ---

  // --- (Render Loading & Error) ---
  if (loading && !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackToHome}
            style={styles.headerButton}
          >
            <Text style={styles.headerBackText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Memuat Detail Pesanan...
          </Text>
        </View>
        <InfoModal
          isVisible={modalVisible}
          onClose={closeModalAndNavigate} // Gunakan fungsi Opsi B
          title={modalTitle}
          message={modalMessage}
        />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackToHome}
            style={styles.headerButton}
          >
            <Text style={styles.headerBackText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <InfoModal
          isVisible={true}
          onClose={handleBackToHome}
          title="Error"
          message="Detail pesanan tidak ditemukan."
        />
      </SafeAreaView>
    );
  }

  // --- (Persiapan Data Tampilan) ---
  const paymentDeadline = new Date(
    new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000,
  ).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const totalItemsPrice = order.order_items.reduce(
    (sum, item) => sum + item.price_per_item * item.quantity,
    0,
  );
  const adminFee = 0;
  const pointsUsed = order.points_used || 0;

  // (PERBAIKAN 5) Ambil data bank dari relasi
  const paymentMethodDetails = order.payment_methods;

  // Cek jika data bank tidak ada (fallback, seharusnya tidak terjadi)
  if (!paymentMethodDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <InfoModal
          isVisible={true}
          onClose={handleBackToHome}
          title="Error Kritis"
          message="Data metode pembayaran untuk order ini tidak ditemukan."
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
          onPress={handleBackToHome}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menunggu Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* --- Jumlah & Metode Pembayaran --- */}
        <View style={[styles.card, styles.paymentSummaryCard]}>
          <Text style={styles.paymentAmountLabel}>
            Jumlah yang harus dibayar
          </Text>
          <Text style={styles.paymentAmountValue}>
            {formatCurrency(order.total_amount)}
          </Text>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.bankIcon}>🏦</Text>
            <Text style={styles.paymentMethodName}>
              {paymentMethodDetails.bank_name}
            </Text>
          </View>
        </View>

        {/* --- Instruksi & Batas Waktu --- */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionHeader}>
            Segera bayar sebelum {paymentDeadline}
          </Text>
          <Text style={styles.instructionBody}>
            Pesanan Anda **#{order.id.substring(0, 8)}** telah dibuat. Mohon
            selesaikan pembayaran dan tekan tombol "Saya Sudah Bayar" untuk
            verifikasi.
          </Text>
        </View>

        {/* --- (PERBAIKAN 6) Detail Rekening Tujuan --- */}
        <View style={[styles.card, styles.accountCard]}>
          <Text style={styles.accountCardTitle}>Rekening Tujuan:</Text>

          <Text style={styles.accountLabel}>Nama Bank</Text>
          <Text style={styles.accountValue}>
            {paymentMethodDetails.bank_name}
          </Text>

          <Text style={styles.accountLabel}>Nomor Rekening</Text>
          <Text style={styles.accountValue}>
            {paymentMethodDetails.account_number}
          </Text>

          <Text style={styles.accountLabel}>Atas Nama</Text>
          <Text style={styles.accountValue}>
            {paymentMethodDetails.account_name}
          </Text>
        </View>
        {/* --- (BATAS PERBAIKAN 6) --- */}

        {/* --- Alamat Pengiriman --- */}
        <View style={[styles.card, styles.addressCard]}>
          <Text style={styles.accountLabel}>Alamat Pengiriman:</Text>
          <Text style={styles.addressTextValue}>{order.shipping_address}</Text>
          <Text style={styles.userMessageText}>
            Pesan: {order.user_message || 'Tidak ada pesan'}
          </Text>
        </View>

        {/* --- Ringkasan Produk --- */}
        <View style={[styles.card, styles.productSummaryCard]}>
          <Text style={styles.cardTitle}>Produk Dipesan</Text>
          {order.order_items.map((item, index) => {
            const product = item.products;
            const itemPrice = item.price_per_item * item.quantity;
            return (
              <View key={index} style={styles.productRow}>
                <Image
                  source={
                    product.image_url
                      ? { uri: product.image_url }
                      : placeholderImage
                  }
                  style={styles.productThumbnail}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {product.name}
                  </Text>
                  {item.variant_info?.selected && (
                    <Text style={styles.productVariant}>
                      Variasi: {item.variant_info.selected}
                    </Text>
                  )}
                  <Text style={styles.productPriceSmall}>
                    {formatCurrency(item.price_per_item)} x{item.quantity}
                  </Text>
                </View>
                <Text style={styles.productQuantity}>
                  {formatCurrency(itemPrice)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* --- Rincian Pembayaran --- */}
        <View style={[styles.card, styles.paymentDetailsCard]}>
          <Text style={styles.cardTitle}>Rincian Pembayaran</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal Harga Barang</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(totalItemsPrice)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Biaya Admin</Text>
            <Text style={styles.detailValue}>{formatCurrency(adminFee)}</Text>
          </View>
          {pointsUsed > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Diskon Poin</Text>
              <Text style={[styles.detailValue, styles.discountUsed]}>
                - {formatCurrency(pointsUsed)}
              </Text>
            </View>
          )}
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.detailLabel, styles.totalLabel]}>
              Total Pembayaran
            </Text>
            <Text style={[styles.detailValue, styles.totalValue]}>
              {formatCurrency(order.total_amount)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- (PERBAIKAN 7) Footer Tombol Konfirmasi --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButtonFooter,
            // Tombol nonaktif jika:
            // 1. Halaman masih loading (loading)
            // 2. Tombol sedang ditekan (isConfirming)
            // 3. Status BUKAN 'pending_payment' (sudah dikonfirmasi / gagal)
            (loading || isConfirming || order.status !== 'pending_payment') &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={
            loading || isConfirming || order.status !== 'pending_payment'
          }
        >
          {isConfirming ? ( // Gunakan state baru
            <ActivityIndicator color="#6A453C" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {/* Ganti teks jika status sudah berubah */}
              {order.status === 'pending_verification'
                ? 'Menunggu Verifikasi'
                : order.status === 'paid'
                ? 'Sudah Dibayar'
                : 'Saya Sudah Bayar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {/* --- (BATAS PERBAIKAN 7) --- */}

      <InfoModal
        isVisible={modalVisible}
        onClose={closeModalAndNavigate} // Gunakan fungsi Opsi B
        title={modalTitle}
        message={modalMessage}
      />
    </SafeAreaView>
  );
};

// --- (STYLE BARU DITAMBAHKAN) ---
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
  headerButton: { padding: 5, minWidth: 40 },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
  },
  paymentSummaryCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  paymentAmountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    width: '100%',
    justifyContent: 'center',
  },
  bankIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  instructionContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  instructionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionBody: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  accountCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // --- (STYLE BARU UNTUK REKENING) ---
  accountCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  accountLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  // ---
  addressCard: {
    alignItems: 'flex-start',
  },
  addressTextValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginTop: 5,
    marginBottom: 10,
  },
  userMessageText: {
    fontSize: 12,
    color: '#888',
  },
  productSummaryCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  productThumbnail: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: '#EEE',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  productVariant: { fontSize: 13, color: '#888', marginBottom: 3 },
  productPriceSmall: { fontSize: 14, fontWeight: '500', color: '#444' },
  productQuantity: { fontSize: 14, color: '#888' },
  paymentDetailsCard: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountUsed: {
    color: '#2E7D32', // Hijau
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#D32F2F',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  confirmButtonFooter: {
    backgroundColor: '#E3D5B8',
    paddingVertical: 14,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  // --- (STYLE BARU) ---
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  // ---
  confirmButtonText: {
    color: '#6A453C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransferDetailsScreen;
