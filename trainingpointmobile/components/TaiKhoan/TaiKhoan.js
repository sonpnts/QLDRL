import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Avatar, Title, Caption, Button as PaperButton, Card, TextInput, TextInput as PaperTextInput } from 'react-native-paper';
import APIs, { endpoints, formatDate } from '../../configs/APIs';
import Styles from './Styles';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInfo = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [sv, setSv] = useState(null);
    const [lops, setLops] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [errors, setErrors] = React.useState({
        email: "",
        username: "",
        password: "",
        avatar: ""
    });

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
                const reslop = await APIs.get(endpoints['lop']);
                const response = await APIs.get(endpoints['current_taikhoan'], {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setLops(reslop.data.results);
                setUser(response.data);

                // Nếu người dùng là sinh viên, tải thông tin sinh viên
                if (response.data.role === 4) {
                    const ressv = await APIs.get(endpoints['current_sinhvien'], {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setSv(ressv.data);
                }

            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        fetchUserData();
    }, []);

    const findClassName = (classId) => {
        const foundClass = Array.isArray(lops) && lops.find(lop => lop.id === classId);
        return foundClass ? foundClass.ten_lop : "";
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const selectedDate = date.toISOString().slice(0, 10); // Lấy ra phần yyyy-MM-dd
        change("ngay_sinh", selectedDate);
        hideDatePicker();
    };

    const change = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
        setErrors(current => ({ ...current, [field]: "" })); // Clear error message when the field changes
    };

    const changesv = (field, value) => {
        setSv(current => ({ ...current, [field]: value }));
    };

    const handleChooseAvatar = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                change('avatar', result.assets[0]);
            }
        }
    };

    const changinfo = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.patch(endpoints['current_taikhoan'], user, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (user.role === 4 && sv) {
                const ressv = await APIs.patch(endpoints['current_sinhvien'], sv, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (ressv.status === 200) {
                    Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
                }
            }
            if (response.status === 200) {
                Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin:", error);
        }
    };

    if (!user) {
        return (
            <View style={[Styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={Styles.container}>
                <Card style={Styles.card}>
                    <Card.Content style={Styles.cardContent}>
                        <View style={[Styles.align_item_center, Styles.margin_bottom_20]}>
                            <TouchableOpacity onPress={handleChooseAvatar}>
                                <Avatar.Image 
                                    source={{ uri: user.avatar }} 
                                    size={150} 
                                    style={Styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>
                        { errors.avatar ? <Text style={Styles.error}>{errors.avatar}</Text> : null}
                        <TextInput
                            label="Username"
                            value={user.username}
                            mode="outlined"
                            onChangeText={(value) => change("username", value)}
                            style={Styles.input}
                        />
                        <TextInput
                            label="Email"
                            value={user.email}
                            editable={false}
                            style={Styles.input}
                        />
                        <TextInput
                            label="Loại tài khoản"
                            value={roles[user.role]}
                            editable={false}
                            style={Styles.input}
                        />
                        {user.role === 4 && sv && (
                        <>
                            <TextInput
                                label="Họ và tên"
                                value={sv.ho_ten}
                                editable={false}
                                style={Styles.input}
                            />
                            <TextInput
                                label="Địa chỉ"
                                value={sv.dia_chi}
                                onChangeText={(value) => changesv("dia_chi", value)}
                                mode="outlined"
                                style={Styles.input}
                            />
                            <TextInput
                                label="Giới tính"
                                value={sv.gioi_tinh === 1 ? 'Nam' : 'Nữ'}
                                editable={false}
                                style={Styles.input}
                            />
                            <TextInput
                                label="Lớp"
                                value={findClassName(sv.lop)}
                                editable={false}
                                style={Styles.input}
                            />
                            <TextInput
                                label="Ngày sinh"
                                value={formatDate(sv.ngay_sinh)}
                                editable={false}
                                style={Styles.input}
                            />
                        </>
                        )}
                    </Card.Content>
                </Card>
                <PaperButton 
                    mode="contained" 
                    style={Styles.button}
                    onPress={changinfo}
                >
                    Chỉnh sửa thông tin
                </PaperButton>
            </View>
        </ScrollView>
    );
};

export default UserInfo;
