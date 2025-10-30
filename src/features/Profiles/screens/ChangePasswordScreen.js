// src/features/Profiles/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
// (Kita bisa pakai ikon mata yang sama dari RegisterScreen jika sudah jadi SVG)

const ChangePasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  const handleUpdatePassword = async () => {
    // Validasi
    if (!newPassword || !confirmPassword) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Semua field wajib diisi.',
        modalType: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Password baru tidak cocok.',
        modalType: 'error',
      });
      return;
    }
    if (newPassword.length < 6) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Password baru harus minimal 6 karakter.',
        modalType: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // Panggil fungsi Supabase untuk update password user
      const { error } = await supabase.auth.updateUser({
        password: newPassword, // Kirim password baru
      });

      if (error) throw error;

      // Sukses
      setLoading(false);
      setModalState({
        isVisible: true,
        title: 'Sukses!',
        message: 'Password Anda telah berhasil diperbarui.',
        modalType: 'success',
        onClose: () => navigation.goBack(), // Kembali ke ProfileScreen setelah ditutup
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setLoading(false);
      console.error('Error updating password:', error.message);
      setModalState({
        isVisible: true,
        title: 'Gagal Update',
        message: error.message,
        modalType: 'error',
      });
    }
  };

  const hideModal = () => {
    // Jalankan onClose jika ada (untuk navigasi kembali)
    if (modalState.onClose) {
      modalState.onClose();
    }
    setModalState(prev => ({ ...prev, isVisible: false, onClose: undefined }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ganti Password</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.infoText}>
          Masukkan password baru Anda. Anda akan logout dari semua perangkat
          lain.
        </Text>

        {/* Password Baru */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password baru"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isNewPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.iconPlaceholder}
              onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            >
              <Text style={{ fontSize: 24, color: '#555' }}>
                {isNewPasswordVisible ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Konfirmasi Password Baru */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Konfirmasi Password Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan lagi password baru"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.iconPlaceholder}
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Text style={{ fontSize: 24, color: '#555' }}>
                {isConfirmPasswordVisible ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>Simpan Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Notifikasi */}
      <InfoModal
        isVisible={modalState.isVisible}
        title={modalState.title}
        message={modalState.message}
        modalType={modalState.modalType}
        onClose={hideModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Header coklat
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F4F4F4', // Background abu muda
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },
  iconPlaceholder: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#7D5A5A',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    minHeight: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
