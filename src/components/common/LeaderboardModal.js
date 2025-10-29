// src/components/common/LeaderboardModal.js
import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import Modal from 'react-native-modal';

// --- Data Dummy Leaderboard ---
const leaderboardData = [
  {
    id: '1',
    name: 'Marsha Fisher',
    score: 36,
    image: 'https://via.placeholder.com/40/FFC107/333?text=MF',
  },
  {
    id: '2',
    name: 'Juanita Cormier',
    score: 35,
    image: 'https://via.placeholder.com/40/EEEEEE/333?text=JC',
  },
  {
    id: '3',
    name: 'You',
    score: 34,
    image: 'https://via.placeholder.com/40/C8E6C9/333?text=YOU',
    isUser: true,
  }, // Tandai user
  {
    id: '4',
    name: 'Tamara Schmidt',
    score: 33,
    image: 'https://via.placeholder.com/40/EEEEEE/333?text=TS',
  },
  {
    id: '5',
    name: 'Ricardo Veum',
    score: 32,
    image: 'https://via.placeholder.com/40/EEEEEE/333?text=RV',
  },
];

// Komponen untuk satu baris leaderboard
const LeaderboardItem = ({ item, rank }) => (
  <View style={[styles.itemContainer, item.isUser && styles.userItemContainer]}>
    <Text style={[styles.itemRank, item.isUser && styles.userItemText]}>
      {rank}
    </Text>
    <Image source={{ uri: item.image }} style={styles.itemImage} />
    <Text style={[styles.itemName, item.isUser && styles.userItemText]}>
      {item.name}
    </Text>
    <Text style={[styles.itemScore, item.isUser && styles.userItemText]}>
      {item.score} pts
    </Text>
  </View>
);

const LeaderboardModal = ({ isVisible, onClose }) => {
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
        {/* Handle */}
        <View style={styles.handle} />
        {/* Render List */}
        <FlatList
          data={leaderboardData}
          renderItem={({ item, index }) => (
            <LeaderboardItem item={item} rank={index + 1} />
          )}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 20, // Beri jarak di bawah
    paddingHorizontal: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    maxHeight: '60%', // Batasi tinggi modal
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 4,
    marginBottom: 15,
    alignSelf: 'center',
  },
  list: {
    // Style untuk FlatList jika perlu
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
    // Style khusus untuk user
    backgroundColor: '#E3D5B8', // Coklat muda (estimasi)
    borderColor: '#E3D5B8',
  },
  itemRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AAA',
    width: 30, // Beri lebar tetap
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  itemName: {
    flex: 1, // Ambil sisa ruang
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
    // Style teks khusus untuk user
    color: '#6A453C', // Coklat tua
  },
});

export default LeaderboardModal;
