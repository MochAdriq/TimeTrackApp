// src/features/Home/components/QuickActions.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// --- Impor ikon SVG ---
import MapsIcon from '../../../assets/icon/MapsIcon.svg';
import QuizIcon from '../../../assets/icon/QuizIcon.svg';
import BagIcon from '../../../assets/icon/BagIcon.svg';
import GroupIcon from '../../../assets/icon/GroupIcon.svg';

const actions = [
  { id: 'peta', label: 'Peta Sejarah' },
  { id: 'quiz', label: 'Quizz Sejarah' },
  { id: 'market', label: 'Market Place' },
  { id: 'diskusi', label: 'Ruang Diskusi' },
];

// --- TERIMA PROP 'onActionPress' DI SINI ---
const QuickActions = ({ onActionPress }) => {
  const handleActionPress = actionId => {
    // Log internal (tetap ada)
    console.log(`Action pressed: ${actionId}`);

    // --- PANGGIL FUNGSI DARI HomeScreen (PROP) ---
    // Cek dulu apakah prop-nya diberikan, lalu panggil
    if (onActionPress) {
      onActionPress(actionId); // <<<--- BARIS PENTING DITAMBAHKAN
    }
    // --- AKHIR BAGIAN PENTING ---
  };

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionItem}
          // Pastikan onPress memanggil handler internal
          onPress={() => handleActionPress(action.id)}
        >
          <View style={styles.iconBackground}>
            {/* Render Ikon SVG berdasarkan action.id */}
            {action.id === 'peta' && <MapsIcon width={30} height={30} />}
            {action.id === 'quiz' && <QuizIcon width={30} height={30} />}
            {action.id === 'market' && <BagIcon width={30} height={30} />}
            {action.id === 'diskusi' && <GroupIcon width={30} height={30} />}
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ... (Styles tetap sama)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: '#E9E2CF', // Warna dari kode Boss
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    alignItems: 'center',
    maxWidth: 70,
  },
  iconBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 8,
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    color: '#5C5C5C',
    textAlign: 'center',
  },
});

export default QuickActions;
