import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';
import moment from 'moment';

const SuaHoatDong = ({ route, navigation }) => {
  const { hoatDongId } = route.params;
  const [hoatDong, setHoatDong] = useState(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    fetchHoatDongDetail();
  }, []);

  const fetchHoatDongDetail = async () => {
    try {
      const response = await APIs.get(`${endpoints['hoat_dong']}/${hoatDongId}`);
      setHoatDong(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết hoạt động:', error);
      Alert.alert('Error', 'Lỗi khi lấy chi tiết hoạt động');
    }
  };

  const handleChangeTenHDNgoaiKhoa = (text) => {
    setHoatDong((prevState) => ({
      ...prevState,
      ten_HD_NgoaiKhoa: text,
    }));
    setIsModified(true);
  };

  const handleChangeNgayToChuc = (date) => {
    setHoatDong((prevState) => ({
      ...prevState,
      ngay_to_chuc: date.toISOString(),
    }));
    setIsModified(true);
  };

  const handleSaveChanges = async () => {
    const token = await AsyncStorage.getItem('access-token');
    try {
      const response = await APIs.put(`${endpoints['hoat_dong']}/${hoatDongId}`, hoatDong, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Thông báo', 'Cập nhật hoạt động thành công');
        setIsModified(false);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật hoạt động:', error);
      Alert.alert('Error', 'Lỗi khi cập nhật hoạt động');
    }
  };

  const formatDate = (date) => {
    return moment(date).format('HH:mm - DD/MM/YYYY');
  };

  if (!hoatDong) {
    return (
      <View style={Styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={Styles.container}>
      <View style={Styles.container}>
        <Text style={Styles.label}>Tên hoạt động ngoại khóa:</Text>
        <TextInput
          style={Styles.input}
          value={hoatDong.ten_HD_NgoaiKhoa}
          onChangeText={handleChangeTenHDNgoaiKhoa}
        />

        <Text style={Styles.label}>Ngày tổ chức ngoại khóa:</Text>
        <PaperTextInput
          label="Ngày tổ chức"
          value={hoatDong.ngay_to_chuc ? formatDate(new Date(hoatDong.ngay_to_chuc)) : ''}
          mode="outlined"
          editable={false}
          onPress={() => {
            // Show date picker or any other action
          }}
          style={{ marginBottom: 20 }}
        />

        <Text style={Styles.label}>Thông tin:</Text>
        <TextInput
          style={[Styles.input, Styles.multilineInput]}
          value={hoatDong.thong_tin}
          onChangeText={(text) => setHoatDong((prevState) => ({ ...prevState, thong_tin: text }))}
          multiline={true}
          numberOfLines={4}
        />

        <Text style={Styles.label}>Điểm rèn luyện:</Text>
        <TextInput
          style={Styles.input}
          value={hoatDong.diem_ren_luyen}
          onChangeText={(text) => setHoatDong((prevState) => ({ ...prevState, diem_ren_luyen: text }))}
        />

        {/* Other fields like Dropdown for 'Dieu' and 'Hoc ky' */}

        {isModified && (
          <TouchableOpacity style={Styles.saveButton} onPress={handleSaveChanges}>
            <Text style={Styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default SuaHoatDong;
