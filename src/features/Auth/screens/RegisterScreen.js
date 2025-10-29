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
  Alert, // Untuk pesan sementara
} from 'react-native';

import LockIcon from '../../../assets/images/lockIcon.svg';
import PeopleIcon from '../../../assets/icon/PeopleIcon.svg';

// --- Impor Aset (Ganti path jika perlu) ---
// const userIcon = require('../../../assets/images/user_icon.png');
// const lockIcon = require('../../../assets/images/lock_icon.png');

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(true);

  const handleRegister = () => {
    // --- TODO: Logika Registrasi ---
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    console.log('Register attempt:', {
      email,
      fullName,
      gender,
      phoneNumber,
      password,
    });
    Alert.alert('Register Pressed', 'Account details logged.'); // Placeholder
    // Jika sukses, mungkin navigasi ke Login
    // navigation.navigate('Login');
  };

  const handlePrivacyPolicy = () => {
    // --- TODO: Buka link Privacy Policy ---
    console.log('Open Privacy Policy');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2F2F" />{' '}
      {/* Warna gelap */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* === Bagian Atas (Kosong/Gelap) === */}
        <View style={styles.topSection} />

        {/* === Bagian Form (Konten Putih) === */}
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
                onFocus={() => setIsEmailFocused(false)} // <-- Set state jadi true saat fokus
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
                autoCapitalize="words" // Kapitalisasi nama
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setGender('Male')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    gender === 'Male' && styles.radioOuterSelected,
                  ]}
                >
                  {gender === 'Male' && (
                    <View style={styles.radioInnerSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setGender('Female')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    gender === 'Female' && styles.radioOuterSelected,
                  ]}
                >
                  {gender === 'Female' && (
                    <View style={styles.radioInnerSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Female</Text>
              </TouchableOpacity>
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
                keyboardType="phone-pad" // Keyboard nomor telepon
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
                secureTextEntry
              />
              {/* Ganti View ini dengan Image icon gembok */}
              <View style={styles.iconPlaceholder}>
                <LockIcon />
              </View>
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
                secureTextEntry
              />
              <View style={styles.iconPlaceholder}>
                <LockIcon />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRegister}
          >
            <Text style={styles.actionButtonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.privacyText}>
              Have an Account? Click here to log in
            </Text>
          </TouchableOpacity>

          {/* Link Privacy Policy */}
          <TouchableOpacity
            onPress={handlePrivacyPolicy}
            style={styles.privacyButton}
          >
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES (Contoh, silakan sesuaikan) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#4A2F2F', // Warna background gelap
  },
  topSection: {
    height: 100, // Sesuaikan tinggi area gelap atas
    // backgroundColor: '#4A2F2F', // Sudah di scrollViewContainer
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40, // Beri ruang di bawah
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    // fontFamily: 'YourFont-Bold',
  },
  inputGroup: {
    marginBottom: 15, // Jarak antar grup input
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    // fontFamily: 'YourFont-Regular',
  },
  inputContainer: {
    // Container untuk input + ikon
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 15, // Sudut melengkung
  },
  input: {
    flex: 1, // Agar input mengisi ruang
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 0, // Border sudah di container
    // fontFamily: 'YourFont-Regular',
  },
  iconPlaceholder: {
    paddingHorizontal: 10,
  },

  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30, // Jarak antar pilihan gender
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AAA', // Warna border radio button
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#6D4C41', // Warna border saat dipilih (coklat tua)
  },
  radioInnerSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6D4C41', // Warna titik tengah saat dipilih
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    // fontFamily: 'YourFont-Regular',
  },
  actionButton: {
    backgroundColor: '#7D5A5A', // Warna tombol (estimasi)
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25, // Jarak dari input terakhir
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    // fontFamily: 'YourFont-Bold',
  },
  privacyButton: {
    marginTop: 20, // Jarak dari tombol utama
  },
  privacyText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    // fontFamily: 'YourFont-Regular',
  },
});

export default RegisterScreen;
