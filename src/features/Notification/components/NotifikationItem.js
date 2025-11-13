import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// --- Import Ikon ---
import BellTaskIcon from '../../../assets/icon/BellTaskIcon.svg';
import TaskIcon from '../../../assets/icon/TaskIcon.svg';
import ChatIcon from '../../../assets/icon/ChatIcon.svg';
import QuizIcon from '../../../assets/icon/QuizIcon.svg';
import InfoIcon from '../../../assets/icon/InfoIcon.svg';
import MateriIcon from '../../../assets/icon/JelajahIconInactive.svg'; // Asumsi ikon materi

// Fungsi helper untuk menentukan ikon (SESUAI TIPE BARU)
const getIcon = type => {
  if (type === 'QUIZ_NEW') {
    return <QuizIcon width={24} height={24} />;
  } else if (type === 'MATERI_NEW') {
    return <MateriIcon width={24} height={24} fill="#4CAF50" />;
  } else if (type === 'SYSTEM') {
    // Untuk Order
    return <InfoIcon width={24} height={24} />;
  } else if (type === 'chat') {
    return <ChatIcon width={24} height={24} fill="#4A90E2" />;
  } else if (type === 'reminder') {
    return <BellTaskIcon width={24} height={24} />;
  } else if (type === 'QUIZ_COMPLETE') {
    // Selesai Kuis
    return <QuizIcon width={24} height={24} fill="#BDBDBD" />;
  } else if (type === 'TASK') {
    // Selesai Materi
    return <TaskIcon width={24} height={24} />;
  } else {
    return <BellTaskIcon width={24} height={24} />;
  }
};

// Fungsi helper untuk warna background ikon
const getIconBackground = type => {
  if (type === 'QUIZ_NEW') return '#E0F2F7';
  if (type === 'MATERI_NEW') return '#E8F5E9';
  if (type === 'SYSTEM') return '#FFF3E0';
  if (type === 'chat') return '#E7F0FD';
  if (type === 'reminder') return '#FFEBEE';
  if (type === 'QUIZ_COMPLETE') return '#EEEEEE';
  if (type === 'TASK') return '#EEEEEE';
  return '#EEEEEE';
};

const NotificationItem = ({ item }) => {
  const navigation = useNavigation();

  // (INI FUNGSI UTAMA YANG DIPERBAIKI)
  const handlePress = () => {
    const { metadata, navigation_screen, navigation_params, type } = item;

    // --- Skenario 1: Notifikasi dengan METADATA (Sistem BARU) ---
    if (metadata && metadata.entity_type) {
      const { entity_type, entity_id } = metadata;

      console.log(`Navigasi (Metadata): ${entity_type} ID: ${entity_id}`);

      // (INI LOGIKA BARU YANG LEBIH SEDERHANA)
      if (entity_type === 'order' && type === 'SYSTEM') {
        // Arahkan SEMUA status order ke PaymentStatusScreen
        navigation.navigate('PaymentStatus', {
          orderId: entity_id,
        });
      }
      // (BATAS LOGIKA BARU)
      else if (entity_type === 'quiz' && type === 'QUIZ_NEW') {
        navigation.navigate('QuizDetail', {
          id: entity_id,
        });
      } else if (entity_type === 'materi' && type === 'MATERI_NEW') {
        navigation.navigate('MateriDetail', {
          materiId: entity_id,
        });
      }

      // --- Skenario 2: Notifikasi dengan NAVIGASI LAMA (Admin/Chat) ---
    } else if (navigation_screen && (type === 'chat' || type === 'reminder')) {
      console.log(
        `Navigasi (Legacy): ${navigation_screen} Params:`,
        navigation_params,
      );
      navigation.navigate(navigation_screen, navigation_params);
    } else {
      // Ini akan menangkap 'TASK' (Selesai Materi) dan 'QUIZ_COMPLETE' (Selesai Kuis)
      console.log(`Notifikasi tipe ${type} tidak memiliki aksi navigasi.`);
    }
  };

  // Ambil data dari item
  const {
    type,
    title,
    message,
    time,
    badgeCount,
    metadata,
    navigation_screen,
  } = item;

  // (LOGIKA isClickable DIPERBAIKI)
  let isClickable = false;
  if (type === 'SYSTEM' || type === 'QUIZ_NEW' || type === 'MATERI_NEW') {
    isClickable = metadata && metadata.entity_type; // Cek metadata
  } else if (type === 'chat' || type === 'reminder') {
    isClickable = !!navigation_screen; // Cek navigasi lama
  }
  // Notifikasi 'TASK' dan 'QUIZ_COMPLETE' akan 'false'

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!isClickable}
      activeOpacity={isClickable ? 0.7 : 1.0}
    >
      {/* (Sisa UI tetap sama persis) */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconBackground(type) },
        ]}
      >
        <View style={styles.iconPlaceholder}>{getIcon(type)}</View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <View style={styles.metaContainer}>
        <Text style={styles.time}>{time}</Text>
        {badgeCount > 0 && <View style={styles.badge} />}
      </View>
    </TouchableOpacity>
  );
};

// --- (STYLES TETAP SAMA PERSIS) ---
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconPlaceholder: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
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
    alignItems: 'flex-end',
    minWidth: 50,
  },
  time: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#FF0000',
    borderRadius: 6,
    width: 12,
    height: 12,
  },
});

export default NotificationItem;
