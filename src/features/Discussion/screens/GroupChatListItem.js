// src/features/Discussion/components/GroupChatListItem.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Placeholder ikon grup
const placeholderIcon = 'https://via.placeholder.com/50/C8E6C9/333?text=G';

const GroupChatListItem = ({ name, description, iconUrl, onPress }) => {
  const imageSource = iconUrl ? { uri: iconUrl } : { uri: placeholderIcon };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={imageSource} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {/* Tampilkan deskripsi jika ada */}
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
      {/* Bisa tambahkan indikator jumlah anggota atau pesan belum dibaca di sini */}
      <Text style={styles.arrow}>{'>'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15, // Padding lebih besar sedikit
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10, // Jarak antar grup
    borderRadius: 12, // Lengkungan sudut
    // Shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 10, // Kotak dengan sudut melengkung (atau 25 untuk bulat)
    marginRight: 15,
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4, // Jarak ke deskripsi
  },
  description: {
    fontSize: 13,
    color: '#777',
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B0B0B0', // Warna panah abu-abu
    marginLeft: 10,
  },
});

export default GroupChatListItem;
