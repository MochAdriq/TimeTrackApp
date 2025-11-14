// src/components/common/InfoModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';

const InfoModal = ({
  isVisible,
  onClose,
  title,
  message,
  modalType = 'error', // 'error', 'success', atau 'info'

  // --- TAMBAHKAN PROPS BARU INI ---
  confirmText, // Teks untuk tombol konfirmasi (misal: "Upgrade")
  onConfirm, // Fungsi yang dijalankan saat tombol konfirmasi ditekan
}) => {
  const isError = modalType === 'error';
  const isSuccess = modalType === 'success';

  // Tentukan warna title berdasarkan modalType
  const titleColor = isError
    ? '#D32F2F' // Merah
    : isSuccess
    ? '#4CAF50' // Hijau
    : '#0288D1'; // Biru (untuk 'info' premium)

  const animation = isError ? 'shake' : 'pulse';

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
        animation={animation}
        duration={500}
        style={styles.modalContent}
      >
        <Text style={[styles.modalTitle, { color: titleColor }]}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>

        {/* --- UBAH LOGIKA TOMBOL --- */}
        <View style={styles.buttonContainer}>
          {/* Tombol Tutup/Batal (selalu ada) */}
          <TouchableOpacity
            // Jika ada onConfirm, tombol ini jadi "Batal" (warna netral)
            style={[styles.modalButton, onConfirm && styles.cancelButton]}
            onPress={onClose}
          >
            <Text
              style={[
                styles.modalButtonText,
                onConfirm && styles.cancelButtonText,
              ]}
            >
              {onConfirm ? 'Batal' : 'Tutup'}
            </Text>
          </TouchableOpacity>

          {/* Tombol Konfirmasi (hanya muncul jika onConfirm ada) */}
          {onConfirm && (
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>{confirmText || 'OK'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* --- AKHIR PERUBAHAN --- */}
      </Animatable.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
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
  // --- STYLE TOMBOL BARU ---
  buttonContainer: {
    flexDirection: 'row-reverse', // Tombol konfirmasi di kanan
    width: '100%',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1, // Agar tombol mengisi ruang
    backgroundColor: '#7D5A5A', // Warna default "Tutup"
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tombol konfirmasi (warna primer)
  confirmButton: {
    backgroundColor: '#6A453C', // Warna coklat tua
  },
  // Tombol batal (warna netral)
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#555',
  },
});

export default InfoModal;
