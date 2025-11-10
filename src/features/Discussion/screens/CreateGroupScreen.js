// src/features/Discussion/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';
import { launchImageLibrary } from 'react-native-image-picker';

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.7,
      includeBase64: true, // Supabase V2 butuh ini untuk upload
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        showError(
          'Image Picker Error',
          response.errorMessage || 'Gagal memilih gambar.',
        );
      } else if (response.assets && response.assets.length > 0) {
        // Ambil aset pertama
        setImage(response.assets[0]);
      }
    });
  };

  const handleCreateGroup = async () => {
    if (groupName.trim().length === 0) {
      showError('Input Tidak Valid', 'Nama grup tidak boleh kosong.');
      return;
    }
    if (loading) return;
    setLoading(true);

    let uploadedAvatarUrl = null;

    try {
      // 1. Ambil data user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User tidak ditemukan');

      // 2. JIKA ADA GAMBAR, UPLOAD DULU
      if (image && image.base64) {
        const fileName = `group_${user.id}_${Date.now()}.png`;
        const filePath = `${fileName}`; // Path di dalam bucket

        // Upload ke bucket 'group_avatars'
        const { error: uploadError } = await supabase.storage
          .from('group_avatars')
          .upload(filePath, image.base64, {
            contentType: image.type || 'image/png',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // 3. Dapatkan Public URL
        const { data: urlData } = supabase.storage
          .from('group_avatars')
          .getPublicUrl(filePath);

        if (!urlData) {
          throw new Error('Gagal mendapatkan URL gambar.');
        }
        uploadedAvatarUrl = urlData.publicUrl;
      }

      // 4. Insert grup baru ke 'chat_rooms' (DENGAN ATAU TANPA AVATAR URL)
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          title: groupName,
          description: groupDesc,
          type: 'community',
          avatar_url: uploadedAvatarUrl, // <<< SIMPAN URL DI SINI
        })
        .select()
        .single();

      if (roomError) {
        throw roomError;
      }

      // 5. Daftarkan user pembuat sebagai 'admin' di 'chat_room_members'
      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: newRoom.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        throw memberError;
      }

      // 6. Berhasil, navigasi ke ChatScreen
      setLoading(false);
      navigation.replace('ChatScreen', {
        chatId: newRoom.id,
        chatName: newRoom.title,
        chatAvatarUrl: newRoom.avatar_url, // Kirim URL baru ke ChatScreen
        isGroupChat: true,
      });
    } catch (error) {
      setLoading(false);
      showError('Gagal Membuat Grup', error.message || 'Terjadi kesalahan.');
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
        <Text style={styles.headerTitle}>Buat Grup Baru</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleSelectImage}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.avatarPreview} />
          ) : (
            <Text style={styles.imagePickerText}>
              Pilih Avatar Grup (Opsional)
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.label}>Nama Grup</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama grup komunitas..."
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />

        <Text style={styles.label}>Deskripsi (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Jelaskan tentang grup ini..."
          value={groupDesc}
          onChangeText={setGroupDesc}
          multiline
          maxLength={150}
        />

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Buat Grup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
  },
  createButton: {
    backgroundColor: '#6A453C',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  createButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroupScreen;
