import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import { launchImageLibrary } from 'react-native-image-picker';
import { decode } from 'base64-arraybuffer'; // Gunakan library yang sudah ada
import InfoModal from '../../../components/common/InfoModal';

// --- (PENTING) Ambil info rekening ini dari Admin/Config Boss ---
const BANK_NAME = 'Bank Sejarah Indonesia (BSI)';
const ACCOUNT_NUMBER = '7001234567';
const ACCOUNT_NAME = 'PT. Time Tracker Sejarah';
// ---

// Helper untuk format Rupiah
const formatCurrency = value => `Rp ${value.toLocaleString('id-ID')}`;

const PremiumTransferScreen = ({ route, navigation }) => {
  // Ambil data dari PremiumCheckoutScreen
  const { checkoutData } = route.params;
  const { package: selectedPackage, totalAmount } = checkoutData;

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null); // State untuk URI gambar

  const showError = (title, message) => {
    setModalState({ visible: true, type: 'error', title, message });
  };

  // 1. Fungsi Pilih Gambar (Mirip GroupInfo & Profile)
  const handleSelectImage = async () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true,
    };
    const response = await new Promise(resolve =>
      launchImageLibrary(options, resolve),
    );

    if (response.didCancel) return;
    if (
      !response.assets ||
      response.assets.length === 0 ||
      !response.assets[0].base64
    ) {
      showError('Error', 'Gagal membaca gambar (Base64).');
      return;
    }
    setUploadedImage(response.assets[0]); // Simpan seluruh aset gambar
  };

  // 2. Fungsi Konfirmasi Pembayaran
  const handleConfirmPayment = async () => {
    if (!uploadedImage) {
      showError(
        'Upload Bukti',
        'Silakan upload bukti pembayaran Anda terlebih dahulu.',
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      // A. Upload bukti transfer ke Storage 'premium_proofs'
      const decodedData = decode(uploadedImage.base64); //
      const fileName = `proof_${user.id}_${Date.now()}.png`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('premium_proofs')
        .upload(filePath, decodedData, {
          contentType: uploadedImage.type || 'image/png',
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // B. Simpan data ke tabel 'premium_purchases'
      // (PERBAIKAN: Gunakan status 'pending_verification' seperti di Marketplace)
      // BUKAN 'pending_payment', agar trigger notif tidak jalan 2x
      const purchaseData = {
        user_id: user.id,
        package_id: selectedPackage.id,
        status: 'pending_verification', // Status awal setelah upload
        total_amount: totalAmount,
        payment_method_name: BANK_NAME,
        payment_account_info: ACCOUNT_NUMBER,
        proof_of_payment_url: filePath, // Simpan path filenya
        updated_at: new Date(),
      };

      const { error: insertError } = await supabase
        .from('premium_purchases')
        .insert(purchaseData);

      if (insertError) throw insertError;

      // C. Tampilkan modal sukses
      setModalState({
        visible: true,
        type: 'success',
        title: 'Upload Berhasil',
        message:
          'Bukti pembayaran Anda telah diterima dan akan segera diverifikasi oleh Admin.',
      });
    } catch (error) {
      console.error('Error confirming payment:', error.message);
      showError('Upload Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalState({ ...modalState, visible: false });
    // Jika sukses, kirim pengguna kembali ke layar Premium utama
    if (modalState.type === 'success') {
      navigation.popToTop(); // Kembali ke awal stack (Tab Premium)
    }
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
        <Text style={styles.headerTitle}>Detail Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transfer ke Rekening:</Text>

          <Text style={styles.paymentLabel}>Nama Bank</Text>
          <Text style={styles.paymentValue}>{BANK_NAME}</Text>

          <Text style={styles.paymentLabel}>Nomor Rekening</Text>
          <Text style={styles.paymentValue}>{ACCOUNT_NUMBER}</Text>

          <Text style={styles.paymentLabel}>Atas Nama</Text>
          <Text style={styles.paymentValue}>{ACCOUNT_NAME}</Text>

          <View style={styles.separator} />

          <Text style={styles.paymentLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Bukti Pembayaran</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectImage}
          >
            <Text style={styles.uploadButtonText}>
              {uploadedImage ? 'Ganti Gambar' : 'Pilih Gambar'}
            </Text>
          </TouchableOpacity>

          {uploadedImage && (
            <Image
              source={{ uri: uploadedImage.uri }}
              style={styles.imagePreview}
            />
          )}
        </View>
      </ScrollView>

      {/* Tombol Konfirmasi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (loading || !uploadedImage) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={loading || !uploadedImage}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Saya Sudah Membayar</Text>
          )}
        </TouchableOpacity>
      </View>

      <InfoModal
        isVisible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={closeModal}
      />
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
    marginBottom: 20,
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
    marginBottom: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  totalValue: {
    fontSize: 22,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#E3D5B8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#6A453C',
    fontSize: 15,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
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
  confirmButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumTransferScreen;
