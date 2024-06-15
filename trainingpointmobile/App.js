import React from 'react';
import DangKy from './components/TaiKhoan/DangKy';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OTP from './components/TaiKhoan/OTP';
import MyContext from './configs/MyContext';
import ThemTroLySinhVien from './components/Home/ThemTroLySinhVien';
import MyUserReducer from './reducers/MyUserReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DangNhap from './components/TaiKhoan/DangNhap';
import Main from './components/Home/Main';
import { authAPI, endpoints } from './configs/APIs';
import Logout from './components/TaiKhoan/DangXuat';
import BaiViet from './components/BanTin/BaiViet';
import DangXuat from './components/TaiKhoan/DangXuat';
import SinhVienDangKy from './components/TaiKhoan/SinhVien';
import ExportBaoCao from './components/ThongKe/export';
import ChatScreen from './components/ChatFireBase/ChatScreen';
import DiemDanh from './components/TroLySinhVien/UploadFileDiemDanh';
import CreatePost from './components/TroLySinhVien/DangBaiViet';
import HoatDong from './components/TroLySinhVien/HoatDong';
import HoatDongChuaCoBaiViet from './components/TroLySinhVien/DanhSanhHoatDong';
import QuanLyHoatDong from './components/TroLySinhVien/QuanLyCacHoatDong';
import SuaHoatDong from './components/TroLySinhVien/SuaHoatDong';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './configs/firebase'; 


const Stack = createNativeStackNavigator();

// import firebase from './configs/firebase'
import firebase from 'firebase/app';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGIHD-_vTT_S2d3_N13EPkcjJ-9Urt7Z4",
  authDomain: "qldrl-77e59.firebaseapp.com",
  projectId: "qldrl-77e59",
  storageBucket: "qldrl-77e59.appspot.com",
  messagingSenderId: "694590271865",
  appId: "1:694590271865:web:e9186657367b4b1e6b3fa8"
};




export default function App({ navigation }) {
  const [user, dispatch] = React.useReducer(MyUserReducer, null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [role, setRole] = React.useState();
  const [authfire,setAuthfire] = React.useState(false);

  // Hàm chuyển đổi định dạng ngày từ yyyy-MM-dd sang dd/MM/yyyy



  const getFireBaseToken = async () => {
    try {
      const token = await AsyncStorage.getItem('firebase-token');
      if (token !== null) {
        // console.log('Token firebase trong appjs:', token);
        signInWithCustomToken(auth, token)
          .then((userCredential) => {
            // Đăng nhập thành công, userCredential.user sẽ chứa thông tin người dùng
            const user = userCredential.user;
            setAuthfire(true);
            console.log('User logged in:', user.uid);
          })
        .catch((error) => {
          // Xử lý lỗi đăng nhập
          console.error('Error signing in:', error);
        });
      } else {
        console.log('Không tìm thấy token trong AsyncStorage');
      }
    }
    catch (ex) {
      console.log("Lỗi",ex)
    }
  };


  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      if (token !== null) {
        // console.log('Token trong app.js:', token);
        let user = await authAPI(token).get(endpoints['current_taikhoan']);
        console.log(user.data);
        dispatch({
          "type": "login",
          "payload": user.data
        });
        setIsAuthenticated(true);
        setRole(user.data.role);
      } else {
        console.log('Không tìm thấy token trong AsyncStorage');
      }
    } catch (ex) {
      console.log("Lỗi",ex)
    }
  };
  
  React.useEffect(() => {
    getAccessToken();
    getFireBaseToken();
  }, []);

  return (
    <MyContext.Provider value={[user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole]}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          // headerTitle: 'Quản lý điểm rèn luyện sinh viên'
        }}>
          {isAuthenticated && <Stack.Screen name="Main" component={Main} options={{ headerRight: DangXuat }} />}
          {!isAuthenticated && <Stack.Screen name="DangNhap" component={DangNhap} />}
          <Stack.Screen name="BaiViet" component={BaiViet} options={{ title: 'Bài viết' }} />
          <Stack.Screen name="DangKy" component={DangKy} options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="OTP" component={OTP} options={{ title: 'OTP' }} />
          <Stack.Screen name="SinhVienDangKy" component={SinhVienDangKy} options={{ title: 'Sinh viên đăng ký' }} />
          <Stack.Screen name="ThemTaiKhoanTroLy" component={ThemTroLySinhVien} options={{ title: 'Thêm tài khoản trợ lý' }} />
          <Stack.Screen name="ExportBaoCao" component={ExportBaoCao} options={{ title: 'Xuất báo cáo' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Nhắn tin' }} />
          <Stack.Screen name="DiemDanh" component={DiemDanh} options={{ title: 'Điểm danh' }} />
          <Stack.Screen name="CreatePost" component={CreatePost} options={{ title: 'Tạo bài viết' }} />
          <Stack.Screen name="HoatDong" component={HoatDong} options={{ title: 'Hoạt động' }} />
          <Stack.Screen name="HoatDongChuaCoBaiViet" component={HoatDongChuaCoBaiViet} options={{ title: 'Các hoạt động chưa có bài viết' }} />
          <Stack.Screen name="QuanLyHoatDong" component={QuanLyHoatDong} options={{ title: 'Quản lý hoạt động' }} />
          <Stack.Screen name="SuaHoatDong" component={SuaHoatDong} options={{ title: 'Chỉnh sửa hoạt động' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </MyContext.Provider>
  );
}

