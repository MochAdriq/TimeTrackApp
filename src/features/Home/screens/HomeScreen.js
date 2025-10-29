// src/features/Home/screens/HomeScreen.js

import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
} from 'react-native';
import {
  useState, // <<< Import useState
} from 'react';

import Header from '../components/Header'; // <-- Pastikan path ini benar
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import SectionHeader from '../../../components/common/SectionHeader';
import HorizontalCardList from '../../../components/common/HorizontalCardList';

import UnderDevelopmentModal from '../../../components/common/UnderDevelopmentModal'; // Import modal

const sejarahData = [
  {
    id: 'sej1',
    title: 'Kerajaan Islam',
    subtitle: 'Perkembangan kerajaan...',
    imageUrl:
      'https://via.placeholder.com/300x400/A77C55/FFFFFF?text=Sejarah+1',
  },
  {
    id: 'sej2',
    title: 'Masa Penjajahan Barat',
    subtitle: 'Masuknya Portugis, Bel...',
    imageUrl:
      'https://via.placeholder.com/300x400/8B5E3C/FFFFFF?text=Sejarah+2',
  },
  {
    id: 'sej3',
    title: 'Perang Kemerdekaan',
    subtitle: 'Perjuangan melawan...',
    imageUrl:
      'https://via.placeholder.com/300x400/6A453C/FFFFFF?text=Sejarah+3',
  },
  // Tambah item lain jika perlu
];

const budayaData = [
  {
    id: 'bud1',
    title: 'Wayang Kulit',
    subtitle: 'Seni pertunjukan Jawa',
    imageUrl: 'https://via.placeholder.com/300x400/E3D5B8/333333?text=Budaya+1',
  },
  {
    id: 'bud2',
    title: 'Tari Saman',
    subtitle: 'Tarian dari Aceh',
    imageUrl: 'https://via.placeholder.com/300x400/FAF3E0/333333?text=Budaya+2',
  },
  {
    id: 'bud3',
    title: 'Rumah Gadang',
    subtitle: 'Arsitektur Minangkabau',
    imageUrl: 'https://via.placeholder.com/300x400/D4B895/333333?text=Budaya+3',
  },
  // Tambah item lain jika perlu
];

const HomeScreen = ({ navigation }) => {
  const userName = 'Alka Azzahra';
  const userLevel = 1;
  const userPoints = 100000;

  const handleSeeAllSejarah = () => console.log('Lihat Semua Sejarah');
  const handleSeeAllBudaya = () => console.log('Lihat Semua Budaya');
  const [headerHeight, setHeaderHeight] = useState(0);

  // Fungsi yang akan dijalankan saat Header selesai layout
  const onHeaderLayout = event => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== headerHeight) {
      // Update hanya jika ada perubahan & > 0
      setHeaderHeight(height);
    }
  };

  // Hitung posisi top SearchBar HANYA JIKA headerHeight sudah terukur (> 0)
  const searchBarTopPosition = headerHeight > 0 ? headerHeight - 60 / 2 : -999; // Sembunyikan dulu

  const [isModalVisible, setModalVisible] = useState(false); // State untuk kontrol modal

  // Fungsi untuk membuka modal
  const openModal = () => {
    setModalVisible(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setModalVisible(false);
  };

  const handleQuickAction = actionId => {
    // --- TAMBAHKAN LOG DI SINI ---
    console.log('HomeScreen received action:', actionId); // <<< Log Verifikasi

    if (actionId === 'peta') {
      console.log('Opening modal from HomeScreen...'); // <<< Log Verifikasi
      openModal();
    } else if (actionId === 'quiz') {
      navigation.navigate('QuizList'); // <<< Ganti ke 'QuizList'
      return;
    } else if (actionId === 'market') {
      navigation.navigate('MarketPlace');
    } else if (actionId === 'diskusi') {
      openModal(); // Buka juga untuk diskusi?
    } else {
      console.log('Navigate to feature:', actionId);
    }
  };

  return (
    // SafeAreaView background putih
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A2F2F"
        translucent={false}
      />
      <Header
        userName={userName}
        level={userLevel}
        points={userPoints}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onLayout={onHeaderLayout}
      />

      {headerHeight > 0 && (
        <View
          style={[styles.searchBarContainer, { top: searchBarTopPosition }]}
        >
          <SearchBar onSearch={query => console.log('Search:', query)} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <QuickActions onActionPress={handleQuickAction} />

        {/* === Section: Sejarah Indonesia === */}
        <SectionHeader
          title="Sejarah Indonesia"
          onSeeAllPress={handleSeeAllSejarah}
        />
        {/* Nanti di bawah sini kita taruh Horizontal List Sejarah */}
        <HorizontalCardList data={sejarahData} />

        <SectionHeader
          title="Kebudayaan Daerah"
          onSeeAllPress={handleSeeAllBudaya}
        />
        <HorizontalCardList data={budayaData} />
      </ScrollView>
      <UnderDevelopmentModal isVisible={isModalVisible} onClose={closeModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // <<< Background utama PUTIH
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF', // <<< ScrollView background PUTIH
  },
  scrollViewContent: {
    paddingBottom: 20, // Padding bawah saja
    paddingTop: 20,
  },
  placeholder: {
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  searchBarContainer: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    zIndex: 10, // Pastikan di atas Header (zIndex 1) dan ScrollView (default 0)
    shadowColor: '#000',
    shadowOffset: { width: 1000, height: 1000 },
    shadowOpacity: 0.1,
    shadowRadius: 1000,
    elevation: 4,
  },
});

export default HomeScreen;
