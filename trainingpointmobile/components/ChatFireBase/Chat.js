import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../configs/Firebase';
import MyContext from '../../configs/MyContext';
import APIs, { endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatDetailScreen = ({ route }) => {
  const { roomId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sv, setSv] = useState();
  const [khoa, setKhoa] = useState('');
  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

  useEffect(() => {
    if (roomId) {
      const q = query(collection(db, `chatRooms/${roomId}/messages`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach(doc => {
          msgs.push({ ...doc.data(), id: doc.id });
        });
        setMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if (message.trim() && roomId) {
      // console.group(user)
    await addDoc(collection(db, `chatRooms/${roomId}/messages`), {
        text: message,
        createdAt: Timestamp.now(),
        userId: user.id,
        ten: user.first_name + ' ' + user.last_name,
        role: user.role,
        email: user.email,
    });
    setMessage('');
    }
  };

  const renderUsername = (userName, userId, userRole) => {
    let displayName = userName;
    if (userRole === 3 && userId !== user.id) {
      displayName += " - Trợ lý sinh viên khoa " + khoa.ten_khoa;
    }
    if (userId === user.id) {
      displayName = "Bạn";
    }
    return displayName;
  };

  const renderItem = ({ item }) => {
    const isSentByCurrentUser = item.userId === user.id;
    const createdAt = item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().toLocaleString() : new Date(item.createdAt).toLocaleString()) : "Unknown time";
    return (
      <View style={[styles.message, { alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start' }]}>
        <Text style={{ fontSize: 12, color: '#888' }}>{createdAt}</Text>
        <Text style={styles.username}>{renderUsername(item.ten, item.userId, item.role)}:</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
          />
          <Button title="Gửi" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  message: {
    margin: 5,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    maxWidth: '80%',
  },
  username: {
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatDetailScreen;

