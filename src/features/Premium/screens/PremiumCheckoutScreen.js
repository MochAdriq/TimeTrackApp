import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Helper untuk format Rupiah
const formatCurrency = value => {
  if (!value) return 'Gratis';
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const PremiumCheckoutScreen = ({ route, navigation }) => {
  // 1. Ambil data paket yang dikirim dari PremiumScreen
  const { package: selectedPackage } = route.params;

  if (!selectedPackage) {
    // Fallback jika data paket tidak terkirim
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Data paket tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Siapkan data untuk ditampilkan
  const { title, description, price } = selectedPackage;
  const adminFee = 0; // Biaya admin (jika ada)
  const totalAmount = price + adminFee;

  // 3. Fungsi untuk lanjut ke layar upload bukti
  const handleConfirm = () => {
    // Siapkan data untuk layar berikutnya
    const checkoutData = {
      package: selectedPackage,
      totalAmount: totalAmount,
    };

    // Arahkan ke layar BERIKUTNYA (yang akan kita buat)
    navigation.navigate('PremiumTransfer', { checkoutData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Detail Paket */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Paket</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>{title}</Text>
            <Text style={styles.itemValue}>{formatCurrency(price)}</Text>
          </View>
          {description && (
            <Text style={styles.itemDescription}>{description}</Text>
          )}
        </View>

        {/* Ringkasan Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Harga Paket</Text>
            <Text style={styles.itemValue}>{formatCurrency(price)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Biaya Admin</Text>
            <Text style={styles.itemValue}>{formatCurrency(adminFee)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Konfirmasi */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Konfirmasi & Bayar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollView: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5, width: 40 },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 15,
    color: '#555',
  },
  itemValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: -5,
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
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#6A453C',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumCheckoutScreen;
