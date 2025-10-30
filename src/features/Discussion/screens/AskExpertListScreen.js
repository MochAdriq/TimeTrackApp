// src/features/Discussion/screens/AskExpertListScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList, // Gunakan FlatList untuk daftar
} from 'react-native';

// Impor komponen item list
import ChatListItem from '../components/ChatListItem';

// --- Data Dummy (Ganti dengan data asli dari API/Supabase nanti) ---
const dummyExpertChats = [
  {
    id: 'expert1',
    name: 'Prof. Budi Sejarawan',
    lastMessage: 'Baik, akan saya jelaskan mengenai...',
    time: '10:05',
    avatarUrl: 'https://via.placeholder.com/50/8B5E3C/FFFFFF?text=BS',
  },
  {
    id: 'expert2',
    name: 'Dr. Siti Arkeolog',
    lastMessage: 'Penemuan terbaru menunjukkan...',
    time: 'Kemarin',
    avatarUrl: 'https://via.placeholder.com/50/6A453C/FFFFFF?text=SA',
  },
  {
    id: 'expert3',
    name: 'Tim Ahli TimeTrack', // Contoh chat grup ahli
    lastMessage: 'Silakan ajukan pertanyaan Anda di sini.',
    time: '2 hari lalu',
    avatarUrl: 'https://via.placeholder.com/50/E3D5B8/6A453C?text=TA',
  },
  // Tambahkan chat lain atau daftar ahli jika belum ada chat
];
// ------------------------------------------------------------------

const AskExpertListScreen = ({ navigation }) => {
  const handleChatItemPress = chatItem => {
    console.log('Buka chat dengan:', chatItem.name);
    // <<< UBAH NAVIGASI DI SINI >>>
    navigation.navigate('ChatScreen', {
      chatId: chatItem.id,
      chatName: chatItem.name,
      chatAvatarUrl: chatItem.avatarUrl, // Kirim URL avatar juga
    });
  };

  const renderItem = ({ item }) => (
    <ChatListItem
      name={item.name}
      lastMessage={item.lastMessage}
      time={item.time}
      avatarUrl={item.avatarUrl}
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
        {/* Bisa tambahkan ikon search atau tambah chat baru di kanan jika perlu */}
        <View style={{ width: 40 }} />
      </View>

      {/* Daftar Chat */}
      <FlatList
        data={dummyExpertChats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        // Tampilkan pesan jika daftar kosong (opsional)
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada percakapan.</Text>
            <Text style={styles.emptySubText}>
              Mulai percakapan baru dengan ahli kami!
            </Text>
            {/* Bisa tambahkan tombol 'Mulai Chat Baru' di sini */}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0EBE3', // Background sedikit krem/abu
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Coklat header
  },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  list: {
    flex: 1, // Agar list mengisi sisa layar
  },
  listContent: {
    paddingTop: 10, // Jarak dari header
    paddingHorizontal: 10, // Padding samping list
    paddingBottom: 20,
  },
  emptyContainer: {
    // Style untuk saat list kosong
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Beri jarak dari atas
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
