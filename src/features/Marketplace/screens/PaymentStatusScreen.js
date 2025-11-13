import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import InfoModal from '../../../components/common/InfoModal';

// Ikon (Placeholder, ganti dengan SVG jika ada)
const IconCheck = () => <Text style={styles.icon}>✅</Text>;
const IconPending = () => <Text style={styles.icon}>⏳</Text>;
const IconFailed = () => <Text style={styles.icon}>❌</Text>;
const IconWallet = () => <Text style={styles.icon}>💳</Text>; // <-- Ikon baru

// Helper untuk status
const getStatusDetails = status => {
  switch (status) {
    // (INI PERBAIKANNYA) Tambahkan case untuk 'pending_payment'
    case 'pending_payment':
      return {
        icon: <IconWallet />,
        title: 'Menunggu Pembayaran',
        message:
          'Selesaikan pembayaran Anda sebelum batas waktu untuk menghindari pembatalan otomatis.',
        color: '#1E88E5', // Biru
      };
    case 'paid':
      return {
        icon: <IconCheck />,
        title: 'Pembayaran Berhasil',
        message: 'Pesanan Anda telah dikonfirmasi dan akan segera diproses.',
        color: '#2E7D32', // Hijau
      };
    case 'failed':
      return {
        icon: <IconFailed />,
        title: 'Pembayaran Gagal',
        message:
          'Verifikasi pembayaran Anda gagal. Silakan hubungi admin untuk bantuan.',
        color: '#D32F2F', // Merah
      };
    case 'pending_verification':
      return {
        icon: <IconPending />,
        title: 'Pembayaran Diterima',
        message: 'Pembayaran Anda sedang kami verifikasi. Mohon tunggu.',
        color: '#FF8F00', // Oranye
      };
    default:
      return {
        icon: <IconPending />,
        title: 'Status Tidak Dikenal',
        message: `Status pesanan Anda saat ini: ${status}.`,
        color: '#555',
      };
  }
};

const PaymentStatusScreen = ({ route, navigation }) => {
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setModalVisible(true);
      setLoading(false);
      return;
    }

    try {
      // (INI PERBAIKANNYA) Ambil info rekening
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          status,
          total_amount,
          created_at,
          payment_method_name, 
          payment_account_info,
          order_items (
            quantity,
            products ( name, price )
          )
        `,
        )
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order status:', error.message);
      setModalVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

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

  // (INI FUNGSI BARU) Untuk menampilkan info bank
  const renderPaymentInstructions = () => {
    if (order.status !== 'pending_payment') {
      return null; // Hanya tampilkan jika status 'pending_payment'
    }

    return (
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Selesaikan Pembayaran</Text>
        <Text style={styles.paymentLabel}>Metode Pembayaran:</Text>
        <Text style={styles.paymentValue}>{order.payment_method_name}</Text>

        <Text style={styles.paymentLabel}>Nomor Rekening/Virtual Account:</Text>
        <Text style={styles.paymentValue}>{order.payment_account_info}</Text>

        <Text style={styles.paymentLabel}>Total Pembayaran:</Text>
        <Text style={[styles.paymentValue, styles.totalPriceLarge]}>
          Rp {order.total_amount.toLocaleString('id-ID')}
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      );
    }

    if (!order) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Tidak dapat menemukan detail pesanan.
          </Text>
        </View>
      );
    }

    const { icon, title, message, color } = getStatusDetails(order.status);

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.statusContainer, { borderColor: color }]}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            {icon}
          </View>
          <Text style={[styles.statusTitle, { color: color }]}>{title}</Text>
          <Text style={styles.statusMessage}>{message}</Text>
        </View>

        {/* (INI PERBAIKANNYA) Tampilkan info bank jika 'pending_payment' */}
        {renderPaymentInstructions()}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Detail Pesanan</Text>
          <Text style={styles.orderId}>
            ID Pesanan: #{order.id.substring(0, 8)}...
          </Text>
          <View style={styles.separator} />

          {order.order_items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity}x {item.products.name}
              </Text>
              <Text style={styles.itemPrice}>
                Rp {item.products.price.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}

          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalPrice}>
              Rp {order.total_amount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Tutup</Text>
        </TouchableOpacity>
      </ScrollView>
    );
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
        <Text style={styles.headerTitle}>Status Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>
      {renderContent()}
      <InfoModal
        isVisible={modalVisible}
        title="Error"
        message="Terjadi kesalahan saat mengambil data pesanan. Silakan coba lagi."
        type="error"
        onClose={() => {
          setModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

// --- (INI PERBAIKANNYA) Tambahkan style baru ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
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
  scrollContent: {
    padding: 20,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 30,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  // --- (STYLE BARU UNTUK INFO BANK) ---
  paymentCard: {
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
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  totalPriceLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  // --- (BATAS STYLE BARU) ---
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    color: '#6A453C',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6A453C',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentStatusScreen;
