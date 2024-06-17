import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import APIs, { endpoints , formatDate} from '../../configs/APIs';
import Styles from './Styles'; // Đảm bảo import file Styles cho giao diện
import { Picker } from '@react-native-picker/picker'; 


const QuanLyHoatDong = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(''); // State để lưu học kỳ đã chọn
  const [hocKyList, setHocKyList] = useState([]); // State để lưu danh sách học kỳ
  const navigation = useNavigation();

  // Function để lấy danh sách học kỳ
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

  // Function để lấy danh sách hoạt động từ API dựa trên học kỳ đã chọn
  const fetchActivities = async (hocKyId) => {
    const token = await AsyncStorage.getItem('access-token');
    // const tokens= await 
    setLoading(true);
    try {
      const response = await APIs.get(`${endpoints['quan_ly_hoat_dong']}?hoc_ky=${hocKyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hoạt động:', error);
      setLoading(false);
    }
  };

  // Effect hook để gọi function fetchHocKy khi component mount
  useEffect(() => {
    fetchHocKy();
  }, []);

  // Effect hook để gọi function fetchActivities khi selectedHocKy thay đổi
  useEffect(() => {
    if (selectedHocKy) {
      fetchActivities(selectedHocKy);
    }
  }, [selectedHocKy]);

  // Function để xử lý khi người dùng chọn một hoạt động để xem chi tiết
  const viewActivityDetails = (activityId) => {
    navigation.navigate('ChiTietHoatDong', { activityId });
  };

  // Function để xử lý khi người dùng chọn một hoạt động để chỉnh sửa
  const editActivity = (activityId) => {
    navigation.navigate('SuaHoatDong', { activityId });
  };

  // Function để xử lý khi người dùng chọn một hoạt động để xoá
  const deleteActivity = async (hoat_dong_id) => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      const response = await APIs.post(`${endpoints['xoa_hoat_dong']}?hd=${hoat_dong_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Xoá thành công, cập nhật lại danh sách hoạt động
        fetchActivities(selectedHocKy);
      } else {
        console.error('Xoá hoạt động thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi xoá hoạt động:', error);
    }
  };

  if (loading) {
    return (
      <View style={Styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const confirmDelete = (activityId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa hoạt động này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => deleteActivity(activityId),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={Styles.container}>
      {/* Picker để chọn học kỳ */}
      <Picker
        selectedValue={selectedHocKy}
        style={Styles.picker}
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

      {/* Danh sách hoạt động */}
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={Styles.activityItem}>
            <TouchableOpacity onPress={() => viewActivityDetails(item.id)}>
              <Text style={Styles.activityTitle}>{item.ten_HD_NgoaiKhoa}</Text>
              <Text>Ngày tổ chức: {formatDate(item.ngay_to_chuc)}</Text>
              <Text>Thông tin: {item.thong_tin}</Text>
              <TouchableOpacity onPress={() => editActivity(item.id)} style={Styles.editButton}>
                <Text style={Styles.buttonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} style={Styles.deleteButton}>
            <Text style={Styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("CreatePost", { hoatDongId: item.id})} style={Styles.deleteButton}>
                <Text style={Styles.buttonText}>Tạo bài viết</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default QuanLyHoatDong;