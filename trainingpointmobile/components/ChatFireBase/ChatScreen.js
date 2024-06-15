import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet,  KeyboardAvoidingView, Platform  } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../configs/firebase';
import MyContext from '../../configs/MyContext';
import APIs, { endpoints, formatDate } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [khoa, setKhoa] = useState('');
  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

  const getKhoa = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      
      const response = await APIs.get(endpoints['get_khoa'], {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        // console.log("Khoa", response.data);
        setKhoa(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy khoa:', error);
      Alert.alert('Error', 'Lỗi khi lấy khoa');
    }
  }

  useEffect(() => {
    getKhoa();
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim()) {
      await addDoc(collection(db, 'messages'), {
        text: message,
        createdAt: new Date(),
        userId: user.id,
        userName: user.username,
        role: user.role,
        khoa: khoa.id,
      });
      setMessage('');
    }
  };

  const renderUsername = (userName, userId, userRole) => {
    let displayName = userName;
    if ( userRole === 3 && userId!==user.id) {
      displayName += " - Trợ lý sinh viên khoa " + khoa.ten_khoa;
    }
    if (userId ==user.id) {
      displayName = "Bạn";
    }
    return displayName;
  };

  const renderItem = ({ item }) => {
    const isSentByCurrentUser = item.userId === user.id;
    return (
      <View style={[styles.message, { alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start' }]}>
        <Text style={{ fontSize: 12, color: '#888' }}>{item.createdAt.toDate().toLocaleString()}</Text>
        <Text style={styles.username}>{renderUsername(item.userName, item.userId, item.role)}:</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={80} // Điều chỉnh khoảng cách khi bàn phím hiển thị
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted // Hiển thị tin nhắn mới nhất ở phía dưới
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
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    maxWidth: '80%', // Giới hạn chiều rộng của tin nhắn
  },
  username: {
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10, // Khoảng cách giữa input và bottom edge của màn hình
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
export default ChatScreen;
