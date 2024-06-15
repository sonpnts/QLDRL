import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Styles from "./Styles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// import { NavigationContainer } from '@react-navigation/native';


import ChatScreen from '../ChatFireBase/ChatScreen';
import DiemDanh from '../TroLySinhVien/UploadFileDiemDanh';
import CreatePost from '../TroLySinhVien/DangBaiViet';
import HoatDong from '../TroLySinhVien/HoatDong';
import ThemTroLySinhVien from './ThemTroLySinhVien';
import ExportBaoCao from '../ThongKe/export';
import HoatDongChuaCoBaiViet from '../TroLySinhVien/DanhSanhHoatDong';
// const Stack = createNativeStackNavigator();


// import { createNativeStackNavigator } from '@react-navigation/native-stack';
const QuanLy = ({ navigation }) => {

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };
  


  return (

    <View style={Styles.containerqly}>
      <View style={Styles.buttonRow}>
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('QuanLyHoatDong')}
        >
          <Icon name="account-clock" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Quản lý hoạt động</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('HoatDong')}
        >
          <Icon name="account-clock" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Tạo hoạt động</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('HoatDongChuaCoBaiViet')}
        >
          <Icon name="file-document-edit" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Tạo bài viết</Text>
        </TouchableOpacity>
      </View>
      <View style={Styles.buttonRow}>
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('DiemDanh')}
        >
          <Icon name="account-check-outline" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Điểm danh sinh viên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('QuanLyBaoThieu')}
        >
          <Icon name="alert" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Quản lý báo thiếu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('ExportBaoCao')}
        >
          <Icon name="file" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Xuất file PDF</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};


export default QuanLy;
