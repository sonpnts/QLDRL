import React, { useEffect, useState } from 'react';
import { View, Button, ScrollView, ActivityIndicator, Text , Alert} from 'react-native';
import { Title } from 'react-native-paper';
import APIs, { endpoints, authAPI } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Table, Row, Rows } from 'react-native-table-component';
import { StyleSheet } from "react-native";

const HDNKDiemDanh = () => {
    const [loading, setLoading] = useState(true);
    const [hoatDongDiemDanh, setHoatDongDiemDanh] = useState([]);
    const [user, setUser] = useState(null);
    const [sv, setSv] = useState(null);
    const [lops, setLops] = useState([]);
    const [dieus, setDieus] = useState([]);
    const [selectedHocKyNamHoc, setSelectedHocKyNamHoc] = useState('');
    const [hocKyNamHocs, setHocKyNamHocs] = useState([]);
    const [diemRenLuyen, setDiemRenLuyen] = useState('');

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

    const fetchDieus = async () => {
        try {
            const response = await APIs.get(endpoints['dieu']);
            setDieus(response.data);
            // console.log(dieus);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu Dieus.');
        }
    };

    useEffect(() => {
        fetchHocKyNamHocs();
        fetchDieus();
    
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("access-token");
                const reslop = await APIs.get(endpoints['lop']);
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

        fetchUserData();
    }, []);

    const handleViewReport = async (id) => {
        if (!id) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ thông tin.');
            return;
        }
        try {
            const reshoatdongdiemdanh = await APIs.get(`/thamgias/hoat-dong-diem-danh/${sv.id}/${id}`);
            setHoatDongDiemDanh(reshoatdongdiemdanh.data);
            try{
                const restongDRL = await APIs.get(`/diemrenluyens/${sv.id}/${id}`);
                if (restongDRL.status === 200)
                    setDiemRenLuyen(restongDRL.data);
            }catch {
                Alert.alert("Sinh viên không có điểm ở kỳ này");
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu điểm rèn luyện.');
        }
    };

    useEffect(() => {
        if (selectedHocKyNamHoc)
            handleViewReport(selectedHocKyNamHoc);
        setDiemRenLuyen('');
    },[selectedHocKyNamHoc]);

    const findClassName = (classId) => {
        const foundClass = Array.isArray(lops) && lops.find(lop => lop.id === classId);
        return foundClass ? foundClass.ten_lop : "";
    };


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const filteredDieus = dieus.filter(dieu =>
        hoatDongDiemDanh.some(hoatDong => hoatDong.dieu == dieu.ma_dieu)
    );

    return (
        <ScrollView>
            <View style={{ padding: 20 }}>
            <Title style={styles.title}>Thông tin sinh viên</Title>
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

                <ScrollView>
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
                        <Row 
                            data={[`Điều ${dieu.ma_dieu}`, dieu.ten_dieu, `Điểm tối đa: ${dieu.diem_toi_da}`]} 
                            style={styles.tableHeadRow} 
                            textStyle={styles.tableHeadText}
                        />
                        {data.map((rowData, rowIndex) => (
                            <Row 
                                key={rowIndex} 
                                data={rowData} 
                                style={styles.tableDataRow} 
                                textStyle={styles.tableDataText}
                            />
                        ))}
                    </View>
                );
            })}
        </Table>
    </View>
</View>

                    <View style={styles.summaryContainer}>
                        <Title style={styles.summaryTitle}>Tổng điểm rèn luyện: <Text style={styles.summaryText}>{diemRenLuyen?.diem_tong || 0}</Text></Title>
                        <Title style={styles.summaryTitle}>Xếp loại: <Text style={styles.summaryText}>{xepLoaiMap[diemRenLuyen?.xep_loai] || "Chưa có"}</Text></Title>
                    </View>

                </ScrollView>
                
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

export default HDNKDiemDanh;
