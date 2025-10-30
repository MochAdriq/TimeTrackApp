// src/components/common/LeaderboardModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator, // <<< 1. Import
} from 'react-native';
import Modal from 'react-native-modal';
import { supabase } from '../../services/supabaseClient'; // <<< 2. Import Supabase

// --- Hapus Data Dummy Leaderboard ---
// const leaderboardData = [ ... ];

// Komponen untuk satu baris leaderboard (Tetap sama)
const LeaderboardItem = ({ item, rank }) => (
  <View style={[styles.itemContainer, item.isUser && styles.userItemContainer]}>
    <Text style={[styles.itemRank, item.isUser && styles.userItemText]}>
      {rank}
    </Text>
    {/* <<< 3. Gunakan avatar_url dari profiles >>> */}
    <Image
      source={
        item.profiles.avatar_url
          ? { uri: item.profiles.avatar_url }
          : // Placeholder jika avatar_url null
            {
              uri: `https://via.placeholder.com/40/EEEEEE/333?text=${item.profiles.username[0]}`,
            }
      }
      style={styles.itemImage}
    />
    <Text style={[styles.itemName, item.isUser && styles.userItemText]}>
      {/* <<< 4. Tampilkan 'You' jika ID-nya milik kita >>> */}
      {item.isUser ? 'You' : item.profiles.username}
    </Text>
    <Text style={[styles.itemScore, item.isUser && styles.userItemText]}>
      {item.score} pts
    </Text>
  </View>
);

// <<< 5. Terima 'quizId' sebagai prop >>>
const LeaderboardModal = ({ isVisible, onClose, quizId }) => {
  // --- 6. Tambahkan State ---
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- 7. Fungsi Fetch Leaderboard ---
  const fetchLeaderboard = async () => {
    if (!quizId) return; // Jangan fetch jika tidak ada quizId

    setLoading(true);
    try {
      // 1. Ambil ID user yang sedang login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // 2. Ambil data leaderboard
      // - Ambil dari 'quiz_attempts'
      // - Filter berdasarkan 'quiz_id'
      // - Urutkan dari 'score' tertinggi
      // - Ambil data 'username' & 'avatar_url' dari tabel 'profiles'
      // - Batasi 10 besar
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(
          `
          user_id,
          score,
          profiles (
            username,
            avatar_url
          )
        `,
        )
        .eq('quiz_id', quizId) // Filter kuis yang ini saja
        .order('score', { ascending: false }) // Urutkan skor tertinggi
        .limit(10); // Ambil 10 besar

      if (error) throw error;

      // 3. Format data untuk menandai user
      const formattedData = data
        // Filter data yang profilnya tidak sengaja null
        .filter(item => item.profiles)
        .map(item => ({
          ...item,
          id: item.user_id, // Gunakan user_id sebagai ID unik
          isUser: item.user_id === user?.id, // Tandai jika ini adalah user kita
        }));

      setLeaderboardData(formattedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error.message);
      // Gagal fetch, set data kosong
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 8. Panggil fetchLeaderboard saat modal terlihat ---
  useEffect(() => {
    if (isVisible) {
      fetchLeaderboard();
    }
  }, [isVisible, quizId]); // Jalankan ulang jika quizId atau visibility berubah

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
      <View style={styles.contentContainer}>
        <View style={styles.handle} />

        {/* --- 9. Tampilkan Loading atau List --- */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A453C" />
          </View>
        ) : (
          <FlatList
            data={leaderboardData}
            renderItem={({ item, index }) => (
              <LeaderboardItem item={item} rank={index + 1} />
            )}
            keyExtractor={item => item.id}
            style={styles.list}
            ListHeaderComponent={
              <Text style={styles.title}>Peringkat Kuis Ini</Text>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada peringkat.</Text>
            }
          />
        )}
      </View>
    </Modal>
  );
};

// --- STYLES (Tambahkan style loading, title, empty) ---
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    maxHeight: '60%',
    minHeight: '40%', // Beri tinggi minimum
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 4,
    marginBottom: 15,
    alignSelf: 'center',
  },
  title: {
    // Judul di atas list
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingContainer: {
    // Style loading
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    // Style untuk FlatList jika perlu
  },
  emptyText: {
    // Style jika data kosong
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  userItemContainer: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  itemRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AAA',
    width: 30,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#EEE', // Placeholder background
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  userItemText: {
    color: '#6A453C',
  },
});

export default LeaderboardModal;
