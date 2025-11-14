// src/features/Quiz/components/QuizCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const dummyImageSource = require('../../../assets/images/dummyImage.png');

const QuizCard = ({ item, onPress }) => {
  // --- (PERBAIKAN 1) Ambil 'isCompleted' ---
  const { isCompleted } = item;

  return (
    <TouchableOpacity
      // --- (PERBAIKAN 2) Terapkan style & disable ---
      style={[styles.card, isCompleted && styles.cardDisabled]}
      onPress={() => onPress(item)}
      disabled={isCompleted} // <<< Buat tombol non-aktif
    >
      <Image
        source={dummyImageSource}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.detailRow}>
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 10 }}>📄</Text>
          </View>
          <Text style={styles.detailText}>{item.questionCount} Questions</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 10 }}>🕒</Text>
          </View>
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
      </View>

      {/* --- (PERBAIKAN 3) Tampilkan Rating ATAU Badge Selesai --- */}
      {isCompleted ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>SELESAI</Text>
        </View>
      ) : (
        <View style={styles.ratingContainer}>
          <View style={styles.starPlaceholder}>
            <Text style={{ color: '#FFC107' }}>★</Text>
          </View>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      )}
      {/* --- (BATAS PERBAIKAN 3) --- */}
    </TouchableOpacity>
  );
};

// --- (PERBAIKAN 4) Tambahkan style baru ---
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardDisabled: {
    backgroundColor: '#F0F0F0', // Abu-abu
    opacity: 0.7, // Redupkan
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconPlaceholder: {
    width: 14,
    height: 14,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#777',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  starPlaceholder: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  // --- Style untuk Badge Selesai ---
  completedBadge: {
    backgroundColor: '#4CAF50', // Hijau
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default QuizCard;
