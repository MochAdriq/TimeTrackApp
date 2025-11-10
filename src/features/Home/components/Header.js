// src/features/Home/components/Header.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image, // <<< 1. IMPORT Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// <<< 2. HAPUS IMPORT ProfilePict (SVG) >>>
// import ProfilePict from '../../../assets/images/ProfilePict.svg';
import BellIcon from '../../../assets/icon/BellIcon.svg';
import { useNotification } from '../../../context/NotificationContext';
// (Kita akan ambil avatar_url dari props, yang di-supply oleh HomeScreen)

// <<< 3. TAMBAHKAN 'avatarUrl' KE PROPS >>>
const Header = ({
  userName,
  level,
  points,
  onNotificationPress,
  onLayout,
  avatarUrl,
}) => {
  const navigation = useNavigation();
  const { unreadCount } = useNotification();

  // <<< 4. TENTUKAN SUMBER GAMBAR >>>
  // Pastikan Boss punya gambar fallback di path ini
  const profileImageSource = avatarUrl
    ? { uri: avatarUrl }
    : require('../../../assets/images/dummyImage2.png');

  return (
    <View style={styles.outerContainer} onLayout={onLayout}>
      <View style={styles.backgroundCurve}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.profileTouchable}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}
          >
            <View style={styles.profileContainer}>
              {/* <<< 5. GANTI ProfilePict DENGAN Image >>> */}
              <Image source={profileImageSource} style={styles.profilePict} />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Hi, {userName}</Text>
                <Text style={styles.subGreeting}>Good Morning</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>Level {level}</Text>
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>
                      {points.toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.coinIconPlaceholder} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* --- Tombol Notifikasi (Tidak Berubah) --- */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
          >
            <BellIcon width={40} height={40} />
            {unreadCount > 0 && <View style={styles.badgeContainer} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {},
  backgroundCurve: {
    backgroundColor: '#6A453C',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: StatusBar.currentHeight + 15 || 30,
    paddingHorizontal: 20,
    paddingBottom: 70,
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
    // <<< 6. PERBAIKI STYLE UNTUK <Image> >>>
    width: 80,
    height: 80,
    borderRadius: 40, // Setengah dari width/height agar bulat
    backgroundColor: '#FFF',
    marginRight: 15,
    borderWidth: 2, // Opsional: border putih
    borderColor: '#FFFFFF',
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
    alignSelf: 'flex-start',
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
    position: 'relative',
  },
  notificationIconPlaceholder: {
    // Tidak terpakai lagi
  },
  badgeContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#D0AA7B',
  },
});

export default Header;
