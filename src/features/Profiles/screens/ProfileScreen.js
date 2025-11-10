// src/features/Profiles/screens/ProfileScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  PermissionsAndroid, // <<< 1. IMPORT UNTUK IZIN
  Platform, // <<< 2. IMPORT UNTUK CEK OS
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { decode } from 'base64-arraybuffer';

// --- Import Komponen ---
import EditableInfoRow from '../components/EditableInfoRow';
import InfoModal from '../../../components/common/InfoModal';

// --- Import Supabase ---
import { supabase } from '../../../services/supabaseClient';

// --- Komponen Aksi (Desain Baru, Tanpa Library) ---
const ActionItem = ({ icon, label, onPress, isLast, isLogout }) => (
  <TouchableOpacity
    style={[styles.actionItem, isLast && styles.actionItemLast]}
    onPress={onPress}
  >
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIconText}>{icon}</Text>
    </View>
    <Text style={[styles.actionLabel, isLogout && styles.logoutText]}>
      {label}
    </Text>
    {!isLogout && <Text style={styles.chevronIcon}>›</Text>}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  // ... (State tetap sama) ...
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    title: 'Memuat task...',
    progress: 0,
    total: 1,
    pointsReward: 0,
    isCompleted: false,
  });
  const [profileData, setProfileData] = useState({
    username: '...',
    full_name: 'Memuat...',
    mobile_no: '...',
    email: '...',
    dob: '...',
    upi_id: '...',
    points: 0,
    level: 0,
    avatar_url: null,
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  // --- Fungsi Fetch Data (Tidak diubah) ---
  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      const [profileResult, userTasksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'username, full_name, mobile_no, dob, upi_id, points, level, avatar_url',
          )
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_tasks')
          .select(
            `current_progress, is_completed, tasks ( title, target_count, points_reward, type )`,
          )
          .eq('user_id', user.id)
          .eq('tasks.type', 'read_materi')
          .maybeSingle(),
      ]);

      if (profileResult.error) throw profileResult.error;

      if (profileResult.data) {
        const profile = profileResult.data;
        const fullProfile = {
          username: profile.username || 'Belum diatur',
          full_name: profile.full_name || 'Belum diatur',
          mobile_no: profile.mobile_no || '',
          email: user.email || '',
          dob: profile.dob || '',
          upi_id: profile.upi_id || '',
          points: profile.points || 0,
          level: profile.level || 1,
          avatar_url: profile.avatar_url,
        };
        setProfileData(fullProfile);
        setOriginalProfileData(fullProfile);
      }

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
      console.error('Error fetching profile:', error.message);
      setModalState({
        isVisible: true,
        title: 'Gagal Memuat Profil',
        message: error.message,
        modalType: 'error',
      });
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile(false);
    }, [fetchProfile]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile(true);
  }, [fetchProfile]);

  // --- Fungsi Simpan, Batal, Logout (Dengan perbaikan null-safe) ---
  const handleInputChange = (field, value) => {
    setProfileData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      // Perbaikan Null-safe .trim()
      const updates = {
        username: (profileData.username || '').trim(),
        full_name: (profileData.full_name || '').trim(),
        mobile_no: (profileData.mobile_no || '').trim() || null,
        dob: (profileData.dob || '').trim() || null,
        upi_id: (profileData.upi_id || '').trim() || null,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(true);
      setIsEditing(false);

      setModalState({
        isVisible: true,
        title: 'Profil Disimpan',
        message: 'Informasi profil berhasil diperbarui.',
        modalType: 'success',
      });
    } catch (error) {
      console.error('Error saving profile:', error.message);
      setModalState({
        isVisible: true,
        title: 'Gagal Menyimpan',
        message: error.message,
        modalType: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalProfileData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsSaving(false);
      setModalState({
        isVisible: true,
        title: 'Logout Gagal',
        message: error.message,
        modalType: 'error',
      });
    }
  };

  // --- <<< 3. FUNGSI UNTUK MINTA IZIN (FIX) >>> ---
  const requestPermission = async source => {
    if (Platform.OS !== 'android') return true;

    let permission;
    let title;
    let message;

    if (source === 'camera') {
      permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      title = 'Izin Kamera';
      message = 'TimeTrackApp membutuhkan izin untuk mengakses kamera Anda.';
    } else {
      if (Platform.Version >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        title = 'Izin Galeri';
        message = 'TimeTrackApp membutuhkan izin untuk mengakses foto Anda.';
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        title = 'Izin Penyimpanan';
        message = 'TimeTrackApp membutuhkan izin untuk membaca galeri Anda.';
      }
    }

    try {
      // Periksa apakah izin sudah ada
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true; // Jika sudah diizinkan, langsung return true

      // Jika belum, minta izin
      const granted = await PermissionsAndroid.request(permission, {
        title: title,
        message: message,
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
      });
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Izin diberikan');
        return true;
      } else {
        console.log('Izin ditolak');
        Alert.alert(
          'Izin Ditolak',
          'Anda perlu memberikan izin untuk melanjutkan.',
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // --- FUNGSI UPLOAD FOTO ---
  const handleEditPicture = () => {
    if (!isEditing) return;

    Alert.alert(
      'Ubah Foto Profil',
      'Pilih sumber foto Anda:',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ambil Foto', onPress: () => pickImage('camera') },
        { text: 'Pilih dari Galeri', onPress: () => pickImage('gallery') },
      ],
      { cancelable: true },
    );
  };

  // --- FUNGSI pickImage (FIX: 'length' of undefined) ---
  const pickImage = async source => {
    const options = {
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8,
      includeBase64: true,
    };

    let action = source === 'camera' ? launchCamera : launchImageLibrary;

    // Panggil fungsi izin
    const hasPermission = await requestPermission(source);
    if (!hasPermission) return; // Hentikan jika izin ditolak

    try {
      const response = await action(options);

      if (response.didCancel) {
        console.log('User membatalkan pilihan gambar');
        return;
      }
      if (response.errorCode) {
        throw new Error(response.errorMessage);
      }
      if (!response.assets || response.assets.length === 0) {
        throw new Error('Gagal mendapatkan gambar');
      }

      const asset = response.assets[0];

      // <<< --- INI PERBAIKAN BUG 'length' of undefined --- >>>
      if (!asset.base64) {
        throw new Error(
          'Gagal memproses data gambar (base64 null). Coba gambar lain.',
        );
      }
      // <<< --- BATAS PERBAIKAN --- >>>

      const base64 = asset.base64;
      const contentType = asset.type || 'image/jpeg';

      setIsSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      const filePath = `${user.id}/${new Date().getTime()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date() })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Panggil fetchProfile() agar data baru (termasuk avatar_url)
      // di-fetch ulang ke state
      await fetchProfile(true);

      setModalState({
        isVisible: true,
        title: 'Sukses',
        message: 'Foto profil berhasil diperbarui!',
        modalType: 'success',
      });
    } catch (error) {
      console.error('Error ganti foto profil:', error.message);
      setModalState({
        isVisible: true,
        title: 'Upload Gagal',
        message: error.message,
        modalType: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Navigasi ---
  const handleTaskAction = () => navigation.navigate('Jelajahi');
  const handleChangePassword = () => navigation.navigate('ChangePassword');
  const handleHelp = () => console.log('Help');
  const hideModal = () =>
    setModalState(prev => ({ ...prev, isVisible: false }));

  // Loading Awal
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
        <ActivityIndicator size="large" color="#6A453C" />
        <Text style={styles.loadingText}>Memuat Profil...</Text>
      </SafeAreaView>
    );
  }

  // Progress Bar Task
  const taskProgressPercent =
    (currentTask.progress / (currentTask.total || 1)) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      {/* --- Header (Dengan Ikon Emoji) --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>❌</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.headerButton, styles.headerButtonSave]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.headerButtonSaveText}>✅</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A453C']}
            tintColor={'#6A453C'}
          />
        }
      >
        {/* --- Area Info Profil Atas --- */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleEditPicture} disabled={!isEditing}>
            <Image
              source={
                profileData.avatar_url
                  ? { uri: profileData.avatar_url }
                  : require('../../../assets/images/dummyImage2.png') // Fallback
              }
              style={styles.profilePic}
            />
            {isEditing && (
              <View style={styles.editIconSmallContainer}>
                <Text style={styles.editIconSmallText}>✏️</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{profileData.full_name}</Text>
          <Text style={styles.profileUsername}>@{profileData.username}</Text>
        </View>

        {/* --- Area Stats (Dengan Ikon Emoji) --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{profileData.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🔖</Text>
            <Text style={styles.statValue}>
              {profileData.points.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.statLabel}>Poin</Text>
          </View>
        </View>

        {/* --- Card Task Harian (Dengan Ikon Emoji) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tugas Harian</Text>
          <View style={styles.taskHeader}>
            <View style={styles.taskIcon}>
              <Text style={styles.taskIconText}>
                {currentTask.isCompleted ? '✅' : '📢'}
              </Text>
            </View>
            <Text style={styles.taskInfo} numberOfLines={1}>
              {currentTask.title}
            </Text>
            <Text style={styles.taskProgress}>
              {currentTask.progress}/{currentTask.total}
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${taskProgressPercent}%` },
              ]}
            />
          </View>
          <View style={styles.taskFooter}>
            <Text style={styles.adInfo}>
              Reward: {currentTask.pointsReward} Poin
            </Text>
            <TouchableOpacity
              style={[
                styles.taskButton,
                currentTask.isCompleted && styles.taskButtonCompleted,
              ]}
              onPress={handleTaskAction}
              disabled={currentTask.isCompleted}
            >
              <Text style={styles.taskButtonText}>
                {currentTask.isCompleted ? 'Selesai' : 'Kerjakan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Card Informasi Akun (Sesuai Skema) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          <EditableInfoRow
            label="Email"
            value={profileData.email}
            isEditing={false}
          />
          <EditableInfoRow
            label="Nama Lengkap"
            value={profileData.full_name}
            isEditing={isEditing}
            onChangeText={val => handleInputChange('full_name', val)}
            autoCapitalize="words"
          />
          <EditableInfoRow
            label="No. Telepon"
            value={profileData.mobile_no}
            isEditing={isEditing}
            onChangeText={val => handleInputChange('mobile_no', val)}
            keyboardType="phone-pad"
            placeholder="0812..."
          />
          <EditableInfoRow
            label="Tanggal Lahir"
            value={profileData.dob}
            isEditing={isEditing}
            onChangeText={val => handleInputChange('dob', val)}
            placeholder="YYYY-MM-DD"
          />
          <EditableInfoRow
            label="UPI ID"
            value={profileData.upi_id}
            isEditing={isEditing}
            onChangeText={val => handleInputChange('upi_id', val)}
            placeholder="ID UPI (jika ada)"
            isLast
          />
        </View>

        {/* --- Card Pengaturan Akun (Dengan Ikon Emoji) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pengaturan</Text>
          <ActionItem
            icon="🔒"
            label="Ganti Password"
            onPress={handleChangePassword}
          />
          <ActionItem
            icon="❓"
            label="Bantuan & Dukungan"
            onPress={handleHelp}
            isLast
          />
        </View>

        {/* --- Tombol Logout (Dengan Ikon Emoji) --- */}
        <View style={[styles.card, styles.logoutCard]}>
          <ActionItem
            icon="🔄"
            label="Keluar"
            onPress={handleLogout}
            isLast
            isLogout
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- Modal dan Overlay --- */}
      <InfoModal
        isVisible={modalState.isVisible}
        title={modalState.title}
        message={modalState.message}
        modalType={modalState.modalType}
        onClose={hideModal}
      />
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

// --- STYLES (Versi Emoji) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A453C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F4F4F4',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
  },
  headerButtonText: {
    fontSize: 20,
    color: '#333',
  },
  headerButtonSave: {
    backgroundColor: '#6A453C',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 5,
  },
  headerButtonSaveText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editIconSmallContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A453C',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  editIconSmallText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  profileUsername: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIcon: {
    marginRight: 10,
    width: 20, // Samakan dengan emoji
    alignItems: 'center',
  },
  taskIconText: {
    fontSize: 18,
  },
  taskInfo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginRight: 10,
  },
  taskProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6A453C',
    borderRadius: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  adInfo: { fontSize: 12, color: '#AAA' },
  taskButton: {
    backgroundColor: '#7D5A5A',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  taskButtonCompleted: {
    backgroundColor: '#B0B0B0',
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionListCard: {
    paddingVertical: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionIconText: {
    fontSize: 18,
    color: '#4A2F2F',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  chevronIcon: {
    fontSize: 18,
    color: '#B0B0B0',
  },
  logoutCard: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FFEBE9',
    borderWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  logoutText: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});

export default ProfileScreen;
