// src/features/Discussion/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList, // Untuk daftar pesan
  TextInput, // Untuk input pesan
  KeyboardAvoidingView, // Agar input tidak tertutup keyboard
  Platform, // Untuk penyesuaian OS
  Image, // Untuk avatar di header (opsional)
} from 'react-native';

// --- Impor Aset (Ganti jika perlu) ---
// import BackArrowIcon from '../../../assets/icon/BackArrowIcon.svg';
// import SendIcon from '../../../assets/icon/SendIcon.svg';
const placeholderAvatar =
  'https://via.placeholder.com/40/A77C55/FFFFFF?text=AH'; // Placeholder avatar header

// --- Data Dummy Pesan ---
const dummyMessages = [
  {
    id: '1',
    text: 'Halo, saya mau tanya tentang sejarah Kerajaan Majapahit.',
    sender: 'user',
    time: '10:01',
  },
  {
    id: '2',
    text: 'Halo! Tentu, silakan. Apa yang ingin Anda ketahui secara spesifik?',
    sender: 'expert',
    time: '10:02',
  },
  {
    id: '3',
    text: 'Bagaimana puncak kejayaan Majapahit bisa tercapai?',
    sender: 'user',
    time: '10:03',
  },
  {
    id: '4',
    text: 'Puncak kejayaan Majapahit terjadi pada masa pemerintahan Hayam Wuruk, dengan dukungan Mahapatih Gajah Mada. Sumpah Palapa Gajah Mada menjadi salah satu faktor penting dalam penyatuan Nusantara.',
    sender: 'expert',
    time: '10:05',
  },
  {
    id: '5',
    text: 'Terima kasih penjelasannya!',
    sender: 'user',
    time: '10:06',
  },
  // Tambahkan pesan lain untuk testing scroll
  {
    id: '6',
    text: 'Ada lagi yang bisa saya bantu?',
    sender: 'expert',
    time: '10:07',
  },
  {
    id: '7',
    text: 'Untuk saat ini cukup, Prof.',
    sender: 'user',
    time: '10:08',
  },
  {
    id: '8',
    text: 'Baik, jangan ragu bertanya lagi jika ada pertanyaan lain.',
    sender: 'expert',
    time: '10:09',
  },
];
// -------------------------

const ChatScreen = ({ route, navigation }) => {
  // Ambil nama chat/ahli dari parameter navigasi
  const { chatId, chatName, chatAvatarUrl } = route.params || {
    chatId: 'unknown',
    chatName: 'Ahli Sejarah',
    chatAvatarUrl: null,
  };

  const [messages, setMessages] = useState(dummyMessages); // State untuk pesan
  const [inputText, setInputText] = useState(''); // State untuk input teks
  const flatListRef = useRef(null); // Ref untuk FlatList

  const headerAvatarSource = chatAvatarUrl
    ? { uri: chatAvatarUrl }
    : { uri: placeholderAvatar };

  // Fungsi untuk mengirim pesan (sementara hanya tambah ke state)
  const handleSend = () => {
    if (inputText.trim().length === 0) {
      return; // Jangan kirim pesan kosong
    }
    const newMessage = {
      id: `msg-${Date.now()}`, // ID unik sementara
      text: inputText.trim(),
      sender: 'user', // Asumsikan pengguna selalu pengirim
      time: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText(''); // Kosongkan input
  };

  // Scroll ke bawah saat ada pesan baru atau keyboard muncul
  useEffect(() => {
    if (flatListRef.current) {
      // Beri sedikit delay agar layout sempat update
      setTimeout(
        () => flatListRef.current.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages]);

  // Render item pesan
  const renderMessageItem = ({ item }) => {
    const isUserSender = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isUserSender
            ? styles.userMessageContainer
            : styles.expertMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUserSender
              ? styles.userMessageBubble
              : styles.expertMessageBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A453C" />

      {/* Header Chat */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Image source={headerAvatarSource} style={styles.headerAvatar} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatName}
        </Text>
        {/* Bisa tambahkan tombol lain di kanan header jika perlu */}
        <View style={{ width: 40 }} />
      </View>

      {/* Keyboard Avoiding View */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Sesuaikan offset jika perlu
      >
        {/* Daftar Pesan */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          } // Coba scroll saat konten berubah
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} // Coba scroll saat layout berubah
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ketik pesan..."
            value={inputText}
            onChangeText={setInputText}
            multiline // Aktifkan multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            {/* Ganti dengan ikon Send */}
            <Text style={styles.sendButtonText}>➔</Text>
            {/* <SendIcon width={24} height={24} fill="#FFF" /> */}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECE5DD', // Background chat (mirip WhatsApp)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // Kurangi padding horizontal
    paddingVertical: 10,
    backgroundColor: '#6A453C', // Coklat header
  },
  headerButton: { padding: 8 },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#FFF', // Warna placeholder
  },
  headerTitle: {
    fontSize: 18, // Sedikit lebih kecil agar muat
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1, // Agar bisa memanjang dan dipotong (...)
  },
  keyboardAvoidingContainer: {
    flex: 1, // Agar mengisi sisa ruang
  },
  messageList: {
    flex: 1, // Agar list mengisi ruang di atas input
  },
  messageListContent: {
    paddingHorizontal: 10,
    paddingVertical: 15, // Beri jarak atas dan bawah
  },
  messageBubbleContainer: {
    marginVertical: 5, // Jarak vertikal antar bubble
    maxWidth: '80%', // Batasi lebar bubble
  },
  userMessageContainer: {
    alignSelf: 'flex-end', // Rata kanan untuk user
  },
  expertMessageContainer: {
    alignSelf: 'flex-start', // Rata kiri untuk ahli
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15, // Lengkungan bubble
  },
  userMessageBubble: {
    backgroundColor: '#DCF8C6', // Warna bubble hijau (mirip WhatsApp)
    borderTopRightRadius: 5, // Sudut kanan atas lebih datar
  },
  expertMessageBubble: {
    backgroundColor: '#FFFFFF', // Warna bubble putih
    borderTopLeftRadius: 5, // Sudut kiri atas lebih datar
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20, // Jarak antar baris teks
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end', // Rata kanan waktu
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Agar input text dan tombol sejajar di bawah
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    backgroundColor: '#F8F8F8', // Background area input
  },
  textInput: {
    flex: 1, // Mengisi ruang sisa
    minHeight: 40, // Tinggi minimum
    maxHeight: 120, // Tinggi maksimum sebelum scroll
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF', // Background input putih
    borderRadius: 20, // Bulat
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1, // Tambah border tipis
    borderColor: '#E0E0E0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A453C', // Warna coklat
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, // Sesuaikan agar sejajar dengan input
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20, // Ukuran ikon kirim (ganti dg SVG nanti)
    transform: [{ rotate: '-45deg' }, { translateX: -1 }], // Rotate icon panah
  },
});

export default ChatScreen;
