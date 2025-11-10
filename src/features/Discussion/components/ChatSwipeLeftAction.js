// src/features/Discussion/components/ChatSwipeLeftAction.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Komponen ini HANYA TAMPILAN. Aksi 'onPress' akan ditangani oleh
// komponen SwipeableRow.js
const ChatSwipeLeftAction = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 10,
    height: '90%',
    alignSelf: 'center',
  },
  button: {
    // Tombol mengisi penuh container-nya
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ChatSwipeLeftAction;
