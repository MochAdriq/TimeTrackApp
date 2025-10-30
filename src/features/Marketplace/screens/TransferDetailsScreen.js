// src/features/Marketplace/screens/TransferDetailsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert, // Tetap gunakan Alert untuk feedback konfirmasi
  Platform,
} from 'react-native';
// HAPUS: import Clipboard from '@react-native-clipboard/clipboard';

// Impor gambar placeholder jika diperlukan
const placeholderImage = require('../../../../src/assets/images/dummyImage.png');

const TransferDetailsScreen = ({ route, navigation }) => {
  const { orderDetails } = route.params || {};

  const order = orderDetails || {
    orderId: 'N/A',
    productName: 'Produk Tidak Ditemukan',
    variant: 'N/A',
    quantity: 1,
    price: 0,
    total: 0,
    paymentMethod: { name: 'Bank Tidak Diketahui', account: 'N/A' },
    imageUrl: null,
  };

  const paymentMethodName = order.paymentMethod?.name || 'Bank Tidak Diketahui';
  const paymentAccount = order.paymentMethod?.account || 'N/A';
  const totalAmount = order.total || 0;
  const adminFee = 2000;
  const productPriceTotal = (order.price || 0) * (order.quantity || 1);
  const imageSource = order.imageUrl
    ? { uri: order.imageUrl }
    : placeholderImage;
  const paymentDeadline = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleBackToHome = () => {
    navigation.navigate('MainApp', { screen: 'Jelajah' });
  };

  // HAPUS: Fungsi copyToClipboard

  const handleConfirmPayment = () => {
    Alert.alert(
      'Konfirmasi',
      'Terima kasih telah melakukan konfirmasi. Pesanan akan segera diproses setelah pembayaran diverifikasi.',
    );
    handleBackToHome();
  };

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Jumlah & Metode Pembayaran --- */}
        <View style={[styles.card, styles.paymentSummaryCard]}>
          <Text style={styles.paymentAmountLabel}>
            Jumlah yang harus dibayar
          </Text>
          {/* HAPUS: TouchableOpacity di sini */}
          <Text style={styles.paymentAmountValue}>
            Rp {totalAmount.toLocaleString('id-ID')}
          </Text>
          {/* <Text style={styles.balanceInfo}>Saldo R-Pay saat ini : Rp 1.000.000</Text> */}
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.bankIcon}>🏦</Text>
            <Text style={styles.paymentMethodName}>{paymentMethodName}</Text>
          </View>
        </View>

        {/* --- Instruksi & Batas Waktu --- */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionHeader}>
            Segera bayar sebelum {paymentDeadline}
          </Text>
          <Text style={styles.instructionBody}>
            Mohon selesaikan pembayaran dengan mentransfer ke rekening tujuan di
            bawah ini. Abaikan pesan ini jika Anda sudah melakukan pembayaran.
            Pesanan akan otomatis dibatalkan jika melewati batas waktu.
          </Text>
          <Text style={styles.instructionBody}>
            Setelah transfer berhasil, mohon tunggu proses verifikasi oleh tim
            kami. Anda dapat menekan tombol "Konfirmasi" di bawah (opsional).
          </Text>
        </View>

        {/* --- Detail Rekening Tujuan --- */}
        <View style={[styles.card, styles.accountCard]}>
          <Text style={styles.accountLabel}>Rekening Tujuan:</Text>
          <View style={styles.accountRow}>
            {/* HAPUS: TouchableOpacity di sini */}
            <Text style={styles.accountValue}>{paymentAccount}</Text>
            {/* HAPUS: Tombol Salin */}
          </View>
          {/* Tambahkan info Nama Pemilik Rekening jika ada */}
          {/* <Text style={styles.accountOwnerName}>(a/n Nama Toko Keren)</Text> */}
        </View>

        {/* --- Ringkasan Produk --- */}
        <View style={[styles.card, styles.productSummaryCard]}>
          <Image source={imageSource} style={styles.productThumbnail} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {order.productName}
            </Text>
            {order.variant !== 'N/A' && (
              <Text style={styles.productVariant}>
                Variasi: {order.variant}
              </Text>
            )}
            <Text style={styles.productPriceSmall}>
              Rp{order.price?.toLocaleString('id-ID')}
            </Text>
          </View>
          <Text style={styles.productQuantity}>x{order.quantity}</Text>
        </View>

        {/* --- Rincian Pembayaran --- */}
        <View style={[styles.card, styles.paymentDetailsCard]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Harga</Text>
            <Text style={styles.detailValue}>
              Rp{productPriceTotal.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Biaya Admin</Text>
            <Text style={styles.detailValue}>
              Rp{adminFee.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.detailLabel, styles.totalLabel]}>
              Total Pembayaran
            </Text>
            <Text style={[styles.detailValue, styles.totalValue]}>
              Rp.{totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Tombol Konfirmasi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButtonFooter}
          onPress={handleConfirmPayment}
        >
          <Text style={styles.confirmButtonText}>Konfirmasi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (Sesuaikan jika perlu) ---
const styles = StyleSheet.create({
  // ... (Sebagian besar style tetap sama) ...
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
    // Shadow (jika mau)
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
    alignItems: 'center',
    shadowColor: '#000', // Shadow agar lebih menonjol
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  accountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8, // Tambah jarak bawah
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    // HAPUS: marginRight
  },
  // HAPUS: Style copyButton
  // accountOwnerName: { // Style untuk nama pemilik rekening (jika ditambahkan)
  //    fontSize: 13,
  //    color: '#888',
  //    marginTop: 4,
  // },

  productSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // Footer
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
  },
  confirmButtonText: {
    color: '#6A453C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransferDetailsScreen;
