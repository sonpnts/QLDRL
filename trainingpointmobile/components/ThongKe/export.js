import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Platform, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import APIs, { endpoints, BASE_URL } from "../../configs/APIs";
import { Picker } from '@react-native-picker/picker';

export default function ExportBaoCao() {
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);
    const [reportType, setReportType] = useState('khoa'); // 'khoa' or 'lop'
    
    const fetchKhoas = async () => {
        try {
            const response = await APIs.get(endpoints['khoa']);
            setKhoas(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLops = async (khoaId) => {
        try {
            const response = await APIs.get(`${endpoints['khoa']}${khoaId}/lops/`);
            setLops(response.data);
        } catch (error) {
            console.error(error);
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

    const exportReport = async (format) => {
        try {
            const formatValue = format === 'csv' ? 1 : 2;
            let url;
            if (reportType === 'khoa') {
                if (!selectedKhoa) {
                    Alert.alert('Lỗi', 'Vui lòng chọn khoa.');
                    return;
                }
                url = `${BASE_URL}bao-cao-khoa/${selectedKhoa}/${1}/${formatValue}/`;
            } else {
                if (!selectedLop) {
                    Alert.alert('Lỗi', 'Vui lòng chọn lớp.');
                    return;
                }
                url = `${BASE_URL}bao-cao-lop/${selectedLop}/${1}/${formatValue}/`;
            }
            
            const downloadedFile = await FileSystem.downloadAsync(
                url,
                FileSystem.documentDirectory + 'bao_cao.' + format,
            );
            if (downloadedFile.status === 200) {
                if (Platform.OS === 'ios') {
                    await Sharing.shareAsync(downloadedFile.uri);
                } else {
                    Alert.alert('Tệp đã được lưu', `Đã lưu báo cáo dưới dạng ${format}`);
                }
            } else {
                Alert.alert('Lỗi', 'Không thể tải xuống báo cáo');
            }
        } catch (error) {
            Alert.alert('Lỗi', error.message);
        }
    };

    return (
        <View>
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

            <Button title="Xuất CSV" onPress={() => exportReport('csv')} />
            <Button title="Xuất PDF" onPress={() => exportReport('pdf')} />
        </View>
    );
}
