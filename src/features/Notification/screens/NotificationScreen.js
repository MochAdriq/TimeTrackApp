// src/features/Notifications/screens/NotificationScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import NotificationItem from '../components/NotifikationItem'; // Import item

// --- Data Dummy ---
const dummyNotifications = [
  // Hari ini
  {
    id: '1',
    type: 'reminder',
    title: 'Saatnya membaca',
    message: 'Pelajari lebih lanjut mengenai bacaan yang terakhir kali dibaca',
    time: '2min ago',
    badgeCount: 2,
    dateGroup: 'Hari ini',
  },
  {
    id: '2',
    type: 'task',
    title: 'Saatnya mengerjakan tugas',
    message: 'Pelajari lebih lanjut mengenai tugas yang belum dikerjakan',
    time: '14min ago',
    badgeCount: 0,
    dateGroup: 'Hari ini',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Saatnya membaca',
    message: 'Pelajari lebih lanjut mengenai bacaan yang terakhir kali dibaca',
    time: '9min ago',
    badgeCount: 3,
    dateGroup: 'Hari ini',
  }, // Duplikat judul sengaja
  // Kemarin
  {
    id: '4',
    type: 'task',
    title: 'Pengingat mengerjakan tugas',
    message: 'Pelajari lebih lanjut mengenai pengingat mengerjakan tugas',
    time: '30min ago',
    badgeCount: 1,
    dateGroup: 'Kemarin',
  },
  {
    id: '5',
    type: 'task',
    title: 'Pengingat mengerjakan tugas',
    message: 'Pelajari lebih lanjut mengenai pengingat mengerjakan tugas',
    time: '58min ago',
    badgeCount: 0,
    dateGroup: 'Kemarin',
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Pengingat saatnya membaca',
    message: 'Pelajari lebih lanjut mengenai pengingat saatnya membaca',
    time: '45min ago',
    badgeCount: 2,
    dateGroup: 'Kemarin',
  },
];

// Fungsi untuk mengelompokkan data
const groupNotifications = data => {
  return data.reduce((acc, notification) => {
    const group = notification.dateGroup;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(notification);
    return acc;
  }, {});
};

const NotificationScreen = ({ navigation }) => {
  const groupedData = groupNotifications(dummyNotifications);
  const sections = Object.keys(groupedData); // Ambil nama grup ('Hari ini', 'Kemarin')

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bawaan Sementara (Ganti dengan header kustom jika perlu) */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        {/* Tombol kembali (butuh navigation) */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 40 }} /> {/* Spacer agar judul di tengah */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {sections.map(sectionTitle => (
          <View key={sectionTitle} style={styles.section}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            {groupedData[sectionTitle].map(item => (
              <NotificationItem
                key={item.id}
                type={item.type}
                title={item.title}
                message={item.message}
                time={item.time}
                badgeCount={item.badgeCount}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background abu-abu muda
  },
  header: {
    // Header sederhana
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
    marginLeft: 5, // Sedikit indentasi judul section
  },
});

export default NotificationScreen;
