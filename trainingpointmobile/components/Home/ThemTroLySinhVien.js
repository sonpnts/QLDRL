import React from "react";
import { Picker } from "@react-native-picker/picker";
import { ScrollView, View, Image, ActivityIndicator, Alert, Text } from "react-native";
import { TextInput as PaperTextInput, Title, Button as PaperButton } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "./Styles";

const ThemTroLySinhVien = ({ navigation }) => {
    const [assistant, setAssistant] = React.useState({
        email: "",
        username: "",
        firstname: "",
        lastname: "",
        password: "",
        avatar: "",
        role: "3",
        khoa: null
    });

    const [khoa, setKhoa] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({
        email: "",
        username: "",
        firstname: "",
        lastname: "",
        password: "",
        avatar: "",
        khoa: ""
    });

    const change = (field, value) => {
        setAssistant(current => ({ ...current, [field]: value }));
        setErrors(current => ({ ...current, [field]: "" })); 
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

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateForm = async () => {
        let valid = true;
        let newErrors = {  username: "", firstname: "", lastname: "", password: "", avatar: "", khoa: "" };

      
        if (!validatePassword(assistant.password)) {
            newErrors.password = 'Password phải có từ 8 ký tự trở lên';
            valid = false;
        }
        if (!assistant.avatar) {
            newErrors.avatar = 'Avatar không tồn tại!';
            valid = false;
        }
        if (!assistant.username) {
            newErrors.username = 'Username không được để trống!';
            valid = false;
        }
        if (!assistant.firstname) {
            newErrors.firstname = 'Firstname không được để trống!';
            valid = false;
        }
        if (!assistant.lastname) {
            newErrors.lastname = 'Lastname không được để trống!';
            valid = false;
        }
        if (!assistant.khoa) {
            newErrors.khoa = 'Khoa không được để trống!';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const postAssistant = async () => {
        if (await validateForm()) {
            try {
                //  let tk_valid = false; // Đã có tài khoản
                try {
                    let check = await APIs.get(`${endpoints['tai_khoan_is_valid']}?email=${assistant.email}&username=${assistant.username}`);
                    if (check.data.is_valid == "False") {
                        setLoading(true);
                        let form = new FormData();
                        for (let key in assistant) {
                            if (key === "avatar") {
                                form.append(key, {
                                    uri: assistant.avatar.uri,
                                    name: assistant.avatar.fileName,
                                    type: assistant.avatar.type || 'image/jpeg'
                                });
                            } else {
                                form.append(key, assistant[key]);
                            }
                        }
                        
                        let accessToken = await AsyncStorage.getItem('access-token');
                        const resdk = await APIs.post(endpoints['dang_ky'], form, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${accessToken}`
                            }
                        });
                        let formtroly = new FormData();
                        formtroly.append('trolySV', resdk.data.id);
                        formtroly.append('khoa', assistant.khoa);
                        let trolycreate = await APIs.post(endpoints['tro_ly'], formtroly,{
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${accessToken}`
                            }
                        });

                        if (resdk.status ===  201 && trolycreate.status === 201 ) {
                            Alert.alert('Thêm trợ lý sinh viên thành công!');
                            setAssistant({
                                email: "",
                                username: "",
                                firstname: "",
                                lastname: "",
                                password: "",
                                avatar: "",
                                role: "3",
                                khoa: null
                            });
            
                            // Clear errors
                            setErrors({
                                email: "",
                                username: "",
                                firstname: "",
                                lastname: "",
                                password: "",
                                avatar: "",
                                khoa: ""
                            });
                        }
                        
                    }
                    else {
                        Alert.alert('Email hoặc username đã tồn tại!');
                    }
                } catch (ex) {
                    setLoading(false);
                    Alert.alert('Có lỗi gì đó đã xảy ra', ex.message);
                }
                
            } catch (ex) {
                console.log(ex);
                Alert.alert('Có lỗi gì đó đã xảy ra!', ex.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const getKhoas = async () => {
        try {
            const khoas = await APIs.get(endpoints['khoa']);
            setKhoa(khoas.data);
        } catch (ex) {
            Alert.alert('Có lỗi gì đó đã xảy ra khi lấy dữ liệu khoa!', ex.message);
        }
    };

    React.useEffect(() => {
        getKhoas();
    }, []);

    return (
        <ScrollView automaticallyAdjustKeyboardInsets={true}>
            <View style={Styles.container}>
                {assistant.avatar && (
                    <View style={[Styles.align_item_center, Styles.margin_bottom_20]}>
                        <Image
                            source={{ uri: assistant.avatar.uri }}
                            style={Styles.avatar}
                        />
                    </View>
                )}
                <PaperButton mode='contained-tonal' onPress={handleChooseAvatar} style={Styles.margin_bottom_20}>Chọn ảnh đại diện</PaperButton>
                {errors.avatar ? <Text style={Styles.error}>{errors.avatar}</Text> : null}
                <PaperTextInput
                    label="Email"
                    value={assistant.email}
                    onChangeText={text => change("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.email ? <Text style={Styles.error}>{errors.email}</Text> : null}
                <PaperTextInput
                    label="Username"
                    value={assistant.username}
                    onChangeText={text => change("username", text)}
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.username ? <Text style={Styles.error}>{errors.username}</Text> : null}
                <PaperTextInput
                    label="Firstname"
                    value={assistant.firstname}
                    onChangeText={text => change("firstname", text)}
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.firstname ? <Text style={Styles.error}>{errors.firstname}</Text> : null}
                <PaperTextInput
                    label="Lastname"
                    value={assistant.lastname}
                    onChangeText={text => change("lastname", text)}
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.lastname ? <Text style={Styles.error}>{errors.lastname}</Text> : null}
                <PaperTextInput
                    label="Password"
                    value={assistant.password}
                    onChangeText={text => change("password", text)}
                    secureTextEntry
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.password ? <Text style={Styles.error}>{errors.password}</Text> : null}
                <View style={[Styles.margin_bottom_20, { borderColor: 'purple', borderWidth: 1, borderRadius: 25 }]}>
                    <Picker
                        selectedValue={assistant.khoa}
                        onValueChange={(itemValue) => change("khoa", itemValue)}
                    >
                        {khoa.map(k => (
                            <Picker.Item label={k.ten_khoa} value={k.id} key={k.id} />
                        ))}
                    </Picker>
                </View>
                {errors.khoa ? <Text style={Styles.error}>{errors.khoa}</Text> : null}
                {loading ? <ActivityIndicator /> : (
                    <PaperButton mode="contained" style={Styles.margin_bottom_20} onPress={postAssistant}>Thêm trợ lý sinh viên</PaperButton>
                )}
            </View>
        </ScrollView>
    );
};

export default ThemTroLySinhVien;
