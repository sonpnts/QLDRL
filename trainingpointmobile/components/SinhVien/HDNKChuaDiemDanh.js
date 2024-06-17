import React, { useEffect, useState, useCallback } from 'react';
import { View, Button, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import APIs, { endpoints, authAPI } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet } from "react-native";
import { useFocusEffect } from '@react-navigation/native';


const HDNKChuaDiemDanh = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [hoatDongChuaDiemDanh, setHoatDongChuaDiemDanh] = useState([]);
    const [user, setUser] = useState(null);
    const [sv, setSv] = useState(null);
    const [lops, setLops] = useState([]);
    const [selectedHocKyNamHoc, setSelectedHocKyNamHoc] = useState('');
    const [hocKyNamHocs, setHocKyNamHocs] = useState([]);
    const [hoatDongs, setHoatDongs] = useState([]);

    const trangThaiMap = {
        0: 'Đăng Ký',
        1: 'Điểm Danh',
        2: 'Báo Thiếu',
        3: 'Báo Thiếu Bị Từ Chối',
    };

    const fetchHocKyNamHocs = async () => {
        try {
            const response = await APIs.get(endpoints['hoc_ky_nam_hoc']);
            if (response.data && Array.isArray(response.data)) {
                setHocKyNamHocs(response.data);
            } else {
                setHocKyNamHocs([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            setHocKyNamHocs([]);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu học kỳ năm học');
        }
    };

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const reslop = await APIs.get(endpoints['lop']);
            const reshd = await APIs.get(endpoints['hoatdong']);
            setHoatDongs(reshd.data);
            // console.log(reshd.data);
            setLops(reslop.data.results);
            
            const ressv = await APIs.get(endpoints['current_sinhvien'], {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
           
            setSv(ressv.data);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            setLoading(false);
        }
    };

    const handleViewReport = async (id) => {
        if (!id) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ thông tin.');
            return;
        }
        try {
            const reshoatdongchuadiemdanh = await APIs.get(`/thamgias/hoat-dong-chua-diem-danh/${sv.id}/${id}`);
            setHoatDongChuaDiemDanh(reshoatdongchuadiemdanh.data);
            
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu điểm rèn luyện.');
        }
    };

    useEffect(() => {
        fetchHocKyNamHocs();
        fetchUserData();
    }, []);

    useEffect(() => {
        if (selectedHocKyNamHoc)
            handleViewReport(selectedHocKyNamHoc);
    }, [selectedHocKyNamHoc]);

    useFocusEffect(
        useCallback(() => {
            fetchHocKyNamHocs();
            fetchUserData();
            if (selectedHocKyNamHoc)
                handleViewReport(selectedHocKyNamHoc);
        }, [selectedHocKyNamHoc])
    );

    const findClassName = (classId) => {
        const foundClass = Array.isArray(lops) && lops.find(lop => lop.id === classId);
        return foundClass ? foundClass.ten_lop : "";
    };

    const findHoatDongName = (hoatdongId) => {
        const foundHoatDong = Array.isArray(hoatDongs) && hoatDongs.find(hd => hd.id === hoatdongId);
        
        return foundHoatDong ? foundHoatDong.ten_HD_NgoaiKhoa : "";
    };

    const findHoatDongDRL = (hoatdongId) => {
        const foundHoatDong = Array.isArray(hoatDongs) && hoatDongs.find(hd => hd.id === hoatdongId);
        return foundHoatDong ? foundHoatDong.diem_ren_luyen : "";
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={styles.title}>Thông tin sinh viên</Text>
            {sv ? (
                <>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Họ và tên: <Text style={styles.boldText}>{sv.ho_ten}</Text></Text>
                        <Text style={styles.infoText}>Lớp: <Text style={styles.boldText}>{findClassName(sv.lop)}</Text></Text>
                        <Text style={styles.infoText}>MSSV: <Text style={styles.boldText}>{sv.mssv}</Text></Text>
                    </View>
                </>
            ) : (
                <Text>Không tìm thấy thông tin sinh viên</Text>
            )}

            <View style={styles.dropdownContainer}>
                <Picker
                    selectedValue={selectedHocKyNamHoc}
                    onValueChange={(itemValue) => setSelectedHocKyNamHoc(itemValue)}
                    mode="dropdown"
                    style={styles.picker}
                >
                    <Picker.Item label="Chọn học kỳ năm học" value="" />
                    {hocKyNamHocs.map(hocKyNamHoc => (
                        <Picker.Item key={hocKyNamHoc.id} label={`${hocKyNamHoc.hoc_ky} - ${hocKyNamHoc.nam_hoc}`} value={hocKyNamHoc.id} />
                    ))}
                </Picker>
            </View>

            {/* <Button title="Xem" onPress={handleViewReport} /> */}

            
                <View>
                    <Text style={styles.title}>Danh sách hoạt động ngoại khóa chưa điểm danh</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.hoatDongNameColumn]}>Tên hoạt động</Text>
                        <Text style={[styles.tableHeaderText, styles.diemRenLuyenColumn]}>Điểm rèn luyện</Text>
                        <Text style={[styles.tableHeaderText, styles.trangThaiColumn]}>Trạng thái</Text>
                    </View>
                    <ScrollView>
                        {hoatDongChuaDiemDanh.map((hd) => (
                        <TouchableOpacity key={hd.id} 
                            style={styles.hoatDongContainer}
                            onPress={() => navigation.navigate('MinhChung', { thamgia_id: hd.id })}
                        >
                            <View key={hd.id} style={styles.tableRow}>
                                <Text style={styles.hoatDongNameColumn}>{findHoatDongName(hd.hd_ngoaikhoa)}</Text>
                                <Text style={styles.diemRenLuyenColumn}>{findHoatDongDRL(hd.hd_ngoaikhoa)}</Text>
                                <Text style={styles.trangThaiColumn}>{trangThaiMap[hd.trang_thai]}</Text>
                            </View>
                        </TouchableOpacity>
                        ))}    
                    </ScrollView>
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoContainer: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 5,
    },
    boldText: {
        fontWeight: 'bold',
    },
    dropdownContainer: {
        marginBottom: 20,
    },
    picker: {
        height: 190,
        width: '100%',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableHeaderText: {
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    hoatDongNameColumn: {
        flex: 3,
    },
    diemRenLuyenColumn: {
        flex: 1,
        textAlign: 'center',
    },
    trangThaiColumn: {
        flex: 1,
        textAlign: 'center',
    },
});


export default HDNKChuaDiemDanh;
