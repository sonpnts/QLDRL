import React, { useState, useEffect } from 'react';
import { View, Button, Alert, ActivityIndicator, TextInput, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker'; 
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';



const DiemDanh = ({ navigation }) => {
    const [file, setFile] = useState(null);
    const [hocKy, setHocKy] = useState(null);
    const [hoatdong, setHoatDong] = useState([]);
    const [hocKyList, setHocKyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hockyselected, setHockyselected] = useState(null);
    const [hoatdongselected, setHoatDongSelected] = useState(null);


    const fetchHoatDong = async (hocKyId) => {
        const token = await AsyncStorage.getItem("access-token");

        try {
            const response = await APIs.get(`${endpoints['hoat_dong_diem_danh']}?hoc_ky=${hocKyId}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // console.log(response.data);
            const sortedHoatDong = response.data.sort((a, b) => new Date(b.ngay_to_chuc) - new Date(a.ngay_to_chuc));
            setHoatDong(sortedHoatDong);
            setLoading(false);
        } catch (err) {
            Alert.alert('Error fetching hoat dong data: ' + err.message);
            setLoading(false);
        }
    };
    
    React.useEffect(() => {
        const fetchHocKy = async () => {
            try {
                const response = await APIs.get(endpoints['hocky']);
                setHocKyList(response.data);
                setLoading(false);
            } catch (err) {
                Alert.alert('Error fetching hoc ky data: ' + err.message);
                setLoading(false);
            }
        };
    
        fetchHocKy();
    }, []);
    
    React.useEffect(() => {
        if (hockyselected) {
            fetchHoatDong(hockyselected);
        }
    }, [hockyselected]);


    const removeFile = () => {
        setFile(null);
    };


    const selectFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
            });
           
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedFile = result.assets[0];
                setFile({
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.type,
                });
            
            }
        } catch (err) {
            Alert.alert('Error picking file:', err.message);
        }
    };

    const uploadFile = async () => {
        
        if (!file) {
            Alert.alert('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type, // Bạn có thể thay đổi type theo loại file
            name: file.name,
        });

        try {
            // console.log(hoatdongselected);
            const response = await APIs.post(endpoints['diemdanh'](hoatdongselected), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                Alert.alert('Tải file điểm danh lên hệ thống thành công');
                removeFile();
            } else {
                Alert.alert('Failed to upload file');
            }
        } catch (err) {
            Alert.alert('Error: ' + err.message);
        }
    };

    return (
        <View style={Styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <View style={Styles.pickerContainer}>
                        <Picker
                            selectedValue={hockyselected}
                            onValueChange={(itemValue) => setHockyselected(itemValue)}
                            mode="dropdown"
                        >
                            <Picker.Item label="Chọn học kỳ" value="" />
                            {hocKyList.map((hocKyItem, index) => (
                                <Picker.Item key={index} label={`Học kỳ ${hocKyItem.hoc_ky} - ${hocKyItem.nam_hoc}`} value={hocKyItem.id} />
                            ))}
                        </Picker>
                    </View>

                    <View style={Styles.pickerContainer}>
                        <Picker
                            selectedValue={hoatdongselected}
                            onValueChange={(itemValue) => setHoatDongSelected(itemValue)}
                            mode="dropdown"
                        >
                            {hoatdong.map(activity => (
                                <Picker.Item key={activity.id} label={activity.ten_HD_NgoaiKhoa} value={activity.id} />
                            ))}
                        </Picker>
                    </View>

                    {file && (
                        <View style={Styles.fileContainer}>
                            <Text style={Styles.fileName}>File đã chọn: {file.name}</Text>
                            <TouchableOpacity style={Styles.deleteButton} onPress={removeFile}>
                                <Icon name="close" size={25} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {!file && (
                        <TouchableOpacity style={Styles.button} onPress={selectFile}>
                            <Text style={Styles.buttonText}>Select File</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={Styles.button} onPress={uploadFile}>
                        <Text style={Styles.buttonText}>Upload File</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default DiemDanh;
