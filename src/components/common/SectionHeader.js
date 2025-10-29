// src/components/common/SectionHeader.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Terima 'title' dan fungsi 'onSeeAllPress' sebagai props
const SectionHeader = ({ title, onSeeAllPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {/* Tombol "Lihat Semua" hanya muncul jika ada fungsi onSeeAllPress */}
      {onSeeAllPress && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Judul dan link sejajar
    justifyContent: 'space-between', // Judul di kiri, link di kanan
    alignItems: 'center', // Tengah secara vertikal
    paddingHorizontal: 15, // Padding samping
    marginTop: 25, // Jarak dari komponen di atasnya (QuickActions)
    marginBottom: 15, // Jarak ke daftar item di bawahnya
  },
  title: {
    fontSize: 18, // Ukuran font judul section
    fontWeight: 'bold',
    color: '#333333', // Warna teks judul (gelap)
    // fontFamily: 'YourFont-Bold',
  },
  seeAllText: {
    fontSize: 13, // Ukuran font link
    color: '#8B5E3C', // Warna link (coklat, estimasi)
    fontWeight: '500',
    // fontFamily: 'YourFont-Medium',
  },
});

export default SectionHeader;
