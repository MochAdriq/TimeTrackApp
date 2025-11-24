import React, { useState } from 'react'; // <<< 1. Import useState
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useProfile } from '../../../context/ProfileContext'; // <<< 2. Import useProfile
import InfoModal from '../../../components/common/InfoModal'; // <<< 3. Import InfoModal

// --- (PERBAIKAN) Komponen Pilihan ---
const ChoiceCard = ({ icon, title, description, onPress, isPremium }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
    <View style={styles.textContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);
// --- (BATAS PERBAIKAN) ---

const DiscussionChoiceScreen = ({ navigation }) => {
  // --- (PERBAIKAN 2) Ambil profil & state modal ---
  const { profile } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);

  const handleNavigateToPremium = () => {
    setModalVisible(false);
    // Arahkan ke tab Premium (sesuai AppTabs.js)
    navigation.navigate('Premium');
  };

  const showPremiumModal = () => {
    setModalVisible(true);
  };

  // --- (PERBAIKAN 3) Logika Premium Gate ---
  const handleNavigation = (screenName, isPremiumFeature) => {
    const isUserPremium = profile?.plan === 'premium';

    if (isPremiumFeature && !isUserPremium) {
      // Jika fitur premium DAN user BUKAN premium
      showPremiumModal();
    } else {
      // Jika fitur gratis ATAU user premium
      navigation.navigate(screenName);
    }
  };
  // --- (BATAS PERBAIKAN 3) ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mulai Diskusi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- (PERBAIKAN 4) Tiga Pilihan Baru --- */}
        <ChoiceCard
          icon="⭐"
          title="Chat Ahli"
          description="Tanya jawab eksklusif dengan para ahli (1-on-1)."
          isPremium={true}
          onPress={() => handleNavigation('AskExpertList', true)}
        />

        <ChoiceCard
          icon="👑"
          title="Grup Premium"
          description="Grup diskusi eksklusif dengan materi dan mentor premium."
          isPremium={true}
          onPress={() => handleNavigation('PremiumGroupList', true)}
        />

        <ChoiceCard
          icon="👥"
          title="Grup Komunitas"
          description="Bergabung dengan grup diskusi general (publik)."
          isPremium={false}
          onPress={() => handleNavigation('CommunityGroupList', false)}
        />
        {/* --- (BATAS PERBAIKAN 4) --- */}
      </ScrollView>

      {/* --- (PERBAIKAN 5) Tambah Modal --- */}
      <InfoModal
        isVisible={modalVisible}
        title="Fitur Khusus Premium"
        message="Untuk mengakses fitur ini, Anda harus meng-upgrade akun Anda ke Premium."
        modalType="info" // Tipe 'info' (ikon info)
        onClose={() => setModalVisible(false)}
        confirmText="Upgrade"
        onConfirm={handleNavigateToPremium}
      />
      {/* --- (BATAS PERBAIKAN 5) --- */}
    </SafeAreaView>
  );
};

// --- (STYLE BARU) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'flex-start' },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0EBE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#FFD700', // Warna emas
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A2F2F',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  chevron: {
    fontSize: 20,
    color: '#BDBDBD',
    marginLeft: 10,
  },
});

export default DiscussionChoiceScreen;
