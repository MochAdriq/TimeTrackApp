// src/features/Discussion/screens/CommunityGroupListScreen.js
import React, { useState, useEffect } from 'react'; // <<< 1. Import hooks
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator, // <<< 2. Import
} from 'react-native';
import Modal from 'react-native-modal'; // <<< 3. Import Modal (untuk loading)

import GroupChatListItem from './GroupChatListItem'; // Ganti nama komponen
import { supabase } from '../../../services/supabaseClient'; // <<< 4. Import Supabase
import InfoModal from '../../../components/common/InfoModal'; // <<< 5. Import Modal Error

// --- Hapus Data Dummy ---

const CommunityGroupListScreen = ({ navigation }) => {
  // --- 6. Tambahkan State ---
  const [groupList, setGroupList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState(false); // State loading saat join
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- 7. Fungsi showError ---
  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- 8. Fungsi Fetch Data ---
  const fetchGroupList = async () => {
    setLoading(true);
    try {
      // Ambil data room yang tipenya 'community'
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'community') // <<< Filter hanya 'community'
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

  // --- 9. Panggil fetch saat komponen fokus ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroupList();
    });
    return unsubscribe;
  }, [navigation]);

  // --- 10. Logika KUNCI: Join Grup saat ditekan ---
  const handleGroupItemPress = async groupItem => {
    if (joiningRoom) return; // Cegah klik ganda
    setJoiningRoom(true);

    try {
      // 1. Ambil ID user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User tidak ditemukan');

      // 2. Daftarkan user ke chat_room_members
      // Jika sudah ada (konflik), jangan lakukan apa-apa (ignore)
      const { error: joinError } = await supabase
        .from('chat_room_members')
        .upsert(
          { room_id: groupItem.id, user_id: user.id },
          {
            onConflict: 'room_id, user_id', // <<< Tentukan kolom yang unik
            ignoreDuplicates: true, // <<< Ini pengganti .ignore()
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
      name={item.title} // <<< Gunakan 'title'
      description={item.description} // <<< Gunakan 'description'
      iconUrl={item.avatar_url} // <<< Gunakan 'avatar_url'
      onPress={() => handleGroupItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grup Komunitas</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && groupList.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      ) : (
        <FlatList
          data={groupList} // <<< Gunakan data dari state
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchGroupList} // <<< Tambah refresh
          refreshing={loading}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada grup tersedia.</Text>
                <Text style={styles.emptySubText}>
                  Jadilah yang pertama membuat grup!
                </Text>
              </View>
            )
          }
        />
      )}

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
  // --- Style untuk Modal "Joining" ---
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

export default CommunityGroupListScreen;
