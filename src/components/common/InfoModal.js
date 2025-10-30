// src/components/common/InfoModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal'; // Pastikan 'react-native-modal' sudah terinstal
import * as Animatable from 'react-native-animatable'; // 'react-native-animatable' juga sudah ada

const InfoModal = ({
  isVisible,
  onClose,
  title,
  message,
  modalType = 'error', // 'error' atau 'success'
}) => {
  const isError = modalType === 'error';
  const titleColor = isError ? '#D32F2F' : '#4CAF50'; // Merah untuk error, Hijau untuk sukses
  const animation = isError ? 'shake' : 'pulse'; // Animasi berbeda

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.4}
    >
      <Animatable.View
        animation={animation} // Terapkan animasi
        duration={500}
        style={styles.modalContent}
      >
        <Text style={[styles.modalTitle, { color: titleColor }]}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Tutup</Text>
        </TouchableOpacity>
      </Animatable.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20, // Lebih melengkung
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#7D5A5A', // Warna coklat
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 15,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InfoModal;
