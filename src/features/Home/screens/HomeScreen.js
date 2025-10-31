// src/features/Home/screens/HomeScreen.js
import React, {
  useState,
  useEffect,
  useCallback, // Pastikan ini di-import
} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  Alert,
} from 'react-native';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import SectionHeader from '../../../components/common/SectionHeader';
import HorizontalCardList from '../../../components/common/HorizontalCardList';
import UnderDevelopmentModal from '../../../components/common/UnderDevelopmentModal';

// --- IMPORT SUPABASE ---
import { supabase } from '../../../services/supabaseClient';

// --- Helper function untuk format data ---
// (Kita letakkan di luar komponen agar tidak dibuat ulang)
const formatMateriData = item => ({
  ...item,
  imageUrl: item.image_url,
});

const HomeScreen = ({ navigation }) => {
  // State untuk User
  const [userName, setUserName] = useState('Memuat...');
  const [userLevel, setUserLevel] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userId, setUserId] = useState(null);

  // State untuk UI
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- State untuk Data Materi (Sudah Dipecah) ---
  const [materiPopuler, setMateriPopuler] = useState([]);
  const [materiBudaya, setMateriBudaya] = useState([]);
  const [materiTokoh, setMateriTokoh] = useState([]);
  const [materiSejarahLain, setMateriSejarahLain] = useState([]);

  // State untuk Favorit
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // --- FUNGSI FETCH DATA UTAMA ---
  useEffect(() => {
    // Fungsi untuk memvalidasi hasil kueri
    const validateQueryResult = (result, name) => {
      // Abaikan error 406 untuk .single()
      if (result.error && result.status !== 406) {
        throw new Error(`Error ${name}: ${result.error.message}`);
      }
      return result.data;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(`User Error: ${userError.message}`);
        if (!user) throw new Error('User tidak ditemukan (session null)');

        setUserId(user.id); // Simpan user ID

        // --- Jalankan SEMUA kueri sekaligus ---
        const [
          profileResult,
          populerResult,
          budayaResult,
          tokohResult,
          sejarahLainResult,
          favoritesResult,
        ] = await Promise.all([
          // 1. Profile
          supabase
            .from('profiles')
            .select('username, level, points')
            .eq('id', user.id)
            .single(),
          // 2. Materi Populer (ID: Bebas, Urutkan berdasarkan 'likes')
          supabase
            .from('materi')
            .select('*')
            .order('likes', { ascending: false })
            .limit(10),
          // 3. Kebudayaan Daerah (ID: 2)
          supabase.from('materi').select('*').eq('category_id', 2).limit(10),
          // 4. Tokoh Nasional (ID: 3)
          supabase.from('materi').select('*').eq('category_id', 3).limit(10),
          // 5. Sejarah Lain (ID: 4)
          supabase.from('materi').select('*').eq('category_id', 4).limit(10),
          // 6. Favorit User
          supabase
            .from('user_favorites')
            .select('materi_id')
            .eq('user_id', user.id),
        ]);

        // --- Validasi dan proses data ---
        const profileData = validateQueryResult(profileResult, 'Profile');
        const populerData = validateQueryResult(
          populerResult,
          'Materi Populer',
        );
        const budayaData = validateQueryResult(budayaResult, 'Materi Budaya');
        const tokohData = validateQueryResult(tokohResult, 'Materi Tokoh');
        const sejarahLainData = validateQueryResult(
          sejarahLainResult,
          'Materi Sejarah Lain',
        );
        const favoritesData = validateQueryResult(
          favoritesResult,
          'User Favorites',
        );

        // Set state data
        if (profileData) {
          setUserName(profileData.username);
          setUserLevel(profileData.level || 1);
          setUserPoints(profileData.points || 0);
        }
        if (populerData) {
          setMateriPopuler(populerData.map(formatMateriData));
        }
        if (budayaData) {
          setMateriBudaya(budayaData.map(formatMateriData));
        }
        if (tokohData) {
          setMateriTokoh(tokohData.map(formatMateriData));
        }
        if (sejarahLainData) {
          setMateriSejarahLain(sejarahLainData.map(formatMateriData));
        }
        if (favoritesData) {
          const favSet = new Set(favoritesData.map(fav => fav.materi_id));
          setFavoriteIds(favSet);
        }
      } catch (error) {
        console.error('Error fetching data HomeScreen:', error.message);
        Alert.alert('Gagal Memuat Data', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // [] = Jalankan sekali saat load

  // --- FUNGSI FAVORIT ---
  const handleToggleFavorite = useCallback(
    async (materiId, isCurrentlyFavorite) => {
      if (!userId) return;

      const newFavoriteIds = new Set(favoriteIds);
      if (isCurrentlyFavorite) {
        newFavoriteIds.delete(materiId);
      } else {
        newFavoriteIds.add(materiId);
      }
      setFavoriteIds(newFavoriteIds);

      try {
        if (isCurrentlyFavorite) {
          const { error } = await supabase
            .from('user_favorites')
            .delete()
            .match({ user_id: userId, materi_id: materiId });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_favorites')
            .insert({ user_id: userId, materi_id: materiId });
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error toggling favorite:', error.message);
        setFavoriteIds(favoriteIds); // Rollback
        Alert.alert('Gagal', 'Gagal memperbarui favorit.');
      }
    },
    [userId, favoriteIds],
  );

  // --- Handlers untuk "See All" ---
  const handleSeeAllPopuler = () => console.log('Lihat Semua Materi Populer');
  const handleSeeAllBudaya = () => console.log('Lihat Semua Budaya');
  const handleSeeAllTokoh = () => console.log('Lihat Semua Tokoh Nasional');
  const handleSeeAllSejarahLain = () =>
    console.log('Lihat Semua Sejarah yg Tdk Diketahui');

  // --- Handlers untuk UI ---
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
    if (actionId === 'peta') openModal();
    else if (actionId === 'quiz') navigation.navigate('QuizList');
    else if (actionId === 'market') navigation.navigate('MarketPlace');
    else if (actionId === 'diskusi') navigation.navigate('DiscussionChoice');
  };

  // --- Fungsi Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A2F2F"
        translucent={false}
      />
      <Header
        userName={userName}
        level={userLevel}
        points={userPoints}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onLayout={onHeaderLayout}
        navigation={navigation}
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

        {/* --- 1. MATERI POPULER --- */}
        <SectionHeader
          title="Materi Populer"
          onSeeAllPress={handleSeeAllPopuler}
        />
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Memuat...</Text>
          </View>
        ) : (
          <HorizontalCardList
            data={materiPopuler}
            onCardPress={item =>
              navigation.navigate('MateriDetail', { materiId: item.id })
            }
            favoriteMateriIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* --- 2. KEBUDAYAAN DAERAH (ID: 2) --- */}
        <SectionHeader
          title="Kebudayaan Daerah"
          onSeeAllPress={handleSeeAllBudaya}
        />
        <HorizontalCardList
          data={materiBudaya}
          onCardPress={item =>
            navigation.navigate('MateriDetail', { materiId: item.id })
          }
          favoriteMateriIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* --- 3. TOKOH NASIONAL (ID: 3) --- */}
        <SectionHeader
          title="Tokoh Nasional"
          onSeeAllPress={handleSeeAllTokoh}
        />
        <HorizontalCardList
          data={materiTokoh}
          onCardPress={item =>
            navigation.navigate('MateriDetail', { materiId: item.id })
          }
          favoriteMateriIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* --- 4. SEJARAH YANG TIDAK DIKETAHUI (ID: 4) --- */}
        <SectionHeader
          title="Sejarah yang Tidak Diketahui"
          onSeeAllPress={handleSeeAllSejarahLain}
        />
        <HorizontalCardList
          data={materiSejarahLain}
          onCardPress={item =>
            navigation.navigate('MateriDetail', { materiId: item.id })
          }
          favoriteMateriIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
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
