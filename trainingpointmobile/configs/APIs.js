import axios from "axios";

const BASE_URL = 'http://192.168.1.218:8000/';


export const endpoints = {
    // 'categories': '/categories/',
    // 'courses': '/courses/',
    // 'lessons': (courseId) => `/courses/${courseId}/lessons/`,
    // 'lesson-details': (lessonId) => `/lessons/${lessonId}/`,
    // 'comments': (lessonId) => `/lessons/${lessonId}/comments/`,
    // 'login': '/o/token/',
    // 'current-user': '/users/current-user/',
    // 'register': '/users/',
    // 'add-comment': (lessonId) => `/lessons/${lessonId}/comments/`
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
    'tac_gia': (bai_viet_id) => `/baiviets/${bai_viet_id}/tac_gia/`
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