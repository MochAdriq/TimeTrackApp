import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import SectionHeader from '../../../components/common/SectionHeader';
import HorizontalCardList from '../../../components/common/HorizontalCardList';
import UnderDevelopmentModal from '../../../components/common/UnderDevelopmentModal';

import { supabase } from '../../../services/supabaseClient';
import { useNotification } from '../../../context/NotificationContext';
import { useProfile } from '../../../context/ProfileContext';

// --- (Fungsi formatMateriData dan filterMateri tetap sama) ---
const formatMateriData = item => ({
  ...item,
  imageUrl: item.image_url,
});

const filterMateri = (data, query) => {
  if (!query) {
    return data;
  }
  const lowerCaseQuery = query.toLowerCase();
  return data.filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
};
// --- (Batas Fungsi) ---

const HomeScreen = ({ navigation }) => {
  const { fetchProfile } = useProfile();
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
  const [refreshing, setRefreshing] = useState(false);
  const { fetchUnreadCount } = useNotification();

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) {
        setLoading(true);
      }
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(`User Error: ${userError.message}`);
        if (!user) throw new Error('User tidak ditemukan (session null)');

        if (!userId) {
          setUserId(user.id);
        }

        const [
          populerResult,
          budayaResult,
          tokohResult,
          sejarahLainResult,
          favoritesResult,
        ] = await Promise.all([
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

        const validateQueryResult = (result, name) => {
          if (result.error && result.status !== 406) {
            throw new Error(`Error ${name}: ${result.error.message}`);
          }
          return result.data;
        };

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
        if (!isRefresh) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
    fetchUnreadCount();
    fetchProfile(true);
  }, [fetchData, fetchUnreadCount, fetchProfile]);

  const handleToggleFavorite = useCallback(
    async (materiId, isCurrentlyFavorite) => {
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'Anda harus login untuk menyukai materi.');
          return;
        }
        currentUserId = user.id;
        setUserId(currentUserId);
      }

      const newFavoriteIds = new Set(favoriteIds);
      if (isCurrentlyFavorite) {
        newFavoriteIds.delete(materiId);
      } else {
        newFavoriteIds.add(materiId);
      }
      setFavoriteIds(newFavoriteIds); // Supabase update

      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: currentUserId, materi_id: materiId });
        if (error) {
          Alert.alert('Error', error.message);
          newFavoriteIds.add(materiId);
          setFavoriteIds(newFavoriteIds);
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: currentUserId, materi_id: materiId });
        if (error) {
          Alert.alert('Error', error.message);
          newFavoriteIds.delete(materiId);
          setFavoriteIds(newFavoriteIds);
        }
      }
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

  // --- (INI PERBAIKANNYA) ---
  const handleSeeAllPopuler = () =>
    navigation.navigate('MateriList', {
      title: 'Materi Populer',
      filterType: 'popular', // Kirim 'popular'
    });
  const handleSeeAllBudaya = () =>
    navigation.navigate('MateriList', {
      title: 'Kebudayaan Daerah',
      filterType: 'category', // Kirim 'category'
      filterValue: 2, // ID Kategori Budaya
    });
  const handleSeeAllTokoh = () =>
    navigation.navigate('MateriList', {
      title: 'Tokoh Nasional',
      filterType: 'category',
      filterValue: 3, // ID Kategori Tokoh
    });
  const handleSeeAllSejarahLain = () =>
    navigation.navigate('MateriList', {
      title: 'Sejarah yang Tidak Diketahui',
      filterType: 'category',
      filterValue: 4, // ID Kategori Sejarah Lain
    });
  // --- (BATAS PERBAIKAN) ---

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A2F2F"
        translucent={false}
      />
      <Header
        onNotificationPress={() => navigation.navigate('Notifications')}
        onLayout={onHeaderLayout}
      />
      {headerHeight > 0 && (
        <View
          style={[styles.searchBarContainer, { top: searchBarTopPosition }]}
        >
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A453C']}
            tintColor={'#6A453C'}
          />
        }
      >
        <QuickActions onActionPress={handleQuickAction} />

        <SectionHeader
          title="Materi Populer"
          onSeeAllPress={handleSeeAllPopuler}
        />

        {loading && !refreshing ? (
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

// --- (Styles tetap sama) ---
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
    paddingTop: 40,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 130,
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
