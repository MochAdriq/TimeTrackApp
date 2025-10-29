import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import TimeTrackLogo from '../../../../src/assets/images/TimeTrackLogo.svg';

const DealCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.bgColor }]}
      onPress={onPress}
    >
      <View style={styles.logoContainer}>
        <TimeTrackLogo style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <TouchableOpacity
        style={[styles.viewButton, { backgroundColor: item.buttonColor }]}
        onPress={onPress}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160, // Lebar kartu (sesuaikan)
    borderRadius: 20,
    padding: 15,
    marginRight: 15, // Jarak antar kartu
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    width: '100%',
    height: 50, // Tinggi area logo
    backgroundColor: '#FFFFFF', // Background logo putih
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: '80%', // Ukuran logo di dalam container
    height: '80%',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333', // Warna judul
    marginBottom: 5,
    minHeight: 34, // Jaga 2 baris
  },
  subtitle: {
    fontSize: 12,
    color: '#555', // Warna subtitle
    marginBottom: 15,
  },
  viewButton: {
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default DealCard;
