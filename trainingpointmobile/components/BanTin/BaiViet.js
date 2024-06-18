import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button as PaperButton } from 'react-native-paper'
import RenderHtml from 'react-native-render-html';
import Styles from './Styles';
import CommentModal from './CommentModal';
import MyContext from '../../configs/MyContext';
import APIs, { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const BaiViet = ({ baiviet = null, navigation = null }) => { 
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = React.useContext(MyContext);
    const [expanded, setExpanded] = useState(false);
    const [hoatdong, setHoatDong] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [baiViet, setBaiViet] = useState(null);
    const [author, setAuthor] = useState(null);
    const [liked, setLiked] = useState(null);
    const [registered, setRegistered] = useState(false);
    const maxDisplayWords = 20;

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const handleModalVisible = () => {
        setModalVisible(true);
    }

    const handleCloseModal = () => {
        setModalVisible(false);
    }

    const getAuthor = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            let auth = await APIs.get(endpoints['tac_gia'](id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAuthor(auth.data);
        } catch (error) {
            console.error("Lỗi khi lấy tác giả:", error);
            Alert.alert("Lỗi khi lấy tác giả bài viết");
        }
    }

    const checkLiked = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.get(endpoints['baiviet_liked'](id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.liked == true) {
               
                setLiked(true);
            } else {
                setLiked(false);
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái 'liked':", error);
        }
    };

    const handleLike = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.post(endpoints['baiviet_like'](id), null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (liked) {
                setLiked(false);
            } else {
                setLiked(true);
            }
        } catch (error) {
            console.error("Lỗi khi xử lý like:", error);
        }
    };  

    const checkRegister = async (id) => {
        try {
          
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.get(endpoints['kiem_tra_dang_ky'](id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.registered === true) {
                setRegistered(true);
            } else {
                setRegistered(false);
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái đăng ký hoạt động:", error);
        }
    };


    const handleRegistration = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            // Gửi yêu cầu đăng ký bài viết
            const response = await APIs.post(endpoints['dang_ky_hoat_dong'](id), null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Nếu đăng ký thành công, cập nhật state
            if (response.status === 201) {
                setRegistered(true);
            }
        } catch (error) {
            console.error("Lỗi khi xử lý đăng ký:", error);
        }
    };
    const getHoatDong = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            let response = await APIs.get(endpoints['hoat_dong'](id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setHoatDong(response.data);

        } catch (error) {
            console.error("Lỗi khi lấy hoạt động:", error);
        }
    };

    const formatISODate = (isoDateString, format = "HH:mm - DD/MM/YYYY") => {
        return moment(isoDateString).format(format);
    };


    React.useEffect(() => {
        if (baiviet) {
                setBaiViet(baiviet);
                // console.log(baiviet);
                getHoatDong(baiviet.hd_ngoaikhoa);
                getAuthor(baiviet.id);
                checkLiked(baiviet.id);
                if(role==4){
                    checkRegister(baiviet.hd_ngoaikhoa);
                    
                }
            }
    }, [baiviet]);

    return (
        <View style={[Styles.container, Styles.baiViet]}>
            {baiViet === null ? <></> : <>
                <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.title}>{baiViet.title}</Text>
                <Text numberOfLines={expanded ? 99 : 4} ellipsizeMode="tail" style={Styles.content} onPress={toggleExpand}>
                {baiViet.content}
                {'\n'}
                Ngày tổ chức: {hoatdong ? formatISODate(hoatdong.ngay_to_chuc) : 'Loading...'}
                {'\n'}
                Điểm rèn luyện: {hoatdong ? hoatdong.diem_ren_luyen : 'Loading...'}
                {'\n'}
                Điều: {hoatdong ? hoatdong.dieu : 'Loading...'}
                
                </Text>
                {baiViet.content.split(' ').length > maxDisplayWords && !expanded && (
                    <PaperButton onPress={toggleExpand}>Xem thêm</PaperButton>
                )}
                <Image source={{ uri: baiViet.image }} style={Styles.image} />
                <View style={Styles.bottom}>
                    <PaperButton mode='contained-tonal' style={{ marginRight: 5, borderRadius: 10 }} onPress={() => handleLike(baiViet.id)}>
                        {liked ? <Text style={{ fontWeight: 'bold' }}>Đã Thích</Text> : 'Thích'}
                    </PaperButton>
                    <PaperButton
                        onPress={handleModalVisible}
                        style={{ marginRight: 10, borderRadius: 10 }}
                        mode='outlined'
                    >
                        Bình luận
                    </PaperButton>
                    {registered ? (
                        <PaperButton mode='contained-tonal' style={{ marginRight: 5, borderRadius: 10, backgroundColor: '#d3d3d3' }} disabled>
                            Đã Đăng Ký
                        </PaperButton>
                    ) : (
                        <PaperButton
                            mode='contained'
                            style={{ marginRight: 5, borderRadius: 10 }}
                            onPress={() => handleRegistration(baiViet.hd_ngoaikhoa)}
                            disabled={role !== 4}
                        >
                            Đăng ký
                        </PaperButton>
                    )}
                    <CommentModal visible={modalVisible} onClose={handleCloseModal} postId={baiViet.id} />
                </View>
            </>
            }
        </View>
    );
};
export default BaiViet;
