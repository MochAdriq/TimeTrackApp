/* eslint-disable react-native/no-inline-styles */
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
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Speech from 'expo-speech';
import Video from 'react-native-video';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal'; // Pastikan path ini benar
import LoveIconActive from '../../../assets/icon/LoveIconActive.svg';
import LoveIconInactive from '../../../assets/icon/LoveIconInactive.svg';
import { updateTaskProgress } from '../../../services/taskService';
import { useProfile } from '../../../context/ProfileContext';

const MIN_TIME_SPENT_MS = 10000;

const MateriScreen = ({ route, navigation }) => {
  const { materiId } = route.params;

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    visible: false, // State di sini namanya 'visible'
    type: 'error',
    title: '',
    message: '',
  });

  const showError = (title, message) => {
    setModalInfo({
      visible: true,
      type: 'error',
      title: title,
      message: message,
    });
  };

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasTimeRequirementMet, setHasTimeRequirementMet] = useState(false);
  const [hasTaskBeenTriggered, setHasTaskBeenTriggered] = useState(false);
  const timerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { profile } = useProfile();
  const isPremium = profile?.plan === 'premium';

  console.log('--- STATUS PREMIUM CHECK ---');
  console.log('isPremium:', isPremium);
  console.log('Profile Plan:', profile?.plan);

  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);

  const fetchMateriData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      showError('Gagal Memuat', error.message);
      setMateri(null);
    } finally {
      setLoading(false);
    }
  }, [materiId]);

  useEffect(() => {
    if (materiId) {
      fetchMateriData();
    }
  }, [materiId, fetchMateriData]);

  const tryCompleteTask = useCallback(
    async triggerSource => {
      if (hasTaskBeenTriggered) {
        return;
      }
      const isScrolled = triggerSource === 'scroll' || hasScrolledToBottom;
      const isTimeMet = triggerSource === 'timer' || hasTimeRequirementMet;

      if (isScrolled && isTimeMet) {
        setHasTaskBeenTriggered(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        try {
          const completedTask = await updateTaskProgress(
            'read_materi',
            materiId,
          );
          if (completedTask && completedTask.length > 0) {
            const taskResult = completedTask[0];
            setModalInfo({
              visible: true,
              type: 'success',
              title: taskResult.title,
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
  );

  useEffect(() => {
    if (!loading && materi) {
      console.log('MateriScreen: Timer dimulai...');
      timerRef.current = setTimeout(() => {
        console.log(
          `MateriScreen: Waktu ${MIN_TIME_SPENT_MS / 1000} detik terpenuhi.`,
        );
        setHasTimeRequirementMet(true);
        tryCompleteTask('timer');
      }, MIN_TIME_SPENT_MS);
    }
    return () => {
      if (timerRef.current) {
        console.log('MateriScreen: Timer dibersihkan.');
        clearTimeout(timerRef.current);
      }
    };
  }, [loading, materi, tryCompleteTask]);

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
      setIsFavorite(!newFavoriteStatus);
      setModalInfo({
        visible: true,
        type: 'error',
        title: 'Update Gagal',
        message: 'Gagal memperbarui status favorit. Coba lagi.',
      });
    }
  }; // --- FUNGSI INI DIRAPIKAN DARI SISA DEBUG ---

  const handlePlayVideo = () => {
    // --- START: PREMIUM GATE ---
    if (!isPremium) {
      console.log('Membuka modal premium untuk VIDEO...');
      setModalInfo({
        visible: true,
        type: 'info', // Tipe info (biru)
        title: 'Fitur Premium',
        message:
          'Video materi eksklusif hanya untuk pengguna Premium. Upgrade sekarang?',
        confirmText: 'Upgrade',
        onConfirm: () => {
          setModalInfo(prev => ({ ...prev, visible: false }));
          navigation.navigate('Premium'); // Arahkan ke tab Premium
        },
      });
      return; // Hentikan aksi
    } // --- END: PREMIUM GATE ---
    console.log('User premium, membuka video player...');
    const url = materi?.video_url;
    if (url) {
      setIsVideoModalVisible(true);
    } else {
      console.log('Tidak ada video url');
    }
  }; // ---
  const handlePlayAudio = () => {
    // --- START: PREMIUM GATE (Logika Anda sudah benar) ---
    if (!isPremium) {
      setModalInfo({
        visible: true,
        type: 'info',
        title: 'Fitur Premium',
        message:
          'Fitur Suara AI hanya untuk pengguna Premium. Upgrade sekarang?',
        confirmText: 'Upgrade',
        onConfirm: () => {
          setModalInfo(prev => ({ ...prev, visible: false }));
          navigation.navigate('Premium');
        },
      });
      return;
    }
    // --- END: PREMIUM GATE ---

    // --- START: LOGIKA BARU EXPO-SPEECH ---
    if (isSpeaking) {
      // Jika sedang berbicara, hentikan
      Speech.stop();
      // (Callback onDone/onStopped akan mengatur setIsSpeaking(false))
    } else {
      // Jika tidak sedang berbicara, mulai
      if (materi?.summary) {
        Speech.speak(materi.summary, {
          language: 'id-ID', // <-- Konfigurasi dipindah ke sini
          rate: 0.5, // <-- Konfigurasi dipindah ke sini
          pitch: 1.0, // <-- Konfigurasi dipindah ke sini

          // --- Callback pengganti Event Listener ---
          onStart: () => {
            setIsSpeaking(true);
          },
          onDone: () => {
            setIsSpeaking(false);
          },
          onStopped: () => {
            // Jika dihentikan manual
            setIsSpeaking(false);
          },
          onError: error => {
            console.error('Expo Speech Error:', error);
            setIsSpeaking(false);
            showError(
              'Fitur Suara Gagal',
              'Gagal memulai fitur suara AI. Coba lagi.',
            );
          },
        });
      } else {
        showError('Error', 'Tidak ada teks ringkasan untuk dibaca.');
      }
    }
    // --- END: LOGIKA BARU EXPO-SPEECH ---
  };

  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, visible: false }));
  };

  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isCloseToBottom && !hasScrolledToBottom) {
      console.log('MateriScreen: Scroll sudah di bawah.');
      setHasScrolledToBottom(true);
      tryCompleteTask('scroll');
    }
  };

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

  if (!materi) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
          isVisible={modalInfo.visible} // Ganti 'visible' menjadi 'isVisible'
          title={modalInfo.title}
          message={modalInfo.message}
          type={modalInfo.type}
          onClose={closeModal}
          confirmText={modalInfo.confirmText}
          onConfirm={modalInfo.onConfirm}
        />
      </SafeAreaView>
    );
  }

  const { title, image_url, video_thumbnail_url, summary, video_url } = materi;
  const imageSource = image_url ? { uri: image_url } : null;
  const videoThumbSource = video_thumbnail_url
    ? { uri: video_thumbnail_url }
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
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
        <Text style={styles.contentTitle}>{title}</Text>
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
              _
            />

            <View style={styles.playIconOverlay}>
              <View style={styles.playIconPlaceholder}>
                <Text style={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>
                  ▶
                </Text>
              </View>
            </View>
            {/* --- Fix pointerEvents sudah benar --- */}
            {!isPremium && (
              <View style={styles.premiumLockOverlay} pointerEvents="none">
                <Text style={styles.premiumLockText}>🔒</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {materi.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interaktivitas</Text>
            <TouchableOpacity
              style={styles.audioPlayer}
              onPress={handlePlayAudio}
            >
              <View style={styles.audioIconPlaceholder}>
                <Text style={{ fontSize: 20 }}>{isSpeaking ? '⏹️' : '🔊'}</Text>
              </View>
              <View style={styles.audioTextContainer}>
                <Text style={styles.audioTitle}>
                  {isSpeaking
                    ? 'Hentikan Suara AI'
                    : 'Dengar Ringkasan (Suara AI)'}
                </Text>

                <Text style={styles.audioSubtitle}>
                  {isSpeaking ? 'Sedang membaca...' : 'Fitur Text-to-Speech'}
                </Text>
              </View>
              {!isPremium && <Text style={styles.premiumLockIcon}>🔒</Text>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
      {/* --- PERBAIKAN 2 DI SINI --- */}
      <InfoModal
        isVisible={modalInfo.visible} // Ganti 'visible' menjadi 'isVisible'
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={closeModal}
        confirmText={modalInfo.confirmText}
        onConfirm={modalInfo.onConfirm}
      />
      {video_url && (
        <Modal
          isVisible={isVideoModalVisible}
          style={styles.videoModalContainer}
          onBackButtonPress={() => setIsVideoModalVisible(false)}
          onBackdropPress={() => setIsVideoModalVisible(false)}
        >
          <SafeAreaView style={styles.videoSafeArea}>
            {isVideoModalVisible && (
              <Video
                source={{ uri: video_url }}
                style={styles.videoPlayerDirect}
                controls={true}
                resizeMode="contain"
                onBuffer={() => console.log('Buffering video...')}
                onError={e => console.error('Video Error:', e)}
                paused={!isVideoModalVisible}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVideoModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// --- (STYLE TETAP SAMA) ---
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
  videoModalContainer: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoSafeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoPlayerDirect: {
    width: '100%',
    height: '80%',
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  premiumLockText: {
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumLockIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
});

export default MateriScreen;
