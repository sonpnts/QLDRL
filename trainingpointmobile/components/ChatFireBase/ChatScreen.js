
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Alert, TouchableOpacity , ActivityIndicator} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../configs/Firebase';
import MyContext from '../../configs/MyContext';
import APIs, { endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'firebase/database';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sv, setSv] = useState();
  const [khoa, setKhoa] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

  useEffect(() => {
    getKhoa();
    const unsubscribe = onSnapshot(collection(db, 'chatRooms'), (snapshot) => {
      let rooms = [];
      snapshot.forEach(doc => {
        const data = doc.data();
         if (role === 4 && data.participants.includes(user.id)) {
          rooms.push({ ...data, id: doc.id });
        }
      });
      if (role === 4) {
        if (rooms.length > 0) {
          setSelectedRoom(rooms[0].id); // Chọn phòng đầu tiên mà sinh viên có thể tham gia
        } else {
          createChatRoomForStudent(); // Tạo phòng mới nếu không có phòng nào
        }
      }
      // setChatRooms(rooms);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const q = query(collection(db, `chatRooms/${selectedRoom}/messages`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach(doc => {
          msgs.push({ ...doc.data(), id: doc.id });
        });
        setMessages(msgs);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [selectedRoom]);

  const getKhoa = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      const response = await APIs.get(endpoints['get_khoa'], {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        setKhoa(response.data);
        // console.log(response.data);
      }
      if(user.role ==4){
        const svres = await APIs.get(endpoints['current_sinhvien'],{
          headers: {
            Authorization: `Bearer ${token}`
          }
        
        });
        setSv(svres.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy khoa:', error);
      Alert.alert('Error', 'Lỗi khi lấy khoa');
    }
  }

  const createChatRoomForStudent = async () => {
    const token = await AsyncStorage.getItem('access-token');
    const svres = await APIs.get(endpoints['current_sinhvien'],{
      headers: {
        Authorization: `Bearer ${token}`
      }
    
    });
    setSv(svres.data);
    try {
      const newRoom = await addDoc(collection(db, 'chatRooms'), {
        createdAt: Timestamp.now(),
        participants: [user.id],
        mssv: svres.data.mssv,
        ten_sv: svres.data.ho_ten,
        khoa: khoa.id,
      });
      setSelectedRoom(newRoom.id);
    } catch (error) {
      console.error('Lỗi khi tạo phòng chat:', error);
      Alert.alert('Error', 'Lỗi khi tạo phòng chat');
    }
  }

  const sendMessage = async () => {
    if (message.trim() && selectedRoom) {
      await addDoc(collection(db, `chatRooms/${selectedRoom}/messages`), {
        text: message,
        createdAt: Timestamp.now(),
        userId: user.id,
        role: user.role,
        email: user.email,
        ten: sv.ho_ten,
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

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
          <>
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
          </>
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
  roomContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginVertical: 5,
    backgroundColor: 'lightblue',
  },roomText: {
    fontSize: 16, // Phông chữ to hơn
    // fontWeight: 'bold', // Đậm chữ
    marginBottom: 5, // Khoảng cách dưới mỗi dòng
  },
});

export default ChatScreen;
