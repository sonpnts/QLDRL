import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../configs/Firebase';
import MyContext from '../../configs/MyContext';
import APIs, { endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatListScreen = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [khoa, setKhoa] = useState('');
  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);


  const getroom = async (id) => {
    const unsubscribe = onSnapshot(collection(db, 'chatRooms'), (snapshot) => {
        let rooms = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (role == 3 && data.khoa == id) {
            rooms.push({ ...data, id: doc.id });
          } 
        });
        // console.log(rooms);
        setChatRooms(rooms);
      });
      return () => unsubscribe();
    }


    useEffect(() => {
        const fetchData = async () => {
          try {
            const token = await AsyncStorage.getItem('access-token');
            const response = await APIs.get(endpoints['get_khoa'], {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
            if (response.status === 200) {
              setKhoa(response.data);
              getroom(response.data.id);
            } else {
              Alert.alert('Error', 'Lỗi khi lấy khoa');
            }
          } catch (error) {
            console.error('Lỗi khi lấy khoa:', error);
            Alert.alert('Error', 'Lỗi khi lấy khoa');
          }
        };
    
        fetchData(); 
    
      }, [role, navigation]);
    

  return (
    <View style={styles.container}>
      {chatRooms.map(room => (
        <TouchableOpacity key={room.id} style={styles.roomContainer} onPress={() => navigation.navigate('ChatDetail', { roomId: room.id })}>
          <Text style={styles.roomText}>MSSV: {room.mssv}</Text>
          <Text style={styles.roomText}>Tên sinh viên: {room.ten_sv}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  roomContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginVertical: 5,
    backgroundColor: 'lightblue',
  },
  roomText: {
    fontSize: 16, // Phông chữ to hơn
    marginBottom: 5, // Khoảng cách dưới mỗi dòng
  },
});

export default ChatListScreen;
