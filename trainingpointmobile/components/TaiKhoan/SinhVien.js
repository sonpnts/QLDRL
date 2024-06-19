import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, ScrollView, Alert, ActivityIndicator, ToastAndroid, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput as PaperTextInput, Title, Button as PaperButton, Button } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import APIs, { endpoints } from "../../configs/APIs";
import Styles from './Styles';
import { Picker } from '@react-native-picker/picker';
import { count } from 'firebase/firestore';


const SinhVienDangKy = ({ navigation }) => {
    const route = useRoute();

    const email_sv  = route.params.email;

    const [sv, setSv] = useState({
        "email": email_sv || "",
        "mssv": email_sv ? email_sv.slice(0, 10) : "",
        "ho_ten": "",
        "ngay_sinh": "2000-01-01",
        "lop": "",
        "dia_chi": "",
        "gioi_tinh": "1",
    });

    const [loading, setLoading] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [gioiTinh, setGioiTinh] = useState(""); 
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);


    const fetchKhoas = async () => {
        try {
            const response = await APIs.get(endpoints['khoa']);
            if (response.data && Array.isArray(response.data)) {
                setKhoas(response.data);
            } else {
                setKhoas([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu khoa');
        }
    };
    const fetchLops = async (khoaId) => {
        try {
            const response = await APIs.get(`${endpoints['khoa']}${khoaId}/lops/`);
            if (response.data && Array.isArray(response.data)) {
                setLops(response.data);
            } else {
                setLops([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu lớp');
        }
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const selectedDate = date.toISOString().slice(0, 10); 
        change("ngay_sinh", selectedDate);
        hideDatePicker();
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const change = (field, value) => {
        setSv(current => {
            return { ...current, [field]: value }
        });
    };

    useEffect(() => {
        console.log(email_sv);
        console.log(route.params.email);
        if (email_sv) {
            change("email", email_sv);
            change("mssv", email_sv.slice(0, 10));
        }
    }, [email_sv]);

    const validateFields = () => {
        if (!sv.email || !sv.ho_ten || !sv.ngay_sinh || !sv.lop || !sv.dia_chi || !sv.gioi_tinh) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
            return false;
        }
        return true;
    };

    useEffect(() => {
        fetchKhoas();
    }, []);

    useEffect(() => {
        if (selectedKhoa) {
            fetchLops(selectedKhoa);
        }
    }, [selectedKhoa]);

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
                // navigation.navigate('DangNhap');
                navigation.goBack(); 
            } else {
                Alert.alert('Thất bại', 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            Alert.alert('Lỗi', error.message);
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
            <View style={Styles.containerlogin}>
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
                    editable={false}
                />
                <PaperTextInput
                    label="Họ tên"
                    value={sv.ho_ten}
                    onChangeText={(value) => change("ho_ten", value)}
                    mode="outlined"
                    style={Styles.margin_bottom_20}
                />

                <TouchableOpacity onPress={showDatePicker}>
                    <View pointerEvents="none">
                        <PaperTextInput
                            label="Ngày sinh"
                            value={formatDate(sv.ngay_sinh)}
                            mode="outlined"
                            style={Styles.margin_bottom_20}
                            editable={false} 
                        />
                    </View>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />

            <View style={[Styles.margin_bottom_20, { borderColor: '#000', borderWidth: 1, borderRadius: 4 }]}>
                <Picker
                    selectedValue={selectedKhoa}
                    onValueChange={(itemValue) => setSelectedKhoa(itemValue)}
                    mode="dropdown"
                >
                <Picker.Item label="Chọn khoa" value="" />
                {khoas.map(khoa => (
                <Picker.Item key={khoa.id} label={khoa.ten_khoa} value={khoa.id} />
                ))}
                </Picker>
            </View>

            <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
                <Picker
                    selectedValue={selectedLop}
                    onValueChange={(itemValue) => {
                        setSelectedLop(itemValue);
                        change("lop", itemValue);
                    }}
                    mode="dropdown"
                    enabled={!!selectedKhoa}
                >
                <Picker.Item label="Chọn lớp" value="" />
                    {lops.map(lop => (
                        <Picker.Item key={lop.id} label={lop.ten_lop} value={lop.id} />
                    ))}
                </Picker>
            </View>

            {/* <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}> */}
                <KeyboardAvoidingView enabled>
                    <PaperTextInput
                        label="Địa chỉ"
                        value={sv.dia_chi}
                        onChangeText={(value) => change("dia_chi", value)}
                        mode="outlined"
                        style={Styles.margin_bottom_20}
                    />
                </KeyboardAvoidingView>

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
