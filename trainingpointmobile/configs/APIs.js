import axios from "axios";

export const BASE_URL = 'http://192.168.1.218:8000/';


// const BASE_URL = 'https://sonpnts.pythonanywhere.com/'

export const endpoints = {

    'dang_ky': '/taikhoans/',
    'dang_nhap': '/o/token/',
    'current_taikhoan': '/taikhoans/current-taikhoan/',
    'tai_khoan_is_valid': '/taikhoans/is_valid/',
    'sinh_vien_is_valid': '/sinhviens/is_valid/',
    'lop': '/lops/',
    'sinh_vien': '/sinhviens/',
    'send_mail': '/send_mail/',
    'khoa': '/khoas/',
    'bai_viet': '/baiviets/',
    'bao-cao': '/bao-cao/',
    'baiviet_tag': (bai_viet_id) => `/baiviets/${bai_viet_id}/tags/`,
    'tac_gia': (bai_viet_id) => `/baiviets/${bai_viet_id}/tac_gia/`,
    'baiviet_like': (bai_viet_id) => `/baiviets/${bai_viet_id}/like/`,
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