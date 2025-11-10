// src/features/Notifications/screens/NotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import NotificationItem from '../components/NotifikationItem'; // <<< Nama file Boss
import { supabase } from '../../../services/supabaseClient';
import { useNotification } from '../../../context/NotificationContext';

// --- Fungsi Grouping (Tetap sama) ---
const groupNotificationsByDate = data => {
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);

  return data.reduce((acc, notification) => {
    const notifDate = new Date(notification.created_at).setHours(0, 0, 0, 0);
    let group = 'Sebelumnya';

    if (notifDate === today) {
      group = 'Hari ini';
    } else if (notifDate === yesterday) {
      group = 'Kemarin';
    }

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(notification);
    return acc;
  }, {});
};

// --- Fungsi Format Waktu (Tetap sama) ---
const formatTime = isoString => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
  if (diffInHours < 24) return `${diffInHours}j lalu`;
  if (diffInDays === 1) return 'Kemarin';
  return `${diffInDays}h lalu`;
};

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { markAllAsRead } = useNotification();

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true); // Panggil fetch data
    markAllAsRead(); // Juga tandai sudah dibaca saat refresh
  }, [fetchNotifications, markAllAsRead]);

  useEffect(() => {
    fetchNotifications(false); // Panggilan awal
    markAllAsRead();
  }, [fetchNotifications, markAllAsRead]);

  const groupedData = groupNotificationsByDate(notifications);
  const sections = Object.keys(groupedData);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        {/* ... (Header tetap sama) ... */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tampilkan loading HANYA jika bukan sedang refreshing */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6A453C" />
        </View>
      ) : sections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6A453C']}
              tintColor={'#6A453C'}
            />
          }
        >
          <Text style={styles.emptyText}>Tidak ada notifikasi.</Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6A453C']}
              tintColor={'#6A453C'}
            />
          }
        >
          {sections.map(sectionTitle => (
            <View key={sectionTitle} style={styles.section}>
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
              {groupedData[sectionTitle].map(item => (
                // <<< 1. MODIFIKASI DI SINI: Kirim 'item' utuh >>>
                <NotificationItem
                  key={item.id}
                  item={{
                    ...item,
                    time: formatTime(item.created_at), // Format waktu
                    badgeCount: !item.is_read ? 1 : 0, // Hitung badge
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ... (Styles tetap sama)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  scrollContainer: {
    padding: 15,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default NotificationScreen;
