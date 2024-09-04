// src/App.js
import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch, Routes , Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import DangKy from './components/TaiKhoan/DangKy';
import Header from './components/Commons/Header';
import ThemTroLySinhVien from './components/QuanLy/ThemTroLySinhVien';
import DangNhap from './components/TaiKhoan/DangNhap';
import BanTin from './components/BanTin/BanTin';
import DangXuat from './components/TaiKhoan/DangXuat';
import SinhVienDangKy from './components/TaiKhoan/SinhVien';
import ExportBaoCao from './components/QuanLy/Export';
import ChatScreen from './components/ChatFireBase/ChatScreen';
import DiemDanh from './components/QuanLy/UploadFileDiemDanh';
import CreatePost from './components/QuanLy/TaoBaiViet';
import HoatDong from './components/QuanLy/HoatDong';
import HoatDongChuaCoBaiViet from './components/QuanLy/DanhSanhHoatDongChuaCoBaiViet';
import QuanLyHoatDong from './components/QuanLy/QuanLyCacHoatDong';
import SuaHoatDong from './components/QuanLy/SuaHoatDong';
import ChatListScreen from './components/ChatFireBase/RoomChat';
import ChatDetailScreen from './components/ChatFireBase/Chat';
import DanhSachBaoThieu from './components/QuanLy/DanhSachBaoThieu';
import DanhSachSinhVien from './components/QuanLy/DanhSachSinhVien';
import ChiTietBaoThieu from './components/QuanLy/ChiTietBaoThieu';
import ThanhTichNgoaiKhoa from './components/QuanLy/ThanhTichNgoaiKhoa';
import HDNKChuaDiemDanh from './components/SinhVien/HDNKChuaDiemDanh';
import HDNKDiemDanh from './components/SinhVien/HDNKDiemDanh';
import MinhChung from './components/SinhVien/MinhChung';
import { MyDispatchContext, MyUserContext } from './configs/MyContext';
import UserInfo from './components/TaiKhoan/TaiKhoan';
import MyUserReducer from './reducers/MyUserReducer';
import cookie from "react-cookies";
import NotificationDetail from './components/BanTin/NotificationDetail';
import Footer from './components/Commons/Footer';
import ForgotPassword from './components/TaiKhoan/ForgotPassword';

const App = () => {


  const ProtectedRoute = ({ element: Component, allowedRoles, user, ...rest }) => {
    return (
      allowedRoles.includes(user?.role) ? (
        <Component {...rest} />
      ) : (
        <NoAccess />
      )
    );
  };
  const NotFound = () => (
    <div className="not-found-container text-center mt-5" style={{ padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
      <h1 className="not-found-title" style={{ fontSize: '80px', color: '#dc3545', animation: 'bounce 1s infinite' }}>404</h1>
      <h2 className="not-found-subtitle" style={{ fontSize: '30px', color: '#343a40', marginTop: '20px' }}>Không tìm thấy trang</h2>
      <p className="not-found-message" style={{ color: '#6c757d', margin: '20px 0' }}>Trang bạn tìm không tồn tại. Vui lòng kiểm tra lại đường dẫn.</p>
      <a href="/" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '18px' }}>Quay về Trang Chính</a>
    </div>
  );

  const NoAccess = () => (
    <div className="no-access-container d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="display-1">403</h1>
        <h2 className="mb-4">Không có quyền truy cập</h2>
        <p className="mb-4">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn nghĩ đây là một lỗi.
        </p>
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      </div>
      <style>
        {`
          .no-access-container {
            background-color: #f8f9fa;
            animation: fadeIn 1s ease-in-out;
          }
  
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
  
          h1.display-1 {
            font-size: 6rem;
            font-weight: 700;
            color: #dc3545;
            animation: bounce 2s infinite;
          }
  
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-30px);
            }
            60% {
              transform: translateY(-15px);
            }
          }
        `}
      </style>
    </div>
  );
  

  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);
  return (
    <BrowserRouter>
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <Header />
        <Routes>
          

          
              <Route path="/them-tro-ly-khoa" element={<ProtectedRoute element={ThemTroLySinhVien} allowedRoles={[2]} user={user} />} />
              <Route path="/dang-nhap" element={<DangNhap />} />
              <Route path="/dang-ky" element={<DangKy />} />
       
              
              <Route path="/sinh-vien-dang-ky" element={<SinhVienDangKy />} />
              <Route path="/" element={<BanTin />} />
              <Route path="/dang-xuat" element={<DangXuat />} />
              <Route path="/profile" element={<UserInfo />} />
              <Route path="/no-access" element={<NoAccess />} />

              <Route path="/chat" element={<ChatScreen />} />

              <Route path="/chat-list" element={<ProtectedRoute element={ChatListScreen} allowedRoles={[3]} user={user} />} />
              <Route path="/chat-list/:roomId" element={<ProtectedRoute element={ChatDetailScreen} allowedRoles={[3]} user={user} />} />
              <Route path="/export-bao-cao" element={<ProtectedRoute element={ExportBaoCao} allowedRoles={[3]} user={user} />} />


              <Route path="/hdnk-chua-diem-danh" element={<ProtectedRoute element={HDNKChuaDiemDanh} allowedRoles={[4]} user={user}  />} />
              <Route path="/minh-chung" element={<MinhChung />} />


              <Route path="/chi-tiet-bao-thieu" element={<ProtectedRoute element={ChiTietBaoThieu} allowedRoles={[2, 3, 4]} user={user} />} />
              <Route path="/danh-sach-bao-thieu" element={<ProtectedRoute element={DanhSachBaoThieu} allowedRoles={[2, 3, 4]} user={user} />} />
              <Route path="/thanh-tich-ngoai-khoa" element={<ProtectedRoute element={ThanhTichNgoaiKhoa} allowedRoles={[2, 3, 4]} user={user} />} />
              <Route path="/danh-sach-sinh-vien" element={<ProtectedRoute element={DanhSachSinhVien} allowedRoles={[2, 3, 4]} user={user} />} />
              <Route path="/hoat-dong-chua-co-bai-viet" element={<ProtectedRoute element={HoatDongChuaCoBaiViet} allowedRoles={[3]} user={user} />} />
              <Route path="/tao-hoat-dong" element={<ProtectedRoute element={HoatDong} allowedRoles={[3]} user={user} />} />
              <Route path="/diem-danh" element={<ProtectedRoute element={DiemDanh} allowedRoles={[3]} user={user} />} />
              <Route path="/quan-ly-hoat-dong" element={<ProtectedRoute element={QuanLyHoatDong} allowedRoles={[3]} user={user} />} />
              <Route path="/sua-hoat-dong" element={<ProtectedRoute element={SuaHoatDong} allowedRoles={[3]} user={user} />} />
              <Route path="/tao-bai-viet" element={<ProtectedRoute element={CreatePost} allowedRoles={[3]} user={user} />} />
              <Route path="/hdnk-diem-danh" element={<ProtectedRoute element={HDNKDiemDanh} allowedRoles={[4]} user={user} />} />
              <Route path="*" element={<NotFound />} />
              
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/notifications/:id" element={<NotificationDetail />} />
         
        </Routes>
        <Footer/>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
    </BrowserRouter>

  );
};

export default App;
