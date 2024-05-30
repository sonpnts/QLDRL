import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native"
import { TextInput as PaperTextInput, Title, Button as PaperButton } from "react-native-paper";
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import MyContext from "../../configs/MyContext";
import Styles from "./Styles";



const DangNhap = ({ navigation }) => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

    const login = async () => {
        try {
            let res = await APIs.post(endpoints['dang_nhap'], {
                'username': username,
                'password': password,
                'client_id': "Ysn92B79VeakedOxEn6ZxVk5m9498y8xAlDzWaPT",
                'client_secret': "Vuw6wfyUKBOBs4in2hjazb5krmhVai1BAnpTS1AhSrZtBpAbQI2a9K34tBvUtjSOw1f0jW84GVZ21tGBQItWINaWPS3M5dy3TF8Yy7yhY8JAIs9R4jPfL30V34Y1g5Cs",
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
            console.log(user.data.role);
            let user_role = user.data.role;
            setRole(user_role);
            setIsAuthenticated(true);

        } catch (ex) {
            console.error(ex);
            
        }
    };

    const register = () => {
        navigation.replace("DangKy");
    }
    const sv = () => {
        navigation.replace("SinhVienDangKy");
    }

    return (
        <View style={Styles.container}>
            <Text style={[Styles.subject, Styles.margin_bottom_20]}>ĐĂNG NHẬP</Text>

            <PaperTextInput value={username} label="Username" mode="outlined" onChangeText={t => setUsername(t)} placeholder="Username..." style={Styles.margin_bottom_20} />
            <PaperTextInput value={password} label="Password" mode="outlined" onChangeText={t => setPassword(t)} secureTextEntry={true} placeholder="Password..." style={Styles.margin_bottom_20} />
            <PaperButton onPress={login} mode="contained" style={Styles.margin_bottom_20}>Đăng nhập</PaperButton>
            <PaperButton onPress={register} mode="elevated">Đăng ký</PaperButton>
            {/*<PaperButton onPress={sv} mode="elevated">Sinh Viên</PaperButton>*/}
        </View>
    )
}

export default DangNhap