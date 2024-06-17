import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Styles from "./Styles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('DanhSachBaoThieu')}
        >
          <Icon name="alert" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Danh sách báo thiếu</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('DanhSachSinhVien')}
        >
          <Icon name="message" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Danh sách sinh viên</Text>
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
        {/* <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('QuanLyBaoThieu')}
        >
          <Icon name="alert" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Quản lý báo thiếu</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('ExportBaoCao')}
        >
          <Icon name="file" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Xuất file PDF</Text>
        </TouchableOpacity>
      
        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('ThemTroLySinhVien')}
        >
          <Icon name="file" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Thêm trợ lý sinh viên</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={Styles.buttonHomePly}
          onPress={() => navigateToScreen('ChatList')}
        >
          <Icon name="message" size={30} color="white" style={Styles.icon} />
          <Text style={Styles.buttonTextQly}>Tin nhắn hỗ trợ sinh viên</Text>
        </TouchableOpacity>

      

       
      </View>
    </View>

  );
};


export default QuanLy;
