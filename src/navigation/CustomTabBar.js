// src/navigation/CustomTabBar.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from 'react-native';

import ScanIconInactive from '../assets/icon/ScanIconInactive.svg';
import LoveIconInactive from '../assets/icon/LoveIconInactive.svg';
import StarIconInactive from '../assets/icon/StarIconInactive.svg';
import ProfileIconInactive from '../assets/icon/ProfileIconInactive.svg';
import JelajahIconInactive from '../assets/icon/JelajahIconInactive.svg';

import ScanIconActive from '../assets/icon/ScanIconActive.svg';
import LoveIconActive from '../assets/icon/LoveIconActive.svg';
import JelajahIconActive from '../assets/icon/JelajahIconActive.svg';
import StarIconActive from '../assets/icon/StarIconActive.svg';
import ProfileIconActive from '../assets/icon/ProfileIconActive.svg';

// --- Constants ---
const { width: screenWidth } = Dimensions.get('window');
const tabBarPaddingHorizontal = 15; // Padding di tabBarContainer
// Lebar area efektif untuk tab items (tanpa padding container)
const effectiveTabBarWidth = screenWidth - tabBarPaddingHorizontal * 2;
const numTabs = 5;
// Lebar pasti per tab item
const tabWidth = effectiveTabBarWidth / numTabs;
const indicatorSize = 60; // Ukuran lingkaran
const iconSize = 28; // Ukuran ikon samping
const centerIconSize = 30; // Ukuran ikon tengah

// --- Warna ---
const inactiveColor = '#FFFFFF'; // Warna ikon inactive (putih outline)
const tabBarBackgroundColor = '#6A453C';
const activeCircleColor = '#FFFFFF';
const activeIconColor = tabBarBackgroundColor; // Warna ikon aktif (coklat fill)

