import React from "react";
import { View, Image, Text, Alert, ActivityIndicator, ScrollView, ToastAndroid } from "react-native";
import { TextInput as PaperTextInput, Title, Button as PaperButton, Avatar } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import Styles from "./Styles";
// import mime from 'mime';


const DangKy = ({ route, navigation }) => {
    const [user, setUser] = React.useState({
        "email": "",
        "username": "",
        "password": "",
        "avatar": "",
        'role': "4"
    });

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [errors, setErrors] = React.useState({
        email: "",
        username: "",
        password: "",
        avatar: ""
    });

    const change = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
        setErrors(current => ({ ...current, [field]: "" })); // Clear error message when the field changes
    };

    const handleEmailChange = (text) => {
        change("email", text);
    };

    const handlePasswordChange = (text) => {
        change('password', text);
    };

    const handleUsernameChange = (text) => {
        change('username', text);
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
        const re = /^\d{10}[a-zA-Z]+@ou\.edu\.vn$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateDangKy = async () => {
        let valid = true;
        let newErrors = { email: "", username: "", password: "", avatar: "" };

        if (!validateEmail(user.email)) {
            newErrors.email = 'Email nhập không hợp lệ! Vui lòng nhập dạng 10 số + tên @ou.edu.vn';
            valid = false;
        }
        if (!validatePassword(user.password)) {
            newErrors.password = 'Password phải có từ 8 ký tự trở lên';
            valid = false;
        }
        if (!user.avatar) {
            newErrors.avatar = 'Avatar không tồn tại!';
            valid = false;
        }
        if (!user.username) {
            newErrors.username = 'Username không được để trống!';
            valid = false;
        }

        setErrors(newErrors);
        let message = '';
        if (valid) {
            let tk_valid = false; // Đã có tài khoản
            try {
                let check = await APIs.get(`${endpoints['tai_khoan_is_valid']}?email=${user.email}&username=${user.username}`);
                if (check.status == 200) {
                    const res = check.data.is_valid;
                    if (res) {
                        tk_valid = true;
                        message = check.data.message;
                    }
                }
            } catch (ex) {
                setLoading(false);
                ToastAndroid.show(ex.message, ToastAndroid.LONG);
                Alert.alert('Có lỗi gì đó đã xảy ra', 'Tài khoản sinh viên đã tồn tại!');
            }

            if (!tk_valid) {
                navigation.navigate('OTP', { email: user.email });
            } else {
                Alert.alert('Có lỗi gì đó xảy ra', message);
            }
        }
    };

    const PostTaiKhoan = async () => {
        if (success) {
            try {
                setLoading(true);
                let form = new FormData();
                for (let key in user) {
                    if (key === "avatar") {
                    form.append(key, {
                        uri: user.avatar.uri,
                        name: user.avatar.fileName ,
                        type: user.avatar.type || 'image/jpeg'
                        // type: mime.getType(user.avatar.uri) || "image/jpeg"

                    });
                    console.log("Avatar type: ", user[key].type)
                    } else {
                    form.append(key, user[key]);
                    }
                }
            
                console.log(form);
                // console.log('Avatar URI:', user.avatar.uri);
                let res = await APIs.post(endpoints['dang_ky'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log(res.data);
                setLoading(false);
                if(res.status === 201){
                    Alert.alert('Tạo tài khoản thành công!');
                    navigation.navigate("SinhVienDangKy", { email: user.email });
                }
                
            } catch (ex) {
                console.log(ex);
                ToastAndroid.show(ex.message, ToastAndroid.LONG);
                Alert.alert('Có lỗi gì đó đã xảy ra trong lúc tạo tài khoản!', ex.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const login = () => {
        navigation.replace("DangNhap");
    }

    React.useEffect(() => {
        if (route.params && route.params.success) {
            setSuccess(route.params.success);
        }
    }, [route.params]);

    React.useEffect(() => {
        const postAndResetSuccess = async () => {
            try {
                PostTaiKhoan();
                setSuccess(false);
            } catch (error) {
                // ToastAndroid.show(error.message, ToastAndroid.LONG);
                console.error('Error in postAndResetSuccess:', error);
            }
        };
        if (success) {
            postAndResetSuccess();
        }
    }, [success]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView automaticallyAdjustKeyboardInsets={true}>
            <View style={user.avatar ? Styles.container : [Styles.container, { marginTop: 40 }]}>
                <View style={Styles.margin_bottom_40}>
                    <Title numberOfLines={1} ellipsizeMode="tail" style={[Styles.subject, Styles.align_item_center]}>
                        Đăng ký
                    </Title>
                </View>
                {user.avatar && (
                    <View style={[Styles.align_item_center, Styles.margin_bottom_20]}>
                        <Image
                            source={{ uri: user.avatar.uri }}
                            style={Styles.avatar}
                        />
                    </View>
                )}
                <PaperButton mode='contained-tonal' onPress={handleChooseAvatar} style={Styles.margin_bottom_20}>Chọn ảnh đại diện</PaperButton>
                {errors.avatar ? <Text style={Styles.error}>{errors.avatar}</Text> : null}
                <PaperTextInput
                    label="Email"
                    value={user.email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.email ? <Text style={Styles.error}>{errors.email}</Text> : null}
                <PaperTextInput
                    label="Username"
                    value={user.username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.username ? <Text style={Styles.error}>{errors.username}</Text> : null}
                <PaperTextInput
                    label="Password"
                    value={user.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {errors.password ? <Text style={Styles.error}>{errors.password}</Text> : null}
                {loading ? <ActivityIndicator /> : <>
                    <PaperButton mode="contained" style={Styles.margin_bottom_20} onPress={validateDangKy}>Đăng ký</PaperButton>
                </>}
                <PaperButton mode="elevated" style={Styles.margin_bottom_20} onPress={login}>Đã có tài khoản? Đăng nhập</PaperButton>
            </View>
        </ScrollView>
    );
};

export default DangKy;
