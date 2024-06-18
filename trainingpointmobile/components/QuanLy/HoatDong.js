import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity , ScrollView} from 'react-native';
import { TextInput as PaperTextInput,  Dialog, Portal, Paragraph  } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker'; 
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import MyContext from '../../configs/MyContext';
import { set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';


const HoatDong = () => {
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = React.useContext(MyContext);
    const [dieus, setDieus] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hocKyList, setHocKyList] = useState([]);
    const navigation = useNavigation();  // Use the useNavigation hook
    const [idhd, setIdhd] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [hoatDong, setHoatDong] = useState({
        "ten_HD_NgoaiKhoa": "",
        "ngay_to_chuc": "",
        "thong_tin": "",
        "diem_ren_luyen": "",
        "dieu": "",
        "hk_nh": "",
        "tro_ly": ""
    });

    
    const change = (field, value) => {
        setHoatDong(current => {
            return { ...current, [field]: value }
        });
    };

  useEffect(() => {
    fetchDieus();
  }, []);

  const fetchDieus = async () => {
    try {
      const response = await APIs.get(endpoints['dieu']);
      setDieus(response.data);
    } catch (error) {
      console.error('Error fetching dieus:', error);
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
  
  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("access-token");
    setLoading(true);
    try{
        hoatDong.tro_ly = user.id;
        console.log(hoatDong);
        const response = await APIs.post(endpoints['tao_hoat_dong'], hoatDong, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        if (response.status === 201) {
            setIdhd(response.data.id);
            setShowConfirmation(true);
        }

    }catch(error){
        console.error('Lỗi khi tạo hoạt động:', error);
        Alert.alert('Lỗi khi tạo hoạt động:', error.message);
    }
    finally{
        setLoading(false);
    }
    setLoading(false);
  };

  const handleDialogDismiss = () => {
    
    setShowConfirmation(false);
    setHoatDong({
      ten_HD_NgoaiKhoa: "",
      ngay_to_chuc: "",
      thong_tin: "",
      diem_ren_luyen: "",
      dieu: "",
      hk_nh: "",
      tro_ly: ""
    });
  };


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    change("ngay_to_chuc", date.toISOString());
    hideDatePicker();
  };

  const formatDate = (date) => {
    return moment(date).format(' HH:mm - DD/MM/YYYY');
  };

  return (
    <View contentContainerStyle={Styles.container} >
    <ScrollView  >
      <View style={Styles.container}>
        <Text style={Styles.label}>Tên hoạt động ngoại khóa:</Text>
        <TextInput
          style={Styles.input}
          placeholder="Nhập tên hoạt động ngoại khóa"
          value={hoatDong.ten_HD_NgoaiKhoa}
          onChangeText={(text) => change('ten_HD_NgoaiKhoa', text)}
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
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={Styles.label}>Thông tin:</Text>
        <TextInput
          style={[Styles.input, Styles.multilineInput]}
          placeholder="Nhập thông tin cho hoạt động ngoại khóa"
          value={hoatDong.thong_tin}
          onChangeText={(text) => change('thong_tin', text)}
          multiline={true}
          numberOfLines={4}
        />

        <Text style={Styles.label}>Điểm rèn luyện:</Text>
        <TextInput
          style={Styles.input}
          placeholder="Nhập điểm rèn luyện"
          value={hoatDong.diem_ren_luyen}
          keyboardType="numeric"
          onChangeText={(text) => change('diem_ren_luyen', text)}
        />

        <Text style={Styles.label}>Chọn điều:</Text>
        <Picker
          // style={Styles.picker}
          selectedValue={hoatDong.dieu}
          onValueChange={(itemValue) => change('dieu', itemValue)}
        >
          <Picker.Item label="--Chọn điều--" value="" />
          {dieus.map((dieu) => (
            <Picker.Item key={dieu.ma_dieu} label={dieu.ten_dieu} value={dieu.ma_dieu} />
          ))}
        </Picker>

        <Text style={Styles.label}>Chọn học kỳ:</Text>
        <Picker
          // style={Styles.picker}
          selectedValue={hoatDong.hk_nh}
          onValueChange={(itemValue) => change('hk_nh', itemValue)}
          mode="dropdown"
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

        <TouchableOpacity  
          style={[Styles.button, { backgroundColor: loading || !hoatDong.ten_HD_NgoaiKhoa || !hoatDong.ngay_to_chuc || !hoatDong.thong_tin || !hoatDong.diem_ren_luyen || !hoatDong.dieu || !hoatDong.hk_nh ? '#ccc' : '#3498db' }]}
          onPress={loading || !hoatDong.ten_HD_NgoaiKhoa || !hoatDong.ngay_to_chuc || !hoatDong.thong_tin || !hoatDong.diem_ren_luyen || !hoatDong.dieu || !hoatDong.hk_nh ? null : handleSubmit}
          disabled={loading || !hoatDong.ten_HD_NgoaiKhoa || !hoatDong.ngay_to_chuc || !hoatDong.thong_tin || !hoatDong.diem_ren_luyen || !hoatDong.dieu || !hoatDong.hk_nh}
        >
          <Text style={Styles.label}>Tạo hoạt động</Text>
        </TouchableOpacity>
      </View>

      
      <Dialog visible={showConfirmation} onDismiss={handleDialogDismiss}>
        <Dialog.Title>Tạo hoạt động thành công</Dialog.Title>
        <Dialog.Content>
        <Paragraph>Bạn có muốn tạo bài viết cho hoạt động đã tạo không?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <TouchableOpacity onPress={handleDialogDismiss}>
            <Text style={Styles.dialogButtonText}>Không</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleDialogDismiss();
              try {
                navigation.navigate("CreatePost", { hoatDongId: idhd });
              } catch (error) {
                console.error('Error navigating to CreatePost:', error);
                Alert.alert('Error navigating to CreatePost:', error.message);
              }
            }}
          >
            <Text style={Styles.dialogButtonText}>Có</Text>
          </TouchableOpacity>
        </Dialog.Actions>
      </Dialog>
    </ScrollView>
    </View>
  );
};

export default HoatDong;