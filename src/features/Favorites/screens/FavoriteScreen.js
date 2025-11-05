// src/features/Favorites/screens/FavoriteScreen.js

// --- MODIFIKASI 1: Import useMemo dan SearchBar ---
import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import FavoriteItem from '../components/FavoriteItem';
import FavoriteHeader from '../components/FavoriteHeader';
import FavoriteInfo from '../components/FavoriteInfo';
// Import SearchBar dari folder Home
import SearchBar from '../../Home/components/SearchBar';

// --- MODIFIKASI 2: Pindahkan logika filter ke LUAR komponen ---
// Ini adalah "pure function" dan memperbaiki error ESLint "exhaustive-deps".
const filterMateri = (data, query) => {
  if (!query) {
    return data;
  }
  const lowerCaseQuery = query.toLowerCase();
  return data.filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
};

const FavoriteScreen = ({ navigation }) => {
  // --- State (favorites, profile, loading, modalInfo) tetap sama ---
  const [favorites, setFavorites] = useState([]); // Ini adalah master list
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalInfo, setModalInfo] = useState({ visible: false, message: '' });

  // --- MODIFIKASI 3: Tambahkan state untuk search ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- useFocusEffect (Tidak diubah) ---
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          // ... (Logika fetch data Anda sudah benar) ...
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
          if (authError || !user)
            throw authError || new Error('User not found');

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
        }
      };
      fetchData();
    }, []),
  );

  // --- handleItemPress (Tidak diubah, sudah benar navigasi ke MateriDetail) ---
  const handleItemPress = item => {
    navigation.navigate('MateriDetail', {
      materiId: item.id,
      materiTitle: item.title,
    });
  };

  // --- MODIFIKASI 4: Buat state turunan untuk data yang difilter ---
  const filteredFavorites = useMemo(
    () => filterMateri(favorites, searchQuery),
    [searchQuery, favorites],
  );

  const renderItem = ({ item }) => (
    <FavoriteItem item={item} onPress={() => handleItemPress(item)} />
  );

  // --- MODIFIKASI 5: Buat ListEmptyComponent lebih dinamis ---
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

  // --- Tampilan Loading (Tidak diubah) ---
  if (loading && !profile) {
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

      {/* MODIFIKASI 6: Update FlatList */}
      <FlatList
        data={filteredFavorites} // <-- Gunakan data yang difilter
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
            {/* Tambahkan SearchBar di sini */}
            <View style={styles.searchBarWrapper}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyList}
      />

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

// --- MODIFIKASI 7: Tambahkan style untuk searchBarWrapper ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
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
    marginTop: 10, // Beri jarak dari FavoriteInfo
    marginBottom: 10, // Beri jarak ke item pertama
  },
});

export default FavoriteScreen;
