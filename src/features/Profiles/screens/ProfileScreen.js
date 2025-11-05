// src/features/Profiles/screens/ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// --- Import Komponen ---
import EditableInfoRow from '../components/EditableInfoRow';
import InfoModal from '../../../components/common/InfoModal';

// --- Import Supabase ---
import { supabase } from '../../../services/supabaseClient';

// --- MODIFIKASI 1: Ganti initial hardcoded task dengan default structure ---
const defaultTask = {
  title: 'Baca 5 Materi untuk Mendapatkan Poin',
  progress: 0,
  total: 5,
  pointsReward: 0,
  isCompleted: false,
};

// --- Komponen Aksi (Tidak diubah) ---
const ActionItem = ({ iconPlaceholder, label, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.actionItem, isLast && styles.actionItemLast]}
    onPress={onPress}
  >
    <View style={styles.actionIconPlaceholder}>
      <Text>{iconPlaceholder}</Text>
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // State khusus untuk tombol simpan

  // --- MODIFIKASI 2: Tambahkan state untuk task dinamis ---
  const [currentTask, setCurrentTask] = useState(defaultTask);

  const [profileData, setProfileData] = useState({
    namaPengguna: '',
    fullName: '',
    mobileNo: '',
    email: '',
    dob: '',
    upiId: '',
    points: 0,
    level: 0,
  });

  const [originalProfileData, setOriginalProfileData] = useState(null);

  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  // --- MODIFIKASI 3: Fungsi untuk mengambil data profil DAN Task ---
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      // --- 1. Fetch Profile Data & User Email ---
      const [profileResult, userTasksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('username, full_name, mobile_no, dob, upi_id, points, level')
          .eq('id', user.id)
          .single(),

        // --- 2. Fetch Task Progress (diambil semua task user) ---
        supabase
          .from('user_tasks')
          .select(
            `current_progress, is_completed, tasks ( title, target_count, points_reward, type )`,
          )
          .eq('user_id', user.id),
      ]);

      if (profileResult.error) throw profileResult.error;

      // 3. Set State Profile
      if (profileResult.data) {
        const profile = profileResult.data;
        const fullProfile = {
          namaPengguna: profile.username || '',
          fullName: profile.full_name || '',
          mobileNo: profile.mobile_no || '',
          email: user.email || '', // Ambil email dari auth
          dob: profile.dob || '',
          upiId: profile.upi_id || 'Not Connected',
          points: profile.points || 0,
          level: profile.level || 1,
        };
        setProfileData(fullProfile);
        setOriginalProfileData(fullProfile);
      }

      // 4. Set State Task
      if (userTasksResult.data) {
        const readMateriTask = userTasksResult.data.find(
          t => t.tasks?.type === 'read_materi',
        );
        if (readMateriTask) {
          setCurrentTask({
            title: readMateriTask.tasks.title,
            progress: readMateriTask.current_progress,
            total: readMateriTask.tasks.target_count,
            pointsReward: readMateriTask.tasks.points_reward,
            isCompleted: readMateriTask.is_completed,
          });
        } else {
          // Jika user belum pernah memulai task, ambil template dari tabel master 'tasks'
          const { data: defaultTaskInfo } = await supabase
            .from('tasks')
            .select('title, target_count, points_reward')
            .eq('type', 'read_materi')
            .maybeSingle();

          if (defaultTaskInfo) {
            setCurrentTask({
              ...defaultTask,
              title: defaultTaskInfo.title,
              total: defaultTaskInfo.target_count,
              pointsReward: defaultTaskInfo.points_reward,
            });
          }
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
      setLoading(false);
    }
  }, []);

  // --- useFocusEffect: PENTING untuk refresh poin dan level ---
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  // --- Logika Edit Profil & Logout (Tidak ada perubahan mendasar, hanya penggunaan state) ---

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

      // ... (Logika updates Anda sudah benar) ...
      const updates = {
        username: profileData.namaPengguna.trim(),
        full_name: profileData.fullName.trim(),
        mobile_no: profileData.mobileNo.trim() || null,
        dob: profileData.dob.trim() || null,
        upi_id:
          profileData.upiId === 'Not Connected' ||
          profileData.upiId.trim() === ''
            ? null
            : profileData.upiId.trim(),
        updated_at: new Date(),
      };

      if (profileData.email.trim().toLowerCase() !== user.email) {
        setModalState({
          isVisible: true,
          title: 'Info',
          message: 'Perubahan email belum bisa dilakukan dari halaman ini.',
          modalType: 'error',
        });
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setOriginalProfileData(profileData);
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

  // --- Handler Navigasi Tugas ---
  const handleTaskAction = () => {
    // Arahkan ke halaman tugas Anda (ganti 'PlaceholderScreen' jika sudah ada)
    navigation.replace('MainApp');
  };

  // --- Fungsi lain ---
  const handleEditProfile = () => setIsEditing(true);
  const handleChangePassword = () => navigation.navigate('ChangePassword');
  const handleHelp = () => console.log('Help');
  const handleConnectUpi = () => console.log('Connect UPI');
  const handleLevelPress = () => navigation.navigate('RedeemPoin');
  const handleEditPicture = () => console.log('Edit Picture');

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isVisible: false }));
  };

  const actionListData = isEditing
    ? [
        {
          key: 'save',
          icon: isSaving ? '⏳' : '✅',
          label: 'Simpan Perubahan',
          handler: handleSaveProfile,
          disabled: isSaving,
        },
        {
          key: 'cancel',
          icon: '❌',
          label: 'Batal',
          handler: handleCancelEdit,
          disabled: false,
        },
      ]
    : [
        {
          key: 'edit',
          icon: '✏️',
          label: 'Edit Profile',
          handler: handleEditProfile,
        },
        {
          key: 'password',
          icon: '🔒',
          label: 'Change Password',
          handler: handleChangePassword,
        },
        { key: 'help', icon: '❓', label: 'Help', handler: handleHelp },
        { key: 'logout', icon: '🔄', label: 'Log out', handler: handleLogout },
      ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <ActivityIndicator size="large" color="#6A453C" />
        <Text style={styles.loadingText}>Memuat Profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCurve} />

        {/* --- Profile Picture Section (Avatar) --- */}
        <View style={styles.profilePicWrapper}>
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={handleEditPicture}
            activeOpacity={0.8}
            disabled={!isEditing}
          >
            <View style={styles.profilePicPlaceholder}>
              <Text style={{ fontSize: 50 }}>👤</Text>
            </View>
            {isEditing && (
              <View style={styles.editIconSmallContainer}>
                <View style={styles.editIconSmallPlaceholder}>
                  <Text style={{ fontSize: 10 }}>✏️</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentArea}>
          {isEditing ? (
            <TextInput
              style={[styles.userNameText, styles.userNameInput]}
              value={profileData.namaPengguna}
              onChangeText={val => handleInputChange('namaPengguna', val)}
            />
          ) : (
            <Text style={styles.userNameText}>{profileData.namaPengguna}</Text>
          )}

          {!isEditing && (
            <View style={styles.greetingSection}>
              <View style={styles.coinIconPlaceholderLarge}>
                <Text style={{ fontSize: 24 }}>💰</Text>
              </View>
              <View style={styles.greetingText}>
                {/* Menampilkan Full Name/Username */}
                <Text style={styles.helloText}>
                  Hello {profileData.fullName || profileData.namaPengguna}
                </Text>
                {/* Menampilkan POIN yang terhubung dari DB */}
                <Text style={styles.pointsText}>
                  {profileData.points.toLocaleString('id-ID')} Poin
                </Text>
              </View>
              <TouchableOpacity
                style={styles.levelButton}
                onPress={handleLevelPress}
              >
                {/* Menampilkan LEVEL yang terhubung dari DB */}
                <Text style={styles.levelButtonText}>
                  Level {profileData.level}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- Task Card Dinamis --- */}
          {!isEditing && (
            <View style={styles.card}>
              <View style={styles.taskHeader}>
                <View
                  style={[
                    styles.taskIconPlaceholder,
                    currentTask.isCompleted && { backgroundColor: '#A8E6CF' },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>
                    {currentTask.isCompleted ? '✅' : '📢'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.taskInfo,
                    currentTask.isCompleted && { color: '#2C5F2D' },
                  ]}
                >
                  Task : {currentTask.title}
                </Text>
                <Text style={styles.taskProgress}>
                  {currentTask.progress}/{currentTask.total}
                </Text>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.adInfo}>
                  Reward: {currentTask.pointsReward} Poin
                </Text>
                <TouchableOpacity
                  style={[
                    styles.taskButton,
                    currentTask.isCompleted && { backgroundColor: '#808080' },
                  ]}
                  onPress={handleTaskAction}
                  disabled={currentTask.isCompleted}
                >
                  <Text style={styles.taskButtonText}>
                    {currentTask.isCompleted ? 'Selesai' : 'Baca'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isEditing && (
            <Text style={styles.editTitle}>Edit Informasi Dasar</Text>
          )}

          <View
            style={[
              styles.card,
              styles.infoCard,
              isEditing && styles.infoCardEditing,
            ]}
          >
            {/* ... (EditableInfoRow components) ... */}
            <EditableInfoRow
              label="Username"
              value={profileData.namaPengguna}
              isEditing={isEditing}
              onChangeText={val => handleInputChange('namaPengguna', val)}
              autoCapitalize="none"
            />
            <EditableInfoRow
              label="Name"
              value={profileData.fullName}
              isEditing={isEditing}
              onChangeText={val => handleInputChange('fullName', val)}
              autoCapitalize="words"
            />
            <EditableInfoRow
              label="Mobile No"
              value={profileData.mobileNo}
              isEditing={isEditing}
              onChangeText={val => handleInputChange('mobileNo', val)}
              keyboardType="phone-pad"
            />
            <EditableInfoRow
              label="Email address"
              value={profileData.email}
              isEditing={false} // <<< Email tetap tidak bisa diedit di sini
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <EditableInfoRow
              label="D.O.B."
              value={profileData.dob}
              isEditing={isEditing}
              onChangeText={val => handleInputChange('dob', val)}
              placeholder="YYYY-MM-DD"
            />
            <EditableInfoRow
              label="Upi Id"
              value={profileData.upiId}
              isEditing={isEditing}
              onChangeText={val => handleInputChange('upiId', val)}
              showButton={!isEditing && profileData.upiId === 'Not Connected'}
              onButtonPress={handleConnectUpi}
            />
          </View>

          <View style={[styles.card, styles.actionListCard]}>
            {actionListData.map((item, index) => (
              <ActionItem
                key={item.key}
                iconPlaceholder={item.icon}
                label={item.label}
                onPress={item.handler}
                isLast={index === actionListData.length - 1}
              />
            ))}
          </View>
          <View style={{ height: 90 }} />
        </View>
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

// --- STYLES (Tidak diubah) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollView: { flex: 1, backgroundColor: '#F4F4F4' },
  scrollContent: { paddingBottom: 20 },
  topCurve: {
    height: 140,
    backgroundColor: '#6A453C',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profilePicWrapper: {
    alignItems: 'center',
    marginTop: -60,
    zIndex: 1,
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  editIconSmallContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#555',
    padding: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  editIconSmallPlaceholder: {
    /* Style ikon pensil */
  },
  contentArea: {
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 75,
    zIndex: 0,
    minHeight: 500,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    paddingVertical: 5,
  },
  userNameInput: {
    borderBottomWidth: 1,
    borderColor: '#C0C0C0',
    paddingBottom: 5,
    textAlign: 'center',
  },
  editTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  coinIconPlaceholderLarge: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFECB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  greetingText: { flex: 1, marginRight: 10 },
  helloText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  pointsText: { fontSize: 14, color: '#777' },
  levelButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelButtonText: { color: '#6A453C', fontWeight: 'bold', fontSize: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskInfo: { flex: 1, fontSize: 13, color: '#555', marginRight: 10 },
  taskProgress: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  adInfo: { fontSize: 11, color: '#AAA' },
  taskButton: {
    backgroundColor: '#7D5A5A',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  taskButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
    elevation: 1,
    shadowOpacity: 0.05,
  },
  infoCardEditing: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
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
  actionIconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    paddingTop: 100,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A453C',
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
