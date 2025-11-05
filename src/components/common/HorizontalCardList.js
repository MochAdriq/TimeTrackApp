// src/components/common/HorizontalCardList.js
import React from 'react';
import { View, FlatList } from 'react-native';
import SectionHeader from './SectionHeader';
import ContentCard from './ContentCard';

// --- 1. Terima 2 props baru: favoriteMateriIds dan onToggleFavorite ---
const HorizontalCardList = ({
  data,
  title,
  onCardPress,
  onSeeAllPress,
  favoriteMateriIds,
  onToggleFavorite,
}) => {
  const renderItem = ({ item }) => {
    const isFavorite = favoriteMateriIds
      ? favoriteMateriIds.has(item.id)
      : false;

    return (
      <ContentCard
        item={item}
        onPress={onCardPress}
        isFavorite={isFavorite}
        // --- INI PERBAIKANNYA ---
        // Cek dulu apakah onToggleFavorite ada (dikirim dari HomeScreen)
        onToggleFavorite={
          onToggleFavorite
            ? () => onToggleFavorite(item.id, isFavorite)
            : undefined // Jika tidak ada, kirim undefined (AMAN)
        }
      />
    );
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <View style={{ zIndex: 1 }}>
        <SectionHeader title={title} onSeeAllPress={onSeeAllPress} />
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
        style={{
          zIndex: 10, // Tetap di lapisan atas
          overflow: 'visible', // Izinkan konten (bayangan) render di luar batas
        }}
        contentContainerStyle={{
          paddingLeft: 15,
          paddingRight: 5,
          paddingTop: 10, // Beri 10px ruang di atas card untuk bayangan
        }}
      />
    </View>
  );
};

export default HorizontalCardList;
