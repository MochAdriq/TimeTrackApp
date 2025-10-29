// src/features/Profiles/screens/RedeemPoinScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  FlatList, // Untuk horizontal list
} from 'react-native';
import DealCard from '../components/DealCard'; // Import kartu deal

// --- Data Dummy ---
const userPoints = 300;
const conversionRate = '1000 XY = 100rs'; // rs? rupiah?
const minRedeem = 3000;

const dailyDeals = [
  {
    id: '1',
    logoUrl: 'https://via.placeholder.com/100x40/EEEEEE/000000?text=mamaearth',
    title: 'mama earth 300rs off coupan',
    subtitle: 'for 2500 XY coins',
    bgColor: '#E0F8E0',
    buttonColor: '#2E7D32',
  },
  {
    id: '2',
    logoUrl: 'https://via.placeholder.com/100x40/EEEEEE/000000?text=lenskart',
    title: 'lenskart 300rs off coupan',
    subtitle: 'for 3000 XY coins',
    bgColor: '#E6E6FA',
    buttonColor: '#303F9F',
  },
  {
    id: '3',
    logoUrl: 'https://via.placeholder.com/100x40/EEEEEE/000000?text=Brand+3',
    title: 'mama earth 450rs off...',
    subtitle: 'for 4500 XY coins',
    bgColor: '#D7EFFF',
    buttonColor: '#0277BD',
  },
];

const RedeemPoinScreen = ({ navigation }) => {
  const handleGetRs = () => console.log('Get Rs pressed');
  const handleViewDeal = deal => console.log('View deal:', deal.id);

  const renderDealItem = ({ item }) => (
    <DealCard item={item} onPress={() => handleViewDeal(item)} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom (Coklat) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
          {/* Ganti dengan Ikon Panah SVG/Image */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Poin</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Kartu Poin (Kuning) */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Your XY Coins :</Text>
            <Text style={styles.pointsAmount}>{userPoints}</Text>
            <TouchableOpacity style={styles.redeemButton} onPress={handleGetRs}>
              <Text style={styles.redeemButtonText}>Get Rs from XY Coins</Text>
            </TouchableOpacity>
            <Text style={styles.minRedeemText}>
              * Minimum {minRedeem} XY coins are required to redeem coins
            </Text>
          </View>
          <View style={styles.pointsGraphic}>
            {/* Ganti View ini dengan Ikon Koin */}
            <View style={styles.coinPlaceholder}>
              <Text>💰</Text>
            </View>
            <Text style={styles.conversionText}>{conversionRate}</Text>
          </View>
        </View>

        {/* Judul Daily Deals */}
        <Text style={styles.sectionTitle}>Daily deals :-</Text>

        {/* List Daily Deals (Horizontal) */}
        <FlatList
          data={dailyDeals}
          renderItem={renderDealItem}
          keyExtractor={item => item.id}
          horizontal // Penting
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealsListContainer}
        />

        {/* Bisa tambahkan section lain di sini */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Background abu muda
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C', // Header coklat
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContainer: {
    paddingVertical: 20,
  },
  pointsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4', // Kuning muda (estimasi)
    borderRadius: 20,
    marginHorizontal: 15,
    padding: 20,
    marginBottom: 25,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsInfo: {
    flex: 1, // Ambil sisa ruang
  },
  pointsLabel: {
    fontSize: 14,
    color: '#555',
  },
  pointsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  redeemButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start', // Agar tombol tidak full width
    marginBottom: 10,
    // Shadow kecil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  redeemButtonText: {
    color: '#E65100', // Oranye (estimasi)
    fontSize: 12,
    fontWeight: 'bold',
  },
  minRedeemText: {
    fontSize: 10,
    color: '#D32F2F', // Merah (estimasi)
  },
  pointsGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  coinPlaceholder: {
    // Ganti dengan style Image/SVG
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700', // Emas
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversionText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 15, // Samakan dengan margin card
  },
  dealsListContainer: {
    paddingLeft: 15, // Padding awal untuk list horizontal
    paddingRight: 5, // Sedikit padding akhir
  },
});

export default RedeemPoinScreen;
