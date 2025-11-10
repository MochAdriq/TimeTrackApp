// src/features/Discussion/screens/GroupInfoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView, // <<< DITAMBAHKAN
  StatusBar, // <<< DITAMBAHKAN
  ActivityIndicator, // <<< DITAMBAHKAN
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import { launchImageLibrary } from 'react-native-image-picker';
import InfoModal from '../../../components/common/InfoModal'; // <<< DITAMBAHKAN

const GroupInfoScreen = ({ route, navigation }) => {
  const { chatId, chatName, chatAvatarUrl } = route.params;
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(chatAvatarUrl);
  const [loading, setLoading] = useState(false);

  // --- State untuk Modal ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- Fungsi helper showError ---
  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    // Cek status admin
    const checkAdminStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_room_members')
        .select('role')
        .eq('room_id', chatId)
        .eq('user_id', user.id)
        .single();

      if (data && data.role === 'admin') {
        setIsAdmin(true);
      }
    };
    checkAdminStatus();
  }, [chatId]);

  const handleUpdateAvatar = async () => {
    setLoading(true);

    // 1. Pilih Gambar (sama seperti EditProfileScreen)
    const options = {
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      includeBase64: true,
    };
    const response = await new Promise(resolve =>
      launchImageLibrary(options, resolve),
    );

    if (
      response.didCancel ||
      !response.assets ||
      response.assets.length === 0
    ) {
      setLoading(false);
      return;
    }

    const image = response.assets[0];
    if (!image.base64) {
      showError('Error', 'Gagal membaca gambar (Base64).');
      setLoading(false);
      return;
    }

    try {
      // 2. Upload Gambar BARU
      const fileName = `group_${chatId}_${Date.now()}.png`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('group_avatars')
        .upload(filePath, image.base64, {
          contentType: image.type || 'image/png',
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // 3. Dapatkan URL Publik BARU
      const { data: urlData } = supabase.storage
        .from('group_avatars')
        .getPublicUrl(filePath);
      const newAvatarUrl = urlData.publicUrl;

      // 4. UPDATE Database
      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', chatId);
      if (updateError) throw updateError;

      // 5. (PENTING) Hapus Gambar LAMA
      if (currentAvatar) {
        // Ekstrak 'filePath' lama dari URL lengkap
        const oldFileName = currentAvatar.split('/').pop();
        if (oldFileName) {
          const { error: removeError } = await supabase.storage
            .from('group_avatars')
            .remove([oldFileName]);

          if (removeError) {
            // Jangan batalkan proses, cukup log error
            console.error('Gagal hapus file lama:', removeError.message);
          }
        }
      }

      // 6. Update UI
      setCurrentAvatar(newAvatarUrl);
      // (Opsional: Update juga state di navigator agar ChatScreen ikut berubah)
      navigation.setParams({ chatAvatarUrl: newAvatarUrl });
    } catch (error) {
      showError('Gagal Update Avatar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info Grup</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <Image
          source={{ uri: currentAvatar || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.groupName}>{chatName}</Text>

        {/* Tampilkan tombol HANYA jika user adalah admin */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateAvatar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Ubah Foto Grup</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Error */}
      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </SafeAreaView>
  );
};

// --- STYLESHEET LENGKAP ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0EBE3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#6A453C',
  },
  headerButton: {
    padding: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E0E0E0',
    marginTop: 30,
    marginBottom: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    backgroundColor: '#6A453C',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupInfoScreen;
