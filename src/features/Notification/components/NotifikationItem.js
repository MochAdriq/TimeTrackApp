// src/features/Notifications/components/NotificationItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Nanti import ikon SVG/Image di sini
// import TaskIcon from '../../../assets/icons/TaskIcon.svg';

import BellTaskIcon from '../../../assets/icon/BellTaskIcon.svg'; // <<< Tambah .svg
import TaskIcon from '../../../assets/icon/TaskIcon.svg'; // <<< Tambah .svg

// Fungsi helper untuk menentukan ikon (contoh)
const getIcon = type => {
  if (type === 'reminder') {
    // return <BellIcon width={24} height={24} fill="#FF6B6B" />; // Contoh warna merah
    return '🔔'; // Placeholder
  } else if (type === 'task') {
    // return <TaskIcon width={24} height={24} fill="#4ECDC4" />; // Contoh warna tosca
    return '📝'; // Placeholder
  } else {
    // return <DefaultIcon width={24} height={24} fill="#888" />;
    return '⚪'; // Placeholder default
  }
};

// Fungsi helper untuk warna background ikon (contoh)
const getIconBackground = type => {
  if (type === 'reminder') return '#FFEBEE'; // Merah muda
  if (type === 'task') return '#E0F2F7'; // Biru muda
  return '#EEEEEE'; // Abu-abu
};

const NotificationItem = ({ type, title, message, time, badgeCount }) => {
  return (
    <View style={styles.container}>
      {/* Ikon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconBackground(type) },
        ]}
      >
        {/* Panggil fungsi getIcon atau render SVG/Image langsung */}
        <Text style={styles.iconPlaceholder}>{getIcon(type)}</Text>
      </View>

      {/* Teks Notifikasi */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Waktu & Badge */}
      <View style={styles.metaContainer}>
        <Text style={styles.time}>{time}</Text>
        {badgeCount > 0 && ( // Tampilkan badge jika count > 0
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5, // Setengah width/height
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconPlaceholder: {
    // Hapus jika sudah pakai ikon asli
    fontSize: 20,
  },
  textContainer: {
    flex: 1, // Agar mengisi ruang sisa
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
  },
  metaContainer: {
    alignItems: 'flex-end', // Rata kanan
  },
  time: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#4CAF50', // Warna badge hijau (sesuaikan)
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default NotificationItem;
