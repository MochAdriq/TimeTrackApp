// src/features/Discussion/components/ChatListItem.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Gambar placeholder (ganti dengan gambar asli nanti)
const placeholderAvatar =
  'https://via.placeholder.com/50/A77C55/FFFFFF?text=AH';

const ChatListItem = ({ name, lastMessage, time, avatarUrl, onPress }) => {
  const imageSource = avatarUrl
    ? { uri: avatarUrl }
    : { uri: placeholderAvatar };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={imageSource} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time} numberOfLines={1}>
            {time}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    // borderBottomWidth: 1, // Bisa tambahkan garis pemisah tipis
    // borderBottomColor: '#EEE',
    backgroundColor: '#FFFFFF', // Background item putih (atau transparan jika list punya background)
    marginBottom: 5, // Sedikit jarak antar item
    borderRadius: 10, // Sedikit lengkungan sudut
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, // Bulat
    marginRight: 15,
    backgroundColor: '#E0E0E0', // Warna placeholder
  },
  content: {
    flex: 1, // Agar mengisi sisa ruang
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1, // Agar nama bisa dipotong jika terlalu panjang
    marginRight: 5,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});

export default ChatListItem;
