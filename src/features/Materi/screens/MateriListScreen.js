import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
// Kita gunakan ulang komponen item dari modul Favorit
import FavoriteItem from '../../Favorites/components/FavoriteItem';

const MateriListScreen = ({ route, navigation }) => {
  // Ambil parameter dari HomeScreen
  const { title, filterType, filterValue } = route.params || {
    title: 'Materi',
    filterType: 'all',
  };

  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInfo, setModalInfo] = useState({ visible: false, message: '' });

  useFocusEffect(
    useCallback(() => {
      const fetchMateri = async () => {
        setLoading(true);
        try {
          let query = supabase.from('materi').select('*, categories ( name )'); // Ambil data materi

          // Bangun query secara dinamis berdasarkan parameter
          if (filterType === 'popular') {
            query = query.order('likes', { ascending: false });
          } else if (filterType === 'category' && filterValue) {
            query = query.eq('category_id', filterValue);
          }
          // (Jika 'all', tidak perlu filter tambahan)

          query = query.limit(50); // Batasi 50 hasil

          const { data, error } = await query;
          if (error) throw error;

          setMateriList(data || []);
        } catch (error) {
          setModalInfo({ visible: true, message: error.message });
        } finally {
          setLoading(false);
        }
      };
      fetchMateri();
    }, [filterType, filterValue]),
  );

  const handleItemPress = item => {
    navigation.navigate('MateriDetail', {
      materiId: item.id,
      materiTitle: item.title,
    });
  };

  const renderItem = ({ item }) => (
    // Kita gunakan ulang FavoriteItem.js
    // karena UI-nya cocok
    <FavoriteItem item={item} onPress={() => handleItemPress(item)} />
  );

  const renderEmptyList = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>Belum ada materi di kategori ini.</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={materiList}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5, width: 40 },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default MateriListScreen;
