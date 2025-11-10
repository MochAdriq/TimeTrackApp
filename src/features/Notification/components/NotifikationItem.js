// src/features/Notification/components/NotificationItem.js
import React from 'react';
// <<< 1. IMPORT TouchableOpacity dan useNavigation >>>
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// --- Import Ikon ---
import BellTaskIcon from '../../../assets/icon/BellTaskIcon.svg';
import TaskIcon from '../../../assets/icon/TaskIcon.svg';
import ChatIcon from '../../../assets/icon/ChatIcon.svg'; // <<< 2. IMPORT IKON CHAT

// Fungsi helper untuk menentukan ikon (contoh)
const getIcon = type => {
  if (type === 'reminder') {
    // return <BellIcon width={24} height={24} fill="#FF6B6B" />;
    return <BellTaskIcon width={24} height={24} />; // Placeholder
  } else if (type === 'task') {
    // return <TaskIcon width={24} height={24} fill="#4ECDC4" />;
    return <TaskIcon width={24} height={24} />; // Placeholder
  } else if (type === 'chat') {
    // <<< 3. TAMBAHKAN CASE UNTUK 'chat' >>>
    return <ChatIcon width={24} height={24} fill="#4A90E2" />;
  } else {
    // return <DefaultIcon width={24} height={24} fill="#888" />;
    return <BellTaskIcon width={24} height={24} />; // Default
  }
};

// Fungsi helper untuk warna background ikon (contoh)
const getIconBackground = type => {
  if (type === 'reminder') return '#FFEBEE'; // Merah muda
  if (type === 'task') return '#E0F2F7'; // Biru muda
  if (type === 'chat') return '#E7F0FD'; // <<< 4. TAMBAHKAN CASE UNTUK 'chat'
  return '#EEEEEE'; // Abu-abu
};

// <<< 5. UBAH PROPS: Terima 'item' lengkap, bukan properti terpisah >>>
const NotificationItem = ({ item }) => {
  const navigation = useNavigation();

  // <<< 6. BUAT FUNGSI handlePress UNTUK NAVIGASI >>>
  const handlePress = () => {
    const screen = item.navigation_screen;
    const params = item.navigation_params;

    // Cek jika ada data navigasi di notifikasi
    if (screen) {
      console.log(`Navigasi ke: ${screen} dengan params:`, params);
      navigation.navigate(screen, params);
    } else {
      console.log('Notifikasi ini tidak memiliki aksi navigasi.');
    }
  };

  // Ambil data dari item
  const { type, title, message, time, badgeCount } = item;

  return (
    // <<< 7. UBAH View MENJADI TouchableOpacity >>>
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Ikon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconBackground(type) },
        ]}
      >
        <View style={styles.iconPlaceholder}>{getIcon(type)}</View>
      </View>

      {/* Teks Notifikasi */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {/* Waktu & Badge */}
      <View style={styles.metaContainer}>
        <Text style={styles.time}>{time}</Text>
        {badgeCount > 0 && ( // Tampilkan badge jika count > 0
          <View style={styles.badge} /> // <<< 8. Ubah jadi titik saja
        )}
      </View>
    </TouchableOpacity>
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
    minWidth: 50, // <<< Beri lebar minimum
  },
  time: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#FF0000', // Merah
    borderRadius: 6,
    width: 12,
    height: 12,
  },
  badgeText: {},
});

export default NotificationItem;
