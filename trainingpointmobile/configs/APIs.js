import axios from "axios";

export const BASE_URL = 'http://192.168.1.218:8000/';

export const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

// const BASE_URL = 'https://sonpnts.pythonanywhere.com/'

export const endpoints = {

    'dang_ky': '/taikhoans/',
    'dang_nhap': '/o/token/',
    'hocky': '/hockinamhocs/',
    'diemdanh': '/upload-diem-danh/',
    'current_taikhoan': '/taikhoans/current-taikhoan/',
    'tai_khoan_is_valid': '/taikhoans/is_valid/',
    'sinh_vien_is_valid': '/sinhviens/is_valid/',
    'lop': '/lops/',
    'sinh_vien': '/sinhviens/',
    'current_sinhvien': '/sinhviens/current-sinhvien/',
    'send_mail': '/send_mail/',
    'khoa': '/khoas/',
    'bai_viet': '/baiviets/',
    'bao-cao': '/bao-cao/',
    'binh_luan': (bai_viet_id) => `/baiviets/${bai_viet_id}/comment/`,
    'owner_binh_luan':(com_id) => `/comments/${com_id}/tac_gia/`,
    'lay_binh_luan': (bai_viet_id) => `/baiviets/${bai_viet_id}/comments/`,
    'baiviet_tag': (bai_viet_id) => `/baiviets/${bai_viet_id}/tags/`,
    'tac_gia': (bai_viet_id) => `/baiviets/${bai_viet_id}/tac_gia/`,
    'baiviet_like': (bai_viet_id) => `/baiviets/${bai_viet_id}/like/`,
    'baiviet_liked': (bai_viet_id) => `/baiviets/${bai_viet_id}/liked/`,
    'dang_ky_hoat_dong':(hoat_dong_id) => `/thamgias/${hoat_dong_id}/dang-ky-hoat-dong/`,
    'kiem_tra_dang_ky':(hoat_dong_id) => `/thamgias/${hoat_dong_id}/kiem-tra-dang-ky/`,
}

export const authAPI = (accessToken) => axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${accessToken ? accessToken : AsyncStorage.getItem("acess-token")}`
    }
})

export default axios.create({
    baseURL: BASE_URL
});