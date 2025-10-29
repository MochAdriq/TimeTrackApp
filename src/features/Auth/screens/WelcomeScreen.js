// src/features/Auth/screens/WelcomeScreen.js

import React from 'react';
import {
  View,
  TouchableOpacity, // Import TouchableOpacity for buttons
  Text, // Import Text for button labels
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import TimeTrackLogo from '../../../assets/images/TimeTrackLogo.svg';
import TimeTrackName from '../../../assets/images/TimeTrackName.svg';

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.safeArea.backgroundColor}
      />

      <View style={styles.container}>
        <TimeTrackLogo
          width={150} // Sesuaikan lebar logo jika perlu
          height={150} // Sesuaikan tinggi logo jika perlu
          fill="#8B5E3C" // Sesuaikan warna fill (outline/warna utama) logo jika perlu
          style={styles.logo} // Terapkan margin bawah
        />

        <TimeTrackName
          width={200} // Sesuaikan lebar teks SVG
          height={40} // Sesuaikan tinggi teks SVG
          fill="#6D4C41" // Sesuaikan warna fill (warna teks) jika perlu
          style={styles.appName} // Terapkan margin bawah
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E9E2CF', // Warna background beige/tan (estimasi)
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Pusatkan konten utama (logo+nama) secara vertikal
    alignItems: 'center', // Pusatkan konten secara horizontal
    paddingHorizontal: 20, // Padding samping
  },
  logo: {
    marginBottom: 15, // Jarak dari logo ke nama aplikasi
  },
  appName: {
    marginBottom: 40, // Jarak dari nama aplikasi ke area tombol bawah
  },
  buttonContainer: {
    position: 'absolute', // Agar selalu di bawah
    bottom: 50, // Jarak dari bawah layar
    width: '85%', // Lebar container tombol
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#6A453C', // Warna coklat tua tombol (estimasi)
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25, // Sudut melengkung
    width: '100%',
    alignItems: 'center',
    marginBottom: 15, // Jarak antar tombol
    // Efek shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4, // Shadow untuk Android
  },
  buttonText: {
    color: '#FFFFFF', // Warna teks putih
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
