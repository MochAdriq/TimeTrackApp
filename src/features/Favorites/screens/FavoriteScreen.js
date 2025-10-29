import React from 'react';
import {
  // View, Text, TouchableOpacity dihapus dari sini
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
} from 'react-native';
import FavoriteItem from '../components/FavoriteItem';

import FavoriteHeader from '../components/FavoriteHeader';

import FavoriteInfo from '../components/FavoriteInfo';

const dummyFavorites = [
  {
    id: 'fav1',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/A77C55/FFFFFF?text=Sej1',
  },
  {
    id: 'fav2',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/8B5E3C/FFFFFF?text=Sej2',
  },
  {
    id: 'fav3',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/6A453C/FFFFFF?text=Sej3',
  },
  {
    id: 'fav4',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/A77C55/FFFFFF?text=Sej4',
  },
  {
    id: 'fav5',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/8B5E3C/FFFFFF?text=Sej5',
  },
  {
    id: 'fav6',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/6A453C/FFFFFF?text=Sej6',
  },
  {
    id: 'fav7',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/A77C55/FFFFFF?text=Sej7',
  },
  {
    id: 'fav8',
    title: 'Kerajaan Islam',
    subtitle: 'Samudra Pasai',
    duration: '05:37',
    imageUrl: 'https://via.placeholder.com/150/8B5E3C/FFFFFF?text=Sej8',
  },
];

const FavoriteScreen = ({ navigation }) => {
  const handleItemPress = item => {
    // --- TODO: Logika saat item ditekan (misal putar audio/video) ---
    console.log('Item pressed:', item.id);
  };

  const renderItem = ({ item }) => (
    <FavoriteItem
      imageUrl={item.imageUrl}
      title={item.title}
      subtitle={item.subtitle}
      duration={item.duration}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header Sederhana (bisa diganti komponen Header kustom jika perlu) */}
      <FavoriteHeader navigation={navigation} title="Favorit Saya" />
      <FavoriteInfo
        userName="Alka Azzahra"
        // Tambahkan level & points (meskipun tidak ditampilkan di header ini)
      />

      <FlatList
        data={dummyFavorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer} // Style untuk padding list
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 15,
  },
});

export default FavoriteScreen;
