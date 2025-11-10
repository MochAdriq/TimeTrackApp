import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';

import { supabase } from '../../../services/supabaseClient';
import InfoModal from '../../../components/common/InfoModal';

// Ganti nama layar dan tujuannya
const SCREEN_NAME = 'Pusat Bantuan';
const TABLE_NAME = 'support_messages'; // Tabel baru yang kita buat

const SupportChatScreen = ({ navigation }) => {
  // State dan Ref
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserID, setCurrentUserID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // Modal State

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const flatListRef = useRef(null);

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  }; // --- FUNGSI UTAMA: FETCH DATA ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User not found');
      setCurrentUserID(user.id); // Query: Ambil pesan berdasarkan user_id (yang bertindak sebagai room_id) // NOTE: Kita tidak perlu JOIN profile di sini karena nama pengirim // pasti "Admin" atau "Anda" (User)

      const { data: messageData, error: messageError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', user.id) // Filter berdasarkan user_id saat ini
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;

      setMessages(messageData || []);
    } catch (error) {
      showError('Gagal Memuat Chat Bantuan', error.message);
    } finally {
      setLoading(false);
    }
  }, []); // --- REALTIME LISTENER ---

  useEffect(() => {
    if (!currentUserID) return; // 1. Subscribe ke tabel support_messages dengan filter user_id

    const channel = supabase
      .channel(`support:messages:user_id=eq.${currentUserID}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLE_NAME,
          filter: `user_id=eq.${currentUserID}`,
        },
        payload => {
          // Karena payload Realtime sudah lengkap (tidak perlu JOIN), kita langsung pakai
          const newMessage = payload.new;
          setMessages(prevMessages => {
            if (!prevMessages.find(msg => msg.id === newMessage.id)) {
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserID]); // --- LIFE CYCLE ---

  useEffect(() => {
    fetchData();
  }, [fetchData]); // --- FUNGSI KIRIM PESAN ---

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !currentUserID || isSending) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText('');

    const newMessage = {
      user_id: currentUserID,
      content: content,
      is_from_admin: false, // Penting: Pesan dari user
    };

    try {
      // Insert ke tabel support_messages
      const { error } = await supabase.from(TABLE_NAME).insert(newMessage);
      if (error) throw error; // Pesan akan muncul via Realtime
    } catch (error) {
      showError('Gagal Mengirim Pesan', error.message);
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  }; // Scroll ke bawah saat pesan bertambah

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [messages]); // --- RENDER ITEM PESAN ---

  const renderMessageItem = ({ item }) => {
    // is_from_admin: false -> pesan user (kanan)
    // is_from_admin: true -> pesan admin (kiri)
    const isUserSender = item.is_from_admin === false;

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isUserSender
            ? styles.userMessageContainer
            : styles.adminMessageContainer,
        ]}
      >
               {' '}
        <View
          style={[
            styles.messageBubble,
            isUserSender ? styles.userMessageBubble : styles.adminMessageBubble,
          ]}
        >
                   {' '}
          {!isUserSender && <Text style={styles.senderName}>Admin</Text>}       
            <Text style={styles.messageText}>{item.content}</Text>         {' '}
          <Text style={styles.messageTime}>
                       {' '}
            {new Date(item.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
                     {' '}
          </Text>
                 {' '}
        </View>
             {' '}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#6A453C" />   
        {/* Header Chat */}     {' '}
      <View style={styles.header}>
               {' '}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
                    <Text style={styles.headerBackText}>{'<'}</Text>       {' '}
        </TouchableOpacity>
                <Text style={styles.headerTitle}>{SCREEN_NAME}</Text>
                <View style={{ width: 40 }} />     {' '}
      </View>
            {/* Keyboard Avoiding View */}     {' '}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
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
                <Text style={styles.emptyChatText}>
                  Kami siap membantu Anda. Tanyakan kendala Anda di sini.
                </Text>
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
                {/* Input Area */}       {' '}
        <View style={styles.inputContainer}>
                   {' '}
          <TextInput
            style={styles.textInput}
            placeholder="Ketik pesan..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isSending}
          />
                   {' '}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || inputText.trim().length === 0) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSending || inputText.trim().length === 0}
          >
                       {' '}
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendButtonText}>➔</Text>
            )}
                     {' '}
          </TouchableOpacity>
                 {' '}
        </View>
             {' '}
      </KeyboardAvoidingView>
            {/* Modal Error */}     {' '}
      <InfoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
         {' '}
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 10,
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
  adminMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A2F2F', // Warna untuk Admin
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
  adminMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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

export default SupportChatScreen;
