// src/features/Discussion/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

const placeholderAvatar =
  'https://via.placeholder.com/40/A77C55/FFFFFF?text=AH';

const ChatScreen = ({ route, navigation }) => {
  // --- 1. Ambil 'isGroupChat' dari params ---
  const { chatId, chatName, chatAvatarUrl, isGroupChat } = route.params || {
    chatId: 'unknown',
    chatName: 'Error',
    chatAvatarUrl: null,
    isGroupChat: false, // Default ke false
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserID, setCurrentUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const flatListRef = useRef(null);
  const headerAvatarSource = chatAvatarUrl
    ? { uri: chatAvatarUrl }
    : { uri: placeholderAvatar };

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- 2. Modifikasi useEffect (fetchData) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('User not found');
        setCurrentUserID(user.id);

        // --- 3. UBAH QUERY: Sertakan data 'profiles' ---
        // Ambil data pesan DAN 'username' dari tabel 'profiles'
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(
            `
            *,
            profiles (
              username
            )
          `,
          )
          .eq('room_id', chatId)
          .order('created_at', { ascending: true });

        if (messageError) {
          throw messageError;
        }

        setMessages(messageData || []);
      } catch (error) {
        showError('Gagal Memuat Chat', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (chatId !== 'unknown') {
      fetchData();
    } else {
      showError('Error', 'ID Chat tidak valid.');
      setLoading(false);
    }
  }, [chatId]);

  // --- 4. Modifikasi useEffect (Realtime) ---
  useEffect(() => {
    if (!currentUserID || chatId === 'unknown') return;

    // --- 5. BUAT FUNGSI UNTUK MENGAMBIL PESAN DENGAN PROFIL ---
    // (Realtime 'payload.new' tidak bisa di-join, jadi kita fetch manual)
    const getMessageWithProfile = async messageId => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .eq('id', messageId)
        .single();

      if (error) {
        console.error('Error fetching new message:', error);
        return null;
      }
      return data;
    };

    const channel = supabase
      .channel(`public:messages:room_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${chatId}`,
        },
        async payload => {
          // Ambil pesan lengkap DENGAN profil
          const newMessage = await getMessageWithProfile(payload.new.id);
          if (newMessage) {
            setMessages(prevMessages => {
              if (!prevMessages.find(msg => msg.id === newMessage.id)) {
                return [...prevMessages, newMessage];
              }
              return prevMessages;
            });
          }
        },
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime channel connected!');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          showError('Koneksi Realtime Gagal', 'Koneksi chat terputus.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserID]);

  // --- 6. Fungsi handleSend (Tidak perlu diubah) ---
  const handleSend = async () => {
    if (inputText.trim().length === 0 || !currentUserID || isSending) {
      return;
    }
    setIsSending(true);
    const content = inputText.trim();
    setInputText('');
    const newMessage = {
      room_id: chatId,
      user_id: currentUserID,
      content: content,
    };
    try {
      const { error } = await supabase.from('messages').insert(newMessage);
      if (error) throw error;
      // Pesan akan muncul via Realtime
    } catch (error) {
      showError('Gagal Mengirim Pesan', error.message);
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll ke bawah (logika tetap sama)
  useEffect(() => {
    // Hanya scroll jika ada pesan
    if (messages.length > 0) {
      setTimeout(() => {
        // Cek SEKALI LAGI di dalam timeout
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100); // Beri 100ms agar UI selesai render
    }
  }, [messages]);

  // --- 7. Perbarui renderMessageItem (LOGIKA KUNCI) ---
  const renderMessageItem = ({ item }) => {
    const isUserSender = item.user_id === currentUserID;

    // --- LOGIKA DEFAULT YANG LEBIH BAIK ---
    // 1. Ambil username dari data join (bisa null atau string kosong '')
    const username = item.profiles?.username;

    // 2. Cek jika username ada DAN tidak kosong.
    //    Jika kosong, ganti jadi "Anonymous".
    const senderName =
      username && username.trim().length > 0 ? username.trim() : 'Anonymous';
    // --- AKHIR LOGIKA DEFAULT ---

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isUserSender
            ? styles.userMessageContainer
            : styles.expertMessageContainer,
        ]}
      >
        {isGroupChat && !isUserSender && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isUserSender
              ? styles.userMessageBubble
              : styles.expertMessageBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
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
        <View style={{ width: 40 }} />
      </View>

      {/* Keyboard Avoiding View */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Tampilkan Loading atau Daftar Pesan */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A453C" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id.toString()}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            ListEmptyComponent={
              <View style={styles.emptyChatContainer}>
                <Text style={styles.emptyChatText}>Mulai percakapan...</Text>
              </View>
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ketik pesan..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || inputText.trim().length === 0) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSending || inputText.trim().length === 0}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendButtonText}>➔</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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

// --- 9. Tambahkan style baru untuk 'senderName' ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#6A453C',
  },
  headerButton: { padding: 8 },
  headerBackText: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 14,
    color: '#999',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageBubbleContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  expertMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    // <<< STYLE BARU
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6A453C', // Sesuaikan warnanya
    marginBottom: 4,
    marginLeft: 10,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  userMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 5,
  },
  expertMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    backgroundColor: '#F8F8F8',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A453C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    transform: [{ rotate: '-45deg' }, { translateX: -1 }],
  },
});

export default ChatScreen;
