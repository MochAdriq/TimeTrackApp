// src/features/Quiz/screens/QuizDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

const QuizDetailScreen = ({ route, navigation }) => {
  // Ambil data kuis lengkap yang dikirim dari QuizListScreen
  // Kita asumsikan 'quizItem' berisi { id, title, questionCount, duration, ... }
  const { quizItem } = route.params;

  // Fungsi untuk memulai kuis, kirim quizId ke layar soal
  const handleStartQuiz = () => {
    navigation.navigate('QuizScreen', { quizId: quizItem.id });
  };

  // Ambil nomor kuis dari ID (misal 'quiz4' -> '4')
  const quizNumber = quizItem.id.replace(/\D/g, '') || 'N/A'; // Ambil angkanya saja

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
          {/* Ganti dengan Ikon Panah SVG/Image */}
        </TouchableOpacity>
      </View>

      {/* Konten Utama (Kartu Putih) */}
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.quizNumber}>Quizz #{quizNumber}</Text>
          <Text style={styles.quizTitle}>{quizItem.title}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Pertanyaan</Text>
            <Text style={styles.infoValue}>
              {quizItem.questionCount} Pertanyaan
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu Pengerjaan</Text>
            <Text style={styles.infoValue}>{quizItem.duration}</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6A453C', // Background coklat gelap
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
    justifyContent: 'center', // Pusatkan kartu secara vertikal
    alignItems: 'center', // Pusatkan kartu secara horizontal
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    width: '100%', // Lebar kartu
    alignItems: 'center', // Pusatkan semua teks di dalam kartu
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  quizNumber: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 5,
    // fontFamily: 'YourFont-Regular',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    // fontFamily: 'YourFont-Bold',
  },
  infoRow: {
    alignItems: 'center', // Pusatkan teks di baris
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#7D5A5A', // Warna tombol coklat (estimasi)
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20, // Jarak dari info terakhir
    elevation: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizDetailScreen;
