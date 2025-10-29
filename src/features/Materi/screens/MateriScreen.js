// src/features/Materi/screens/MateriScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image, // Untuk gambar utama dan video thumbnail
} from 'react-native';
// Import ikon (ganti path/nama)
// import BackArrowIcon from '../../../assets/icons/BackArrowIcon.svg';
// import HeartIcon from '../../../assets/icons/HeartIcon.svg'; // Outline heart
// import PlayIcon from '../../../assets/icons/PlayIcon.svg';
// import SpeakerIcon from '../../../assets/icons/SpeakerIcon.svg';

// --- Fungsi untuk mendapatkan data materi (dummy) ---
// Nanti ini diganti dengan fetch data asli berdasarkan ID
const getMateriData = materiId => {
  console.log('Fetching data for:', materiId);
  // Contoh data dummy
  if (materiId === 'sej1' || materiId === 'Kerajaan Islam') {
    return {
      title: 'Kerajaan Islam',
      imageUrl:
        'https://via.placeholder.com/400x250/A77C55/FFFFFF?text=Gambar+Utama+Kerajaan', // URL gambar utama
      videoThumbnailUrl:
        'https://via.placeholder.com/300x180/A77C55/FFFFFF?text=Video+Kerajaan', // URL thumbnail video
      summary:
        'Perkembangan kerajaan Islam seperti Samudra Pasai, Demak, Mataram Islam, hingga Ternate–Tidore, membawa kemajuan dakwah dan perdagangan.',
      likes: 100,
    };
  } else if (materiId === 'bud1' || materiId === 'Wayang Kulit') {
    return {
      title: 'Wayang Kulit',
      imageUrl:
        'https://via.placeholder.com/400x250/E3D5B8/333333?text=Gambar+Wayang',
      videoThumbnailUrl:
        'https://via.placeholder.com/300x180/E3D5B8/333333?text=Video+Wayang',
      summary:
        'Wayang kulit adalah seni tradisional Indonesia yang terutama berkembang di Jawa. Wayang berasal dari kata Ma Hyang...',
      likes: 150,
    };
  }
  // Fallback jika ID tidak ditemukan
  return {
    title: 'Materi Tidak Ditemukan',
    imageUrl: 'https://via.placeholder.com/400x250/CCCCCC/FFFFFF?text=Error',
    videoThumbnailUrl: null,
    summary: 'Data untuk materi ini tidak dapat ditemukan.',
    likes: 0,
  };
};

const MateriScreen = ({ route, navigation }) => {
  // --- Ambil parameter ID/Title dari navigasi ---
  const { materiId, materiTitle } = route.params; // Ambil ID atau Title

  // State untuk menyimpan data materi
  const [materi, setMateri] = useState(null);

  // Efek untuk memuat data saat layar dibuka atau parameter berubah
  useEffect(() => {
    // Gunakan ID atau Title untuk memuat data
    const data = getMateriData(materiId || materiTitle);
    setMateri(data);
  }, [materiId, materiTitle]); // Jalankan ulang jika parameter berubah

  // Handler untuk tombol
  const handleLike = () => console.log('Like pressed');
  const handlePlayVideo = () => console.log('Play video');
  const handlePlayAudio = () => console.log('Play audio explanation');

  // Tampilkan loading atau fallback jika data belum siap
  if (!materi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ambil data dari state 'materi'
  const { title, imageUrl, videoThumbnailUrl, summary, likes } = materi;
  const imageSource = imageUrl ? { uri: imageUrl } : null;
  const videoThumbSource = videoThumbnailUrl
    ? { uri: videoThumbnailUrl }
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      {/* Header dengan tombol kembali dan judul dinamis */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <View style={styles.backIconPlaceholder}>
            <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
          </View>
          {/* <BackArrowIcon width={24} height={24} fill="#FFF" /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Gambar Utama dengan Tombol Like */}
        {imageSource && (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Text style={styles.likeCount}>{likes}</Text>
              {/* Ganti View dengan ikon hati */}
              <View style={styles.likeIconPlaceholder}>
                <Text>♡</Text>
              </View>
              {/* <HeartIcon width={18} height={18} stroke="#FFF" strokeWidth={2} /> */}
            </TouchableOpacity>
          </View>
        )}

        {/* Judul Konten */}
        <Text style={styles.contentTitle}>{title}</Text>

        {/* Video Thumbnail (jika ada) */}
        {videoThumbSource && (
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={handlePlayVideo}
            activeOpacity={0.8}
          >
            <Image
              source={videoThumbSource}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            {/* Ikon Play di tengah */}
            <View style={styles.playIconOverlay}>
              {/* Ganti View dengan ikon play */}
              <View style={styles.playIconPlaceholder}>
                <Text style={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>
                  ▶
                </Text>
              </View>
              {/* <PlayIcon width={40} height={40} fill="rgba(255, 255, 255, 0.8)" /> */}
            </View>
          </TouchableOpacity>
        )}

        {/* Ringkasan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Interaktivitas (Audio) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaktivitas</Text>
          <TouchableOpacity
            style={styles.audioPlayer}
            onPress={handlePlayAudio}
          >
            {/* Ganti View dengan ikon speaker */}
            <View style={styles.audioIconPlaceholder}>
              <Text style={{ fontSize: 20 }}>🔊</Text>
            </View>
            {/* <SpeakerIcon width={24} height={24} fill="#555" /> */}
            <View style={styles.audioTextContainer}>
              <Text style={styles.audioTitle}>
                Dengar Untuk Penjelasan audio
              </Text>
              <Text style={styles.audioSubtitle}>
                Penjelasan audio bergaya podcast...
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer Bawah */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES (Contoh, sesuaikan!) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Header coklat
    height: 60, // Sesuaikan
  },
  backButton: { padding: 5 },
  backIconPlaceholder: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexShrink: 1,
    marginHorizontal: 10,
  }, // flexShrink agar judul tidak mendorong tombol
  scrollContainer: { paddingBottom: 20 },
  imageContainer: { position: 'relative' }, // Untuk positioning tombol like
  mainImage: { width: '100%', height: 250 }, // Sesuaikan tinggi gambar
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background semi-transparan
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  likeCount: { color: '#FFFFFF', fontSize: 12, marginRight: 5 },
  likeIconPlaceholder: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  videoContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0', // Fallback
    justifyContent: 'center',
    alignItems: 'center', // Untuk ikon play
    position: 'relative',
  },
  videoThumbnail: { width: '100%', height: 180 }, // Sesuaikan tinggi thumbnail
  playIconOverlay: {
    position: 'absolute', // Taruh di tengah thumbnail
  },
  playIconPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
    padding: 10,
  },
  section: { marginHorizontal: 15, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  summaryText: { fontSize: 15, color: '#666', lineHeight: 22 },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Background abu
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  audioIconPlaceholder: {
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTextContainer: { flex: 1 },
  audioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  audioSubtitle: { fontSize: 12, color: '#888' },
});

export default MateriScreen;
