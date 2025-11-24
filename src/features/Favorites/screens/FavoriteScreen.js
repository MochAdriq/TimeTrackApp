// src/features/Favorites/screens/FavoriteScreen.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import FavoriteItem from '../components/FavoriteItem';
import FavoriteHeader from '../components/FavoriteHeader';
import FavoriteInfo from '../components/FavoriteInfo';
import SearchBar from '../../Home/components/SearchBar';
import { useProfile } from '../../../context/ProfileContext';

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
  const [loading, setLoading] = useState(true); // <<< UBAH KEMBALI ke true
  const [modalInfo, setModalInfo] = useState({ visible: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { profile: contextProfile, loading: contextLoading } = useProfile();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  // --- (PERBAIKAN 1) Dependency Array (Stale Closure Bug Fix) ---
  // Kita harus daftarkan semua 'setter' yang digunakan di dalam
  // agar fungsi ini di-rebuild dengan benar.
  const fetchData = useCallback(
    async (isRefresh = false) => {
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
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setFavorites, setProfile, setModalInfo, setLoading, setRefreshing],
  ); // <<< INI PERBAIKANNYA
  // --- (BATAS PERBAIKAN 1) ---

  // --- (PERBAIKAN 2) Logika Premium Gate Diperbaiki ---
  useFocusEffect(
    useCallback(() => {
      // 1. Tunggu sampai context profile SELESAI loading
      if (contextLoading) {
        setLoading(true); // Tampilkan spinner fullscreen saat context loading
        setPremiumModalVisible(false); // Sembunyikan modal (jika ada)
        return; // Belum siap, tunggu re-render
      }

      // 2. Context sudah selesai loading.
      //    SEKARANG baru kita hitung status premium dari data FRESH
      const isUserPremium = contextProfile?.plan === 'premium';

      if (!isUserPremium) {
        // 3. JIKA BUKAN: Tampilkan modal premium
        setPremiumModalVisible(true);
        setLoading(false); // Matikan loader fullscreen
        setRefreshing(false);
        setFavorites([]);
        setProfile(null);
      } else {
        // 4. JIKA IYA: User premium, ambil data favoritnya
        setPremiumModalVisible(false);
        fetchData(false);
      }
    }, [contextLoading, contextProfile, fetchData]), // <<< Dependencies diperbarui
  );
  // --- (BATAS PERBAIKAN 2) ---

  const onRefresh = useCallback(() => {
    // Cek status premium dari context TERBARU
    const isUserPremium = contextProfile?.plan === 'premium';
    if (isUserPremium) {
      setRefreshing(true);
      fetchData(true);
    }
  }, [fetchData, contextProfile]); // <<< Tambah dependency contextProfile

  const handleGoToPremium = () => {
    setPremiumModalVisible(false);
    navigation.navigate('Premium');
  };

  const handleGoToJelajah = () => {
    setPremiumModalVisible(false);
    navigation.navigate('MainApp', {
      screen: 'MainTabs',
      params: { screen: 'Jelajah' },
    });
  };

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

  // --- (PERBAIKAN 3) Logika Loading ---
  // Tampilkan loader jika context loading ATAU jika fetchData loading
  if ((loading || contextLoading) && !refreshing) {
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

  // (PERBAIKAN 4) Hitung isPremium TEPAT sebelum render
  const isPremiumForRender = contextProfile?.plan === 'premium';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FavoriteHeader navigation={navigation} title="Favorit Saya" />

      <FlatList
        data={filteredFavorites}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          isPremiumForRender &&
          !loading && (
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
          )
        }
        ListEmptyComponent={isPremiumForRender ? renderEmptyList : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A453C']}
            tintColor={'#6A453C'}
            enabled={isPremiumForRender}
          />
        }
      />

      {/* Modal untuk Error Fetching */}
      <InfoModal
        isVisible={modalInfo.visible}
        title="Error"
        message={modalInfo.message}
        modalType="error"
        onClose={() => setModalInfo({ visible: false, message: '' })}
      />

      {/* Modal Premium Gate */}
      <InfoModal
        isVisible={premiumModalVisible}
        title="Fitur Premium"
        message="Halaman Favorit hanya bisa diakses oleh pengguna Premium. Upgrade akun Anda untuk lanjut."
        modalType="info"
        onClose={handleGoToJelajah}
        confirmText="Upgrade"
        onConfirm={handleGoToPremium}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1,
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
