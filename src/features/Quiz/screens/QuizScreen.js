// src/features/Quiz/screens/QuizScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView, // Tambahkan ScrollView
} from 'react-native';

// --- DATA DUMMY KUIS (Tetap sama) ---
const ALL_QUIZZES = {
  quiz1: {
    title: 'Kuis Kerajaan Islam',
    questions: [
      {
        id: 'q1a',
        question: 'Dimana ibu Kartini lahir?', // Soal dari gambar
        options: ['Jepara', 'Semarang', 'Surabaya', 'Yogyakarta'],
        correctAnswerIndex: 0, // Jepara
      },
      {
        id: 'q1b',
        question: 'Kerajaan Islam pertama di Jawa adalah...',
        options: ['Mataram', 'Pajang', 'Demak', 'Banten'],
        correctAnswerIndex: 2,
      },
      // ... (Tambah 8 soal lagi untuk Kuis #1 jika perlu)
    ],
  },
  quiz2: {
    // ... (Data kuis #2)
  },
};
// --- AKHIR DATA DUMMY ---

const QuizScreen = ({ route, navigation }) => {
  const { quizId } = route.params;

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const data = ALL_QUIZZES[quizId];
    if (data) {
      setQuizData(data);
    } else {
      Alert.alert('Error', 'Kuis tidak ditemukan', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [quizId, navigation]);

  const handleAnswerSelect = index => {
    setSelectedAnswerIndex(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswerIndex === null) {
      Alert.alert('Pilih Jawaban', 'Boss harus pilih jawaban dulu!');
      return;
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    if (selectedAnswerIndex === currentQuestion.correctAnswerIndex) {
      setScore(prevScore => prevScore + 1);
    }

    const isLastQuestion =
      currentQuestionIndex === quizData.questions.length - 1;

    if (isLastQuestion) {
      navigation.replace('QuizCongrats', {
        score:
          score +
          (selectedAnswerIndex === currentQuestion.correctAnswerIndex ? 1 : 0),
        totalQuestions: quizData.questions.length,
      });
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswerIndex(null);
    }
  };

  const handleSeeResult = () => {
    // Fungsi ini mungkin untuk skip ke hasil (jika sudah selesai)
    // Atau navigasi ke hasil jika sudah di soal terakhir
    if (currentQuestionIndex === quizData.questions.length - 1) {
      handleNextQuestion(); // Jalankan logika submit
    } else {
      Alert.alert('Info', 'Selesaikan semua soal untuk melihat hasil.');
    }
  };

  // --- Tampilan Loading ---
  if (!quizData) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading Kuis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Coklat */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
          {/* Ganti dengan Ikon Panah SVG/Image */}
        </TouchableOpacity>
        {/* Tidak ada judul di header ini */}
      </View>

      {/* Gunakan ScrollView untuk konten jika layarnya kecil */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Kartu Putih */}
        <View style={styles.card}>
          {/* Teks Soal */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Pilihan Jawaban */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton, // Style default (putih)
                  // Ganti style jika tombol ini dipilih
                  selectedAnswerIndex === index
                    ? styles.optionButtonSelected
                    : styles.optionButtonDefault,
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <Text
                  style={[
                    styles.optionText,
                    // Ganti warna teks jika tombol ini dipilih
                    selectedAnswerIndex === index
                      ? styles.optionTextSelected
                      : styles.optionTextDefault,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Link "See Result" */}
          <TouchableOpacity onPress={handleSeeResult}>
            <Text style={styles.seeResultText}>See Result</Text>
          </TouchableOpacity>

          {/* Tombol Jawab/Lanjut */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === quizData.questions.length - 1
                ? 'Jawab & Selesai' // Teks di tombol terakhir
                : 'Jawab'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EEE0', // Background krem (estimasi)
  },
  safeAreaLoading: {
    // Background saat loading
    flex: 1,
    backgroundColor: '#6A453C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EEE0',
  },
  header: {
    // Header coklat
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  scrollContainer: {
    flexGrow: 1, // Agar bisa scroll dan center
    justifyContent: 'center', // Pusatkan kartu jika konten pendek
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  questionText: {
    fontSize: 20, // Ukuran font soal
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30, // Jarak ke pilihan
    // fontFamily: 'YourFont-Bold',
  },
  optionsContainer: {
    marginBottom: 20, // Jarak ke link "See Result"
  },
  optionButton: {
    // Style dasar tombol
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30, // Sangat melengkung
    marginBottom: 10,
    borderWidth: 2,
  },
  optionButtonDefault: {
    // Style saat tidak dipilih
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0', // Border abu
  },
  optionButtonSelected: {
    // Style saat dipilih (coklat muda)
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8', // Border warna sama
  },
  optionText: {
    fontSize: 16,
  },
  optionTextDefault: {
    // Teks saat tidak dipilih
    color: '#555',
  },
  optionTextSelected: {
    // Teks saat dipilih
    color: '#6A453C', // Coklat tua
    fontWeight: 'bold',
  },
  seeResultText: {
    fontSize: 14,
    color: '#007AFF', // Biru (link)
    textAlign: 'right', // Posisikan di kanan
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#7D5A5A', // Coklat tua tombol
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizScreen;
