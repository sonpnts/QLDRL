// src/App.js
import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import DangKy from './components/TaiKhoan/DangKy';
import OTP from './components/TaiKhoan/OTP';
// import ThemTroLySinhVien from './components/Home/ThemTroLySinhVien';
import DangNhap from './components/TaiKhoan/DangNhap';
// import Main from './components/Home/Main';
// import BaiViet from './components/BanTin/BaiViet';
// import DangXuat from './components/TaiKhoan/DangXuat';
// import SinhVienDangKy from './components/TaiKhoan/SinhVien';
// import ExportBaoCao from './components/QuanLy/Export';
// import ChatScreen from './components/ChatFireBase/ChatScreen';
// import DiemDanh from './components/QuanLy/UploadFileDiemDanh';
// import CreatePost from './components/QuanLy/DangBaiViet';
// import HoatDong from './components/QuanLy/HoatDong';
// import HoatDongChuaCoBaiViet from './components/QuanLy/DanhSanhHoatDong';
// import QuanLyHoatDong from './components/QuanLy/QuanLyCacHoatDong';
// import SuaHoatDong from './components/QuanLy/SuaHoatDong';
// import ChatListScreen from './components/ChatFireBase/RoomChat';
// import ChatDetailScreen from './components/ChatFireBase/Chat';
// import DanhSachBaoThieu from './components/QuanLy/DanhSachBaoThieu';
// import DanhSachSinhVien from './components/QuanLy/DanhSachSinhVien';
// import ChiTietBaoThieu from './components/QuanLy/ChiTietBaoThieu';
// import ThanhTichNgoaiKhoa from './components/QuanLy/ThanhTichNgoaiKhoa';
// import HDNKChuaDiemDanh from './components/SinhVien/HDNKChuaDiemDanh';
// import HDNKDiemDanh from './components/SinhVien/HDNKDiemDanh';
// import MinhChung from './components/SinhVien/MinhChung';
import MyContext from './configs/MyContext';
// import { useReducer } from "react";
import MyUserReducer from './reducers/MyUserReducer';
import { auth } from './configs/Firebase'; 
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import cookie from "react-cookies";


const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [role, setRole] = useState();
  // const [authfire, setAuthfire] = useState(false);

  // const getFireBaseToken = async () => {
  //   try {
  //     const token = localStorage.getItem('firebase-token');
  //     if (token) {
  //       signInWithCustomToken(auth, token)
  //         .then((userCredential) => {
  //           const user = userCredential.user;
  //           setAuthfire(true);
  //         })
  //         .catch((error) => {
  //           console.error('Error signing in:', error);
  //         });
  //     } else {
  //       console.log('Không tìm thấy token trong localStorage');
  //     }
  //   } catch (ex) {
  //     console.log("Lỗi", ex);
  //   }
  // };

  // const getAccessToken = async () => {
  //   try {
  //     const token = localStorage.getItem('access-token');
  //     if (token) {
  //       const user = await axios.get('API_ENDPOINT_HERE', {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       });
  //       dispatch({
  //         type: 'login',
  //         payload: user.data
  //       });
  //       setIsAuthenticated(true);
  //       setRole(user.data.role);
  //     } else {
  //       console.log('Không tìm thấy token trong localStorage');
  //     }
  //   } catch (ex) {
  //     console.log("Lỗi", ex);
  //   }
  // };

  // useEffect(() => {
  //   getAccessToken();
  //   getFireBaseToken();
  // }, []);

  return (
    <BrowserRouter>
    <MyContext.Provider value={[user, dispatch]}>
      {/* <Router> */}
        <Routes>
          {/* {isAuthenticated ? ( */}
            <>
              {/* Uncomment and add your protected routes here */}
              {/* <Route path="/" element={<Main />} /> */}
              {/* <Route path="/bai-viet" element={<BaiViet />} /> */}
              {/* <Route path="/sinh-vien-dang-ky" element={<SinhVienDangKy />} />
              <Route path="/them-tro-ly-sinh-vien" element={<ThemTroLySinhVien />} />
              <Route path="/export-bao-cao" element={<ExportBaoCao />} />
              <Route path="/chat" element={<ChatScreen />} />
              <Route path="/diem-danh" element={<DiemDanh />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/hoat-dong" element={<HoatDong />} />
              <Route path="/hoat-dong-chua-co-bai-viet" element={<HoatDongChuaCoBaiViet />} />
              <Route path="/quan-ly-hoat-dong" element={<QuanLyHoatDong />} />
              <Route path="/sua-hoat-dong" element={<SuaHoatDong />} />
              <Route path="/chat-list" element={<ChatListScreen />} />
              <Route path="/chat-detail" element={<ChatDetailScreen />} />
              <Route path="/danh-sach-bao-thieu" element={<DanhSachBaoThieu />} />
              <Route path="/danh-sach-sinh-vien" element={<DanhSachSinhVien />} />
              <Route path="/chi-tiet-bao-thieu" element={<ChiTietBaoThieu />} />
              <Route path="/thanh-tich-ngoai-khoa" element={<ThanhTichNgoaiKhoa />} />
              <Route path="/hdnk-chua-diem-danh" element={<HDNKChuaDiemDanh />} />
              <Route path="/hdnk-diem-danh" element={<HDNKDiemDanh />} />
              <Route path="/minh-chung" element={<MinhChung />} /> */}
            </>
          ) : (
            <>
              <Route path="/dang-nhap" element={<DangNhap />} />
              <Route path="/dang-ky" element={<DangKy />} />
              <Route path="/otp" element={<OTP />} />
            </>
          {/* )} */}
        </Routes>
      {/* </Router> */}
    </MyContext.Provider>
    </BrowserRouter>

  );
};

export default App;
