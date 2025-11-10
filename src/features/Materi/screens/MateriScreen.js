// src/features/Materi/screens/MateriScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import LoveIconActive from '../../../assets/icon/LoveIconActive.svg';
import LoveIconInactive from '../../../assets/icon/LoveIconInactive.svg';
import { updateTaskProgress } from '../../../services/taskService';

// Tentukan Waktu Minimum (mis: 3 Menit = 180000 ms)
// Kita set 10 detik (10000 ms) untuk tes cepat. Ganti ke 180000 untuk produksi.
const MIN_TIME_SPENT_MS = 10000; // 10 detik untuk tes

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

  // --- State baru untuk logika task/koin ---
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasTimeRequirementMet, setHasTimeRequirementMet] = useState(false);
  const [hasTaskBeenTriggered, setHasTaskBeenTriggered] = useState(false);

  // Ref untuk menyimpan ID timer
  const timerRef = useRef(null);

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
        )
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
          .maybeSingle();

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

  // --- Logika Inti Pemicu Task ---
  const tryCompleteTask = useCallback(
    async triggerSource => {
      // Cek apakah task sudah pernah dipicu
      if (hasTaskBeenTriggered) {
        return; // Sudah dipicu, jangan lakukan apa-apa
      }

      // Tentukan status saat ini berdasarkan pemicu
      const isScrolled = triggerSource === 'scroll' || hasScrolledToBottom;
      const isTimeMet = triggerSource === 'timer' || hasTimeRequirementMet;

      // Cek apakah KEDUA syarat terpenuhi
      if (isScrolled && isTimeMet) {
        setHasTaskBeenTriggered(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        try {
          // <<< UBAH BARIS INI (tambahkan 'materiId') >>>
          const completedTask = await updateTaskProgress(
            'read_materi',
            materiId,
          );

          // Cek jika 'completedTask' tidak null dan memiliki elemen
          if (completedTask && completedTask.length > 0) {
            // Ambil hasil pertamanya
            const taskResult = completedTask[0];
            setModalInfo({
              visible: true,
              type: 'success',
              title: taskResult.title, // Judul dari DB (mis: "Materi Selesai" atau "Tugas Harian Selesai")
              message: `Anda mendapatkan ${taskResult.points_reward} poin!`,
            });
          }
        } catch (error) {
          console.error('Gagal memicu task:', error.message);
        }
      } else {
        console.log(
          `MateriScreen: Syarat belum terpenuhi (Scroll: ${isScrolled}, Waktu: ${isTimeMet})`,
        );
      }
    },
    [
      hasTaskBeenTriggered,
      hasScrolledToBottom,
      hasTimeRequirementMet,
      materiId,
    ],
  ); // <<< TAMBAHKAN 'materiId' di dependensi

  // --- useEffect Baru (Untuk Timer) ---
  useEffect(() => {
    // Mulai timer hanya saat materi selesai loading
    if (!loading && materi) {
      console.log('MateriScreen: Timer dimulai...');
      timerRef.current = setTimeout(() => {
        console.log(
          `MateriScreen: Waktu ${MIN_TIME_SPENT_MS / 1000} detik terpenuhi.`,
        );
        setHasTimeRequirementMet(true);
        // Panggil pengecek task saat timer selesai
        tryCompleteTask('timer');
      }, MIN_TIME_SPENT_MS);
    }

    // Membersihkan timer jika pengguna meninggalkan layar
    return () => {
      if (timerRef.current) {
        console.log('MateriScreen: Timer dibersihkan.');
        clearTimeout(timerRef.current);
      }
    };
  }, [loading, materi, tryCompleteTask]); // Tambahkan tryCompleteTask sebagai dependensi

  // --- Handler untuk tombol Like/Unlike (Tetap Sama) ---
  const handleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, materi_id: materi.id });
        if (error) throw error;
      } else {
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

  // --- Handler placeholder (Tetap Sama) ---
  const handlePlayVideo = () =>
    console.log('Play video', materi?.video_url || 'Tidak ada video');
  const handlePlayAudio = () =>
    console.log('Play audio', materi?.audio_url || 'Tidak ada audio');

  // --- Handler untuk menutup modal (Tetap Sama) ---
  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, visible: false }));
  };

  // --- Modifikasi handleScroll ---
  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Offset 20px agar trigger sedikit sebelum akhir
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    // Jika sudah di bawah DAN belum pernah ditandai scroll
    if (isCloseToBottom && !hasScrolledToBottom) {
      console.log('MateriScreen: Scroll sudah di bawah.');
      // 1. Tandai bahwa syarat scroll terpenuhi
      setHasScrolledToBottom(true);

      // 2. Panggil pengecek task
      tryCompleteTask('scroll');
    }
  };

  // --- Tampilan Loading (Tetap Sama) ---
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

  // --- Tampilan Jika Materi Tidak Ditemukan (Tetap Sama) ---
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

  // --- Ambil data dari state 'materi' (Tetap Sama) ---
  const { title, image_url, video_thumbnail_url, summary, likes } = materi;
  const imageSource = image_url ? { uri: image_url } : null;
  const videoThumbSource = video_thumbnail_url
    ? { uri: video_thumbnail_url }
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      {/* Header (Tetap Sama) */}
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
        onScroll={handleScroll} // <<< onScroll sudah benar
        scrollEventThrottle={16} // <<< scrollEventThrottle sudah benar
      >
        {/* Gambar Utama dengan Tombol Like (Tetap Sama) */}
        {imageSource && (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              {isFavorite ? (
                <LoveIconActive width={22} height={22} />
              ) : (
                <LoveIconInactive width={22} height={22} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Judul Konten (Tetap Sama) */}
        <Text style={styles.contentTitle}>{title}</Text>

        {/* Video Thumbnail (jika ada) (Tetap Sama) */}
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

        {/* Ringkasan (Tetap Sama) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Interaktivitas (Audio) (Tetap Sama) */}
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

        {/* Spacer Bawah (Tetap Sama) */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* --- Pop Up Modal (Tetap Sama) --- */}
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

// --- STYLES (Tetap Sama) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    bottom: 12,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 60,
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
