// src/components/common/HorizontalCardList.js

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ContentCard from './ContentCard'; // Import komponen kartu

const HorizontalCardList = ({ data }) => {
  const handleCardPress = item => {
    // --- TODO: Navigasi ke detail item ---
    console.log('Card pressed:', item.id || item.title);
    // Contoh: navigation.navigate('DetailScreen', { itemId: item.id });
  };

  const renderItem = ({ item }) => (
    <ContentCard
      imageUrl={item.imageUrl} // Pastikan data punya properti ini
      title={item.title} // Pastikan data punya properti ini
      subtitle={item.subtitle} // Pastikan data punya properti ini (opsional)
      onPress={() => handleCardPress(item)}
      itemData={item}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id || item.title} // Gunakan ID unik atau title
      horizontal // Membuat list menjadi horizontal
      showsHorizontalScrollIndicator={false} // Sembunyikan scroll bar horizontal
      contentContainerStyle={styles.listContentContainer} // Style untuk container list
      // snapToInterval={cardWidth + cardMargin} // Opsional: Agar scroll 'snap' per kartu
      // decelerationRate="fast" // Opsional: Efek scroll snap
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingRight: 15, // Beri padding di akhir list agar kartu terakhir tidak mepet
    paddingVertical: 5, // Sedikit padding vertikal untuk shadow
  },
});

export default HorizontalCardList;
