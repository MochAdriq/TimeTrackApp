// src/features/Discussion/screens/MyChatListScreen.js
import React, { useState, useEffect, useCallback } from 'react'; // <<< TAMBAHKAN useCallback
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

import ChatListItem from '../components/ChatListItem';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
// ... (import swipeable lainnya)
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableRow from '../components/SwipeableRow';

const MyChatListScreen = ({ navigation }) => {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const fetchMyChats = useCallback(async () => {
    // Cek jika tidak sedang loading, baru set loading (mencegah double load)
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User tidak login');

      const { data, error } = await supabase
        .from('chat_room_members')
        .select('chat_rooms(*)')
        .eq('user_id', user.id)
        .order('last_message_time', {
          referencedTable: 'chat_rooms',
          ascending: false,
          nullsFirst: false,
        });

      if (error) {
        throw error;
      }

      const rooms = data
        .map(item => item.chat_rooms)
        .filter(room => room != null);

      setChatList(rooms);
    } catch (error) {
      showError('Gagal Memuat Chat Anda', error.message);
      setChatList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLeaveGroup = async chatItem => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User tidak login');

      // Hapus keanggotaan user dari tabel chat_room_members
      // Sesuai skema database: public.chat_room_members
      const { error: deleteError } = await supabase
        .from('chat_room_members')
        .delete()
        .match({ user_id: user.id, room_id: chatItem.id }); // Hapus baris yang cocok

      if (deleteError) {
        throw deleteError;
      }

      // Update state secara lokal agar UI langsung berubah
      setChatList(prevChatList =>
        prevChatList.filter(item => item.id !== chatItem.id),
      );
    } catch (error) {
      showError('Gagal Keluar Grup', error.message);
    }
  };

  // Ambil data saat layar ini dibuka/difokuskan
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyChats();
    });
    return unsubscribe;
  }, [navigation, fetchMyChats]);

  useEffect(() => {
    // 1. Tentukan channel yang ingin didengarkan
    // Kita mendengarkan SEMUA perubahan di tabel 'chat_rooms'
    const channel = supabase
      .channel('public:chat_rooms')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Hanya peduli saat ada UPDATE
          schema: 'public',
          table: 'chat_rooms',
        },
        payload => {
          // 2. Saat ada UPDATE (karena trigger pesan baru),
          // kita panggil ulang fetchMyChats untuk mengambil data terbaru
          // dan mengurutkannya.
          console.log('Perubahan terdeteksi di chat_rooms, fetching ulang...');
          fetchMyChats();
        },
      )
      .subscribe(); // 3. Jangan lupa 'unsubscribe' saat komponen dilepas (unmount)

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMyChats]);

  // Logika saat item chat di-klik
  const handleChatItemPress = chatItem => {
    navigation.navigate('ChatScreen', {
      chatId: chatItem.id,
      chatName: chatItem.title,
      chatAvatarUrl: chatItem.avatar_url,
      // Bedakan tipe chat (group/1-on-1) berdasarkan kolom 'type'
      isGroupChat: chatItem.type === 'community',
    });
  };

  // Gunakan komponen ChatListItem yang sudah ada
  const renderItem = ({ item }) => {
    // Tentukan apakah swipe bisa diaktifkan
    const isCommunityGroup = item.type === 'community';

    return (
      <SwipeableRow
        isEnabled={isCommunityGroup} // Hanya aktifkan geser untuk 'community'
        onLeavePress={() => handleLeaveGroup(item)} // Fungsi yang dipanggil saat tombol 'Keluar' ditekan
      >
        {/* Ini adalah children yang akan ditampilkan */}
        <ChatListItem
          name={item.title}
          lastMessage={item.last_message || item.description || '...'}
          time={
            item.last_message_time
              ? new Date(item.last_message_time).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''
          }
          avatarUrl={item.avatar_url}
          onPress={() => handleChatItemPress(item)}
        />
      </SwipeableRow>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Text style={styles.headerTitle}>Daftar Chat Saya</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tampilkan Loading atau Daftar */}
        {loading && chatList.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A453C" />
          </View>
        ) : (
          <FlatList
            data={chatList}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onRefresh={fetchMyChats} // Aktifkan pull-to-refresh
            refreshing={loading}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Belum Ada Chat Aktif.</Text>
                  <Text style={styles.emptySubText}>
                    Mulai percakapan di 'Tanya Ahli' atau 'Grup Komunitas'.
                  </Text>
                </View>
              )
            }
          />
        )}

        {/* Modal Error */}
        <InfoModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Kita bisa gunakan style yang mirip dengan AskExpertListScreen
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
});

export default MyChatListScreen;
