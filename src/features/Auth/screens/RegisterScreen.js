/* eslint-disable react-native/no-inline-styles */
// src/features/Auth/screens/RegisterScreen.js

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
  Alert,
  ActivityIndicator,
  Linking, // <<< 1. IMPORT Linking (untuk buka URL)
} from 'react-native';

import PeopleIcon from '../../../assets/icon/PeopleIcon.svg';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import EyeOpenIcon from '../../../assets/icon/EyeOpenIcon.svg';
import EyeClosedIcon from '../../../assets/icon/EyeClosedIcon.svg';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  // <<< 2. TAMBAHKAN STATE UNTUK CHECKBOX >>>
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
    onClose: () => {},
  });

  const handleSupabaseError = error => {
    // ... (Fungsi ini tetap sama)
    if (error.message.includes('User already registered')) {
      return 'Email ini sudah terdaftar. Silakan login.';
    }
    if (error.message.includes('weak password')) {
      return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    }
    if (
      error.message.includes('rate limit') ||
      error.message.includes('For security purposes')
    ) {
      return 'Anda terlalu sering mencoba. Silakan tunggu 1 menit.';
    }
    if (
      error.message.includes('profiles_username_key') ||
      error.message.includes(
        'violates unique constraint "profiles_username_key"',
      )
    ) {
      return 'Username ini sudah dipakai. Silakan pilih username lain.';
    }
    if (error.message.includes('row-level security policy')) {
      return 'Kesalahan RLS. Pastikan policy INSERT di tabel profiles sudah benar.';
    }
    return error.message;
  };

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

  // --- MODIFIKASI handleRegister ---
  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedPassword = password.trim();

    // <<< 3. TAMBAHKAN VALIDASI CHECKBOX >>>
    if (!agreedToPolicy) {
      setModalState({
        isVisible: true,
        title: 'Persetujuan Diperlukan',
        message: 'Anda harus menyetujui Kebijakan Privasi untuk mendaftar.',
        modalType: 'error',
      });
      return;
    }
    // <<< BATAS TAMBAHAN >>>

    // Validasi
    if (
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedFullName ||
      !trimmedUsername ||
      !trimmedPhoneNumber
    ) {
      setModalState({
        isVisible: true,
        title: 'Error Validasi',
        message: 'Semua field wajib diisi.',
        modalType: 'error',
      });
      return;
    }
    if (trimmedPassword !== confirmPassword.trim()) {
      setModalState({
        isVisible: true,
        title: 'Error Validasi',
        message: 'Password dan Konfirmasi Password tidak cocok!',
        modalType: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        phone: trimmedPhoneNumber,
        options: {
          emailRedirectTo: 'com.timetrackerapp://callback',
          data: {
            full_name: trimmedFullName,
            username: trimmedUsername,
            mobile_no: trimmedPhoneNumber,
            has_accepted_policy: true, // <<< 4. TAMBAHKAN FLAG INI
          },
        },
      });

      if (authError) {
        throw authError;
      }
      if (!authData.user) {
        throw new Error(
          'Gagal membuat akun, user tidak ditemukan setelah daftar.',
        );
      }

      setLoading(false);
      setModalState({
        isVisible: true,
        title: 'Pendaftaran Berhasil!',
        message:
          'Akun Anda telah dibuat. Silakan cek email Anda untuk link konfirmasi.\nSetelah menekan link silahkan login kembali.',
        modalType: 'success',
        onClose: () => navigation.navigate('Login'),
      });
    } catch (error) {
      setLoading(false);
      const friendlyError = handleSupabaseError(error);
      console.error('Error Registrasi:', error.message);
      setModalState({
        isVisible: true,
        title: 'Pendaftaran Gagal',
        message: friendlyError,
        modalType: 'error',
      });
    }
  };
  // --- BATAS MODIFIKASI ---

  const handlePrivacyPolicy = () => {
    // <<< 5. BUAT INI MEMBUKA LINK (GANTI DENGAN URL ASLI BOSS) >>>
    const privacyPolicyUrl = 'https://web-time-track.vercel.app/privacy'; // GANTI INI
    Linking.openURL(privacyPolicyUrl).catch(err =>
      console.error('Gagal membuka URL:', err),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2F2F" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* ... (Top Section, Form Title, Email, Full Name, Username, Phone Number tetap sama) ... */}

        <View style={styles.topSection} />
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Sign Up Form</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              {isEmailFocused && (
                <View style={styles.iconPlaceholder}>
                  <PeopleIcon />
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsEmailFocused(false)}
                onBlur={() => setIsEmailFocused(true)}
              />
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your username (no spaces)"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your Password"
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
                {/* <<< (PERBAIKAN BONUS) Gunakan SVG yang sudah di-import >>> */}
                {isPasswordVisible ? (
                  <EyeOpenIcon width={24} height={24} />
                ) : (
                  <EyeClosedIcon width={24} height={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm your password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your Password"
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
                {/* <<< (PERBAIKAN BONUS) Gunakan SVG yang sudah di-import >>> */}
                {isConfirmPasswordVisible ? (
                  <EyeOpenIcon width={24} height={24} />
                ) : (
                  <EyeClosedIcon width={24} height={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* <<< 6. TAMBAHKAN UI CHECKBOX BARU >>> */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreedToPolicy(!agreedToPolicy)}
            >
              {agreedToPolicy && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyText}>
                Saya telah membaca dan menyetujui{' '}
              </Text>
              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={styles.privacyLink}>Kebijakan Privasi</Text>
              </TouchableOpacity>
              <Text style={styles.privacyText}>.</Text>
            </View>
          </View>
          {/* <<< BATAS UI CHECKBOX >>> */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.privacyText}>
              Have an Account? Click here to log in
            </Text>
          </TouchableOpacity>

          {/* <<< 7. HAPUS TOMBOL PRIVACY POLICY LAMA >>> */}
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

// <<< 8. TAMBAHKAN STYLE BARU UNTUK CHECKBOX >>>
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#4A2F2F',
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
    marginTop: 25, // Tetap 25, karena checkbox ada di atasnya
    elevation: 3,
    minHeight: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  // --- Style Baru ---
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6A453C',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#6A453C',
  },
  privacyTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  privacyLink: {
    fontSize: 12,
    color: '#6A453C',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
