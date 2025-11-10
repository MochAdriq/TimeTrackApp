// src/features/Discussion/components/SwipeableRow.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import ChatSwipeLeftAction from './ChatSwipeLeftAction';

const SWIPE_THRESHOLD = -90; // Lebar tombol 'Keluar'

const SwipeableRow = ({ children, onLeavePress, isEnabled = true }) => {
  const translateX = useSharedValue(0);

  // Fungsi untuk memanggil 'onLeavePress'
  const triggerLeave = () => {
    onLeavePress();
  };

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (!isEnabled) return;
      // Hanya izinkan geser ke kiri (negatif)
      // dan jangan geser terlalu jauh
      translateX.value = Math.max(
        SWIPE_THRESHOLD * 1.5,
        Math.min(0, event.translationX),
      );
    })
    .onEnd(() => {
      if (!isEnabled) return;
      // Jika digeser cukup jauh, snap ke posisi terbuka
      if (translateX.value < SWIPE_THRESHOLD * 0.7) {
        translateX.value = withTiming(SWIPE_THRESHOLD);
      } else {
        // Jika tidak, kembali ke posisi tertutup
        translateX.value = withTiming(0);
      }
    })
    .enabled(isEnabled); // Gestur hanya aktif jika isEnabled true

  // Style animasi untuk menggeser 'children' (ChatListItem)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Style untuk tombol 'Keluar'
  // Ini akan 'scale' (muncul) saat item digeser
  const actionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? 1 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Tombol 'Keluar' (dibelakang) */}
      <Animated.View style={[styles.actionContainer, actionStyle]}>
        <ChatSwipeLeftAction
          onPress={() => {
            // Kita perlu runOnJS untuk memanggil fungsi React dari thread UI Reanimated
            runOnJS(triggerLeave)();
            // Tutup lagi setelah ditekan
            translateX.value = withTiming(0);
          }}
        />
      </Animated.View>

      {/* Konten Utama (di depan) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableRow;
