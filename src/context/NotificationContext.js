// src/context/NotificationContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../services/supabaseClient';

// 1. Buat Context
const NotificationContext = createContext({
  unreadCount: 0,
  markAllAsRead: () => {},
  fetchUnreadCount: async () => {}, // <<< TAMBAHKAN FUNGSI KOSONG DI SINI
});

// 2. Buat Provider (yang akan membungkus aplikasi)
export const NotificationProvider = ({ session, children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = session?.user?.id;

  // 3. Fungsi untuk mengambil jumlah notifikasi yang belum dibaca
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error.message);
    }
  }, [userId]);

  // 4. Fungsi untuk menandai semua sebagai "telah dibaca"
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error.message);
    }
  }, [userId]);

  // 5. Efek untuk mengambil data awal saat login
  useEffect(() => {
    if (session) {
      fetchUnreadCount();
    }
  }, [session, fetchUnreadCount]);

  // 6. Efek untuk mendengarkan notifikasi baru (Realtime)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('Notifikasi baru diterima!', payload.new.title);
          setUnreadCount(currentCount => currentCount + 1);
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Terhubung ke channel notifikasi!');
        }
        if (err) {
          console.error('Gagal terhubung ke channel notifikasi:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    // <<< 7. TAMBAHKAN fetchUnreadCount KE VALUE PROVIDER >>>
    <NotificationContext.Provider
      value={{ unreadCount, markAllAsRead, fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// 3. Buat Hook kustom untuk dipakai di komponen lain
export const useNotification = () => useContext(NotificationContext);
