// src/features/Discussion/screens/DiscussionChoiceScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// --- Impor Aset (Ganti dengan SVG asli jika sudah ada) ---
// import ExpertIcon from '../../../assets/icon/ExpertIcon.svg';
// import CommunityIcon from '../../../assets/icon/CommunityIcon.svg';
// import ChatIcon from '../../../assets/icon/ChatIcon.svg'; // Untuk header kanan

const DiscussionChoiceScreen = ({ navigation }) => {
  const handleAskExpert = () => {
    navigation.navigate('AskExpertList');
  };

  const handleCommunityChat = () => {
    console.log('Navigasi ke Daftar Grup Komunitas');
    navigation.navigate('CommunityGroupList'); // Sesuaikan nama screen jika berbeda
  };

  const handleOpenChatList = () => {
    console.log('Navigasi ke Daftar Semua Chat (Shortcut Header)');
    // Nanti: navigation.navigate('ChatListScreen'); // Layar yang berisi gabungan chat ahli & grup
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ruang Diskusi</Text>
        {/* Ikon Chat Shortcut (sesuai permintaan alur baru) */}
        <TouchableOpacity
          onPress={handleOpenChatList}
          style={styles.headerButton}
        >
          {/* Ganti dengan ikon Chat SVG */}
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>💬</Text>
          {/* <ChatIcon width={24} height={24} fill="#FFF" /> */}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mau Diskusi Apa Hari Ini?</Text>
        <Text style={styles.subtitle}>
          Pilih salah satu opsi di bawah ini untuk memulai diskusi.
        </Text>

        {/* Opsi 1: Tanya Ahli */}
        <TouchableOpacity
          style={[styles.optionCard, styles.expertCard]}
          onPress={handleAskExpert}
          activeOpacity={0.8}
        >
          <View style={styles.optionIconContainer}>
            {/* Ganti dengan Ikon Ahli */}
            <Text style={styles.optionIcon}>👨‍🏫</Text>
            {/* <ExpertIcon width={40} height={40} /> */}
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Tanya Ahli Sejarah</Text>
            <Text style={styles.optionDescription}>
              Ajukan pertanyaan langsung kepada ahli sejarah kami.
            </Text>
          </View>
          <Text style={styles.optionArrow}>{'>'}</Text>
        </TouchableOpacity>

        {/* Opsi 2: Chat Grup Komunitas */}
        <TouchableOpacity
          style={[styles.optionCard, styles.communityCard]}
          onPress={handleCommunityChat}
          activeOpacity={0.8}
        >
          <View style={styles.optionIconContainer}>
            {/* Ganti dengan Ikon Komunitas */}
            <Text style={styles.optionIcon}>👥</Text>
            {/* <CommunityIcon width={40} height={40} /> */}
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Chat Grup Komunitas</Text>
            <Text style={styles.optionDescription}>
              Bergabung dalam diskusi grup dengan pengguna lain.
            </Text>
          </View>
          <Text style={styles.optionArrow}>{'>'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Background abu-abu sangat muda
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Coklat header
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center', // Pusatkan kartu pilihan
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30, // Jarak ke kartu pertama
    maxWidth: '85%', // Batasi lebar subtitle
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 20,
    width: '100%', // Lebar penuh
    marginBottom: 20, // Jarak antar kartu
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expertCard: {
    backgroundColor: '#E3D5B8', // Background krem/beige
  },
  communityCard: {
    backgroundColor: '#C8E6C9', // Background hijau muda (contoh)
  },
  optionIconContainer: {
    // Styling untuk wrapper ikon jika perlu (misal background bulat)
    marginRight: 15,
  },
  optionIcon: {
    fontSize: 35, // Ukuran ikon (emoji)
  },
  optionTextContainer: {
    flex: 1, // Agar mengisi ruang sisa
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444', // Warna judul opsi
    marginBottom: 3,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666', // Warna deskripsi
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A0A0A0', // Warna panah abu-abu
  },
});

export default DiscussionChoiceScreen;
