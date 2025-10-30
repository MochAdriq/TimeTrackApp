// src/features/Discussion/screens/CommunityGroupListScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';

// Impor komponen item list
import GroupChatListItem from './GroupChatListItem';

// --- Data Dummy Grup Komunitas (Ganti dengan data asli nanti) ---
const dummyCommunityGroups = [
  {
    id: 'group1',
    name: 'Pecinta Sejarah Kuno',
    description: 'Diskusi era kerajaan Nusantara',
    iconUrl: 'https://via.placeholder.com/50/A77C55/FFFFFF?text=SK',
  },
  {
    id: 'group2',
    name: 'Era Kemerdekaan RI',
    description: 'Membahas perjuangan 1945-1949',
    iconUrl: 'https://via.placeholder.com/50/8B5E3C/FFFFFF?text=KR',
  },
  {
    id: 'group3',
    name: 'Diskusi Umum Sejarah',
    description: 'Topik bebas seputar sejarah',
    iconUrl: 'https://via.placeholder.com/50/6A453C/FFFFFF?text=DU',
  },
  {
    id: 'group4',
    name: 'Sejarah Lokal Bandung',
    description: 'Cerita dan fakta sejarah Bandung',
    iconUrl: 'https://via.placeholder.com/50/E3D5B8/6A453C?text=SL',
  },
  // Tambahkan grup lain jika perlu
];
// ------------------------------------------------------------------

const CommunityGroupListScreen = ({ navigation }) => {
  const handleGroupItemPress = groupItem => {
    console.log('Masuk grup:', groupItem.name);
    // Nanti: Navigasi ke layar chat spesifik untuk grup ini
    navigation.navigate('ChatScreen', {
      // Gunakan ChatScreen yang sudah ada
      chatId: groupItem.id, // Kirim ID grup sebagai chatId
      chatName: groupItem.name, // Kirim nama grup
      chatAvatarUrl: groupItem.iconUrl, // Kirim ikon grup
      isGroupChat: true, // Tambahkan flag penanda ini chat grup (opsional)
    });
  };

  const renderItem = ({ item }) => (
    <GroupChatListItem
      name={item.name}
      description={item.description}
      iconUrl={item.iconUrl}
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
        {/* Bisa tambahkan ikon 'Buat Grup Baru' di kanan jika perlu */}
        <View style={{ width: 40 }} />
      </View>

      {/* Daftar Grup */}
      <FlatList
        data={dummyCommunityGroups}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada grup tersedia.</Text>
            {/* Bisa tambahkan tombol 'Buat Grup Baru' */}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0EBE3', // Background sama dengan AskExpertList
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
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
});

export default CommunityGroupListScreen;
