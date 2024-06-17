import React, { useState, useEffect } from 'react';
import { View, Button, ScrollView, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Searchbar, Title } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import APIs, { endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DanhSachSinhVien = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);
    const [reportType, setReportType] = useState('khoa');
    const [sv, setSv] = useState([]);

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

    useEffect(() => {
        fetchKhoas();
    }, []);

    useEffect(() => {
        if (selectedKhoa) {
            fetchLops(selectedKhoa);
        }
    }, [selectedKhoa]);

    const handleSearch = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            let ressv=null;
            setSv(null);
            if (!isNaN(searchQuery)) {
                ressv = await APIs.get(endpoints['sinh_vien'], {
                    params: {
                        mssv: searchQuery,
                    }, 
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (reportType === 'khoa') {
                    ressv = await APIs.get(`/khoas/${selectedKhoa}/sinhviens/?mssv=${searchQuery}`);
                } else if (reportType === 'lop') {
                    ressv = await APIs.get(`/lops/${selectedLop}/sinhviens/?mssv=${searchQuery}`);
                }
            } else {
                ressv = await APIs.get(endpoints['sinh_vien'], {
                    params: {
                        ho_ten: searchQuery,
                    }, 
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (reportType === 'khoa') {
                    ressv = await APIs.get(`/khoas/${selectedKhoa}/sinhviens/?ho_ten=${searchQuery}`);
                } else if (reportType === 'lop') {
                    ressv = await APIs.get(`/lops/${selectedLop}/sinhviens/?ho_ten=${searchQuery}`);
                }
            }

            console.log(ressv.data);

            if (ressv.data.length > 0) {
                setSv(ressv.data);
            } else {
                setSv(null);
                Alert.alert('Không tìm thấy sinh viên');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm sinh viên');
        }
    };

    const handleViewReport = async () => {
        if (!selectedKhoa || (reportType === 'lop' && !selectedLop)) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ thông tin.');
            return;
        }
        try {
            let response=null;
            setSv(null);
            if (searchQuery===''){
                if (reportType === 'khoa') {
                    response = await APIs.get(`/khoas/${selectedKhoa}/sinhviens/`);
                }
                else if (reportType === 'lop') {
                    response = await APIs.get(`/lops/${selectedLop}/sinhviens/`);
                } 

                if (response.data && Array.isArray(response.data)) {
                    setSv(response.data);
                } else {
                    setSv([]);
                    Alert.alert('Lỗi', 'Dữ liệu trả về không hợp lệ');
                }
            } else {
                handleSearch();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải danh sách sinh viên');
        }
    };

    return (
        <ScrollView>
            <View>
                <Searchbar
                    placeholder="Nhập họ tên sinh viên hoặc mssv..."
                    onChangeText={(query) => setSearchQuery(query)}
                    value={searchQuery}
                    onSubmitEditing={handleSearch}
                />
            </View>
            <View>
                <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
                    <Picker
                        selectedValue={reportType}
                        onValueChange={(itemValue) => setReportType(itemValue)}
                        mode="dropdown"
                    >
                        <Picker.Item label="Chọn loại xem" value="" />
                        <Picker.Item label="Theo khoa" value="khoa" />
                        <Picker.Item label="Theo lớp" value="lop" />
                    </Picker>
                </View>

                <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
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

                {reportType === 'lop' && (
                    <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
                        <Picker
                            selectedValue={selectedLop}
                            onValueChange={(itemValue) => setSelectedLop(itemValue)}
                            mode="dropdown"
                            enabled={!!selectedKhoa}
                        >
                            <Picker.Item label="Chọn lớp" value="" />
                            {lops.map(lop => (
                                <Picker.Item key={lop.id} label={lop.ten_lop} value={lop.id} />
                            ))}
                        </Picker>
                    </View>
                )}
                <Button title="Xem" onPress={handleViewReport} />
                <ScrollView>
                {sv === null ? (
                    <ActivityIndicator />
                ) : (
                    sv.map((s) => (
                        <View key={s.id} style={styles.studentContainer}>
                            <View style={styles.studentInfo}>
                                <Text style={styles.infoText}>Họ tên: {s.ho_ten}</Text>
                                <Text style={styles.infoText}>MSSV: {s.mssv}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.detailButton}
                                onPress={() => navigation.navigate('ThanhTichNgoaiKhoa', { sinhvien_id: s.id })}
                            >
                                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
                </ScrollView>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    studentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    studentInfo: {
        flex: 1,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 4,
    },
    detailButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DanhSachSinhVien;
