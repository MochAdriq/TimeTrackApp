// (Tambahkan 'Image' di import)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image, // <<< 1. TAMBAHKAN IMPORT INI
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';

// --- (Fungsi formatTime tetap sama) ---
const formatTime = totalSeconds => {
  if (totalSeconds === null || totalSeconds < 0) return '--:--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};
// --- (BATAS FUNGSI) ---

const QuizScreen = ({ route, navigation }) => {
  const { quizId, quizTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      if (!quizId) {
        Alert.alert('Error', 'ID Kuis tidak ditemukan', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setLoading(true);
      try {
        let { data, error } = await supabase
          .from('quizzes')
          .select(
            `
            title,
            duration, 
            questions (
              id,
              question_text,
              image_url, 
              order_index,
              options (
                id,
                option_text,
                is_correct
              )
            )
          `,
          )
          .eq('id', quizId)
          .single();

        if (error) throw error;

        if (data) {
          const formattedQuestions = data.questions
            .sort((a, b) => a.order_index - b.order_index)
            .map(q => ({
              id: q.id,
              question: q.question_text,
              image_url: q.image_url, // <<< 3. SIMPAN IMAGE_URL
              options: q.options.map(opt => opt.option_text),
              correctAnswerIndex: q.options.findIndex(
                opt => opt.is_correct === true,
              ),
            }));

          setQuizData({
            title: data.title,
            duration: data.duration,
            questions: formattedQuestions,
          });
        } else {
          throw new Error('Kuis tidak ditemukan di database.');
        }
      } catch (error) {
        console.error('Error fetching quiz questions:', error.message);
        Alert.alert('Error', `Gagal memuat kuis: ${error.message}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [quizId, navigation]);

  // --- (useEffect Timer tetap sama) ---
  useEffect(() => {
    if (quizData && quizData.duration) {
      const durationInMinutes = parseInt(quizData.duration, 10);
      if (!isNaN(durationInMinutes) && durationInMinutes > 0) {
        const totalSeconds = durationInMinutes * 60;
        setTimeLeft(totalSeconds);
        intervalRef.current = setInterval(() => {
          setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(intervalRef.current);
              Alert.alert(
                'Waktu Habis!',
                'Kuis akan disubmit secara otomatis.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.replace('QuizCongrats', {
                        quizId: quizId,
                        score: score,
                        totalQuestions: quizData.questions.length,
                      });
                    },
                  },
                ],
              );
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [quizData, navigation, quizId, score]);
  // --- (BATAS LOGIKA TIMER) ---

  // --- (Semua handler tetap sama) ---
  const handleAnswerSelect = index => {
    setSelectedAnswerIndex(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswerIndex === null) {
      Alert.alert('Pilih Jawaban', 'Boss harus pilih jawaban dulu!');
      return;
    }
    const currentQuestion = quizData.questions[currentQuestionIndex];
    let currentScore = score;
    if (selectedAnswerIndex === currentQuestion.correctAnswerIndex) {
      currentScore = score + 1;
      setScore(currentScore);
    }
    const isLastQuestion =
      currentQuestionIndex === quizData.questions.length - 1;
    if (isLastQuestion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      navigation.replace('QuizCongrats', {
        quizId: quizId,
        score: currentScore,
        totalQuestions: quizData.questions.length,
      });
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswerIndex(null);
    }
  };

  const handleSeeResult = () => {
    if (currentQuestionIndex === quizData.questions.length - 1) {
      handleNextQuestion();
    } else {
      Alert.alert('Info', 'Selesaikan semua soal untuk melihat hasil.');
    }
  };
  // --- (Batas Handler) ---

  // --- (Tampilan Loading & Kuis Kosong tetap sama) ---
  if (loading || !quizData) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A453C" />
          <Text style={{ marginTop: 10, color: '#555' }}>
            Memuat Soal Kuis...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!quizData.questions || quizData.questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {quizData.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#555', fontSize: 16 }}>
            Kuis ini belum memiliki soal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  // --- (Batas Tampilan Loading) ---

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {quizData.title}
        </Text>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* --- (INI PERBAIKANNYA: Pindahkan ScrollView) --- */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.questionNumber}>
            Pertanyaan {currentQuestionIndex + 1}/{quizData.questions.length}
          </Text>

          {/* --- (INI FITUR BARU) Tampilkan Gambar --- */}
          {currentQuestion.image_url && (
            <Image
              source={{ uri: currentQuestion.image_url }}
              style={styles.questionImage}
              resizeMode="cover"
            />
          )}
          {/* --- (BATAS FITUR BARU) --- */}

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswerIndex === index
                    ? styles.optionButtonSelected
                    : styles.optionButtonDefault,
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <Text
                  style={[
                    styles.optionText,
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
          <TouchableOpacity onPress={handleSeeResult}>
            <Text style={styles.seeResultText}>See Result</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === quizData.questions.length - 1
                ? 'Jawab & Selesai'
                : 'Jawab'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- (STYLES DIMODIFIKASI) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EEE0',
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: '#F4EEE0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EEE0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5, width: 40 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  timerContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Tetap center (untuk soal pendek)
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 10,
    textAlign: 'center',
  },
  // --- (STYLE BARU) ---
  questionImage: {
    width: '100%',
    height: 180, // Tentukan tinggi gambar
    borderRadius: 15,
    marginBottom: 20, // Jarak ke teks soal
    backgroundColor: '#F0F0F0',
  },
  // --- (BATAS STYLE BARU) ---
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
  },
  optionButtonDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  optionButtonSelected: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextDefault: {
    color: '#555',
  },
  optionTextSelected: {
    color: '#6A453C',
    fontWeight: 'bold',
  },
  seeResultText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'right',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#7D5A5A',
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
