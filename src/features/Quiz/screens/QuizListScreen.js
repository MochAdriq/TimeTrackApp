// src/features/Quiz/screens/QuizListScreen.js
import React, { useState, useCallback } from 'react'; // <<< 1. Import useState & useCallback
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator, // <<< 2. Import ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <<< 3. Import useFocusEffect
import QuizCard from '../components/QuizCard'; // Import kartu kuis

// --- 4. Import Supabase ---
import { supabase } from '../../../services/supabaseClient';

// --- Hapus Data Dummy ---
// const userQuizData = { ... };
// const quizListData = [ ... ];

const QuizListScreen = ({ navigation }) => {
  // --- 5. Tambahkan State ---
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Memuat...',
    level: 0,
    points: 0,
  });
  const [quizList, setQuizList] = useState([]);

  // --- 6. Fungsi Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil ID user yang login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      // 2. Ambil data profil & daftar kuis sekaligus
      const [profileResult, quizResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, level, points')
          .eq('id', user.id)
          .single(),
        supabase.from('quizzes').select('*'), // Ambil semua kuis
      ]);

      // 3. Proses data profil
      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw profileResult.error;
      }
      if (profileResult.data) {
        setUserProfile({
          name: profileResult.data.username || 'User',
          level: profileResult.data.level || 1,
          points: profileResult.data.points || 0,
        });
      }

      // 4. Proses data kuis
      if (quizResult.error) throw quizResult.error;

      // Format data agar sesuai QuizCard (berdasarkan dummy)
      const formattedQuizzes = quizResult.data.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz.question_count,
        duration: quiz.duration,
        rating: quiz.rating,
        imageUrl: quiz.image_url,
      }));
      setQuizList(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quiz list data:', error.message);
      // Nanti bisa ganti pakai InfoModal
    } finally {
      setLoading(false);
    }
  };

  // --- 7. Gunakan useFocusEffect ---
  // Akan refresh data setiap kali layar ini dibuka
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleQuizSelect = quizItem => {
    console.log('Selected Quiz:', quizItem.id);
    // Kirim 'quizItem' (yang sudah diformat) ke QuizDetail
    navigation.navigate('QuizDetail', { quizItem: quizItem });
  };

  const renderItem = ({ item }) => (
    <QuizCard item={item} onPress={handleQuizSelect} />
  );

  // --- 8. Tampilkan Loading Penuh ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <ActivityIndicator size="large" color="#6A453C" />
      </SafeAreaView>
    );
  }

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
        </TouchableOpacity>

        {/* Foto Profil (Overlap) */}
        <View style={styles.profilePicWrapper}>
          <View style={styles.profilePicPlaceholder}>
            <Text style={{ fontSize: 30 }}>👤</Text>
          </View>
        </View>

        {/* --- 9. Gunakan Data Dinamis --- */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Hi, {userProfile.name}</Text>
          <Text style={styles.profileSubtext}>Good Morning</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {userProfile.level}</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>
                {userProfile.points.toLocaleString('id-ID')}
              </Text>
              <View style={styles.coinIconPlaceholder}>
                <Text style={{ fontSize: 10 }}>💰</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* --- Akhir Bagian Atas --- */}

      {/* --- Daftar Kuis (Area Putih Melengkung) --- */}
      <FlatList
        data={quizList} // <<< Gunakan data dari state
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.listArea}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada kuis yang tersedia.</Text>
        }
      />
    </SafeAreaView>
  );
};

// --- STYLES (Tambahkan style loading & empty) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  loadingContainer: {
    // Style untuk loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bagian Atas
  topSection: {
    backgroundColor: '#6A453C',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    paddingBottom: 40, // Beri jarak lebih untuk foto profil
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    alignItems: 'center', // Pusatkan semua
  },
  backButton: {
    padding: 5,
    alignSelf: 'flex-start',
    position: 'absolute', // Taruh di pojok
    left: 15,
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    zIndex: 10,
  },
  backIconPlaceholder: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center', // Pusatkan info profil
    marginTop: 10, // Jarak dari foto
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
    alignSelf: 'center', // Pusatkan
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
    // Foto profil sekarang di atas info
    marginTop: 20, // Beri jarak dari tombol back
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, // Tarik ke atas
    zIndex: 0,
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
  },
  emptyText: {
    // Style jika list kuis kosong
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default QuizListScreen;
