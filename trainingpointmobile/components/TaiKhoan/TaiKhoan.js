import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Avatar, Title, Caption, Button as PaperButton, Card } from 'react-native-paper';
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInfo = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const roles = {
        1: 'Admin',
        2: 'Cộng Tác Sinh Viên',
        3: 'Trợ Lý Sinh Viên',
        4: 'Sinh Viên'
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("access-token");
                const response = await APIs.get(endpoints['current_taikhoan'], {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        fetchUserData();
    }, []);

    if (!user) {
        return (
            <View style={[Styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={Styles.container}>
            <Card style={Styles.card}>
                <Card.Content style={Styles.cardContent}>
                    <Avatar.Image 
                        source={{ uri: user.avatar }} 
                        size={100} 
                    />
                    <Title style={Styles.title}>{user.username}</Title>
                    <Caption style={Styles.caption}>{user.email}</Caption>
                    <Text style={Styles.caption}>Loại tài khoản: {roles[user.role]}</Text>
                </Card.Content>
            </Card>
            <PaperButton 
                mode="contained" 
                style={Styles.button}
                onPress={() => navigation.navigate('EditProfile', { user })}
            >
                Chỉnh sửa thông tin
            </PaperButton>
        </ScrollView>
    );
};

export default UserInfo;
