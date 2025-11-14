import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// --- Import Komponen ---
import EditableInfoRow from '../components/EditableInfoRow';
import InfoModal from '../../../components/common/InfoModal';

// --- Import Context & Supabase ---
import { useProfile } from '../../../context/ProfileContext';
import { supabase } from '../../../services/supabaseClient';

import HelpIcon from '../../../assets/icon/HelpIcon.svg';

// --- Komponen Aksi (ActionItem) ---
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
  // --- 1. KONSUMSI DATA DARI CONTEXT ---
  const {
    profile: contextProfile,
    currentTask,
    loading: contextLoading,
    isSaving,
    fetchProfile,
    saveProfile,
    uploadAvatar,
  } = useProfile(); // --- 2. STATE LOKAL HANYA UNTUK UI ---

  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(contextProfile); // Untuk form edit
  const [originalProfileData, setOriginalProfileData] =
    useState(contextProfile); // Untuk 'cancel'
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });
  const [timeLeft, setTimeLeft] = useState('Memuat...');
  const handleLevelTap = () => {
    navigation.navigate('Profil');
    navigation.closeDrawer();
  };
  useEffect(() => {
    setProfileData(contextProfile);
    setOriginalProfileData(contextProfile);
  }, [contextProfile]); // Efek untuk Timer Countdown Tugas Harian

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 0, 0); // Target: Besok jam 00:00:00

      const difference = midnight.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
          .toString()
          .padStart(2, '0');
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        )
          .toString()
          .padStart(2, '0');
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, '0');
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      } else {
        setTimeLeft('Mengatur ulang...');
      }
    };

    calculateTimeLeft(); // Panggil sekali saat load
    const timer = setInterval(calculateTimeLeft, 1000); // Update tiap detik

    return () => clearInterval(timer); // Cleanup
  }, []); // Fungsi Pull-to-Refresh

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile(true); // Memanggil fetch dari context
    setRefreshing(false);
  }, [fetchProfile]); // --- 4. FUNGSI HANDLER ---

  const handleInputChange = (field, value) => {
    setProfileData(prevData => ({ ...prevData, [field]: value }));
  }; // Menyimpan perubahan (memanggil context)

  const handleSaveProfile = async () => {
    try {
      // --- (INI PERBAIKANNYA) Hapus 'upi_id' ---
      const updates = {
        username: (profileData.username || '').trim(),
        full_name: (profileData.full_name || '').trim(),
        mobile_no: (profileData.mobile_no || '').trim() || null,
        dob: (profileData.dob || '').trim() || null,
        // upi_id: (profileData.upi_id || '').trim() || null, // <-- HAPUS INI
        updated_at: new Date(),
      };
      // --- (BATAS PERBAIKAN) ---

      await saveProfile(updates); // Panggil fungsi context

      setIsEditing(false);
      setModalState({
        isVisible: true,
        title: 'Profil Disimpan',
        message: 'Informasi profil berhasil diperbarui.',
        modalType: 'success',
      });
    } catch (error) {
      setModalState({
        isVisible: true,
        title: 'Gagal Menyimpan',
        message: error.message,
        modalType: 'error',
      });
    }
  }; // Batal edit

  const handleCancelEdit = () => {
    setProfileData(originalProfileData);
    setIsEditing(false);
  }; // Logout (tetap lokal)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setModalState({
        isVisible: true,
        title: 'Logout Gagal',
        message: error.message,
        modalType: 'error',
      });
    }
  }; // --- 5. FUNGSI UPLOAD FOTO --- // Meminta izin (Android)

  const requestPermission = async source => {
    if (Platform.OS !== 'android') return true;
    let permission;
    let title;
    let message;

    if (source === 'camera') {
      permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      title = 'Izin Kamera';
      message = 'Aplikasi membutuhkan izin untuk mengakses kamera Anda.';
    } else {
      permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      title = 'Izin Galeri';
      message = 'Aplikasi membutuhkan izin untuk mengakses foto Anda.';
    }

    try {
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;

      const granted = await PermissionsAndroid.request(permission, {
        title,
        message,
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
      });
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
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
  }; // Menampilkan Alert Pilihan (Kamera/Galeri)

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
  }; // Memilih gambar dan memanggil context

  const pickImage = async source => {
    const options = {
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8,
      includeBase64: true,
    };

    const action = source === 'camera' ? launchCamera : launchImageLibrary;
    const hasPermission = await requestPermission(source);
    if (!hasPermission) return;

    try {
      const response = await action(options);

      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorMessage);
      if (!response.assets || response.assets.length === 0)
        throw new Error('Gagal mendapatkan gambar');

      const asset = response.assets[0];
      if (!asset.base64)
        throw new Error('Gagal memproses data gambar (base64 null).');

      await uploadAvatar(asset); // Panggil fungsi context

      setModalState({
        isVisible: true,
        title: 'Sukses',
        message: 'Foto profil berhasil diperbarui!',
        modalType: 'success',
      });
    } catch (error) {
      setModalState({
        isVisible: true,
        title: 'Upload Gagal',
        message: error.message,
        modalType: 'error',
      });
    }
  }; // --- 6. NAVIGASI ---

  const handleTaskAction = () => navigation.navigate('Jelajah');
  const handleChangePassword = () => navigation.navigate('ChangePassword');
  const handleHelp = () => navigation.navigate('SupportChat');
  const hideModal = () =>
    setModalState(prev => ({ ...prev, isVisible: false })); // --- 7. RENDER --- // Tampilan Loading Awal

  if (contextLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
        <ActivityIndicator size="large" color="#6A453C" />
        <Text style={styles.loadingText}>Memuat Profil...</Text>
      </SafeAreaView>
    );
  } // Kalkulasi progress bar

  const taskProgressPercent =
    (currentTask.progress / (currentTask.total || 1)) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
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
        {/* --- Area Info Profil --- */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleEditPicture} disabled={!isEditing}>
            <Image
              source={
                profileData.avatar_url
                  ? { uri: profileData.avatar_url }
                  : require('../../../assets/images/dummyImage2.png')
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
        <TouchableOpacity>
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
        </TouchableOpacity>
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Tugas Harian</Text>
            <Text style={styles.timerText}>Reset dalam: {timeLeft}</Text>
          </View>

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

          {/* --- (INI PERBAIKANNYA) Ganti UPI dengan Plan --- */}
          <EditableInfoRow
            label="Status Plan"
            value={profileData.plan === 'premium' ? 'Premium' : 'Free'}
            isEditing={false} // Tidak bisa diedit
            isLast
          />
          {/* --- (BATAS PERBAIKAN) --- */}
        </View>
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

// --- (STYLES TETAP SAMA) ---
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
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIcon: {
    marginRight: 10,
    width: 20,
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
