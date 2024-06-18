import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native"
import { TextInput as PaperTextInput, Title, Button as PaperButton } from "react-native-paper";
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import MyContext from "../../configs/MyContext";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Styles from "./Styles";
import { set } from "firebase/database";

const DangNhap = ({ navigation }) => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole, setUser] = useContext(MyContext);
    const [showPassword, setShowPassword] = useState(false);


    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
      };
    const login = async () => {
        try {
            let res = await APIs.post(endpoints['dang_nhap'], {
                'username': username,
                'password': password,
                'client_id': "sdUIX9LsM0sEZH8ipS6op9WPiNjEK8mGU2wV1v8u",
                'client_secret': "rUygoi2fiap7rBvHjOULOulzYWDItVEQ8xC2QkPgn8iD0xIuSNB6gFvUhtHMtJFxg8GGveIkIYK7JDClKknom3ETDZop5Le8BRezqehWcRywwGHTxb6xjtio5xwRLAq7",
                // 'client_id': 'YN17cy35cApl9PUiBuPCO0eTKgEEFtVWTV7I67lV',
                // 'client_secret': '0LpVpqTQ6fcHCwCSfCqKx0JcEzFfGHnf857IuKgtsf2sl1KX3HdqlpTQBUSGiTUm3CaZeqtYZCMXn59Cqfc79pfKu1LVtNUNbIBbO0JnrfbqvAmB3N9xRCHLhDBJI1YM',
                'grant_type': "password"
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            
            console.info(res.data)

            await AsyncStorage.setItem('access-token', res.data.access_token)

            let user = await authAPI(res.data.access_token).get(endpoints['current_taikhoan']);
            dispatch({
                "type": "login",
                "payload": user.data
            });
            let firebase = await APIs.get(endpoints['firebase'], {
                headers: {
                    Authorization: `Bearer ${res.data.access_token}`,
                  },
            });
            
            await AsyncStorage.setItem('firebase-token', firebase.data.token)
           
            // console.log(user.data.role);
            let user_role = user.data.role;
            // setUser(user.data);
            setRole(user_role);
            // console.log(user_role);
            setIsAuthenticated(true);

        } catch (ex) {
            console.error("Lỗi tại màn hình đăng nhập:",ex);
            
        }
    };

    const register = () => {
        navigation.replace("DangKy");
    }
    const sv = () => {
        navigation.replace("SinhVienDangKy");
    }

    return (
        <View style={Styles.containerlogin}>
            <Text style={[Styles.subject, Styles.margin_bottom_20]}>ĐĂNG NHẬP</Text>
       
            <PaperTextInput value={username} label="Username" mode="outlined" onChangeText={t => setUsername(t)} placeholder="Username..." style={Styles.margin_bottom_20} />
            <View style={Styles.passwordContainer}>
                <PaperTextInput
                    label="Password"
                    value={password}
                    onChangeText={t => setPassword(t)}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    style={Styles.passwordInput}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={Styles.showPasswordButton}>
                    <Icon name={showPassword ? "eye" : "eye-off"} size={24} color="black" />
                </TouchableOpacity>
                </View>

            <PaperButton onPress={login} mode="contained" style={Styles.margin_bottom_20}>Đăng nhập</PaperButton>
            <PaperButton onPress={register} mode="elevated">Đăng ký</PaperButton>
            
        </View>
    )
}

export default DangNhap