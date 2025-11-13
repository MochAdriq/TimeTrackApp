// src/context/ProfileContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../services/supabaseClient';
import { decode } from 'base64-arraybuffer'; // <<< TAMBAHKAN IMPORT INI

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

// Data default untuk task
const defaultTask = {
  title: 'Memuat task...',
  progress: 0,
  total: 1,
  pointsReward: 0,
  isCompleted: false,
};

// 2. Buat Context
const ProfileContext = createContext({
  profile: defaultProfile,
  currentTask: defaultTask,
  loading: true,
  isSaving: false,
  fetchProfile: async (isRefresh = false) => {}, // Fungsi untuk refresh
  saveProfile: async updates => {}, // Fungsi untuk simpan data teks
  uploadAvatar: async asset => {}, // Fungsi untuk upload foto
});

// 3. Buat Provider
export const ProfileProvider = ({ session, children }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [currentTask, setCurrentTask] = useState(defaultTask);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // <<< TAMBAHKAN STATE SAVING

  const userId = session?.user?.id;
  const userEmail = session?.user?.email; // 4. Fungsi FETCH UTAMA (Digabungkan dari ProfileScreen.js)

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      if (!isRefresh) setLoading(true);

      try {
        // Gunakan Promise.all seperti di ProfileScreen
        const [profileResult, userTasksResult] = await Promise.all([
          supabase
            .from('profiles')
            .select(
              'username, full_name, mobile_no, dob, upi_id, points, level, avatar_url, plan',
            )
            .eq('id', userId)
            .single(),
          supabase
            .from('user_tasks')
            .select(
              `current_progress, is_completed, tasks ( title, target_count, points_reward, type )`,
            )
            .eq('user_id', userId)
            .eq('tasks.type', 'read_materi') // Asumsi task 'read_materi' selalu ada
            .maybeSingle(),
        ]); // Proses data profil

        if (profileResult.error && profileResult.status !== 406) {
          throw profileResult.error;
        }
        if (profileResult.data) {
          setProfile({
            ...profileResult.data,
            email: userEmail,
          });
        } // Proses data task

        if (userTasksResult.data) {
          const readMateriTask = userTasksResult.data;
          setCurrentTask({
            title: readMateriTask.tasks.title,
            progress: readMateriTask.current_progress,
            total: readMateriTask.tasks.target_count,
            pointsReward: readMateriTask.tasks.points_reward,
            isCompleted: readMateriTask.is_completed,
          });
        } else {
          // Fallback jika user belum ada data task (mungkin user baru)
          const { data: defaultTaskInfo } = await supabase
            .from('tasks')
            .select('title, target_count, points_reward')
            .eq('type', 'read_materi')
            .maybeSingle();
          if (defaultTaskInfo) {
            setCurrentTask({
              title: defaultTaskInfo.title,
              progress: 0,
              total: defaultTaskInfo.target_count,
              pointsReward: defaultTaskInfo.points_reward,
              isCompleted: false,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile context:', error.message);
      } finally {
        setLoading(false);
      }
    },
    [userId, userEmail],
  ); // 5. Efek untuk mengambil data saat login

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setProfile(defaultProfile);
      setCurrentTask(defaultTask);
      setLoading(false);
    }
  }, [session, fetchProfile]);

  const saveProfile = async updates => {
    if (!userId) throw new Error('User tidak login');
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error; // Refresh data di context setelah berhasil
      await fetchProfile(true);
    } catch (error) {
      console.error('Error saving profile:', error.message);
      throw error; // Lempar error agar bisa ditangkap di screen
    } finally {
      setIsSaving(false);
    }
  }; // 7. Fungsi untuk UPLOAD AVATAR

  const uploadAvatar = async asset => {
    if (!userId) throw new Error('User tidak login');
    setIsSaving(true);

    try {
      const { base64, type } = asset;
      const contentType = type || 'image/jpeg';
      const filePath = `${userId}/${new Date().getTime()}.png`; // 1. Upload ke Storage

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType,
          upsert: true,
        });
      if (uploadError) throw uploadError; // 2. Dapatkan Public URL

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl; // 3. Update tabel profiles

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date() })
        .eq('id', userId);
      if (dbError) throw dbError; // 4. Refresh data di context

      await fetchProfile(true);
    } catch (error) {
      console.error('Error uploading avatar:', error.message);
      throw error; // Lempar error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        currentTask,
        loading,
        isSaving,
        fetchProfile,
        saveProfile,
        uploadAvatar,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// 8. Buat Hook kustom untuk dipakai di komponen lain
export const useProfile = () => useContext(ProfileContext);
