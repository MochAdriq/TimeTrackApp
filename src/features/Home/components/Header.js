// src/features/Home/components/Header.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BellIcon from '../../../assets/icon/BellIcon.svg';

// --- (Import Context) ---
import { useNotification } from '../../../context/NotificationContext';
// <<< 1. IMPORT useProfile >>>
import { useProfile } from '../../../context/ProfileContext';

// Gambar fallback (pastikan path ini benar)
const fallbackImage = require('../../../assets/images/dummyImage2.png');

// <<< 2. HAPUS PROPS PROFIL (userName, level, points, avatarUrl) >>>
const Header = ({ onNotificationPress, onLayout }) => {
  const navigation = useNavigation();
  const { unreadCount } = useNotification(); // <<< 3. AMBIL DATA PROFIL DARI CONTEXT >>>
  const { profile } = useProfile(); // <<< 4. TENTUKAN SUMBER GAMBAR (menggunakan 'profile' dari context) >>>

  const profileImageSource = profile.avatar_url
    ? { uri: profile.avatar_url }
    : fallbackImage;

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
              <Image source={profileImageSource} style={styles.profilePict} />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Hi, {profile.username}</Text>
                <Text style={styles.subGreeting}>Good Morning</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>Level {profile.level}</Text>
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>
                      {profile.points.toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.coinIconPlaceholder} />{' '}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
          >
            <BellIcon width={40} height={40} />
            {unreadCount > 0 && <View style={styles.badgeContainer} />}{' '}
          </TouchableOpacity>
        </View>{' '}
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
    // <<< 7. STYLE UNTUK <Image> (Sudah benar) >>>
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    marginRight: 15,
    borderWidth: 2,
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
