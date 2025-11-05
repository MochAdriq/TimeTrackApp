// src/features/Materi/screens/MateriScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator, // Untuk indikator loading
} from 'react-native';
import { supabase } from '../../../services/supabaseClient'; // Import Supabase
import InfoModal from '../../../components/common/InfoModal'; // Import InfoModal
import LoveIconActive from '../../../assets/icon/LoveIconActive.svg'; // Import ikon Like
import LoveIconInactive from '../../../assets/icon/LoveIconInactive.svg'; // Import ikon Unlike
import { updateTaskProgress } from '../../../services/taskService';

// (Ikon lain masih menggunakan placeholder teks karena tidak ditemukan di file Anda)
// import PlayIcon from '../../../assets/icons/PlayIcon.svg';
// import SpeakerIcon from '../../../assets/icons/SpeakerIcon.svg';

const MateriScreen = ({ route, navigation }) => {
  // --- Ambil parameter ID dari navigasi ---
  const { materiId } = route.params;

  // --- State untuk data, loading, dan favorit ---
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const [hasTaskBeenTriggered, setHasTaskBeenTriggered] = useState(false);

  // --- Fungsi untuk memuat data materi dan status favorit ---
  const fetchMateriData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Ambil data user saat ini
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Ambil data materi berdasarkan ID
      const { data: materiData, error: materiError } = await supabase
        .from('materi')
        .select(
          `
          *,
          categories ( name ),
          user_favorites ( count )
        `,
        ) // <--- PERUBAHAN DI SINI
        .eq('id', materiId)
        .single();

      if (materiError) {
        throw new Error('Materi tidak ditemukan atau terjadi kesalahan.');
      }

      setMateri(materiData);

      // 3. Cek status favorit (hanya jika user login)
      if (user && materiData) {
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('user_favorites')
          .select('user_id')
          .eq('user_id', user.id)
          .eq('materi_id', materiData.id)
          .maybeSingle(); // maybeSingle() tidak error jika tidak ada row

        if (favoriteError) {
          console.error('Gagal mengecek favorit:', favoriteError.message);
        }

        if (favoriteData) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }
      }
    } catch (error) {
      setModalInfo({
        visible: true,
        type: 'error',
        title: 'Gagal Memuat',
        message: error.message,
      });
      setMateri(null); // Pastikan tidak ada data materi lama
    } finally {
      setLoading(false);
    }
  }, [materiId]); // Dependensi pada materiId

  // --- Efek untuk memuat data saat layar dibuka ---
  useEffect(() => {
    if (materiId) {
      fetchMateriData();
    }
  }, [materiId, fetchMateriData]); // Jalankan ulang jika ID berubah

  // --- Handler untuk tombol Like/Unlike ---
  const handleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Cek jika user belum login
    if (!user) {
      setModalInfo({
        visible: true,
        type: 'info',
        title: 'Login Dibutuhkan',
        message: 'Anda harus login untuk menambahkan materi ke favorit.',
      });
      return;
    }

    const newFavoriteStatus = !isFavorite;
    // Optimistic UI update
    setIsFavorite(newFavoriteStatus);

    try {
      if (newFavoriteStatus) {
        // --- Tambahkan ke favorit ---
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, materi_id: materi.id });
        if (error) throw error;
      } else {
        // --- Hapus dari favorit ---
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('materi_id', materi.id);
        if (error) throw error;
      }
    } catch (error) {
      // Rollback jika terjadi error
      setIsFavorite(!newFavoriteStatus);
      setModalInfo({
        visible: true,
        type: 'error',
        title: 'Update Gagal',
        message: 'Gagal memperbarui status favorit. Coba lagi.',
      });
    }
  };

  // --- Handler placeholder (belum diubah) ---
  const handlePlayVideo = () =>
    console.log('Play video', materi?.video_url || 'Tidak ada video');
  const handlePlayAudio = () =>
    console.log('Play audio', materi?.audio_url || 'Tidak ada audio');

  // --- Handler untuk menutup modal ---
  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, visible: false }));
  };

  const handleCompleteReadTask = useCallback(async () => {
    try {
      // Panggil service, tentukan tipe task-nya 'read_materi'
      const completedTask = await updateTaskProgress('read_materi');

      // Jika fungsi mengembalikan data, berarti task baru saja selesai
      if (completedTask) {
        setModalInfo({
          visible: true,
          type: 'success', // Ganti tipe modal menjadi 'success'
          title: 'Tugas Selesai!',
          message: `Anda telah menyelesaikan tugas "${completedTask.title}" dan mendapatkan ${completedTask.points_reward} poin!`,
        });
      }
    } catch (error) {
      // Tidak perlu menampilkan error ke user untuk task
      console.error('Gagal memicu task:', error.message);
    }
  }, []);

  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Offset 20px agar trigger sedikit sebelum akhir
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    // Jika sudah di bawah DAN belum pernah di-trigger DAN tidak loading
    if (isCloseToBottom && !loading && !hasTaskBeenTriggered) {
      // 1. Tandai bahwa task sudah di-trigger
      setHasTaskBeenTriggered(true);

      // 2. Panggil fungsi untuk update task
      handleCompleteReadTask();
    }
  };

  // --- Tampilan Loading ---
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
          <Text style={{ marginTop: 10, color: '#6A453C' }}>
            Memuat Materi...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Tampilan Jika Materi Tidak Ditemukan ---
  if (!materi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header tetap ada agar bisa kembali */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backIconPlaceholder}>
              <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Error
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 16, color: '#333' }}>
            Materi tidak dapat ditemukan.
          </Text>
        </View>
        <InfoModal
          visible={modalInfo.visible}
          title={modalInfo.title}
          message={modalInfo.message}
          type={modalInfo.type}
          onClose={closeModal}
        />
      </SafeAreaView>
    );
  }

  // --- Ambil data dari state 'materi' (setelah loading) ---
  const { title, image_url, video_thumbnail_url, summary, likes } = materi;
  const imageSource = image_url ? { uri: image_url } : null;
  const videoThumbSource = video_thumbnail_url
    ? { uri: video_thumbnail_url }
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
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Gambar Utama dengan Tombol Like */}
        {imageSource && (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              {/* Data 'likes' dari DB (jika Anda ingin menampilkannya) */}
              {/* <Text style={styles.likeCount}>{likes}</Text> */}

              {/* --- Ikon Hati Dinamis --- */}
              {isFavorite ? (
                <LoveIconActive width={22} height={22} />
              ) : (
                <LoveIconInactive width={22} height={22} />
              )}
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
            <View style={styles.playIconOverlay}>
              <View style={styles.playIconPlaceholder}>
                <Text style={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>
                  ▶
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Ringkasan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Interaktivitas (Audio) */}
        {/* Tambahkan cek jika materi.audio_url ada */}
        {materi.audio_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interaktivitas</Text>
            <TouchableOpacity
              style={styles.audioPlayer}
              onPress={handlePlayAudio}
            >
              <View style={styles.audioIconPlaceholder}>
                <Text style={{ fontSize: 20 }}>🔊</Text>
              </View>
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
        )}

        {/* Spacer Bawah */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* --- Pop Up Modal --- */}
      <InfoModal
        visible={modalInfo.visible}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

// --- STYLES (Sama seperti yang Anda berikan, ditambah loadingContainer) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Latar belakang putih saat loading
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
    height: 60,
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
  },
  scrollContainer: { paddingBottom: 20 },
  imageContainer: { position: 'relative' },
  mainImage: { width: '100%', height: 250 },
  likeButton: {
    position: 'absolute',
    bottom: 12, // Disesuaikan agar lebih rapi
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20, // Bulat sempurna
    width: 40, // Ukuran tetap
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // likeCount: { color: '#FFFFFF', fontSize: 12, marginRight: 5 }, // Dihapus sementara
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoThumbnail: { width: '100%', height: 180 },
  playIconOverlay: {
    position: 'absolute',
  },
  playIconPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
    width: 60, // Perbesar sedikit
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F5F5F5',
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
