// src/components/common/UnderDevelopmentModal.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Modal from 'react-native-modal'; // Import react-native-modal

// Import SVG/Image logo
import TimeTrackLogo from '../../assets/images/TimeTrackLogo.svg'; // Sesuaikan path
import Development from '../../assets/images/development.svg';
import TimeTrackName from '../../assets/images/TimeTrackName.svg';

// Terima isVisible (boolean) dan onClose (fungsi) sebagai props
const UnderDevelopmentModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      isVisible={isVisible} // Kontrol visibilitas modal
      onSwipeComplete={onClose} // Tutup saat swipe ke bawah
      swipeDirection="down" // Arah swipe untuk menutup
      onBackdropPress={onClose} // Tutup saat klik area luar
      style={styles.modal} // Style untuk posisi di bawah
      // Atur animasi (opsional, defaultnya sudah bagus)
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0} // Agar backdrop hilang instan saat modal ditutup
    >
      {/* Konten Modal */}
      <View style={styles.contentContainer}>
        {/* Handle kecil (opsional) */}
        <View style={styles.handle} />

        <Development
          width={80}
          height={80}
          fill="#8B5E3C"
          style={styles.logo}
        />
        <TimeTrackName />
        <Text style={styles.message}>
          Fitur Ini dalam pengembangan developer
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end', // Posisikan modal ke bawah
    margin: 0, // Hapus margin default agar modal full-width
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 22,
    alignItems: 'center', // Pusatkan konten
    borderTopRightRadius: 20, // Lengkungan atas
    borderTopLeftRadius: 20,
    // Tentukan tinggi minimum atau biarkan konten menentukan tinggi
    minHeight: 600, // Contoh tinggi minimum
  },
  handle: {
    // Handle abu-abu kecil di atas (opsional)
    width: 40,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 4,
    marginBottom: 15,
  },
  logo: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25, // Jarak ke tombol tutup
  },
});

export default UnderDevelopmentModal;
