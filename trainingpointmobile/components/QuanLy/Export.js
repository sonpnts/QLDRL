import React, { useState, useEffect } from 'react';
import { View, Button, Alert, ScrollView, Text, Platform } from 'react-native';
import APIs, { endpoints, BASE_URL} from "../../configs/APIs";
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ExportBaoCao() {
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [selectedHocKyNamHoc, setSelectedHocKyNamHoc] = useState('');
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);
    const [hocKyNamHocs, setHocKyNamHocs] = useState([]);
    const [reportType, setReportType] = useState('khoa');
    const [diemrenluyens, setDiemrenluyens] = useState([]);

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

    const fetchHocKyNamHocs = async () => {
        try {
            const response = await APIs.get(endpoints['hocky']);
            
            if (response.data && Array.isArray(response.data)) {
                setHocKyNamHocs(response.data);
                // console.log(hocKyNamHocs)
            } else {
                setHocKyNamHocs([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            setHocKyNamHocs([]); // Đảm bảo hocKyNamHocs là một mảng ngay cả khi có lỗi
            Alert.alert('Lỗi', 'Không thể tải dữ liệu học kỳ năm học');
        }
    };

    useEffect(() => {
        fetchKhoas();
        fetchHocKyNamHocs();
    }, []);

    useEffect(() => {
        if (selectedKhoa) {
            fetchLops(selectedKhoa);
        }
    }, [selectedKhoa]);

    const handleViewReport = async () => {
        const token = await AsyncStorage.getItem('access-token');
        if (!selectedHocKyNamHoc || !selectedKhoa || (reportType === 'lop' && !selectedLop)) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ thông tin.');
            return;
        }

        try {
            let response;
            if (reportType === 'khoa') {
                response = await APIs.get(`/thong-ke-khoa/${selectedKhoa}/${selectedHocKyNamHoc}/`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                
                });
            } else if (reportType === 'lop') {
                response = await APIs.get(`/thong-ke-lop/${selectedLop}/${selectedHocKyNamHoc}/`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            if (response.data && Array.isArray(response.data)) {
                setDiemrenluyens(response.data);
            } else {
                setDiemrenluyens([]);
                Alert.alert('Lỗi', 'Dữ liệu trả về không hợp lệ');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu điểm rèn luyện.');
        }
    };


    const exportReport = async (format) => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            const formatValue = format === 'csv' ? 1 : 2;
            let url;
            if (reportType === 'khoa') {
                if (!selectedKhoa || !selectedHocKyNamHoc) {
                    Alert.alert('Lỗi', 'Vui lòng chọn khoa và học kỳ năm học.');
                    return;
                }
                url = `${BASE_URL}bao-cao-khoa/${selectedKhoa}/${selectedHocKyNamHoc}/${formatValue}/`;
            } else {
                if (!selectedLop || !selectedHocKyNamHoc) {
                    Alert.alert('Lỗi', 'Vui lòng chọn lớp và học kỳ năm học.');
                    return;
                }
                url = `${BASE_URL}bao-cao-lop/${selectedLop}/${selectedHocKyNamHoc}/${formatValue}/`;
            }

            const downloadedFile = await FileSystem.downloadAsync(
                url,
                FileSystem.documentDirectory + 'bao_cao.' + format,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                        
                    },
                }
            );
            if (downloadedFile.status === 200) {
                await Sharing.shareAsync(downloadedFile.uri);
                Alert.alert('Tệp đã được lưu', `Đã lưu báo cáo dưới dạng ${format}`);
                
            } else {
                Alert.alert('Lỗi', 'Không thể tải xuống báo cáo');
            }
        } catch (error) {
            Alert.alert('Lỗi', error.message);
        }
    };



    return (
        <ScrollView>
            <View>
                <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
                    <Picker
                        selectedValue={selectedHocKyNamHoc}
                        onValueChange={(itemValue) => setSelectedHocKyNamHoc(itemValue)}
                        mode="dropdown"
                    >
                        <Picker.Item label="Chọn học kỳ năm học" value="" />
                        {hocKyNamHocs.map(hocKyNamHoc => (
                            <Picker.Item key={hocKyNamHoc.id} label={`${hocKyNamHoc.hoc_ky} - ${hocKyNamHoc.nam_hoc}`} value={hocKyNamHoc.id} />
                        ))}
                    </Picker>
                </View>

                <View style={{ borderColor: '#000', borderWidth: 1, borderRadius: 4, marginBottom: 20 }}>
                    <Picker
                        selectedValue={reportType}
                        onValueChange={(itemValue) => setReportType(itemValue)}
                        mode="dropdown"
                    >
                        <Picker.Item label="Chọn loại báo cáo" value="" />
                        <Picker.Item label="Báo cáo theo khoa" value="khoa" />
                        <Picker.Item label="Báo cáo theo lớp" value="lop" />
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
                    {diemrenluyens && diemrenluyens.length > 0 && Array.isArray(diemrenluyens) &&
                        diemrenluyens.map(drl => (
                            <View key={drl.id} style={{ borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 10 }}>
                                <Text>Sinh viên: {drl.sinh_vien}</Text>
                                <Text>Điểm tổng: {drl.diem_tong}</Text>
                                <Text>Xếp loại: {drl.xep_loai}</Text>
                            </View>
                        ))}
                    {diemrenluyens && diemrenluyens.length === 0 && (
                        <Text>Không có dữ liệu</Text>
                    )}
                </ScrollView>


                <Button title="Xuất CSV" onPress={() => exportReport('csv')} />
                <Button title="Xuất PDF" onPress={() => exportReport('pdf')} />


            </View>
        </ScrollView>
    );
}