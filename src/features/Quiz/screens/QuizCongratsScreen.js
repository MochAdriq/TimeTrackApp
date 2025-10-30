// src/features/Quiz/screens/QuizCongratsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator, // <<< 1. Import ActivityIndicator
} from 'react-native';
import LeaderboardModal from '../../../components/common/LeaderboardModal';

// --- 2. Import Supabase & Modal Error ---
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

// --- 3. Tentukan Poin per Jawaban Benar ---
const POINTS_PER_CORRECT_ANSWER = 10; // (Boss bisa ganti ini)

const QuizCongratsScreen = ({ route, navigation }) => {
  // Ambil data dari QuizScreen
  const { score, totalQuestions, quizId } = route.params;

  // --- 4. Hitung Poin Secara Dinamis ---
  const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(true); // <<< State loading baru

  // State untuk modal error (jika gagal simpan)
  const [errorModal, setErrorModal] = useState({
    isVisible: false,
    message: '',
  });

  // --- 5. Efek untuk MENYIMPAN hasil Kuis ---
  useEffect(() => {
    // Fungsi async untuk menyimpan data
    const saveQuizAttempt = async () => {
      setIsSaving(true);
      try {
        // 1. Dapatkan ID user yang sedang login
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user)
          throw new Error('Sesi user tidak ditemukan, silakan login ulang.');

        // 2. Siapkan data untuk tabel 'quiz_attempts'
        const attemptData = {
          user_id: user.id,
          quiz_id: quizId,
          score: score,
          total_questions: totalQuestions,
          points_earned: pointsEarned,
          // 'completed_at' akan otomatis diisi 'now()' oleh database
        };

        // 3. Insert ke database
        const { error: insertError } = await supabase
          .from('quiz_attempts')
          .insert(attemptData);
        if (insertError) throw insertError;

        // --- SUKSES ---
        console.log('Hasil kuis berhasil disimpan!');
        // Trigger di database (handle_quiz_completion) akan otomatis
        // memanggil increment_user_points untuk update 'profiles'
      } catch (error) {
        console.error('Error saving quiz attempt:', error.message);
        setErrorModal({
          isVisible: true,
          message: `Gagal menyimpan hasil kuis Anda: ${error.message}`,
        });
      } finally {
        setIsSaving(false); // Selesai menyimpan

        // Tampilkan modal leaderboard (logika asli)
        const timer = setTimeout(() => {
          setModalVisible(true);
        }, 1000); // Muncul setelah 1 detik

        // Hati-hati: return cleanup function harus ada di akhir
        return () => clearTimeout(timer);
      }
    };

    saveQuizAttempt(); // Panggil fungsi simpan
  }, [quizId, score, totalQuestions, pointsEarned, navigation]); // dependensi

  const handleContinue = () => {
    setModalVisible(false); // Tutup modal leaderboard
    // Kembali ke layar QuizList (yang akan auto-refresh poin)
    navigation.navigate('QuizList');
  };

  const hideErrorModal = () => {
    setErrorModal({ isVisible: false, message: '' });
    navigation.navigate('QuizList'); // Tetap kembali walau gagal simpan
  };

  // --- 6. Tampilkan Layar Loading saat menyimpan ---
  if (isSaving) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <ActivityIndicator size="large" color="#6A453C" />
        <Text style={styles.loadingText}>
          Menyimpan hasil & menambah EXP...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Biarkan user bisa kembali
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Lingkaran Skor */}
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreText}>
            {score}/{totalQuestions}
          </Text>
        </View>

        {/* Teks Ucapan Selamat (Dinamis) */}
        <Text style={styles.congratsTitle}>Congratulation</Text>
        <Text style={styles.congratsSubtitle}>
          {/* <<< 7. Tampilkan Poin yang didapat >>> */}
          Great job, You earn {pointsEarned} points
        </Text>

        {/* Tombol Continue */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Render Modal Peringkat */}
      <LeaderboardModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        quizId={quizId} // <<< KIRIM quizId KE MODAL
      />

      {/* --- 8. Tambahkan Modal Error --- */}
      <InfoModal
        isVisible={errorModal.isVisible}
        title="Error"
        message={errorModal.message}
        modalType="error"
        onClose={hideErrorModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EEE0',
  },
  // --- Style Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7D5A5A',
    borderWidth: 10,
    borderColor: '#C8B08F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  congratsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#E3D5B8',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 3,
  },
  continueButtonText: {
    color: '#6A453C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizCongratsScreen;
