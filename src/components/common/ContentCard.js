// src/components/common/ContentCard.js

import React from 'react';
import {
  View,
  Text,
  ImageBackground, // Gunakan ini agar teks bisa di atas gambar
  StyleSheet,
  TouchableOpacity,
  Dimensions, // Untuk menghitung lebar kartu
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import hook navigasi

// Hitung perkiraan lebar kartu (misal, 2 kartu terlihat plus sedikit kartu ketiga)
const { width: screenWidth } = Dimensions.get('window');
// Kurangi padding horizontal HomeScreen (15*2) dan margin antar kartu
const cardMargin = 10;
const cardWidth = screenWidth * 0.55; // Sesuaikan persentase ini (0.55 = 55%)

const ContentCard = ({ imageUrl, title, subtitle, onPress, itemData }) => {
  const navigation = useNavigation(); // Dapatkan navigation
  const imageSource = imageUrl
    ? { uri: imageUrl }
    : require('../../assets/images/dummyImage2.png'); // Siapkan gambar placeholder

  const handlePress = () => {
    // Navigasi ke MateriDetail, kirim ID atau data lain
    navigation.navigate('MateriDetail', {
      materiId: itemData?.id, // Kirim ID
      materiTitle: title, // Kirim judul juga (opsional)
      // Kirim data lain jika perlu
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle} // Style untuk Image di dalam ImageBackground
        resizeMode="cover" // Agar gambar mengisi area
      >
        {/* Overlay gelap agar teks lebih mudah dibaca */}
        <View style={styles.textOverlay}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth * 1.25, // Buat kartu sedikit lebih tinggi dari lebarnya (rasio 4:5), sesuaikan
    borderRadius: 15,
    overflow: 'hidden', // Penting agar ImageBackground mengikuti borderRadius
    marginLeft: cardMargin, // Margin kiri antar kartu
    // Shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: '#E0E0E0', // Warna fallback jika gambar gagal load
  },
  imageBackground: {
    flex: 1, // Mengisi seluruh container
    justifyContent: 'flex-end', // Posisikan overlay teks di bawah
  },
  imageStyle: {
    // borderRadius bisa juga ditaruh di sini
  },
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay semi-transparan hitam
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Radius hanya di sudut bawah (jika diinginkan, atau hapus jika mau lurus)
    // borderBottomLeftRadius: 15,
    // borderBottomRightRadius: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    // fontFamily: 'YourFont-Bold',
  },
  subtitle: {
    color: '#E0E0E0', // Warna abu-abu terang untuk subjudul
    fontSize: 11,
    // fontFamily: 'YourFont-Regular',
  },
});

export default ContentCard;
