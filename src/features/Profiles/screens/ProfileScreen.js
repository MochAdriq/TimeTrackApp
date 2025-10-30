// src/features/Profiles/screens/ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react'; // <<< 1. Import useEffect & useCallback
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
  ActivityIndicator, // <<< 2. Import ActivityIndicator
  // Alert, // <<< Hapus Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <<< 3. Import useFocusEffect

// --- Import Komponen ---
import EditableInfoRow from '../components/EditableInfoRow';
import InfoModal from '../../../components/common/InfoModal'; // <<< 4. Import InfoModal

// --- Import Supabase ---
import { supabase } from '../../../services/supabaseClient'; // <<< 5. Import Supabase

// --- Hapus initialUserData ---
// const initialUserData = { ... };

const currentTask = {
  title: 'Baca 5 Sejarah untuk Mendapatkan poin',
  progress: 1,
  total: 5,
  adReward: 100,
};

// --- Komponen Aksi (Tetap sama) ---
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

  // --- 6. State untuk data profil & loading ---
  const [loading, setLoading] = useState(true); // Mulai dengan loading
  const [isSaving, setIsSaving] = useState(false); // State khusus untuk tombol simpan

  const [profileData, setProfileData] = useState({
    // State awal kosong
    namaPengguna: '',
    fullName: '',
    mobileNo: '',
    email: '',
    dob: '',
    upiId: '',
    points: 0,
    level: 0,
  });

  // State untuk data asli (untuk perbandingan & batal)
  const [originalProfileData, setOriginalProfileData] = useState(null);

  // State untuk modal (pengganti Alert)
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  // --- 7. Fungsi untuk mengambil data profil ---
  const fetchProfile = async () => {
    setLoading(true); // Tampilkan loading penuh
    try {
      // 1. Ambil user yang sedang login dari Auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      // 2. Ambil data profil dari tabel 'profiles'
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, mobile_no, dob, upi_id, points, level')
        .eq('id', user.id)
        .single(); // Ambil 1 baris

      if (profileError) {
        // Jika user ada di auth tapi tidak ada di profiles (mungkin gagal pas daftar)
        if (profileError.code === 'PGRST116') {
          throw new Error(
            'Profil Anda tidak ditemukan di database. Silakan hubungi support.',
          );
        }
        throw profileError;
      }

      // 3. Set state dengan data gabungan
      if (profile) {
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
        setOriginalProfileData(fullProfile); // Simpan data asli untuk 'Batal'
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
  };

  // --- 8. Gunakan useFocusEffect ---
  // Ini akan berjalan setiap kali user kembali ke layar ini
  useFocusEffect(
    useCallback(() => {
      fetchProfile(); // Ambil data profil terbaru
    }, []),
  );

  // Fungsi untuk update data di state
  const handleInputChange = (field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  // --- 9. Modifikasi Fungsi Simpan ---
  const handleSaveProfile = async () => {
    setIsSaving(true); // Tampilkan loading di tombol Simpan
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      // Siapkan data untuk update
      const updates = {
        username: profileData.namaPengguna.trim(),
        full_name: profileData.fullName.trim(),
        mobile_no: profileData.mobileNo.trim() || null,
        dob: profileData.dob.trim() || null, // Kirim null jika kosong
        upi_id:
          profileData.upiId === 'Not Connected' ||
          profileData.upiId.trim() === ''
            ? null
            : profileData.upiId.trim(),
        updated_at: new Date(), // Set waktu update
      };

      // Cek apakah email diubah (ini butuh penanganan khusus)
      if (profileData.email.trim().toLowerCase() !== user.email) {
        // --- TODO: Handle Update Email ---
        // Ini lebih rumit, butuh konfirmasi.
        // Untuk sekarang, kita tampilkan pesan bahwa email tidak bisa diubah di sini.
        setModalState({
          isVisible: true,
          title: 'Info',
          message: 'Perubahan email belum bisa dilakukan dari halaman ini.',
          modalType: 'error',
        });
        // Jangan update email di 'updates'
      }

      // Query update ke Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Sukses
      setOriginalProfileData(profileData); // Update data 'asli' dengan data baru
      setIsEditing(false); // Kembali ke mode view
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
      setIsSaving(false); // Selesai loading tombol Simpan
    }
  };

  // --- 10. Modifikasi Fungsi Batal ---
  const handleCancelEdit = () => {
    setProfileData(originalProfileData); // Kembalikan data ke data asli terakhir
    setIsEditing(false); // Kembali ke mode view
  };

  // --- 11. Modifikasi Fungsi Logout ---
  const handleLogout = async () => {
    setIsSaving(true); // Pakai state loading yang sama
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
    // Jika sukses, App.tsx akan otomatis pindah layar
    // setLoading(false); // Tidak perlu
  };

  // Fungsi lain (biarkan sama)
  const handleEditProfile = () => setIsEditing(true);
  const handleChangePassword = () => navigation.navigate('ChangePassword');
  const handleHelp = () => console.log('Help');
  const handleSettings = () => console.log('Settings');
  const handleTaskAction = () => console.log('Task Action (Baca)');
  const handleEditPicture = () => console.log('Edit Picture');
  const handleConnectUpi = () => console.log('Connect UPI');
  const handleLevelPress = () => navigation.navigate('RedeemPoin');

  // Fungsi modal
  const hideModal = () => {
    setModalState(prev => ({ ...prev, isVisible: false }));
  };

  const actionListData = isEditing
    ? [
        {
          key: 'save',
          icon: '✅',
          label: 'Simpan Perubahan',
          handler: handleSaveProfile,
        },
        {
          key: 'cancel',
          icon: '❌',
          label: 'Batal',
          handler: handleCancelEdit,
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

        <View style={styles.profilePicWrapper}>
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={handleEditPicture}
            activeOpacity={0.8}
            disabled={!isEditing} // Nonaktifkan ganti foto jika tidak mode edit
          >
            <View style={styles.profilePicPlaceholder}>
              <Text style={{ fontSize: 50 }}>👤</Text>
            </View>
            {isEditing && ( // Hanya tampilkan ikon pensil jika mode edit
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
              value={profileData.namaPengguna} // <<< Sesuai state
              onChangeText={val => handleInputChange('namaPengguna', val)} // <<< Sesuai state
            />
          ) : (
            <Text style={styles.userNameText}>{profileData.namaPengguna}</Text> // <<< Sesuai state
          )}

          {!isEditing && (
            <View style={styles.greetingSection}>
              <View style={styles.coinIconPlaceholderLarge}>
                <Text style={{ fontSize: 24 }}>💰</Text>
              </View>
              <View style={styles.greetingText}>
                {/* <<< PERBAIKAN: Gunakan fullName atau namaPengguna >>> */}
                <Text style={styles.helloText}>
                  Hello {profileData.fullName || profileData.namaPengguna}
                </Text>
                <Text style={styles.pointsText}>
                  {profileData.points.toLocaleString('id-ID')} Poin
                </Text>
              </View>
              <TouchableOpacity
                style={styles.levelButton}
                onPress={handleLevelPress}
              >
                <Text style={styles.levelButtonText}>
                  Level {profileData.level}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditing && (
            <View style={styles.card}>
              <View style={styles.taskHeader}>
                <View style={styles.taskIconPlaceholder}>
                  <Text style={{ fontSize: 20 }}>📢</Text>
                </View>
                <Text style={styles.taskInfo}>Task : {currentTask.title}</Text>
                <Text style={styles.taskProgress}>
                  {currentTask.progress}/{currentTask.total}
                </Text>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.adInfo}>
                  1 Ad = {currentTask.adReward} XY Coins
                </Text>
                <TouchableOpacity
                  style={styles.taskButton}
                  onPress={handleTaskAction}
                >
                  <Text style={styles.taskButtonText}>Baca</Text>
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
              isEditing={false} // <<< BUAT EMAIL TIDAK BISA DIEDIT
              // onChangeText={val => handleInputChange('email', val)}
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
                // Tambahkan cek 'loading' untuk tombol Logout
                onPress={
                  item.key === 'logout' && loading ? () => {} : item.handler
                }
                isLast={index === actionListData.length - 1}
              />
            ))}
          </View>
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* --- 13. Tambahkan Modal JSX --- */}
      <InfoModal
        isVisible={modalState.isVisible}
        title={modalState.title}
        message={modalState.message}
        modalType={modalState.modalType}
        onClose={hideModal}
      />

      {/* Tampilkan overlay loading di atas tombol "Simpan" */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

// --- STYLES (Tambahkan style loading) ---
const styles = StyleSheet.create({
  // ... (semua style lama Anda)
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
    minHeight: 500, // Pastikan konten area cukup tinggi
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
  // <<< Style Loading Penuh >>>
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    paddingTop: 100, // Beri jarak dari atas
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A453C',
  },
  // <<< Style Tombol Simpan Loading >>>
  savingOverlay: {
    ...StyleSheet.absoluteFillObject, // Tutupi seluruh layar
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Latar belakang gelap transparan
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99, // Pastikan di atas segalanya
  },
});

export default ProfileScreen;
