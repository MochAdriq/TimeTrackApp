// src/features/Discussion/screens/PremiumGroupListScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';

import GroupChatListItem from './GroupChatListItem';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

const PremiumGroupListScreen = ({ navigation }) => {
  const [groupList, setGroupList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- (PERBAIKAN 1) Modifikasi Query ---
  const fetchGroupList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'community') // Tipe tetap 'community'
        .eq('is_premium', true) // <-- HANYA AMBIL GRUP PREMIUM
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGroupList(data || []);
    } catch (error) {
      showError('Gagal Memuat Grup', error.message);
      setGroupList([]);
    } finally {
      setLoading(false);
    }
  };
  // --- (BATAS PERBAIKAN 1) ---

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroupList();
    });
    return unsubscribe;
  }, [navigation]);

  // (Logika handleGroupItemPress tidak berubah)
  const handleGroupItemPress = async groupItem => {
    if (joiningRoom) return;
    setJoiningRoom(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User tidak ditemukan');

      const { error: joinError } = await supabase
        .from('chat_room_members')
        .upsert(
          { room_id: groupItem.id, user_id: user.id },
          {
            onConflict: 'room_id, user_id',
            ignoreDuplicates: true,
          },
        );

      if (joinError) {
        throw joinError;
      }

      navigation.navigate('ChatScreen', {
        chatId: groupItem.id,
        chatName: groupItem.title,
        chatAvatarUrl: groupItem.avatar_url,
        isGroupChat: true,
      });
    } catch (error) {
      showError('Gagal Masuk Grup', error.message);
    } finally {
      setJoiningRoom(false);
    }
  };

  const renderItem = ({ item }) => (
    <GroupChatListItem
      name={item.title}
      description={item.description}
      iconUrl={item.avatar_url}
      onPress={() => handleGroupItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        {/* --- (PERBAIKAN 2) Ganti Judul --- */}
        <Text style={styles.headerTitle}>Grup Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && groupList.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      ) : (
        <FlatList
          data={groupList}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchGroupList}
          refreshing={loading}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                {/* --- (PERBAIKAN 3) Ganti Teks Empty --- */}
                <Text style={styles.emptyText}>Belum Ada Grup Premium.</Text>
                <Text style={styles.emptySubText}>
                  Grup eksklusif akan segera hadir di sini.
                </Text>
              </View>
            )
          }
        />
      )}

      {/* --- (PERBAIKAN 4) Hapus Tombol FAB (Tombol +) --- */}
      {/* Tombol FAB dihapus dari sini */}
      {/* --- (BATAS PERBAIKAN 4) --- */}

      <Modal isVisible={joiningRoom} style={styles.joiningModal}>
        <View style={styles.joiningContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
          <Text style={styles.joiningText}>Masuk ke Grup...</Text>
        </View>
      </Modal>

      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0EBE3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
  // Tombol FAB dihapus dari style
  joiningModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  joiningContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  joiningText: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
  },
});

export default PremiumGroupListScreen;
