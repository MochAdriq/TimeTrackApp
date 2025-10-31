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
      <SectionHeader title={title} onSeeAllPress={onSeeAllPress} />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 15, paddingRight: 5 }} // Padding list
      />
    </View>
  );
};

export default HorizontalCardList;
