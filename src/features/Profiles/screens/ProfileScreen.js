// src/features/Profiles/screens/ProfileScreen.js
import React, { useState } from 'react'; // Import useState
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image, // Pastikan Image diimpor jika nanti pakai gambar asli
  TextInput, // <<< Import TextInput
  Alert, // <<< Import Alert
} from 'react-native';

// --- Import Komponen BARU ---
import EditableInfoRow from '../components/EditableInfoRow'; // <<< Import EditableInfoRow

// --- Impor Aset (Ganti placeholder) ---
// const ProfilePlaceholderIcon = require('../../../assets/icons/ProfilePlaceholder.svg');
// const EditIconSmall = require('../../../assets/icons/EditIconSmall.svg');
// const CoinStackIcon = require('../../../assets/icons/CoinStackIcon.svg');
// const AdsIcon = require('../../../assets/icons/AdsIcon.svg');
// ... (ikon aksi lainnya)

// --- Data Awal (bisa jadi prop atau dari state global nanti) ---
const initialUserData = {
  namaPengguna: 'Nama Pengguna',
  fullName: 'full name',
  mobileNo: '+91 11111 22222',
  email: 'hello@gmail.com',
  dob: '12 - 11 - 2002',
  upiId: 'Not Connected',
  points: 10000,
  level: 1,
};

const currentTask = {
  title: 'Baca 5 Sejarah untuk Mendapatkan poin',
  progress: 1,
  total: 5,
  adReward: 100,
};

// --- Komponen Aksi (diupdate) ---
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
  // --- State untuk Mode Edit ---
  const [isEditing, setIsEditing] = useState(false); // <<< State mode edit
  // --- State untuk Data Profil ---
  const [profileData, setProfileData] = useState(initialUserData); // <<< State data

  // Fungsi untuk update data di state
  const handleInputChange = (field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  // --- Fungsi Handler ---
  const handleEditProfile = () => {
    setIsEditing(true); // <<< Masuk mode edit
  };

  const handleSaveProfile = () => {
    // --- TODO: Panggil API Simpan (nanti) ---
    console.log('Saving data:', profileData);
    setIsEditing(false); // <<< Kembali ke mode view
    Alert.alert('Profil Disimpan', 'Informasi profil berhasil diperbarui.'); // Feedback
  };

  const handleCancelEdit = () => {
    setProfileData(initialUserData); // Kembalikan data ke awal
    setIsEditing(false); // <<< Kembali ke mode view
  };

  const handleChangePassword = () => console.log('Change Password');
  const handleHelp = () => console.log('Help');
  const handleSettings = () => console.log('Settings');
  const handleLogout = () => {
    console.log('Logout'); /* navigation.replace('Auth'); */
  };
  const handleTaskAction = () => console.log('Task Action (Baca)');
  const handleEditPicture = () => console.log('Edit Picture');
  const handleConnectUpi = () => console.log('Connect UPI');
  const handleLevelPress = () => navigation.navigate('RedeemPoin'); // Ke Redeem Poin

  // --- Data untuk List Aksi (Dinamis) ---
  const actionListData = isEditing
    ? [
        // <<< Tampilan Tombol saat Mode EDIT
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
        // <<< Tampilan Tombol saat Mode VIEW
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
        {
          key: 'settings',
          icon: '⚙️',
          label: 'Settings',
          handler: handleSettings,
        },
        { key: 'logout', icon: '🔄', label: 'Log out', handler: handleLogout },
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === Bagian Atas (Curve Coklat) === */}
        <View style={styles.topCurve}>
          {/* Header Kustom (Opsional, jika ingin header "Profile" di atas) */}
        </View>

        {/* === Foto Profil (Overlap) === */}
        <View style={styles.profilePicWrapper}>
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={handleEditPicture}
            activeOpacity={0.8}
          >
            <View style={styles.profilePicPlaceholder}>
              <Text style={{ fontSize: 50 }}>👤</Text>
            </View>
            <View style={styles.editIconSmallContainer}>
              <View style={styles.editIconSmallPlaceholder}>
                <Text style={{ fontSize: 10 }}>✏️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* === Konten Putih (di bawah curve) === */}
        <View style={styles.contentArea}>
          {/* Nama Pengguna di bawah foto */}
          {isEditing ? (
            <TextInput
              style={[styles.userNameText, styles.userNameInput]}
              value={profileData.namaPengguna}
              onChangeText={val => handleInputChange('namaPengguna', val)}
            />
          ) : (
            <Text style={styles.userNameText}>{profileData.namaPengguna}</Text>
          )}

          {/* Greeting & Info Poin (Sembunyikan jika mode edit) */}
          {!isEditing && ( // <<< Sembunyikan jika sedang edit
            <View style={styles.greetingSection}>
              <View style={styles.coinIconPlaceholderLarge}>
                <Text style={{ fontSize: 24 }}>💰</Text>
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.helloText}>Hello {profileData.name}</Text>
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

          {/* Task Card (Sembunyikan jika mode edit) */}
          {!isEditing && ( // <<< Sembunyikan jika sedang edit
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

          {/* --- Kartu Info Detail (Sekarang Editable) --- */}
          {isEditing && ( // <<< Judul berbeda saat mode edit
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
              isEditing={isEditing}
              onChangeText={val => handleInputChange('email', val)}
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
              showButton={profileData.upiId === 'Not Connected'}
              onButtonPress={handleConnectUpi}
            />
          </View>

          {/* --- Daftar Aksi (Sekarang Dinamis) --- */}
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
    </SafeAreaView>
  );
};

// --- STYLES ---
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
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    paddingVertical: 5, // Tambah padding agar mirip input
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
    textAlign: 'center', // Pusatkan judul
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
    // Style tambahan saat edit
    backgroundColor: '#FFFFFF', // Buat lebih kontras
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
    borderBottomWidth: 0, // Hapus border untuk item terakhir
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
});

export default ProfileScreen;
