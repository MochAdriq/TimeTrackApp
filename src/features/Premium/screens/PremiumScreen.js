import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator, // <<< 1. IMPORT
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <<< 2. IMPORT
import { supabase } from '../../../services/supabaseClient'; // <<< 3. IMPORT

// --- Impor Aset ---
import TimeTrackLogo from '../../../assets/images/TimeTrackLogo.svg';
import TimeTrackName from '../../../assets/images/TimeTrackName.svg';

// Data Fitur Premium (Tetap Hardcoded)
const premiumFeatures = [
  'Akses semua Materi Video',
  'Fitur Favorite Materi',
  'Menghilangkan iklan',
  'Fitur Premium Diskusi',
  'Batalkan kapan saja',
];

const PremiumScreen = ({ navigation }) => {
  // --- (INI PERUBAHANNYA) State Dinamis ---
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  // --- (BATAS PERUBAHAN) ---

  // --- (INI FUNGSI BARU) Fetch data paket ---
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('premium_packages')
        .select('*')
        .order('price', { ascending: true }); // Urutkan dari termurah

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching premium packages:', error.message);
      // Di sini kita bisa tampilkan modal error jika perlu
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil data saat layar dibuka
  useFocusEffect(
    useCallback(() => {
      // Panggil fungsi async dari dalam sini
      fetchPackages();
    }, [fetchPackages]), // <-- Pastikan fetchPackages ada di dependensi
  );
  // --- (BATAS FUNGSI BARU) ---

  const handleGetStarted = () => {
    // --- (INI PERUBAHANNYA) Logika navigasi ---
    if (!selectedPackageId) {
      alert('Silakan pilih salah satu paket terlebih dahulu.');
      return;
    }

    const selectedPkg = packages.find(p => p.id === selectedPackageId);
    if (selectedPkg) {
      console.log('Navigasi ke PremiumCheckout dengan paket:', selectedPkg);
      // Arahkan ke layar BERIKUTNYA (yang akan kita buat)
      navigation.navigate('PremiumCheckout', { package: selectedPkg });
    }
    // --- (BATAS PERUBAHAN) ---
  };

  const handleSelectPlan = pkgId => {
    // --- (INI PERUBAHANNYA) Logika memilih plan ---
    setSelectedPackageId(pkgId);
    // --- (BATAS PERUBAHAN) ---
  };

  // Helper untuk format Rupiah
  const formatCurrency = value => {
    if (!value) return 'Gratis';
    return `Rp ${value.toLocaleString('id-ID')}`;
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
              <View style={styles.checkmarkPlaceholder}>
                <Text style={{ color: '#4CAF50' }}>✓</Text>
              </View>
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

        {/* --- (INI PERUBAHAN BESAR) Pilihan Paket Dinamis --- */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6A453C"
            style={styles.loader}
          />
        ) : (
          <View style={styles.planOptionsContainer}>
            {packages.map(pkg => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.planCard,
                  selectedPackageId === pkg.id && styles.planCardSelected, // Style saat dipilih
                ]}
                onPress={() => handleSelectPlan(pkg.id)}
              >
                <Text style={styles.planType}>{pkg.title}</Text>
                <Text style={styles.planPrice}>
                  {formatCurrency(pkg.price)}
                </Text>
                <Text style={styles.planTrial}>
                  {/* Tampilkan durasi (misal: "Selama 30 Hari") */}
                  {pkg.duration_days
                    ? `Selama ${pkg.duration_days} Hari`
                    : 'Sekali Bayar'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* --- (BATAS PERUBAHAN) --- */}

        {/* Tombol Get Started */}
        <TouchableOpacity
          style={[
            styles.getStartedButton,
            (!selectedPackageId || loading) && styles.getStartedButtonDisabled, // Tombol disable
          ]}
          onPress={handleGetStarted}
          disabled={!selectedPackageId || loading}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- (INI PERUBAHAN STYLE) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    marginTop: 10,
  },
  featuresContainer: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    paddingLeft: '10%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmarkPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
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
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  loader: {
    height: 120, // Beri tinggi agar layout tidak "lompat"
    justifyContent: 'center',
  },
  planOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#FAF3E0',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2, // Tambahkan border
    borderColor: '#FAF3E0', // Border transparan by default
  },
  // --- (STYLE BARU UNTUK KARTU AKTIF) ---
  planCardSelected: {
    borderColor: '#6A453C', // Border coklat saat dipilih
    backgroundColor: '#FFFFFF', // Ubah background saat dipilih
  },
  planType: {
    fontSize: 13,
    color: '#B0A08D',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A453C',
    marginBottom: 4,
  },
  planTrial: {
    fontSize: 11,
    color: '#AAA',
    height: 15, // Beri tinggi agar card sejajar
  },
  getStartedButton: {
    backgroundColor: '#E3D5B8',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // --- (STYLE BARU UNTUK TOMBOL DISABLE) ---
  getStartedButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
  },
  getStartedButtonText: {
    color: '#6A453C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumScreen;
