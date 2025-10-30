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
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';

const QuizScreen = ({ route, navigation }) => {
  const { quizId, quizTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [score, setScore] = useState(0);

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
            questions (
              id,
              question_text,
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
              options: q.options.map(opt => opt.option_text),
              correctAnswerIndex: q.options.findIndex(
                opt => opt.is_correct === true,
              ),
            }));

          setQuizData({
            title: data.title,
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

  // --- Tampilan Loading Awal (Saat `quizData` masih null) ---
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

  // --- TAMBAHAN: Tampilan Jika Kuis Kosong (Soal tidak ada) ---
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

  // --- Jika aman, baru ambil currentQuestion ---
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
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.questionNumber}>
            Pertanyaan {currentQuestionIndex + 1}/{quizData.questions.length}
          </Text>
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

// --- STYLES (Tetap sama) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EEE0',
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: '#F4EEE0', // Samakan background loading
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
    justifyContent: 'space-between', // Agar judul bisa di tengah
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5, width: 40 }, // Beri lebar agar judul pas di tengah
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: {
    // Style untuk judul di header
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1, // Agar bisa memanjang
    textAlign: 'center', // Tengah
    marginHorizontal: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
    // Style nomor soal
    fontSize: 14,
    color: '#AAA',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center', // Pusatkan soal
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
    textAlign: 'center', // Pusatkan teks opsi
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
