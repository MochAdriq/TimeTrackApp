// src/features/Premium/screens/PremiumScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

// --- Impor Aset ---
// Pastikan path ini benar
import TimeTrackLogo from '../../../assets/images/TimeTrackLogo.svg';
import TimeTrackName from '../../../assets/images/TimeTrackName.svg';
// Impor ikon centang jika pakai SVG
// import CheckmarkIcon from '../../../assets/icons/CheckmarkIcon.svg';

// Data Fitur Premium
const premiumFeatures = [
  'Akses semua Materi Video',
  'Fitur Favorite Materi',
  'Menghilangkan iklan',
  'Fitur Premium Diskusi',
  'Batalkan kapan saja',
];

const PremiumScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    // --- TODO: Logika untuk memulai langganan ---
    console.log('Get Started Premium');
  };

  const handleSelectPlan = planType => {
    // --- TODO: Logika memilih plan ---
    console.log('Selected plan:', planType);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo & Judul Aplikasi */}
        <View style={styles.logoContainer}>
          <TimeTrackLogo width={100} height={100} fill="#8B5E3C" />
          <TimeTrackName
            width={180}
            height={35}
            fill="#6D4C41"
            style={styles.appName}
          />
        </View>

        {/* Daftar Fitur */}
        <View style={styles.featuresContainer}>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              {/* Ganti View ini dengan ikon centang */}
              <View style={styles.checkmarkPlaceholder}>
                <Text style={{ color: '#4CAF50' }}>✓</Text>
              </View>
              {/* <CheckmarkIcon width={20} height={20} fill="#4CAF50" /> */}
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Section Dapatkan Premium */}
        <View style={styles.getPremiumSection}>
          <Text style={styles.premiumTitle}>Dapatkan Fitur Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Menjelajahi dengan fitur favorit
          </Text>
        </View>

        {/* Pilihan Paket */}
        <View style={styles.planOptionsContainer}>
          {/* Paket Bulanan */}
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleSelectPlan('monthly')}
          >
            <Text style={styles.planType}>Premium Bulanan</Text>
            <Text style={styles.planPrice}>Rp 25ribu/Bulan</Text>
            <Text style={styles.planTrial}>7 hari percobaan</Text>
          </TouchableOpacity>

          {/* Paket Tahunan */}
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleSelectPlan('yearly')}
          >
            <Text style={styles.planType}>Premium Tahunan</Text>
            <Text style={styles.planPrice}>Rp 250ribu/Tahun</Text>
            {/* Kosongkan trial jika tidak ada */}
            <Text style={styles.planTrial}> </Text>
          </TouchableOpacity>
        </View>

        {/* Tombol Get Started */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Spacer agar tidak tertutup tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES (Contoh, sesuaikan warna, font, spacing) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Background putih
  },
  scrollContainer: {
    alignItems: 'center', // Pusatkan konten secara horizontal
    paddingHorizontal: 20,
    paddingTop: 30, // Jarak dari atas
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    marginTop: 10,
  },
  featuresContainer: {
    alignSelf: 'flex-start', // Ratakan list fitur ke kiri
    marginBottom: 30,
    paddingLeft: '10%', // Beri indentasi
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmarkPlaceholder: {
    // Ganti dengan style ikon centang
    width: 24,
    height: 24,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // checkmarkIcon: { marginRight: 10 },
  featureText: {
    fontSize: 16,
    color: '#333',
    // fontFamily: 'YourFont-Regular',
  },
  getPremiumSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    // fontFamily: 'YourFont-Bold',
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#777',
    // fontFamily: 'YourFont-Regular',
  },
  planOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Kasih jarak antar kartu
    width: '100%', // Lebar penuh
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#FAF3E0', // Warna krem/beige (estimasi)
    borderRadius: 15,
    padding: 15,
    width: '48%', // Sekitar setengah lebar (dikurangi jarak)
    alignItems: 'center', // Teks di tengah
    // Shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  planType: {
    fontSize: 13,
    color: '#B0A08D', // Warna abu kecoklatan (estimasi)
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A453C', // Warna coklat tua (estimasi)
    marginBottom: 4,
  },
  planTrial: {
    fontSize: 11,
    color: '#AAA', // Warna abu-abu
  },
  getStartedButton: {
    backgroundColor: '#E3D5B8', // Warna krem tombol (estimasi)
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30, // Sangat melengkung
    // Shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedButtonText: {
    color: '#6A453C', // Warna teks coklat tua
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumScreen;
