// src/features/Auth/screens/LoginScreen.js

import React, { useState, useRef } from 'react';
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
  Alert,
} from 'react-native';

import TimeTrackNameWhite from '../../../assets/images/TimeTrackNameWhite.svg';
import TimeTrackLogo from '../../../assets/images/TimeTrackLogo.svg';
import GoogleLogo from '../../../assets/images/GoogleLogo.svg';
import InstagramLogo from '../../../assets/images/InstagramLogo.svg';
import MetaverseLogo from '../../../assets/images/MetaverseLogo.svg';

import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

import EyeOpenIcon from '../../../assets/icon/EyeOpenIcon.svg';
import EyeClosedIcon from '../../../assets/icon/EyeClosedIcon.svg';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  const passwordInputRef = useRef(null);

  const handleSupabaseError = error => {
    // ... (Fungsi ini tetap sama)
    if (error.message.includes('Invalid login credentials')) {
      return 'Email atau password yang Anda masukkan salah.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Email Anda belum dikonfirmasi. Silakan cek inbox email Anda.';
    }
    return error.message;
  };

  const hideModal = () => {
    setModalState({
      isVisible: false,
      title: '',
      message: '',
      modalType: 'error',
    });
  };

  const handleLogin = async () => {
    // ... (Fungsi ini tetap sama, tidak diubah)
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setModalState({
        isVisible: true,
        title: 'Error',
        message: 'Email dan Password wajib diisi.',
        modalType: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        throw error; // Lempar ke catch block
      }

      if (data.session) {
        console.log('Login Berhasil, session:', data.session.user.email);
        setLoading(false);
        // Navigasi akan di-handle oleh App.tsx
      } else {
        throw new Error('Login berhasil namun tidak mendapatkan session.');
      }
    } catch (error) {
      setLoading(false);
      const friendlyError = handleSupabaseError(error);
      console.error('Error Login:', error.message);
      setModalState({
        isVisible: true,
        title: 'Login Gagal',
        message: friendlyError,
        modalType: 'error',
      });
    }
  };

  // --- 2. FUNGSI LUPA PASSWORD (DIMODIFIKASI) ---
  const handleForgotPassword = async () => {
    if (loading) return; // Mencegah klik ganda saat loading
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setModalState({
        isVisible: true,
        title: 'Email Kosong',
        message:
          'Silakan masukkan email Anda di kolom email terlebih dahulu, lalu tekan "Lupa Password?".',
        modalType: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // --- PERUBAHAN DI SINI ---
      // Tambahkan 'redirectTo' agar Supabase mengirim deep link
      const { error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: 'com.timetrackerapp://callback',
        },
      );
      // --- BATAS PERUBAHAN ---

      if (error) {
        throw error; // Lempar ke catch block
      }

      // Tampilkan pesan sukses
      setModalState({
        isVisible: true,
        title: 'Cek Email Anda',
        message:
          'Link untuk reset password telah dikirim ke email Anda. Silakan cek inbox (dan folder spam).',
        modalType: 'success', // Tampilkan modal sukses
      });
    } catch (error) {
      console.error('Error Forgot Password:', error.message);
      setModalState({
        isVisible: true,
        title: 'Gagal',
        message:
          'Gagal mengirim link reset password. Pastikan email yang Anda masukkan sudah benar dan terdaftar.',
        modalType: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  // --- BATAS FUNGSI BARU ---

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleSocialLogin = provider => {
    // ... (Fungsi ini tetap sama)
    console.log(`Login with ${provider}`);
    setModalState({
      isVisible: true,
      title: 'Fitur Belum Tersedia',
      message: 'Login dengan media sosial sedang dalam pengembangan.',
      modalType: 'error',
    });
  };

  const handlePrivacyPolicy = () => {
    console.log('Open Privacy Policy');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2F2F" />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <TimeTrackLogo width={71.6} height={71.6} />
          <TimeTrackNameWhite width={200} height={40} style={styles.appName} />
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.LockIconStyle}
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

          {/* --- 3. TOMBOL BARU "LUPA PASSWORD?" --- */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
          </TouchableOpacity>
          {/* --- BATAS TOMBOL BARU --- */}

          {/* Tombol Login */}
          <TouchableOpacity
            // --- 4. UBAH STYLE (Tambah margin) ---
            style={[styles.loginButton, { marginTop: 10 }]} // Hapus margin top lama
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Link Create Account */}
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.createAccountText}>Create account</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        {/* <View style={styles.bottomSection}>
          <View style={styles.socialLoginContainer}>
            <TouchableOpacity
              onPress={() => handleSocialLogin('Google')}
              style={styles.socialIconPlaceholder}
            >
              <GoogleLogo />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSocialLogin('Meta')}
              style={styles.socialIconPlaceholder}
            >
              <MetaverseLogo />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSocialLogin('Instagram')}
              style={styles.socialIconPlaceholder}
            >
              <InstagramLogo />
            </TouchableOpacity>
          </View>
        </View> */}
      </ScrollView>

      {/* Modal */}
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

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#6A453C',
  },
  topSection: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    marginTop: 10,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
  },
  LockIconStyle: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
    marginRight: 3,
  },
  // --- 5. STYLE BARU ---
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 15, // Jarak sebelum tombol Login
    marginTop: -10, // Sedikit lebih dekat ke input password
  },
  forgotPasswordText: {
    color: '#4A2F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  // --- BATAS STYLE BARU ---
  loginButton: {
    backgroundColor: '#6A453C',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    // marginTop: 10, // Dihapus dari sini, dipindah inline
    marginBottom: 20,
    elevation: 3,
    minHeight: 52,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: '#4A2F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomSection: {
    paddingBottom: 30,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  socialIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyText: {
    color: '#888',
    fontSize: 12,
  },
});

export default LoginScreen;
