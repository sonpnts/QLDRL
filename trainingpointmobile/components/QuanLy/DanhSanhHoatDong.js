import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import APIs, { endpoints, formatDate } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from './Styles';
import { Picker } from '@react-native-picker/picker'; 
import { useNavigation } from '@react-navigation/native';
  
  

const HoatDongChuaCoBaiViet = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(''); // State để lưu học kỳ đã chọn
  const [hocKyList, setHocKyList] = useState([]); // State để lưu danh sách học kỳ
  const navigation = useNavigation();  // Use the useNavigation hook

  // Hàm lấy danh sách học kỳ
  const fetchHocKy = async () => {
    try {
      const response = await APIs.get(endpoints['hocky']);
      setHocKyList(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hoc ky data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHocKy();
  }, []);

  useEffect(() => {
    if (selectedHocKy) {
      fetchActivitiesWithoutPost(selectedHocKy);
    }
  }, [selectedHocKy]);

  const fetchActivitiesWithoutPost = async (hoc_ky) => {
    const token = await AsyncStorage.getItem("access-token");
    setLoading(true);
    try {
      const response = await APIs.get(`${endpoints['hoat_dong_tao_bai_viet']}?hoc_ky=${hoc_ky}`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log('Activities:', response.data);
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy hoạt động:', error);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={[Styles.containerDSHD, Styles.loading]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={Styles.containerDSHD}>
      <Picker
        selectedValue={selectedHocKy}
        style={Styles.pickerdshd}
        mode="dropdown"
        onValueChange={(itemValue) => setSelectedHocKy(itemValue)}
      >
         <Picker.Item label="Chọn học kỳ" value="" />
          {hocKyList.map((hocKyItem, index) => (
            <Picker.Item
              key={index}
              label={`Học kỳ ${hocKyItem.hoc_ky} - ${hocKyItem.nam_hoc}`}
              value={hocKyItem.id}
            />
          ))}
        </Picker>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={Styles.item}>
            <Text style={Styles.title}>Tên hoạt động: {item.ten_HD_NgoaiKhoa}</Text>
            <Text>Ngày tổ chức: {formatDate(item.ngay_to_chuc)}</Text>
            <Text>Thông tin: {item.thong_tin}</Text>
            <Text>Điểm rèn luyện: {item.diem_ren_luyen}</Text>
            <Text>Điều: {item.dieu}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreatePost", { hoatDongId: item.id})} style={Styles.createPostButton}>
              <Text style={Styles.createPostButtonText}>Tạo bài viết</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default HoatDongChuaCoBaiViet;
