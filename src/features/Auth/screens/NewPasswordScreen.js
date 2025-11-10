// src/features/Auth/screens/NewPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import EyeOpenIcon from '../../../assets/icon/EyeOpenIcon.svg';
import EyeClosedIcon from '../../../assets/icon/EyeClosedIcon.svg';

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
    onClose: () => {},
  });

  const hideModal = () => {
    if (modalState.onClose) {
      modalState.onClose();
    }
    setModalState({
      isVisible: false,
      title: '',
      message: '',
      modalType: 'error',
      onClose: () => {},
    });
  };

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Password harus minimal 6 karakter.',
        modalType: 'error',
      });
      return;
    }
    if (password !== confirmPassword) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Password tidak cocok.',
        modalType: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // Fungsi ini hanya berhasil jika user berada dalam session PASSWORD_RECOVERY
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // Sukses! Tampilkan modal, lalu logout paksa
      setModalState({
        isVisible: true,
        title: 'Sukses!',
        message:
          'Password Anda telah berhasil diperbarui. Silakan login kembali dengan password baru Anda.',
        modalType: 'success',
        onClose: async () => {
          await supabase.auth.signOut();
          // App.tsx akan mendeteksi SIGNED_OUT dan mengarahkan ke AuthNavigator
        },
      });
    } catch (error) {
      setLoading(false);
      setModalState({
        isVisible: true,
        title: 'Gagal Update',
        message: `Terjadi kesalahan: ${error.message}`,
        modalType: 'error',
      });
    }
    // Jangan set loading false di sini jika sukses, biarkan modal yg handle
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2F2F" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.topSection} />
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Buat Password Baru</Text>
          <Text style={styles.infoText}>
            Masukkan password baru Anda di bawah ini.
          </Text>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Baru</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password baru"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.iconPlaceholder}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Text style={{ fontSize: 24, color: '#555' }}>
                  {isPasswordVisible ? (
                    <EyeClosedIcon width={24} height={24} />
                  ) : (
                    <EyeOpenIcon width={24} height={24} />
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>
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
                  {isConfirmPasswordVisible ? (
                    <EyeClosedIcon width={24} height={24} />
                  ) : (
                    <EyeOpenIcon width={24} height={24} />
                  )}
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
        </View>
      </ScrollView>

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

// Styles (Daur ulang dari RegisterScreen)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#4A2F2F',
    justifyContent: 'center',
  },
  topSection: {
    height: 100,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 15,
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
    marginTop: 25,
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

export default NewPasswordScreen;
