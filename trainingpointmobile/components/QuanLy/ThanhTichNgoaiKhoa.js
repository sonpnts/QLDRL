import React, { useState, useEffect } from 'react';
import { View, Button, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { Title } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Table, Row } from 'react-native-table-component';
import APIs, { endpoints, BASE_URL } from '../../configs/APIs';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import AsyncStorage from '@react-native-async-storage/async-storage';

const ThanhTichNgoaiKhoa = () => {
    const route = useRoute();
    const { sinhvien_id } = route.params;

    const [selectedHocKyNamHoc, setSelectedHocKyNamHoc] = useState('');
    const [hocKyNamHocs, setHocKyNamHocs] = useState([]);
    const [sv, setSv] = useState(null);
    const [hoatDongDiemDanh, setHoatDongDiemDanh] = useState([]);
    const [dieus, setDieus] = useState([]);
    const [diemRenLuyen, setDiemRenLuyen] = useState('');
    const [lops, setLops] = useState([]);

    const xepLoaiMap = {
        1: 'Xuất Sắc',
        2: 'Giỏi',
        3: 'Khá',
        4: 'Trung Bình',
        5: 'Yếu',
        6: 'Kém'
    };

    const fetchHocKyNamHocs = async () => {
        try {
            const response = await APIs.get(endpoints['hoc_ky_nam_hoc']);
            setHocKyNamHocs(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu học kỳ năm học');
        }
    };

    const fetchDieus = async () => {
        try {
            const response = await APIs.get(endpoints['dieu']);
            setDieus(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu Dieus.');
        }
    };

    const fetchLops = async () => {
        try {
            const resLop = await APIs.get(endpoints['lop']);
            setLops(resLop.data.results);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu Lớp.');
        }
    }

    const fetchSinhVien = async (sinhvien_id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.get(`${endpoints['sinh_vien']}${sinhvien_id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }); 
            setSv(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải thông tin sinh viên');
        }
    };

    useEffect(() => {
        fetchHocKyNamHocs();
        fetchDieus();
        fetchLops();
        fetchSinhVien(sinhvien_id);
    }, [sinhvien_id]);

    const handleViewReport = async (id) => {
        if (!selectedHocKyNamHoc || !sv) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ thông tin');
            return;
        }
        try {
            const resHoatDongDiemDanh = await APIs.get(`/thamgias/hoat-dong-diem-danh/${sv.id}/${id}`);
            setHoatDongDiemDanh(resHoatDongDiemDanh.data);

            try{
                const resDiemRenLuyen = await APIs.get(`/diemrenluyens/${sv.id}/${id}`);
                if (resDiemRenLuyen.status === 200)
                    setDiemRenLuyen(resDiemRenLuyen.data);
            } catch {
                Alert.alert("Sinh viên không có điểm ở kỳ này");
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu điểm rèn luyện');
        }
    };

    useEffect(() => {
        if (selectedHocKyNamHoc)
            handleViewReport(selectedHocKyNamHoc);
        setDiemRenLuyen('');
    },[selectedHocKyNamHoc])

    const findClassName = (classId) => {
        const foundClass = Array.isArray(lops) && lops.find(lop => lop.id === classId);
        return foundClass ? foundClass.ten_lop : "";
    };

    const filteredDieus = dieus.filter(dieu =>
        hoatDongDiemDanh.some(hoatDong => hoatDong.dieu == dieu.ma_dieu)
    );

    const handleExportReport = async (format) => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            const formatValue = format === 'csv' ? 1 : 2;

            let url = `${BASE_URL}bao-cao-chi-tiet/${sv.id}/${selectedHocKyNamHoc}/${formatValue}/`;

            const downloadedFile = await FileSystem.downloadAsync(
                url,
                FileSystem.documentDirectory + `bao_cao_${format}.` + format,
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
        <ScrollView style={styles.container}>
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

            <Text style={styles.title}>Thông tin sinh viên</Text>
            {sv ? (
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Họ và tên: <Text style={styles.boldText}>{sv.ho_ten}</Text></Text>
                    <Text style={styles.infoText}>Lớp: <Text style={styles.boldText}>{findClassName(sv.lop)}</Text></Text>
                    <Text style={styles.infoText}>MSSV: <Text style={styles.boldText}>{sv.mssv}</Text></Text>
                </View>
            ) : (
                <Text style={styles.infoText}>Không tìm thấy thông tin sinh viên</Text>
            )}
            <Button title="Xuất PDF" onPress={() => handleExportReport('pdf')} />

            {/* Thêm nút xuất file CSV */}
            <Button title="Xuất CSV" onPress={() => handleExportReport('csv')} />



            <View style={styles.tableContainer}>
                <Title style={styles.boldText}>DS hoạt động ngoại khóa đã tham gia:</Title>
                <View style={styles.tableContent}>
                    <Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
                        {filteredDieus.map((dieu, index) => {
                            const filteredHoatDongs = hoatDongDiemDanh.filter(hoatDong => hoatDong.dieu == dieu.ma_dieu);
                            const data = filteredHoatDongs.map(filteredHoatDong => [
                                `${filteredHoatDong.ten_HD_NgoaiKhoa}`,
                                `ĐRL: ${filteredHoatDong.diem_ren_luyen}`
                            ]);
                            return (
                                <View key={index} style={styles.tableRow}>
                                    <Row data={[`Điều ${dieu.ma_dieu}`, dieu.ten_dieu, `Điểm tối đa: ${dieu.diem_toi_da}`]} style={styles.tableHeadRow} textStyle={styles.tableHeadText}/>
                                    {data.map((rowData, index) => (
                                        <Row key={index} data={rowData} style={styles.tableDataRow} textStyle={styles.tableDataText}/>
                                    ))}
                                </View>
                            );
                        })}
                    </Table>
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Tổng điểm rèn luyện: <Text style={styles.summaryText}>{diemRenLuyen?.diem_tong || 0}</Text></Text>
                <Text style={styles.summaryTitle}>Xếp loại: <Text style={styles.summaryText}>{xepLoaiMap[diemRenLuyen?.xep_loai] || "Chưa có"}</Text></Text>
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    dropdownContainer: { borderColor: '#000', borderWidth: 1, borderRadius: 4, marginVertical: 20 },
    picker: { height: 190, width: '100%' },
    infoContainer: { margin: 10, paddingHorizontal: 16 },
    title: { fontWeight: 'bold', fontSize: 24 },
    infoText: { marginBottom: 8, fontSize: 16 },
    boldText: { fontWeight: 'bold' },
    tableContainer: { flex: 1, marginBottom: 20 },
    tableContent: { marginTop: 20 },
    tableRow: { borderWidth: 1, borderColor: '#c8e1ff', marginBottom: 10 },
    tableHeadRow: { backgroundColor: '#f1f8ff', borderBottomWidth: 1 },
    tableHeadText: { margin: 5, fontWeight: 'bold', textAlign: 'center' },
    tableDataRow: { padding: 5, borderTopWidth: 1 },
    tableDataText: { textAlign: 'center' },
    summaryContainer: { marginTop: 20, paddingHorizontal: 16 },
    summaryTitle: { fontWeight: 'bold' },
    summaryText: { fontWeight: 'bold', color: 'red', fontSize: 18 },
});

export default ThanhTichNgoaiKhoa;
