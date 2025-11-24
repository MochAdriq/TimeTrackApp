// src/features/Quiz/screens/QuizListScreen.js
import React, { useState, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QuizCard from '../components/QuizCard';

import { supabase } from '../../../services/supabaseClient';

const QuizListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Memuat...',
    level: 0,
    points: 0,
  });
  const [quizList, setQuizList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- (PERBAIKAN) Modifikasi fetchData ---
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      // --- (INI PERBAIKANNYA) Ambil 3 data sekaligus ---
      const [profileResult, quizResult, attemptsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, level, points')
          .eq('id', user.id)
          .single(),
        supabase.from('quizzes').select('*'),
        // 3. Ambil riwayat kuis yang sudah diambil
        supabase
          .from('quiz_attempts')
          .select('quiz_id') // Hanya butuh ID kuisnya
          .eq('user_id', user.id),
      ]);
      // --- (BATAS PERBAIKAN) ---

      // 1. Proses Profil (Tidak berubah)
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

      // 2. Proses Daftar Kuis & Riwayat
      if (quizResult.error) throw quizResult.error;
      if (attemptsResult.error) throw attemptsResult.error;

      // Buat Set (lookup cepat) dari kuis yang sudah selesai
      const completedQuizIds = new Set(
        attemptsResult.data.map(att => att.quiz_id),
      );

      // Format data dan tambahkan 'isCompleted'
      const formattedQuizzes = quizResult.data.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz.question_count,
        duration: quiz.duration,
        rating: quiz.rating,
        imageUrl: quiz.image_url,
        isCompleted: completedQuizIds.has(quiz.id), // <<< KUNCI LOGIKA
      }));

      setQuizList(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quiz list data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  // --- (BATAS PERBAIKAN) ---

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  const handleQuizSelect = quizItem => {
    // (PERBAIKAN) Jangan navigasi jika sudah selesai
    if (quizItem.isCompleted) return;

    console.log('Selected Quiz:', quizItem.id);
    navigation.navigate('QuizDetail', { quizItem: quizItem });
  };

  const renderItem = ({ item }) => (
    <QuizCard item={item} onPress={handleQuizSelect} />
  );

  if (loading && !refreshing) {
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
      <View style={styles.topSection}>
        {/* ... (Kode Bagian Atas tidak berubah) ... */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate('MainApp', {
              screen: 'MainTabs',
              params: { screen: 'Jelajah' },
            })
          }
        >
          <View style={styles.backIconPlaceholder}>
            <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.profilePicWrapper}>
          <View style={styles.profilePicPlaceholder}>
            <Text style={{ fontSize: 30 }}>👤</Text>
          </View>
        </View>
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

      <FlatList
        data={quizList}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.listArea}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada kuis yang tersedia.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A453C']}
            tintColor={'#6A453C'}
          />
        }
        // (PERBAIKAN) Pastikan list update saat data berubah
        extraData={quizList}
      />
    </SafeAreaView>
  );
};

// --- (STYLES tidak berubah) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    backgroundColor: '#6A453C',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 25,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
    alignSelf: 'flex-start',
    position: 'absolute',
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
    alignItems: 'center',
    marginTop: 10,
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
    alignSelf: 'center',
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
    marginTop: 20,
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
  listArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    zIndex: 0,
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default QuizListScreen;
