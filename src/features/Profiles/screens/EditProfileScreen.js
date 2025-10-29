// src/features/Profiles/screens/EditProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image, // Untuk ikon
} from 'react-native';

// --- Impor Aset (Ganti path dan nama file) ---
// const ProfilePlaceholderIcon = require('../../../assets/icons/ProfilePlaceholder.svg');
// const EditIconSmall = require('../../../assets/icons/EditIconSmall.svg');

// --- Data Dummy ---
const userEditData = {
  namaPengguna: 'Nama Pengguna',
  fullName: 'full name',
  mobileNo: '+91 11111 22222',
  email: 'hello@gmail.com',
  dob: '12 - 11 - 2002',
  upiId: 'Not Connected',
  // profileImageUrl: null,
};

// --- Komponen kecil untuk baris info ---
const InfoRow = ({ label, value, showButton = false, onButtonPress }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {showButton && (
      <TouchableOpacity style={styles.connectButton} onPress={onButtonPress}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    )}
  </View>
);

const EditProfileScreen = ({ navigation }) => {
  const handleEditPicture = () => console.log('Edit Picture');
  const handleConnectUpi = () => console.log('Connect UPI');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom (Coklat) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
          {/* Ganti dengan Ikon Panah SVG/Image */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === Bagian Atas (Curve Coklat) === */}
        <View style={styles.topCurve}>
          {/* Foto Profil (Overlap) */}
          <View style={styles.profilePicWrapper}>
            <TouchableOpacity
              style={styles.profilePicContainer}
              onPress={handleEditPicture}
              activeOpacity={0.8}
            >
              {/* Ganti View dengan Image/SVG */}
              <View style={styles.profilePicPlaceholder}>
                <Text style={{ fontSize: 50 }}>👤</Text>
              </View>
              {/* {userEditData.profileImageUrl ? ... } */}
              {/* Ikon Edit Kecil */}
              <View style={styles.editIconSmallContainer}>
                <View style={styles.editIconSmallPlaceholder}>
                  <Text style={{ fontSize: 10 }}>✏️</Text>
                </View>
                {/* <EditIconSmall width={14} height={14} fill="#FFF" /> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* === Konten Putih (di bawah curve) === */}
        <View style={styles.contentArea}>
          {/* Nama Pengguna di bawah foto */}
          <Text style={styles.userNameText}>{userEditData.namaPengguna}</Text>

          {/* Kartu Info Detail */}
          <View style={styles.infoCard}>
            <InfoRow label="Username" value={userEditData.namaPengguna} />
            <InfoRow label="Name" value={userEditData.fullName} />
            <InfoRow label="Mobile No" value={userEditData.mobileNo} />
            <InfoRow label="Email address" value={userEditData.email} />
            <InfoRow label="D.O.B." value={userEditData.dob} />
            <InfoRow
              label="Upi Id"
              value={userEditData.upiId}
              showButton={userEditData.upiId === 'Not Connected'} // Tampilkan tombol jika Not Connected
              onButtonPress={handleConnectUpi}
            />
          </View>
        </View>

        {/* Spacer Bawah */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES (Contoh, sesuaikan!) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background abu muda
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollView: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topCurve: {
    height: 140, // Tinggi area curve coklat (sesuaikan)
    backgroundColor: '#6A453C',
    borderBottomLeftRadius: 30, // Lengkungan bawah
    borderBottomRightRadius: 30,
    // Kita akan overlap foto di atas ini
  },
  profilePicWrapper: {
    alignItems: 'center',
    marginTop: -60, // <<< Tarik foto ke atas (setengah tinggi foto)
    zIndex: 1,
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePicPlaceholder: {
    // Ganti dengan style Image/SVG
    width: 120, // Ukuran foto profil
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0', // Placeholder abu
    borderWidth: 4,
    borderColor: '#FFF', // Border putih
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
    // Area putih dimulai di bawah area coklat
    backgroundColor: '#FFFFFF', // Background putih untuk area di bawah curve
    borderTopLeftRadius: 30, // Lengkungan atas area putih
    borderTopRightRadius: 30,
    marginTop: -30, // <<< Tarik area putih ke atas agar pas di bawah foto
    paddingTop: 85, // <<< Beri padding atas (tinggi foto/2 + jarak ke nama)
    zIndex: 0, // Di belakang foto
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25, // Jarak dari nama ke kartu info
  },
  infoCard: {
    backgroundColor: '#F8F9FA', // Warna kartu info (abu sangat muda)
    borderRadius: 15,
    padding: 20,
    // Shadow (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Jarak antar baris
  },
  infoTextContainer: {
    flex: 1, // Agar bisa wrap jika panjang
    marginRight: 10, // Jarak ke tombol (jika ada)
  },
  infoLabel: {
    fontSize: 13,
    color: '#999', // Warna label abu
    marginBottom: 4,
    // fontFamily: 'YourFont-Regular',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333', // Warna nilai
    // fontFamily: 'YourFont-Medium',
  },
  connectButton: {
    backgroundColor: '#6A453C', // Warna coklat
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
