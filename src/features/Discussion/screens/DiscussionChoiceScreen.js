// src/features/Discussion/screens/DiscussionChoiceScreen.js
import React, { useState } from 'react'; // <<< 1. Import useState
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// --- 2. Impor SVG Ikon Asli ---
import PeopleIcon from '../../../assets/icon/PeopleIcon.svg';
import GroupIcon from '../../../assets/icon/GroupIcon.svg';
import ChatIcon from '../../../assets/icon/ChatIcon.svg';
import UnderDevelopmentModal from '../../../components/common/UnderDevelopmentModal'; // <<< 3. Impor Modal

const DiscussionChoiceScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAskExpert = () => {
    navigation.navigate('AskExpertList');
  };

  const handleCommunityChat = () => {
    navigation.navigate('CommunityGroupList');
  };

  const handleOpenChatList = () => {
    setModalVisible(true); // Buka modal
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
        {/* --- 6. Ganti Ikon Header --- */}
        <TouchableOpacity
          onPress={handleOpenChatList}
          style={styles.headerButton}
        >
          <ChatIcon width={24} height={24} fill="#FFF" />
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
            {/* --- 7. Ganti Ikon Ahli --- */}
            <PeopleIcon width={40} height={40} fill="#6A453C" />
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
            {/* --- 8. Ganti Ikon Komunitas --- */}
            <GroupIcon width={40} height={40} fill="#388E3C" />
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

      {/* --- 9. Tambahkan Modal --- */}
      <UnderDevelopmentModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
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
    marginRight: 15,
    width: 40, // Beri lebar tetap
    alignItems: 'center', // Pusatkan ikon
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