// Map nama route ke komponen ikon AKTIF dan INACTIVE
const iconComponents = {
  Scan: { active: ScanIconActive, inactive: ScanIconInactive },
  Favorites: { active: LoveIconActive, inactive: LoveIconInactive },
  Jelajah: { active: JelajahIconActive, inactive: JelajahIconInactive }, // Inactive hanya label
  Premium: { active: StarIconActive, inactive: StarIconInactive }, // Pastikan nama route 'Premium'
  Profile: { active: ProfileIconActive, inactive: ProfileIconInactive },
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Simpan layout { x, width } untuk setiap tab item
  const [layouts, setLayouts] = useState([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const activeIndex = state.index;

  useEffect(() => {
    // Pastikan layout untuk index aktif sudah ada dan valid
    if (
      layouts.length === numTabs &&
      activeIndex >= 0 &&
      activeIndex < layouts.length &&
      layouts[activeIndex]?.x !== undefined &&
      layouts[activeIndex]?.width !== undefined
    ) {
      // Hitung posisi X target agar PUSAT LINGKARAN pas di PUSAT TAB ITEM
      const tabItemCenterX =
        layouts[activeIndex].x + layouts[activeIndex].width / 2; // Pusat tab item (relatif thd container)
      // Posisi awal (kiri) lingkaran agar pusatnya pas di tabItemCenterX
      const targetX = tabItemCenterX - indicatorSize / 2;

      Animated.spring(translateX, {
        toValue: targetX,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    }
  }, [activeIndex, layouts, translateX]);

  // Fungsi untuk menyimpan layout x dan width relatif terhadap tabBarContainer
  const handleLayout = (event, index) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts(prevLayouts => {
      // Hanya update jika layout berbeda atau belum ada
      if (
        !prevLayouts[index] ||
        prevLayouts[index].x !== x ||
        prevLayouts[index].width !== width
      ) {
        const newLayouts = [...prevLayouts];
        // Simpan posisi x dan width RELATIF terhadap tabBarContainer
        newLayouts[index] = { x: x, width: width };

        // Inisialisasi posisi awal jika ini layout pertama & index aktif
        if (
          index === activeIndex &&
          prevLayouts.filter(l => l && l.x !== undefined).length === 0
        ) {
          const initialTabItemCenterX =
            newLayouts[index].x + newLayouts[index].width / 2;
          const initialTargetX = initialTabItemCenterX - indicatorSize / 2;
          // Langsung set posisi awal tanpa animasi
          translateX.setValue(initialTargetX);
        }
        return newLayouts;
      }
      return prevLayouts;
    });
  };

  return (
    <View>
      {' '}
      {/* Wrapper utama */}
      {/* --- Bar Coklat (Layer Bawah) --- */}
      <View style={styles.tabBarContainer}>
        {/* --- Tombol Tab (Render Ikon INACTIVE & Label Tengah) --- */}
        {state.routes.map((route, index) => {
          // *** Pengecekan layout LENGKAP ***
          if (
            layouts.length !== numTabs ||
            layouts[index]?.x === undefined ||
            layouts[index]?.width === undefined
          ) {
            // Render placeholder kosong selagi menunggu layout
            return (
              <View
                key={route.key}
                style={styles.tabItem}
                onLayout={event => handleLayout(event, index)}
              />
            ); // Tetap ukur layout!
          }

          const { options } = descriptors[route.key];
          const isFocused = activeIndex === index;
          const icons = iconComponents[route.name];
          const IconInactive = icons?.inactive;

          // Hitung posisi X ikon ini untuk interpolasi opacity
          const tabItemCenterX = layouts[index].x + layouts[index].width / 2;
          const iconPositionX = tabItemCenterX - indicatorSize / 2; // Posisi lingkaran saat di tab ini

          // Opacity Inactive: 0 saat lingkaran pas di atas, 1 saat jauh
          const inactiveOpacity = translateX.interpolate({
            inputRange: [
              iconPositionX - layouts[index].width / 4,
              iconPositionX,
              iconPositionX + layouts[index].width / 4,
            ], // Gunakan lebar tab terukur
            outputRange: [1, 0, 1], // Fade out saat lingkaran di atasnya
            extrapolate: 'clamp',
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (route.name === 'Profiles') {
              navigation.openDrawer(); // <<< Panggil fungsi ini
              return; // Hentikan navigasi biasa jika perlu
            }

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              // onLayout dipasang di sini untuk mengukur area TouchableOpacity
              onLayout={event => handleLayout(event, index)}
            >
              {/* --- Render ikon INACTIVE (pakai animasi opacity) --- */}
              {IconInactive && ( // <<< Baris Ini: Cek apakah ada ikon inactive (Jelajah = null)
                <Animated.View style={{ opacity: inactiveOpacity }}>
                  <IconInactive width={iconSize} height={iconSize} />
                </Animated.View>
              )}
              {/* --- Tampilkan label HANYA untuk tab tengah & SAAT INACTIVE --- */}
            </TouchableOpacity>
          );
        })}
      </View>
      {/* --- Layer Atas (Lingkaran Bergerak & Ikon Aktif) --- */}
      <Animated.View
        style={[
          styles.slidingIndicator,
          { transform: [{ translateX }] },
          {
            // Posisi absolut relatif terhadap wrapper utama (View terluar)
            position: 'absolute',
            // Hitung posisi bottom agar pusat lingkaran pas di tepi atas bar
            bottom: styles.tabBarContainer.height - indicatorSize / 2,
            zIndex: 1,
          },
        ]}
      >
        {/* Render SEMUA ikon AKTIF di dalam lingkaran, atur opacity */}
        {state.routes.map((route, index) => {
          // Pengecekan layout lengkap
          if (
            layouts.length !== numTabs ||
            layouts[index]?.x === undefined ||
            layouts[index]?.width === undefined
          ) {
            return null;
          }
          const IconActive = iconComponents[route.name]?.active;
          if (!IconActive) return null;
          const size = route.name === 'Jelajah' ? centerIconSize : iconSize;

          // Hitung posisi X ikon ini untuk interpolasi
          const tabItemCenterX = layouts[index].x + layouts[index].width / 2;
          const iconPositionX = tabItemCenterX - indicatorSize / 2; // Posisi lingkaran saat di tab ini

          // Opacity Aktif: 1 saat lingkaran pas di atas, 0 saat jauh
          const activeOpacity = translateX.interpolate({
            inputRange: [
              iconPositionX - layouts[index].width / 2,
              iconPositionX,
              iconPositionX + layouts[index].width / 2,
            ], // Gunakan lebar tab terukur
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={route.key}
              style={[styles.activeIconWrapper, { opacity: activeOpacity }]}
            >
              <IconActive width={size} height={size} />
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 70, // Tinggi bar
    backgroundColor: tabBarBackgroundColor,
    borderRadius: 25,
    // Hapus position absolute
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    // Hapus paddingHorizontal di sini jika x sudah relatif
    // paddingHorizontal: tabBarPaddingHorizontal,
    alignItems: 'center', // Tetap tengahkan secara vertikal
  },
  tabItem: {
    flex: 1, // Tetap flex 1
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    // backgroundColor: 'rgba(0,255,0,0.2)' // DEBUG
  },
  slidingIndicator: {
    width: indicatorSize,
    height: indicatorSize,
    borderRadius: indicatorSize / 2,
    backgroundColor: activeCircleColor,
    // position diatur inline
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  activeIconWrapper: {
    position: 'absolute',
  },
  centerLabel: {
    fontSize: 10,
    color: inactiveColor, // Tetap putih
    // Hapus position absolute
    marginTop: 4, // Jarak dari (posisi imajiner) ikon tengah
  },
});

export default CustomTabBar;
