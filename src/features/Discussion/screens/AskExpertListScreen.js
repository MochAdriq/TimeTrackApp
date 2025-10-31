// src/features/Discussion/screens/AskExpertListScreen.js
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

import ChatListItem from '../components/ChatListItem';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

const AskExpertListScreen = ({ navigation }) => {
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

  const fetchExpertList = async () => {
    setLoading(true);
    try {
      // <<< INI KUNCI-nya >>>
      // Sekarang query ini akan berhasil karena kolom 'type' sudah ada
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'expert') // <<< Filter hanya untuk 'expert'
        .order('last_message_time', { ascending: false, nullsFirst: false });

      if (error) {
        throw error;
      }

      setChatList(data || []);
    } catch (error) {
      showError('Gagal Memuat Daftar Ahli', error.message);
      setChatList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil data saat fokus ke layar (agar bisa refresh saat kembali)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExpertList();
    });
    return unsubscribe;
  }, [navigation]);

  const handleChatItemPress = chatItem => {
    navigation.navigate('ChatScreen', {
      chatId: chatItem.id,
      chatName: chatItem.title,
      chatAvatarUrl: chatItem.avatar_url,
    });
  };

  // --- Sesuaikan renderItem ---
  const renderItem = ({ item }) => (
    <ChatListItem
      name={item.title}
      lastMessage={item.last_message || item.description || '...'}
      // Format waktu (opsional, tapi lebih baik)
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
        <Text style={styles.headerTitle}>Tanya Ahli</Text>
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
          onRefresh={fetchExpertList}
          refreshing={loading}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada ahli tersedia.</Text>
                <Text style={styles.emptySubText}>
                  Tim kami sedang bekerja untuk menambahkan ahli baru.
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
});

export default AskExpertListScreen;
