// src/features/Auth/screens/LoginScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image, // Untuk logo dan ikon sosial
  ScrollView, // Jika kontennya bisa panjang di layar kecil
} from 'react-native';
import TimeTrackNameWhite from '../../../assets/images/TimeTrackNameWhite.svg';
import TimeTrackLogo from '../../../assets/images/TimeTrackLogo.svg';
import GoogleLogo from '../../../assets/images/GoogleLogo.svg';
import InstagramLogo from '../../../assets/images/InstagramLogo.svg';
import MetaverseLogo from '../../../assets/images/MetaverseLogo.svg';
import LockIcon from '../../../assets/images/lockIcon.svg';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login attempt:', email, password);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleSocialLogin = provider => {
    console.log(`Login with ${provider}`);
  };

  const handlePrivacyPolicy = () => {
    console.log('Open Privacy Policy');
  };

  const handleSkipLogin = () => {
    console.log('Skipping login...');
    navigation.replace('MainApp'); // Pastikan 'HomeScreen' ada di AppNavigator
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2F2F" />{' '}
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.topSection}>
          <TimeTrackLogo
            width={71.6} // Sesuaikan lebar logo
            height={71.6}
          />
          <TimeTrackNameWhite
            width={200} // Sesuaikan lebar teks SVG
            height={40} // Sesuaikan tinggi teks SVG
            style={styles.appName} // Terapkan margin bawah
          />
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]} // Buat style terpisah jika perlu
                placeholder="Enter your Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry // Sembunyikan password
              />
              <View style={styles.LockIconStyle}>
                <LockIcon />
              </View>
            </View>
          </View>

          {/* Tombol Login */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Link Create Account */}
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.createAccountText}>Create account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipLogin}>
          <Text style={styles.skipButtonText}>Skip Login (Dev)</Text>
        </TouchableOpacity>

        <View style={styles.bottomSection}>
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
          <TouchableOpacity onPress={handlePrivacyPolicy}>
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Warna default jika ada area kosong
  },
  scrollViewContainer: {
    flexGrow: 1, // Agar bisa scroll jika konten panjang
    backgroundColor: '#6A453C', // Warna background gelap bagian atas
  },
  topSection: {
    height: 200, // Sesuaikan tinggi area logo
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    flex: 1, // Agar mengisi sisa ruang
    backgroundColor: '#FFFFFF', // Background putih
    borderTopLeftRadius: 45, // Sudut melengkung atas
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 40, // Padding di dalam area putih
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    // fontFamily: 'YourFont-Regular',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15, // Sudut input melengkung
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    // fontFamily: 'YourFont-Regular',
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
    flex: 1, // Agar input mengisi ruang
    borderWidth: 0, // Hapus border individual karena sudah ada di container
  },
  LockIconStyle: {
    marginRight: 15,
  },
  loginButton: {
    backgroundColor: '#6A453C', // Warna tombol login (estimasi)
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10, // Jarak dari input terakhir
    marginBottom: 20, // Jarak ke link create account
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    // fontFamily: 'YourFont-Bold',
  },
  createAccountText: {
    color: '#4A2F2F', // Warna link (estimasi)
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    // fontFamily: 'YourFont-SemiBold',
  },
  skipButton: {
    // Style untuk tombol skip
    marginTop: 10,
    paddingVertical: 10,
    // backgroundColor: '#EEE', // Warna berbeda (opsional)
    // borderRadius: 15,
    alignItems: 'center',
  },
  skipButtonText: {
    // Style teks tombol skip
    color: '#888', // Warna abu-abu
    fontSize: 12,
  },
  bottomSection: {
    paddingBottom: 30, // Padding di bawah area putih
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Lanjutkan background putih
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
    // fontFamily: 'YourFont-Regular',
  },
});

export default LoginScreen;
