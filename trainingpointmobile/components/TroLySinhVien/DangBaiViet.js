import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { TextInput as PaperTextInput, Button, useTheme, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints, formatDate } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyContext from '../../configs/MyContext';
import Styles from './Styles';
import { set } from 'firebase/database';

const CreatePost = ({ route, navigation }) => {
  const theme = useTheme();
  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);
  const [post, setPost] = useState({
    title: '',
    image: "",
    tro_ly: user.id,
    hd_ngoaikhoa: route.params.hoatDongId,
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [activityInfo, setActivityInfo] = useState();

  React.useEffect(() => {
    fetchActivityInfo(route.params.hoatDongId);
  }, [route.params.hoatDongId]);

  const fetchActivityInfo = async (hoatDongId) => {
    const token = await AsyncStorage.getItem('access-token');
    try {
     
      const response = await APIs.get(`${endpoints['hd']}${hoatDongId}/`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log('Activity info:', response.data);
      setActivityInfo(response.data);;
    } catch (error) {
      console.error('Lỗi khi lấy hoạt động', error);
      Alert.alert('Error', 'Lỗi khi lấy hoạt động');
    }
  };


  const change = (field, value) => {
    setPost(current => ({ ...current, [field]: value }));
  };

  const handleChooseImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissions denied!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        change('image', result.assets[0]);
      }
    }
  };


  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("access-token");
    setLoading(true);
    try {
      let form = new FormData();
      // console.log("Post data: ", post);
      for (let key in post) {
          if (key === "image") {
            form.append(key, {
                uri: post.image.uri,
                name: post.image.fileName ,
                type: post.image.type || 'image/jpeg'
            });
          }
          else {
          form.append(key, post[key]);
          }
      }
      console.log("Form data: ", form);
      const response = await APIs.post(endpoints['bai_viet'], form, {
        headers: {
          'Content-Type': 'application/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        Alert.alert('Đăng bài viết thành công!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Lỗi khi đăng bài viết:', error);
      Alert.alert('Lỗi khi đăng bài viết:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>

    {activityInfo ? (
        <View style={{ marginBottom: 20 }}>
          <Text style={Styles.labelcrepost}>Thông tin hoạt động ngoại khóa</Text>
          <Text>Tên hoạt động: {activityInfo.ten_HD_NgoaiKhoa}</Text>
          <Text>Điều: {activityInfo.dieu}</Text>
          <Text>Điểm rèn luyện: {activityInfo.diem_ren_luyen}</Text>
          <Text>Ngày tổ chức: {formatDate(activityInfo.ngay_to_chuc)}</Text>
        </View>
      ) : (
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} style={{ marginBottom: 20 }} />
      )}


      <View style={{ marginBottom: 20 }}>
        <Text style={Styles.labelcrepost}>Tiêu đề:</Text>
        <PaperTextInput
          label="Nhập tiêu đề"
          value={post.title}
          onChangeText={text => change('title', text)}
          mode="outlined"
          style={Styles.marginBottomcrepost}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={Styles.labelcrepost}>Hình ảnh:</Text>
        <TouchableOpacity onPress={handleChooseImage}>
          <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', height: 200 }}>
            {post.image ? (
              <Image source={{ uri: post.image.uri }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text>Chọn hình ảnh</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={Styles.labelcrepost}>Nội dung:</Text>
        <PaperTextInput
          label="Nhập nội dung bài viết"
          value={post.content}
          onChangeText={text => change('content', text)}
          multiline={true}
          numberOfLines={4}
          mode="outlined"
          style={[Styles.marginBottomcrepost, { height: 150 }]}
        />
      </View>

      {loading ? (
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      ) : (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={loading}
        >
          Đăng bài viết
        </Button>
      )}
    </ScrollView>
  );
};

export default CreatePost;
