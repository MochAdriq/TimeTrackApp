// src/features/Home/screens/HomeScreen.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo, // Sudah benar di-import
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
const formatMateriData = item => ({
  ...item,
  imageUrl: item.image_url,
});

// --- MODIFIKASI 1: Logika filter dipindah ke luar komponen ---
// Ini adalah "pure function" dan memperbaiki error ESLint "exhaustive-deps".
const filterMateri = (data, query) => {
  // Jika search query kosong, kembalikan semua data
  if (!query) {
    return data;
  }
  // Jika ada query, filter data berdasarkan judul
  const lowerCaseQuery = query.toLowerCase();
  return data.filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
};

const HomeScreen = ({ navigation }) => {
  // --- Semua state Anda di sini sudah benar ---
  const [userName, setUserName] = useState('Memuat...');
  const [userLevel, setUserLevel] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userId, setUserId] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materiPopuler, setMateriPopuler] = useState([]);
  const [materiBudaya, setMateriBudaya] = useState([]);
  const [materiTokoh, setMateriTokoh] = useState([]);
  const [materiSejarahLain, setMateriSejarahLain] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // --- FUNGSI FETCH DATA UTAMA (Tidak diubah) ---
  useEffect(() => {
    // ... (Semua logika fetch data Anda di sini sudah benar) ...
    const validateQueryResult = (result, name) => {
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
        setUserId(user.id);

        const [
          profileResult,
          populerResult,
          budayaResult,
          tokohResult,
          sejarahLainResult,
          favoritesResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, level, points')
            .eq('id', user.id)
            .single(),
          supabase
            .from('materi')
            .select('*')
            .order('likes', { ascending: false })
            .limit(10),
          supabase.from('materi').select('*').eq('category_id', 2).limit(10),
          supabase.from('materi').select('*').eq('category_id', 3).limit(10),
          supabase.from('materi').select('*').eq('category_id', 4).limit(10),
          supabase
            .from('user_favorites')
            .select('materi_id')
            .eq('user_id', user.id),
        ]);

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

        if (profileData) {
          setUserName(profileData.username);
          setUserLevel(profileData.level || 1);
          setUserPoints(profileData.points || 0);
        }
        if (populerData) setMateriPopuler(populerData.map(formatMateriData));
        if (budayaData) setMateriBudaya(budayaData.map(formatMateriData));
        if (tokohData) setMateriTokoh(tokohData.map(formatMateriData));
        if (sejarahLainData)
          setMateriSejarahLain(sejarahLainData.map(formatMateriData));
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
  }, []);

  // --- FUNGSI FAVORIT (Tidak diubah) ---
  const handleToggleFavorite = useCallback(
    async (materiId, isCurrentlyFavorite) => {
      // ... (Logika favorit Anda di sini sudah benar) ...
    },
    [userId, favoriteIds],
  );

  const filteredMateriPopuler = useMemo(
    () => filterMateri(materiPopuler, searchQuery),
    [searchQuery, materiPopuler],
  );
  const filteredMateriBudaya = useMemo(
    () => filterMateri(materiBudaya, searchQuery),
    [searchQuery, materiBudaya],
  );
  const filteredMateriTokoh = useMemo(
    () => filterMateri(materiTokoh, searchQuery),
    [searchQuery, materiTokoh],
  );
  const filteredMateriSejarahLain = useMemo(
    () => filterMateri(materiSejarahLain, searchQuery),
    [searchQuery, materiSejarahLain],
  );

  // --- Handlers (Tidak diubah) ---
  const handleSeeAllPopuler = () => console.log('Lihat Semua Materi Populer');
  const handleSeeAllBudaya = () => console.log('Lihat Semua Budaya');
  const handleSeeAllTokoh = () => console.log('Lihat Semua Tokoh Nasional');
  const handleSeeAllSejarahLain = () =>
    console.log('Lihat Semua Sejarah yg Tdk Diketahui');
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
        onNotificationPress={() => navigation.navigate('DeveloperScreen')}
        onLayout={onHeaderLayout}
        navigation={navigation}
      />

      {headerHeight > 0 && (
        <View
          style={[styles.searchBarContainer, { top: searchBarTopPosition }]}
        >
          {/* --- MODIFIKASI 3: Hubungkan SearchBar ke state --- */}
          {/* Ini akan memperbaiki error ESLint "no-unused-vars" */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <QuickActions onActionPress={handleQuickAction} />

        {/* --- MODIFIKASI 4: Gunakan variabel yang sudah difilter --- */}
        {/* Ini juga memperbaiki error ESLint "no-unused-vars" */}

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
            data={filteredMateriPopuler}
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
          data={filteredMateriBudaya}
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
          data={filteredMateriTokoh}
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
          data={filteredMateriSejarahLain}
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

// --- MODIFIKASI 5: Penyesuaian Style ---
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
    paddingTop: 40, // Ditambah dari 20, agar ada ruang untuk SearchBar
  },
  searchBarContainer: {
    position: 'absolute',
    top: 130, // Angka ini dari kode asli Anda
    left: 0,
    right: 0,
    zIndex: 10,
    // paddingHorizontal: 15, // Ditambah agar searchbar tidak mepet
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
