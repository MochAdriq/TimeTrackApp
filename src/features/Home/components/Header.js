// src/features/Home/components/Header.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Hook untuk akses navigation

// Impor ikon jika pakai SVG atau library ikon
// import NotificationIcon from '../../../assets/icons/NotificationIcon.svg';

import ProfilePict from '../../../assets/images/ProfilePict.svg';
import BellIcon from '../../../assets/icon/BellIcon.svg';

const Header = ({ userName, level, points, onNotificationPress, onLayout }) => {
  const navigation = useNavigation(); // <<< Dapatkan navigation pakai hook

  return (
    // Container utama header, sekarang transparan/tanpa background spesifik
    <View style={styles.outerContainer} onLayout={onLayout}>
      {/* View untuk background gelap melengkung */}
      <View style={styles.backgroundCurve}>
        {/* Konten ditaruh di dalam lengkungan */}
        <View style={styles.contentContainer}>
          {/* Profile Section */}
          <TouchableOpacity
            style={styles.profileTouchable} // Style tambahan jika perlu
            onPress={() => navigation.openDrawer()} // <<< Panggil openDrawer
            activeOpacity={0.7}
          >
            <View style={styles.profileContainer}>
              <ProfilePict style={styles.profilePict} width={80} height={80} />

              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Hi, {userName}</Text>
                <Text style={styles.subGreeting}>Good Morning</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>Level {level}</Text>
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>
                      {points.toLocaleString('id-ID')}
                    </Text>
                    {/* Ganti View ini dengan ikon koin */}
                    <View style={styles.coinIconPlaceholder} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Notification Button */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
          >
            {/* Ganti View ini dengan ikon notifikasi */}
            <BellIcon width={40} height={40} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {},
  backgroundCurve: {
    backgroundColor: '#6A453C', // Warna background gelap
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: StatusBar.currentHeight + 15 || 30, // Padding atas (termasuk status bar)
    paddingHorizontal: 20,
    paddingBottom: 70, // Padding bawah di dalam lengkungan (SESUAIKAN agar pas)
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 1,
  },
  profilePict: {
    borderRadius: 90,
    backgroundColor: '#FFF',
    marginRight: 15,
  },
  userInfo: {
    // Style text group
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#E0E0E0',
    fontSize: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
    alignSelf: 'flex-start', // Agar width container pas dengan isinya
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // Hapus marginLeft auto, layout diatur oleh levelContainer
  },
  pointsText: {
    color: '#4A2F2F',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinIconPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  notificationButton: {
    backgroundColor: '#D0AA7B',
    padding: 10,
    borderRadius: 16.25,
    right: 10,
  },
  notificationIconPlaceholder: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
});

export default Header;
