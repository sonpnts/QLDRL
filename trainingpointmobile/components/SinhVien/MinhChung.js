import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, ScrollView, ActivityIndicator, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { TextInput as PaperTextInput, Button as PaperButton } from "react-native-paper";
import APIs, { endpoints } from '../../configs/APIs';
import * as ImagePicker from 'expo-image-picker';


const MinhChung = ({ navigation }) => {
    const route = useRoute();
    const { thamgia_id } = route.params;
    
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [hoatDongs, setHoatDongs] = useState([]);
    const [thamGia, setThamGia] = useState(null);
    const [minhchung, setMinhChung] = useState({
        "description": "",
        "anh_minh_chung": "",
        "tham_gia": thamgia_id,
        "phan_hoi": ""
    });

    const [isImageEnlarged, setIsImageEnlarged] = useState(false);

    const change = (field, value) => {
        setMinhChung(current => ({ ...current, [field]: value }));
    };

    const trangThaiMap = {
        0: 'Đăng Ký',
        1: 'Điểm Danh',
        2: 'Báo Thiếu',
        3: 'Báo Thiếu Bị Từ Chối',
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const reshd = await APIs.get(endpoints['hoatdong']);
                setHoatDongs(reshd.data);

                const restg = await APIs.get(`/thamgias/${thamgia_id}`);
                setThamGia(restg.data);

                if (restg.data.trang_thai === 2 || restg.data.trang_thai === 3) {
                    const resmc = await APIs.get(`/thamgias/${thamgia_id}/minhchungs/`);
                    if (resmc.data.length > 0) {
                        const minhChungData = resmc.data[0];
                        setMinhChung({
                            description: minhChungData.description,
                            anh_minh_chung: { uri: minhChungData.anh_minh_chung }, 
                            tham_gia: thamgia_id,
                            phan_hoi: minhChungData.phan_hoi,
                        });
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [thamgia_id]);

    useEffect(() => {
        if (route.params && route.params.success) {
            setSuccess(route.params.success);
        }
    }, [route.params]);

    useEffect(() => {
        const postAndResetSuccess = async () => {
            try {
                await PostMinhChung();
                setSuccess(false);
            } catch (error) {
                console.error('Error in postAndResetSuccess:', error);
            }
        };
        if (success) {
            postAndResetSuccess();
        }
    }, [success]);

    const findHoatDongInfo = (hoatdongId) => {
        const foundHoatDong = Array.isArray(hoatDongs) && hoatDongs.find(hd => hd.id === hoatdongId);
        if (foundHoatDong) {
            return {
                name: foundHoatDong.ten_HD_NgoaiKhoa,
                drl: foundHoatDong.diem_ren_luyen,
                thongTin: foundHoatDong.thong_tin,
                ngayTC: foundHoatDong.ngay_to_chuc,
                dieu: foundHoatDong.dieu
            };
        }
        return {
            name: "",
            drl: "",
            thongTin: "",
            ngayTC: "",
            dieu: ""
        };
    };

    const handleDescriptionChange = (text) => {
        change('description', text);
    };

    const handleChooseImg = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                change('anh_minh_chung', result.assets[0]);
            }
        }
    };

    const PostMinhChung = async () => {
        try {
            setLoading(true);
            let form = new FormData();
            for (let key in minhchung) {
                if (key === "anh_minh_chung") {
                    form.append(key, {
                        uri: minhchung.anh_minh_chung.uri,
                        name: 'anh_minh_chung.jpg',
                        type: minhchung.anh_minh_chung.type || 'image/jpeg'
                    });
                } else {
                    form.append(key, minhchung[key]);
                }
            }

            let res = await APIs.post(endpoints['minh_chung'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            if (res.status === 201) {
                Alert.alert('Tạo minh chứng thành công!');
                navigation.goBack();
            }
        } catch (ex) {
            console.log(ex);
            Alert.alert('Có lỗi gì đó đã xảy ra trong lúc tạo minh chứng!', ex.message);
        } finally {
            setLoading(false);
        }
    };

    const PatchMinhChung = async () => {
        try {
            setLoading(true);
            let form = new FormData();
            for (let key in minhchung) {
                if (key === "anh_minh_chung") {
                    form.append(key, {
                        uri: minhchung.anh_minh_chung.uri,
                        name: 'anh_minh_chung.jpg',
                        type: minhchung.anh_minh_chung.type || 'image/jpeg'
                    });
                } else {
                    form.append(key, minhchung[key]);
                }
            }

            let res = await APIs.patch((`/thamgias/${thamgia_id}/capnhat/`), form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            if (res.status === 200) {
                Alert.alert('Cập nhật minh chứng thành công!');
                navigation.goBack();
            }
        } catch (ex) {
            console.log(ex);
            Alert.alert('Có lỗi gì đó đã xảy ra trong lúc cập nhật minh chứng!', ex.message);
        } finally {
            setLoading(false);
        }
    };

    const updateTrangThai = async () => {
        try {
            const updatedThamGia = { ...thamGia, trang_thai: 2 };
            const res = await APIs.patch(`/thamgias/${thamgia_id}/`, updatedThamGia);
            if (res.status === 200) {
                setThamGia(updatedThamGia);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            Alert.alert("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };

    const handleSubmit = async () => {
        if (!minhchung.description || !minhchung.anh_minh_chung) {
            Alert.alert("Vui lòng nhập đầy đủ thông tin và chọn hình ảnh.");
            return;
        }

        if (thamGia.trang_thai === 0) {
            await updateTrangThai();
            await PostMinhChung();
        } else if (thamGia.trang_thai === 2) {
            await PatchMinhChung();
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const hoatdongInfo = findHoatDongInfo(thamGia.hd_ngoaikhoa);

    const toggleImageSize = () => {
        setIsImageEnlarged(!isImageEnlarged);
    };

    if (thamGia.trang_thai === 0 || thamGia.trang_thai === 2) {
        return (
            <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior='padding'
                    keyboardVerticalOffset={80} // Điều chỉnh khoảng cách khi bàn phím hiển thị
            >
                <ScrollView style={styles.container}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Hoạt động ngoại khóa:</Text>
                        <Text style={styles.value}>{hoatdongInfo.name}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Điểm rèn luyện:</Text>
                        <Text style={styles.value}>{hoatdongInfo.drl}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Chi tiết:</Text>
                        <Text style={styles.value}>{hoatdongInfo.thongTin}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Ngày tổ chức:</Text>
                        <Text style={styles.value}>{hoatdongInfo.ngayTC}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Điều:</Text>
                        <Text style={styles.value}>{hoatdongInfo.dieu}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Trạng thái:</Text>
                        <Text style={styles.value}>{trangThaiMap[thamGia.trang_thai]}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Nhập mô tả:</Text>
                        <PaperTextInput
                            style={styles.input}
                            placeholder="Nhập mô tả..."
                            value={minhchung.description}
                            onChangeText={handleDescriptionChange}
                        />
                    </View>
                    
                    {minhchung.anh_minh_chung && (
                        <TouchableOpacity onPress={toggleImageSize}>
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: minhchung.anh_minh_chung.uri }}
                                    style={[styles.image, isImageEnlarged && styles.enlargedImage]}
                                />
                            </View>
                        </TouchableOpacity>
                    )}

                    <PaperButton style={styles.button} mode='contained-tonal' onPress={handleChooseImg}>Chọn ảnh</PaperButton>
                    <PaperButton style={styles.button} mode="contained" onPress={handleSubmit}>Hoàn Thành</PaperButton>

                    {/* <PaperButton style={styles.button} mode="contained" onPress={() => navigation.navigate('HDNKChuaDiemDanh')}>Thoát</PaperButton> */}
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    if (thamGia.trang_thai === 3) {
        return (
            <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior='padding'
                    keyboardVerticalOffset={80} // Điều chỉnh khoảng cách khi bàn phím hiển thị
            >
                <ScrollView style={styles.container}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Hoạt động ngoại khóa:</Text>
                        <Text style={styles.value}>{hoatdongInfo.name}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Điểm rèn luyện:</Text>
                        <Text style={styles.value}>{hoatdongInfo.drl}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Chi tiết:</Text>
                        <Text style={styles.value}>{hoatdongInfo.thongTin}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Ngày tổ chức:</Text>
                        <Text style={styles.value}>{hoatdongInfo.ngayTC}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Điều:</Text>
                        <Text style={styles.value}>{hoatdongInfo.dieu}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Trạng thái:</Text>
                        <Text style={styles.value}>{trangThaiMap[thamGia.trang_thai]}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                            <Text style={styles.label}>Mô tả:</Text>
                            <PaperTextInput
                                style={styles.input}
                                value={minhchung.description}
                                editable={false} // Không cho phép nhập
                            />
                    </View>

                    {minhchung.anh_minh_chung && (
                        <TouchableOpacity onPress={toggleImageSize}>
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: minhchung.anh_minh_chung.uri }}
                                    style={[styles.image, isImageEnlarged && styles.enlargedImage]}
                                />
                            </View>
                        </TouchableOpacity>
                    )}

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Phản hồi từ trợ lý:</Text>
                        <PaperTextInput
                                    style={styles.input}
                                    value={minhchung.phan_hoi}
                                    editable={false}
                                />
                    </View>

                    <PaperButton style={styles.button} mode="contained" onPress={() => navigation.navigate('HDNKChuaDiemDanh')}>Thoát</PaperButton>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return null;
};

const styles = {
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    infoContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 8,
        marginTop: 8,
    },
    button: {
        marginTop: 16,
    },
    imageContainer: {
        margin: 10,
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    image: {
        width: 200,
        height: 200,
    },
    enlargedImage: {
        width: 400,
        height: 400,
    },
};

export default MinhChung;