// src/screens/DeveloperScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

// Import SVG/Image logo
import TimeTrackLogo from '../assets/images/TimeTrackLogo.svg';
import Development from '../assets/images/development.svg';
import TimeTrackName from '../assets/images/TimeTrackNameWhite.svg'; // Menggunakan warna putih agar kontras
import BackArrow from '../assets/icon/BackDrawerIcon.svg'; // Menggunakan BackDrawerIcon sebagai panah kembali

const DeveloperScreen = ({ navigation }) => {
  // Data dummy tim developer

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackArrow width={24} height={24} fill="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Developer Team</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Konten Utama (Mirip Modal) */}
        <View style={styles.mainContent}>
          <Development
            width={80}
            height={80}
            fill="#6A453C"
            style={styles.logo}
          />
          <TimeTrackName
            width={200}
            height={30}
            fill="#6A453C"
            style={styles.appName}
          />

          <Text style={styles.title}>Tim di Balik Layar</Text>

          <Text style={styles.message}>
            Aplikasi ini dikembangkan dengan semangat untuk melestarikan budaya
            dan sejarah. Terima kasih atas dukungan Anda!
          </Text>
        </View>

        <Text style={styles.versionText}>
          Versi Aplikasi: 1.0.0 (Build 20251031)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#6A453C',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },
  mainContent: {
    backgroundColor: 'white',
    padding: 22,
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logo: {
    marginBottom: 10,
  },
  appName: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    maxWidth: '90%',
  },
  teamList: {
    width: '100%',
    paddingHorizontal: 10,
  },
  devItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  devName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  devRole: {
    fontSize: 14,
    color: '#8B5E3C',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
});

export default DeveloperScreen;
