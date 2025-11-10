// src/context/ProfileContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../services/supabaseClient';

// 1. Definisikan data default
const defaultProfile = {
  username: '...',
  full_name: 'Memuat...',
  mobile_no: '...',
  email: '...',
  dob: '...',
  upi_id: '...',
  points: 0,
  level: 0,
  avatar_url: null,
};

// 2. Buat Context
const ProfileContext = createContext({
  profile: defaultProfile,
  loading: true,
  fetchProfile: async () => {}, // Fungsi untuk refresh
});

// 3. Buat Provider (yang akan membungkus aplikasi)
export const ProfileProvider = ({ session, children }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // 4. Fungsi untuk mengambil data profil
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(
          'username, full_name, mobile_no, dob, upi_id, points, level, avatar_url',
        )
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          email: userEmail, // Selalu ambil email terbaru dari session
        });
      }
    } catch (error) {
      console.error('Error fetching profile context:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  // 5. Efek untuk mengambil data saat login
  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      // Jika logout, reset data
      setProfile(defaultProfile);
      setLoading(false);
    }
  }, [session, fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// 6. Buat Hook kustom untuk dipakai di komponen lain
export const useProfile = () => useContext(ProfileContext);
