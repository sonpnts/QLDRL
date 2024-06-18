import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import APIs, { endpoints, formatDate } from '../../configs/APIs';
import Styles from './Styles';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';



const SuaHoatDong = ({ route, navigation }) => {
  const hoatDongId  = route.params.activityId;
  const [hoatDong, setHoatDong] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [dieus, setDieus] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);



  useEffect(() => {
    fetchHoatDongDetail();
    fetchDieus();
    fetchHocKy();
  }, []);

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

  const fetchDieus = async () => {
    try {
      const response = await APIs.get(endpoints['dieu']);
      setDieus(response.data);
    } catch (error) {
      console.error('Error fetching dieus:', error);
    }
  };

  const fetchHoatDongDetail = async () => {
    try {
      console.log('Hoat dong id:', hoatDongId);
      const response = await APIs.get(endpoints['hoat_dong'](hoatDongId));
      setHoatDong(response.data);
      // console.log('Hoat dong:', response.data);

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
    hideDatePicker();
    setIsModified(true);
  };

  const handleSaveChanges = async () => {
    const token = await AsyncStorage.getItem('access-token');
    try {
      const response = await APIs.put(endpoints['hoat_dong'](hoatDongId), hoatDong, {
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

 


  return (
    <View style={Styles.container}>
    <ScrollView  >
        <View  contentContainerStyle={Styles.container}>
        <Text style={Styles.label}>Tên hoạt động ngoại khóa:</Text>
        <TextInput
          style={Styles.input}
          value={hoatDong.ten_HD_NgoaiKhoa}
          onChangeText={handleChangeTenHDNgoaiKhoa}
        />

      <Text style={Styles.label}>Ngày tổ chức ngoại khóa:</Text>
        <TouchableOpacity onPress={showDatePicker}>
          <View pointerEvents="none" >
            <PaperTextInput
              label="Ngày tổ chức"
              value={hoatDong.ngay_to_chuc ? formatDate(new Date(hoatDong.ngay_to_chuc)) : ''}
              mode="outlined"
              editable={false}
              style={{marginBottom: 20}}
            />
          </View>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={new Date()}
          onConfirm={handleChangeNgayToChuc}
          onCancel={hideDatePicker}
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
          value={hoatDong.diem_ren_luyen.toString()}
          keyboardType="numeric"
          onChangeText={(text) => setHoatDong((prevState) => ({ ...prevState, diem_ren_luyen: text }))}
        />

        <Text style={Styles.label}>Chọn học kỳ:</Text>
        <Picker
          selectedValue={hoatDong.hk_nh}
          onValueChange={(itemValue) => {
            setHoatDong((prevState) => ({ ...prevState, hk_nh: itemValue }));
            setIsModified(true);
          }}
          mode="dropdown"
        >
          <Picker.Item label="Chọn học kỳ" value="" />
          {hocKyList.map((hocKyItem) => (
            <Picker.Item
              key={hocKyItem.id}
              label={`Học kỳ ${hocKyItem.hoc_ky} - ${hocKyItem.nam_hoc}`}
              value={hocKyItem.id}
            />
          ))}
        </Picker>


        <Text style={Styles.label}>Chọn điều:</Text>
        <Picker
          selectedValue={hoatDong.dieu}
          onValueChange={(itemValue) => {
            setHoatDong((prevState) => ({ ...prevState, dieu: itemValue }));
            setIsModified(true);
          }}
           mode="dropdown"
        >
          <Picker.Item label="--Chọn điều--" value="" />
          {dieus.map((dieu) => (
            <Picker.Item key={dieu.ma_dieu} label={dieu.ten_dieu} value={dieu.ma_dieu} />
          ))}
        </Picker>

        {isModified && (
          <TouchableOpacity style={Styles.button} onPress={handleSaveChanges}>
            <Text>Lưu thay đổi</Text>
          </TouchableOpacity>
        )}
        </View>
  </ScrollView>
  </View>
  );
};

export default SuaHoatDong;
