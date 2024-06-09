import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native"
import { TextInput as PaperTextInput, Title, Button as PaperButton } from "react-native-paper";
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import MyContext from "../../configs/MyContext";
import Styles from "./Styles";
import { set } from "firebase/database";

const DangNhap = ({ navigation }) => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole, setUser] = useContext(MyContext);

    const login = async () => {
        try {
            let res = await APIs.post(endpoints['dang_nhap'], {
                'username': username,
                'password': password,
                // 'client_id': "ITGERx67yOCQUySK1JXP1XnjBDEmVWvHsKiRziSK",
                // 'client_secret': "5HEazjuCHoYyiiESfKi71JaePQozLshjXrCofUjWeWbPqQeJ6mmEZKnY2vqgOfVfCyetjURa0rUgemgEAJjnSxfyNNloc7CaEW5QzWFEFXiQ1WUqSVszGFC3duJTN8FI",
                'client_id': 'YN17cy35cApl9PUiBuPCO0eTKgEEFtVWTV7I67lV',
                'client_secret': '0LpVpqTQ6fcHCwCSfCqKx0JcEzFfGHnf857IuKgtsf2sl1KX3HdqlpTQBUSGiTUm3CaZeqtYZCMXn59Cqfc79pfKu1LVtNUNbIBbO0JnrfbqvAmB3N9xRCHLhDBJI1YM',
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
            // setUser(user.data);
            setRole(user_role);
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
    const exportBaoCao = () => {
        navigation.replace("ExportBaoCao");
    }

    const diemdanh = () => {
        navigation.replace("DiemDanh");
    }
    return (
        <View style={Styles.containerlogin}>
            <Text style={[Styles.subject, Styles.margin_bottom_20]}>ĐĂNG NHẬP</Text>

            <PaperTextInput value={username} label="Username" mode="outlined" onChangeText={t => setUsername(t)} placeholder="Username..." style={Styles.margin_bottom_20} />
            <PaperTextInput value={password} label="Password" mode="outlined" onChangeText={t => setPassword(t)} secureTextEntry={true} placeholder="Password..." style={Styles.margin_bottom_20} />
            <PaperButton onPress={login} mode="contained" style={Styles.margin_bottom_20}>Đăng nhập</PaperButton>
            <PaperButton onPress={register} mode="elevated">Đăng ký</PaperButton>
            {/* <PaperButton onPress={sv} mode="elevated">Sinh Viên</PaperButton> */}
             {/* <PaperButton onPress={exportBaoCao} mode="elevated">Thống kê</PaperButton> */}
            {/* <PaperButton onPress={diemdanh} mode="elevated">Điểm danh</PaperButton> */}
        </View>
    )
}

export default DangNhap