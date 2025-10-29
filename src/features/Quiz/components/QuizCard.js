// src/features/Quiz/components/QuizCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// --- Impor Aset (Ganti path) ---
// const quizThumbnail = require('../../../assets/images/quiz_thumb_default.png');
// const starIcon = require('../../../assets/icons/StarIcon.svg'); // Asumsi pakai SVG
// const clockIcon = require('../../../assets/icons/ClockIcon.svg');
// const fileIcon = require('../../../assets/icons/FileIcon.svg');

const dummyImageSource = require('../../../assets/images/dummyImage.png');

const QuizCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      {/* Thumbnail */}
      <Image
        source={dummyImageSource} // <<< Gunakan require() di prop 'source'
        style={styles.thumbnail}
        resizeMode="cover" // Tambahkan resizeMode (opsional tapi bagus)
      />
      {/* Info Kuis */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.detailRow}>
          {/* Ganti View dengan ikon */}
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 10 }}>📄</Text>
          </View>
          <Text style={styles.detailText}>{item.questionCount} Questions</Text>
        </View>
        <View style={styles.detailRow}>
          {/* Ganti View dengan ikon */}
          <View style={styles.iconPlaceholder}>
            <Text style={{ fontSize: 10 }}>🕒</Text>
          </View>
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        {/* Ganti View dengan ikon bintang */}
        <View style={styles.starPlaceholder}>
          <Text style={{ color: '#FFC107' }}>★</Text>
        </View>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  thumbnail: {
    // Ganti jika pakai placeholder
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1, // Ambil sisa ruang
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
    // Ganti dengan style ikon
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
    padding: 5, // Sedikit padding
  },
  starPlaceholder: {
    // Ganti dengan style ikon bintang
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default QuizCard;
