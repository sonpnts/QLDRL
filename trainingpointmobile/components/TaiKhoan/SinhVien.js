import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, ToastAndroid, TouchableOpacity } from 'react-native';
import { TextInput as PaperTextInput, Title, Button as PaperButton, Button } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import APIs, { endpoints } from "../../configs/APIs";
import Styles from './Styles';
import { Picker } from '@react-native-picker/picker';


const SinhVienDangKy = ({ route, navigation }) => {
    const [sv, setSv] = useState({
        "email": "",
        "ho_ten": "",
        "ngay_sinh": "2000-01-01",
        "lop": "",
        "dia_chi": "",
        "gioi_tinh": "1",
    });
    const [loading, setLoading] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [gioiTinh, setGioiTinh] = useState(""); // Trường state để lưu giới tính được chọn
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);
    const [tenKhoa, setTenKhoa] = useState(""); // Thêm state để quản lý tên khoa



    const fetchKhoas = async () => {
        try {
            const response = await APIs.get(endpoints['khoa']);
            setKhoas(response.data);
            console.log(khoas);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLops = async (khoaId) => {
        try {
            const response = await APIs.get(`${endpoints['khoa']}${khoaId}/lops/`);
            setLops(response.data);
            console.log(lops);
        } catch (error) {
            console.error(error);
        }
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };


    const handleConfirm = (date) => {
        const selectedDate = date.toISOString().slice(0, 10); // Lấy ra phần yyyy-MM-dd
        change("ngay_sinh", selectedDate);
        hideDatePicker();
    };

    // Hàm chuyển đổi định dạng ngày từ yyyy-MM-dd sang dd/MM/yyyy
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const change = (field, value) => {
        setSv(current => {
            return { ...current, [field]: value }
        });
    };
    // lấy thống tin từ màn hình đăng ký bỏ sang
    React.useEffect(() => {
        if (route.params?.email) {
            change("email", route.params.email);
        }
    }, [route.params?.email]);

    const validateFields = () => {
        if (!sv.email || !sv.ho_ten || !sv.ngay_sinh || !sv.lop || !sv.dia_chi || !sv.gioi_tinh) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
            return false;
        }
        return true;
    };

    React.useEffect(() => {
        fetchKhoas();
    }, []);

    const capNhatThongTin = async () => {
        if (!validateFields()) return;
        setLoading(true);

        try {
            const response = await APIs.post(endpoints['sinh_vien'], sv, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                console.log(response.data);
                Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
                navigation.replace("DangNhap"); // Quay lại màn hình trước đó
            } else {
                Alert.alert('Thất bại', 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            ToastAndroid.show(error.message, ToastAndroid.LONG);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={Styles.container}>
                <Title style={[Styles.subject, Styles.align_item_center]}>
                    Cập nhật thông tin sinh viên
                </Title>
                <PaperTextInput
                    label="Email"
                    value={sv.email}
                    onChangeText={(value) => change("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                <PaperTextInput
                    label="Họ tên"
                    value={sv.ho_ten}
                    onChangeText={(value) => change("ho_ten", value)}
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />

                <TouchableOpacity onPress={showDatePicker}>
                    <DateTimePickerModal
                        isVisible = {isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                    <PaperTextInput // Sử dụng PaperTextInput thay vì PaperButton
                        label="Ngày sinh"
                        value={formatDate(sv.ngay_sinh)}
                        mode="outlined"
                        style={Styles.margin_bottom_20}
                        editable={false} // Không cho phép chỉnh sửa trực tiếp
                    />
                </TouchableOpacity>

                <View style={[Styles.margin_bottom_20, { borderColor: '#000', borderWidth: 1, borderRadius: 4 }]}>
                <Picker
                    selectedValue={tenKhoa}
                    onValueChange={(itemValue, itemIndex) => {
                        setTenKhoa(itemValue);
                        fetchLops(itemValue);
                    }}
                    mode="dropdown"
                >
                    <Picker.Item label="Chọn khoa" value="" />
                    {khoas.map(khoa => (
                        <Picker.Item key={khoa.id} label={khoa.ten_khoa} value={khoa.id} />
                    ))}
                </Picker>
            </View>


                <View style={[Styles.margin_bottom_20, { borderColor: '#000', borderWidth: 1, borderRadius: 4 }]}>
                    <Picker
                        selectedValue={sv.lop}
                        onValueChange={(itemValue) => change("lop", itemValue)}
                        mode="dropdown"
                    >
                        <Picker.Item label="Chọn lớp" value="" />
                        {lops.map(lop => (
                            <Picker.Item key={lop.id} label={lop.ten_lop} value={lop.id} />
                        ))}
                    </Picker>
                </View>
                <PaperTextInput
                    label="Địa chỉ"
                    value={sv.dia_chi}
                    onChangeText={(value) => change("dia_chi", value)}
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />
                {/* Dropdown menu cho giới tính */}
                <View style={[Styles.margin_bottom_20, { borderColor: '#000', borderWidth: 1, borderRadius: 4 }]}>
                    <Picker
                        selectedValue={gioiTinh}
                        onValueChange={(itemValue) => {
                            setGioiTinh(itemValue);
                            change("gioi_tinh", itemValue === "Nam" ? "1" : "2");
                        }}
                        mode="dropdown"
                    >
                        <Picker.Item label="Nam" value="Nam" />
                        <Picker.Item label="Nữ" value="Nữ" />
                    </Picker>
                </View>
                <PaperButton mode="contained" style={Styles.margin_bottom_20} onPress={capNhatThongTin}>Cập nhật</PaperButton>
            </View>
        </ScrollView>
    );
};

export default SinhVienDangKy;
