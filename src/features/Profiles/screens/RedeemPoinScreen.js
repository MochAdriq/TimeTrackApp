// src/features/Profiles/screens/RedeemPoinScreen.js
import React, { useState, useCallback } from 'react'; // <<< 1. Import useState & useCallback
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator, // <<< 2. Import ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <<< 3. Import useFocusEffect
import DealCard from '../components/DealCard'; // Import kartu deal

// --- 4. Import Supabase & Modal ---
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

// --- Hapus Data Dummy ---
// const userPoints = 300;
// const dailyDeals = [ ... ];

const conversionRate = '1000 XY = 100rs'; // rs? rupiah? (Biarkan ini, sepertinya statis)
const minRedeem = 3000;

const RedeemPoinScreen = ({ navigation }) => {
  // --- 5. Tambahkan State ---
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [rewardsList, setRewardsList] = useState([]);
  const [modalState, setModalState] = useState({
    isVisible: false,
    title: '',
    message: '',
    modalType: 'error',
  });

  // --- 6. Fungsi Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil ID user yang login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak ditemukan.');

      // 2. Ambil poin user & daftar rewards sekaligus
      const [profileResult, rewardsResult] = await Promise.all([
        supabase.from('profiles').select('points').eq('id', user.id).single(),
        supabase
          .from('rewards')
          .select('*')
          .order('points_cost', { ascending: true }),
      ]);

      // 3. Proses Poin
      if (profileResult.error) throw profileResult.error;
      setUserPoints(profileResult.data?.points || 0);

      // 4. Proses Rewards
      if (rewardsResult.error) throw rewardsResult.error;

      // Format data rewards agar sesuai dengan DealCard (berdasarkan dummy data)
      const formattedRewards = rewardsResult.data.map(reward => ({
        id: reward.id,
        logoUrl: reward.logo_url, // 'logo_url' dari DB -> 'logoUrl' untuk DealCard
        title: reward.title,
        // Gabungkan subtitle dan points_cost dari DB
        subtitle: `${reward.subtitle || ''} for ${reward.points_cost} XY coins`,
        bgColor: reward.bg_color,
        buttonColor: reward.button_color,
        pointsCost: reward.points_cost, // Simpan points_cost asli untuk logika
      }));
      setRewardsList(formattedRewards);
    } catch (error) {
      console.error('Error fetching redeem data:', error.message);
      setModalState({
        isVisible: true,
        title: 'Gagal Memuat Data',
        message: error.message,
        modalType: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 7. Gunakan useFocusEffect ---
  // Akan refresh data setiap kali layar ini dibuka
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  // --- 8. Modifikasi Handler Tombol ---
  const handleGetRs = () => {
    // Tombol kuning utama
    if (userPoints < minRedeem) {
      setModalState({
        isVisible: true,
        title: 'Poin Tidak Cukup',
        message: `Anda memerlukan minimal ${minRedeem} poin untuk melakukan redeem. Poin Anda saat ini: ${userPoints}.`,
        modalType: 'error',
      });
    } else {
      // --- TODO: Navigasi ke halaman redeem uang tunai (jika ada) ---
      setModalState({
        isVisible: true,
        title: 'Segera Hadir',
        message: 'Fitur redeem ke Rupiah sedang dalam pengembangan.',
        modalType: 'error',
      });
    }
  };

  const handleRedeemDeal = deal => {
    // Tombol di dalam DealCard
    if (userPoints < deal.pointsCost) {
      setModalState({
        isVisible: true,
        title: 'Poin Tidak Cukup',
        message: `Poin Anda (${userPoints}) tidak cukup untuk menukar "${deal.title}" (${deal.pointsCost} poin).`,
        modalType: 'error',
      });
    } else {
      // --- TODO: Logika redeem (kurangi poin, kurangi stok, dll) ---
      setModalState({
        isVisible: true,
        title: 'Konfirmasi Redeem',
        message: `Anda akan menukar ${deal.pointsCost} poin untuk "${deal.title}". Lanjutkan?`,
        modalType: 'success', // Ganti modalType
        // Nanti tambahkan tombol "OK" dan "Batal" di InfoModal
      });
    }
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isVisible: false }));
  };

  // --- 9. Render Item (FlatList) ---
  const renderDealItem = ({ item }) => (
    <DealCard item={item} onPress={() => handleRedeemDeal(item)} />
  );

  // --- 10. Tampilkan Loading Penuh ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#6A453C" />
        <ActivityIndicator size="large" color="#6A453C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom (Tetap sama) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Poin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Kartu Poin (Kuning) - Data dinamis */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Your XY Coins :</Text>
            {/* <<< Gunakan userPoints dari state >>> */}
            <Text style={styles.pointsAmount}>
              {userPoints.toLocaleString('id-ID')}
            </Text>
            <TouchableOpacity style={styles.redeemButton} onPress={handleGetRs}>
              <Text style={styles.redeemButtonText}>Get Rs from XY Coins</Text>
            </TouchableOpacity>
            <Text style={styles.minRedeemText}>
              * Minimum {minRedeem} XY coins are required to redeem coins
            </Text>
          </View>
          <View style={styles.pointsGraphic}>
            <View style={styles.coinPlaceholder}>
              <Text>💰</Text>
            </View>
            <Text style={styles.conversionText}>{conversionRate}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily deals :-</Text>

        {/* List Daily Deals (Horizontal) - Data dinamis */}
        <FlatList
          data={rewardsList} // <<< Gunakan rewardsList dari state
          renderItem={renderDealItem}
          keyExtractor={item => item.id.toString()} // Ubah ke string
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealsListContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada reward tersedia.</Text>
          }
        />
      </ScrollView>

      {/* --- 11. Tambahkan Modal JSX --- */}
      <InfoModal
        isVisible={modalState.isVisible}
        title={modalState.title}
        message={modalState.message}
        modalType={modalState.modalType}
        onClose={hideModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  // <<< Tambahkan style loading >>>
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContainer: {
    paddingVertical: 20,
  },
  pointsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: 20,
    marginHorizontal: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsInfo: {
    flex: 1,
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
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  redeemButtonText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: 'bold',
  },
  minRedeemText: {
    fontSize: 10,
    color: '#D32F2F',
  },
  pointsGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  coinPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
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
    marginLeft: 15,
  },
  dealsListContainer: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  // <<< Tambahkan style jika list kosong >>>
  emptyText: {
    fontSize: 14,
    color: '#888',
    paddingHorizontal: 20,
  },
});

export default RedeemPoinScreen;
