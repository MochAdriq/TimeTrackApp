// src/features/Quiz/screens/QuizCongratsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LeaderboardModal from '../../../components/common/LeaderboardModal'; // Import modal

const QuizCongratsScreen = ({ route, navigation }) => {
  // Ambil data dari QuizScreen
  const { score, totalQuestions } = route.params;
  const pointsEarned = 1000; // Contoh poin (nanti bisa dikirim juga)

  // --- State untuk Modal ---
  const [isModalVisible, setModalVisible] = useState(false);

  // --- Efek untuk memunculkan modal otomatis ---
  useEffect(() => {
    // Beri sedikit jeda agar layar sempat tampil dulu
    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 1000); // Muncul setelah 1 detik (sesuaikan)

    return () => clearTimeout(timer); // Bersihkan timer
  }, []); // [] = jalankan sekali saat layar muncul

  const handleContinue = () => {
    setModalVisible(false); // Tutup modal jika masih terbuka
    navigation.popToTop(); // Kembali ke layar paling awal (QuizList)
    // atau navigasi ke Home:
    // navigation.navigate('MainApp', { screen: 'Jelajah' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom (Hanya Tombol Back) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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

        {/* Teks Ucapan Selamat */}
        <Text style={styles.congratsTitle}>Congratulation</Text>
        <Text style={styles.congratsSubtitle}>
          Great job, Your earn {pointsEarned} point
        </Text>

        {/* Tombol Continue */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* --- Render Modal Peringkat --- */}
      <LeaderboardModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EEE0', // Background krem (estimasi)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Header coklat
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
    width: 180, // Ukuran lingkaran (sesuaikan)
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7D5A5A', // Coklat muda (estimasi)
    borderWidth: 10,
    borderColor: '#C8B08F', // Coklat lebih muda (estimasi)
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
    backgroundColor: '#E3D5B8', // Krem
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
