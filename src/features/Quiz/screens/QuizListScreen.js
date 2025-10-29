// src/features/Quiz/screens/QuizListScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList, // Pakai FlatList
} from 'react-native';
import QuizCard from '../components/QuizCard'; // Import kartu kuis

const userQuizData = {
  name: 'Alka Azzahra',
  level: 1,
  points: 100000,
  // profilePicUrl: null,
};

const quizListData = [
  {
    id: 'quiz1',
    title: 'Kuis Kerajaan Islam',
    questionCount: 10,
    duration: '1 hour 15 min',
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/150/A77C55/FFFFFF?text=Kuis+1',
  },
  {
    id: 'quiz2',
    title: 'Kuis Penjajahan Barat',
    questionCount: 10,
    duration: '1 hour 15 min',
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/150/8B5E3C/FFFFFF?text=Kuis+2',
  },
  {
    id: 'quiz3',
    title: 'Kuis Sumpah Pemuda',
    questionCount: 10,
    duration: '1 hour 15 min',
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/150/6A453C/FFFFFF?text=Kuis+3',
  },
  {
    id: 'quiz4',
    title: 'Kuis Kemerdekaan',
    questionCount: 10,
    duration: '1 hour 15 min',
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/150/A77C55/FFFFFF?text=Kuis+4',
  },
  {
    id: 'quiz5',
    title: 'Kuis Orde Lama',
    questionCount: 10,
    duration: '1 hour 15 min',
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/150/8B5E3C/FFFFFF?text=Kuis+5',
  },
];

const QuizListScreen = ({ navigation }) => {
  const handleQuizSelect = quizItem => {
    // Navigasi ke layar soal kuis, kirim ID kuis
    console.log('Selected Quiz:', quizItem.id);
    navigation.navigate('QuizDetail', { quizItem: quizItem }); // <<< KIRIM SELURUH ITEM
  };

  const renderItem = ({ item }) => (
    <QuizCard item={item} onPress={handleQuizSelect} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      {/* --- Bagian Atas (Curve Coklat & Profil) --- */}
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconPlaceholder}>
            <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
          </View>
          {/* <BackArrowIcon width={24} height={24} fill="#FFF" /> */}
        </TouchableOpacity>

        {/* Foto Profil (Overlap) */}
        <View style={styles.profilePicWrapper}>
          <View style={styles.profilePicPlaceholder}>
            <Text style={{ fontSize: 30 }}>👤</Text>
          </View>
          {/* <ProfilePic width={70} height={70} style={styles.profilePic} /> */}
        </View>

        {/* Info Profil (di dalam curve) */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Hi, {userQuizData.name}</Text>
          <Text style={styles.profileSubtext}>Good Morning</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {userQuizData.level}</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>
                {userQuizData.points.toLocaleString('id-ID')}
              </Text>
              <View style={styles.coinIconPlaceholder}>
                <Text style={{ fontSize: 10 }}>💰</Text>
              </View>
              {/* <CoinIcon width={12} height={12} /> */}
            </View>
          </View>
        </View>
      </View>
      {/* --- Akhir Bagian Atas --- */}

      {/* --- Daftar Kuis (Area Putih Melengkung) --- */}
      <FlatList
        data={quizListData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.listArea} // Style untuk FlatList
        contentContainerStyle={styles.listContent} // Style untuk konten di dalam FlatList
      />
    </SafeAreaView>
  );
};

// --- STYLES (Mirip ProfileScreen) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background abu
  },
  // Bagian Atas
  topSection: {
    backgroundColor: '#6A453C',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    // HAPUS flexDirection: 'row'
    alignItems: 'center', // <<< PASTIKAN INI ADA
    // HAPUS justifyContent: 'space-between'
  },
  backButton: {
    padding: 5,
    alignSelf: 'flex-start', // Pastikan tombol back di atas
  },
  backIconPlaceholder: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    // Styling untuk info text
    // alignItems: 'flex-start', // Default?
  },
  profileName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  profileSubtext: { color: '#E0E0E0', fontSize: 12 },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointsText: {
    color: '#4A2F2F',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinIconPlaceholder: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicWrapper: {
    // Foto profil diletakkan setelah info teks atau atur layoutnya
    // Mari kita sederhanakan, letakkan di kanan
  },
  profilePicPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bagian List Putih
  listArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Background list putih
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, // <<< Tarik ke atas agar tertutup lengkungan
    zIndex: 0, // Di bawah header
  },
  listContent: {
    padding: 20, // Padding di dalam area list putih
    paddingTop: 30, // Padding atas lebih besar
  },
});

export default QuizListScreen;
