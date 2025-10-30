// src/features/Home/screens/HomeScreen.js

import React, {
  useState,
  useEffect, // <<< Pastikan useEffect di-import dari 'react'
} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  Alert, // <<< Tambahkan Alert untuk error
} from 'react-native';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import SectionHeader from '../../../components/common/SectionHeader';
import HorizontalCardList from '../../../components/common/HorizontalCardList';
import UnderDevelopmentModal from '../../../components/common/UnderDevelopmentModal';

// --- 1. IMPORT SUPABASE ---
import { supabase } from '../../../services/supabaseClient';

const HomeScreen = ({ navigation }) => {
  // --- 2. UBAH STATE DEFAULT ---
  const [userName, setUserName] = useState('Memuat...'); // <<< Ganti jadi default loading
  const [userLevel, setUserLevel] = useState(0); // <<< Ganti jadi default loading
  const [userPoints, setUserPoints] = useState(0); // <<< Ganti jadi default loading
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const [materiData, setMateriData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 3. MODIFIKASI FUNGSI FETCH DATA ---
  useEffect(() => {
    // Buat fungsi async di dalam useEffect
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- A. AMBIL DATA USER YANG SEDANG LOGIN ---
        // (Kita tahu ini ada karena App.tsx sudah memastikan session ada)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(`User Error: ${userError.message}`);
        if (!user) throw new Error('User tidak ditemukan (session null)');

        // --- B. AMBIL DATA DARI TABEL PROFILES & MATERI ---
        // Kita jalankan keduanya sekaligus
        const [profileResult, materiResult] = await Promise.all([
          // Query 1: Ambil profile
          supabase
            .from('profiles')
            .select('username, level, points')
            .eq('id', user.id)
            .single(),
          // Query 2: Ambil materi
          supabase.from('materi').select('*').limit(10),
        ]);

        // --- C. PROSES DATA PROFIL ---
        if (profileResult.error) {
          throw new Error(`Profile Error: ${profileResult.error.message}`);
        }
        if (profileResult.data) {
          setUserName(profileResult.data.username);
          setUserLevel(profileResult.data.level || 1); // Set 1 jika level null
          setUserPoints(profileResult.data.points || 0);
        }

        // --- D. PROSES DATA MATERI ---
        if (materiResult.error) {
          throw new Error(`Materi Error: ${materiResult.error.message}`);
        }
        if (materiResult.data) {
          const formattedData = materiResult.data.map(item => ({
            ...item,
            imageUrl: item.image_url,
          }));
          setMateriData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data HomeScreen:', error.message);
        Alert.alert('Gagal Memuat Data', error.message);
      } finally {
        setLoading(false); // Apapun yang terjadi, stop loading
      }
    };

    fetchData(); // Panggil fungsi saat komponen dimuat
  }, []); // [] = Jalankan sekali saat load

  // --- Sisa fungsi (layout, modal, navigasi) biarkan sama ---
  const handleSeeAllSejarah = () => console.log('Lihat Semua Sejarah');
  const handleSeeAllBudaya = () => console.log('Lihat Semua Budaya');

  const onHeaderLayout = event => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== headerHeight) {
      setHeaderHeight(height);
    }
  };

  const searchBarTopPosition = headerHeight > 0 ? headerHeight - 60 / 2 : -999;
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleQuickAction = actionId => {
    console.log('HomeScreen received action:', actionId);
    if (actionId === 'peta') {
      openModal();
    } else if (actionId === 'quiz') {
      navigation.navigate('QuizList');
    } else if (actionId === 'market') {
      navigation.navigate('MarketPlace');
    } else if (actionId === 'diskusi') {
      navigation.navigate('DiscussionChoice');
    } else {
      console.log('Navigate to feature:', actionId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A2F2F"
        translucent={false}
      />
      {/* --- 4. HEADER SEKARANG DINAMIS --- */}
      <Header
        userName={userName}
        level={userLevel}
        points={userPoints}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onLayout={onHeaderLayout}
        navigation={navigation} // <<< Pastikan 'navigation' dikirim ke Header jika Header punya tombol Logout/Drawer
      />

      {headerHeight > 0 && (
        <View
          style={[styles.searchBarContainer, { top: searchBarTopPosition }]}
        >
          <SearchBar onSearch={query => console.log('Search:', query)} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <QuickActions onActionPress={handleQuickAction} />

        <SectionHeader
          title="Materi Populer"
          onSeeAllPress={handleSeeAllSejarah}
        />

        {/* Logika Loading (Tetap sama) */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Memuat...</Text>
          </View>
        ) : (
          <HorizontalCardList
            data={materiData} // Data dari state
            onCardPress={item =>
              navigation.navigate('MateriDetail', { materiId: item.id })
            }
          />
        )}

        <SectionHeader
          title="Kebudayaan Daerah"
          onSeeAllPress={handleSeeAllBudaya}
        />
        <HorizontalCardList
          data={[]} // Kosongkan dulu
          onCardPress={item =>
            navigation.navigate('MateriDetail', { materiId: item.id })
          }
        />
      </ScrollView>
      <UnderDevelopmentModal isVisible={isModalVisible} onClose={closeModal} />
    </SafeAreaView>
  );
};

// --- STYLES (Tetap sama) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 130, // Sesuaikan angka ini jika header berubah tinggi
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
