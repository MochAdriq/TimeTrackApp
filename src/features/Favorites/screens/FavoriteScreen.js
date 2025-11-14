// src/features/Favorites/screens/FavoriteScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  RefreshControl, // <<< 1. Import RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import FavoriteItem from '../components/FavoriteItem';
import FavoriteHeader from '../components/FavoriteHeader';
import FavoriteInfo from '../components/FavoriteInfo';
import SearchBar from '../../Home/components/SearchBar';

const filterMateri = (data, query) => {
  if (!query) {
    return data;
  }
  const lowerCaseQuery = query.toLowerCase();
  return data.filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
};

const FavoriteScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalInfo, setModalInfo] = useState({ visible: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false); // <<< 2. Tambah state refreshing

  // --- (PERBAIKAN) Ekstrak fetchData ---
  const fetchData = useCallback(async (isRefresh = false) => {
    // Hanya tampilkan loader fullscreen jika BUKAN refresh
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('User not found');

      const [favoritesResponse, profileResponse] = await Promise.all([
        supabase
          .from('user_favorites')
          .select('materi ( *, categories ( name ) )')
          .eq('user_id', user.id),
        supabase
          .from('profiles')
          .select('full_name, level, points')
          .eq('id', user.id)
          .single(),
      ]);

      if (favoritesResponse.error) throw favoritesResponse.error;
      if (profileResponse.error) throw profileResponse.error;

      setFavorites(favoritesResponse.data.map(fav => fav.materi));
      setProfile(profileResponse.data);
    } catch (error) {
      setModalInfo({ visible: true, message: error.message });
    } finally {
      // Selalu matikan kedua loader
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // <<< 3. Tambahkan dependency array kosong
  // --- (BATAS PERBAIKAN) ---

  // --- (PERBAIKAN) Panggil fetchData dengan benar ---
  useFocusEffect(
    useCallback(() => {
      fetchData(false); // 'false' berarti ini loading awal
    }, [fetchData]), // <<< 4. Tambahkan fetchData sebagai dependency
  );

  // --- (FITUR BARU) Fungsi onRefresh ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true); // 'true' berarti ini adalah refresh
  }, [fetchData]); // <<< 5. Tambahkan fetchData sebagai dependency
  // ---

  const handleItemPress = item => {
    navigation.navigate('MateriDetail', {
      materiId: item.id,
      materiTitle: item.title,
    });
  };

  const filteredFavorites = useMemo(
    () => filterMateri(favorites, searchQuery),
    [searchQuery, favorites],
  );

  const renderItem = ({ item }) => (
    <FavoriteItem item={item} onPress={() => handleItemPress(item)} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Favorit'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Coba gunakan kata kunci pencarian yang lain.'
          : 'Anda bisa menambahkan materi ke favorit dari halaman Jelajah.'}
      </Text>
    </View>
  );

  // --- (PERBAIKAN) Logika Loading ---
  // Tampilkan loader HANYA jika loading awal, BUKAN saat refresh
  if (loading && !profile && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <FavoriteHeader navigation={navigation} title="Favorit Saya" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FavoriteHeader navigation={navigation} title="Favorit Saya" />

      {/* --- (PERBAIKAN) Tambahkan RefreshControl ke FlatList --- */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <FavoriteInfo
              userName={profile?.full_name || 'Pengguna'}
              level={profile?.level || 1}
              points={profile?.points || 0}
            />
            <View style={styles.searchBarWrapper}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyList}
        // --- (INI KODENYA) ---
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A453C']} // Warna spinner (Android)
            tintColor={'#6A453C'} // Warna spinner (iOS)
          />
        }
        // ---
      />
      {/* --- (BATAS PERBAIKAN) --- */}

      <InfoModal
        visible={modalInfo.visible}
        title="Error"
        message={modalInfo.message}
        type="error"
        onClose={() => setModalInfo({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
};

// --- (STYLES tidak berubah) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1, // <<< Pastikan ini ada agar refresh control jalan walau list kosong
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  searchBarWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default FavoriteScreen;
