import React from "react";
import { View, TextInput, Button, Image, Text, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, ToastAndroid } from "react-native";
import { TextInput as PaperTextInput, Title, Button as PaperButton } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import Styles from "./Styles";


const DangKy = ({ route, navigation }) => {
    const [user, setUser] = React.useState({
        "email": "",
        "username": "",
        "password": "",
        "avatar": "",
        'role': "4"
    })
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    const change = (field, value) => {
        setUser(current => {
            return { ...current, [field]: value }
        })
    }

    const handleEmailChange = (text) => {
        change("email", text);

    };

    const handlePasswordChange = (text) => {
        change('password', text);
    };

    const handleUsernameChange = (text) => {
        change('username', text);
    }

    const handleChooseAvatar = async () => {
        let { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result =
                await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                change('avatar', result.assets[0]);
        }
    };

    const validateEmail = (email) => {
        // Regular expression to match the desired email format
        const re = /^\d{10}[a-zA-Z]+@ou\.edu\.vn$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8; // Đủ dài ít nhất 8 ký tự
    };

    const validateDangKy = async () => {
        // setLoading(true);

        if (validateEmail(user.email) && validatePassword(user.password) && user.avatar && user.username) {

            let tk_valid = false; // Đã có tài khoản

            try {
                let check = await APIs.get(`${endpoints['tai_khoan_is_valid']}?email=${user.email}&username=${user.username}`);
                if (check.status == 200) {
                    res = check.data.is_valid;
                    if (res == true) {
                        tk_valid = true;
                        message = check.data.message;
                    }
                }
            } catch (ex) {
                setLoading(false);
                ToastAndroid.show(ex.message, ToastAndroid.LONG);
                Alert.alert('Có lỗi gì đó đã xảy ra', 'Tài khoản sinh viên đã tồn tại!');
            }
           if(tk_valid==false){
               // PostTaiKhoan();
               navigation.navigate('OTP', { email: user.email });
           }
           else{
                Alert.alert('Có lỗi gì đó xảy ra', message);
           }
        }
        else
        if (!user.avatar) {
            Alert.alert('Có lỗi gì đó xảy ra', 'Avatar không tồn tại!');
        } else if (!validateEmail(user.email)) {

            Alert.alert('Có lỗi gì đó xảy ra', 'Email nhập không hợp lệ! Vui lòng nhập dạng 10 số + tên @ou.edu.vn');
        } else if (!validatePassword(user.password)) {

            Alert.alert('Pasword nhập không hợp lệ!', 'Password phải có từ 8 ký tự trở lên');
        }

    };

    const PostTaiKhoan = async () => {
        if (success) {
            setLoading(true);
            console.log("Đã vô hàm: ");
            let form = new FormData();
            for (let key in user) {
                if (key === 'avatar') {
                    form.append(key, {
                        uri: user[key].uri,
                        name: user[key].fileName,
                        type: user[key].type
                    })
                }

                else
                    form.append(key, user[key])
            }
            try {
                console.log(form);
                const response = await APIs.post(endpoints['dang_ky'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log(response.data);
                setLoading(false);

                Alert.alert('Tạo tài khoản thành công!');
                navigation.replace("DangNhap");
            } catch (ex) {
                ToastAndroid.show(ex.message, ToastAndroid.LONG);
                console.error(ex);
                setLoading(false);
                Alert.alert('Có lỗi gì đó đã xảy ra trong lúc tạo tài khoản!', 'Vui lòng thử lại sau!',ex);
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
            console.log(route.params.success);
            setSuccess(route.params.success);
        }
    }, [route.params]);

    React.useEffect(() => {
        const postAndResetSuccess = async () => {
            try {
                if (success) {
                    console.log("success: trước ", success);
                    await PostTaiKhoan();
                    setSuccess(false);
                }
            } catch (error) {
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
                <PaperTextInput
                    label="Email"
                    value={user.email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                <PaperTextInput
                    label="Username"
                    value={user.username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                <PaperTextInput
                    label="Password"
                    value={user.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {loading === true ? <ActivityIndicator /> : <>
                    <PaperButton mode="contained" style={Styles.margin_bottom_20} onPress={validateDangKy}>Đăng ký</PaperButton>
                </>}
                <PaperButton mode="elevated" style={Styles.margin_bottom_20} onPress={login}>Đã có tài khoản? Đăng nhập</PaperButton>
            </View>
        </ScrollView>
    );
};


export default DangKy;