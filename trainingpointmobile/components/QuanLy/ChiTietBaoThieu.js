import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Button, ScrollView, ActivityIndicator, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import { TextInput as PaperTextInput, Button as PaperButton } from "react-native-paper";
import APIs, { endpoints, authAPI } from '../../configs/APIs';
import { StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChiTietBaoThieu = ({ navigation }) => {
    const route = useRoute();
    const { thamgiabaothieu_id } = route.params;

    const [loading, setLoading] = useState(true);
    const [hoatDongs, setHoatDongs] = useState([]);
    const [sv, setSv] = useState([]);
    const [chiTietBaoThieu, setChiTietBaoThieu] = useState(null);
    const [minhchung, setMinhChung] = useState({
        "description": "",
        "anh_minh_chung": "",
        "tham_gia": thamgiabaothieu_id,
        "phan_hoi": ""
    });

    const [isImageEnlarged, setIsImageEnlarged] = useState(false);

    const change = (field, value) => {
        setMinhChung(current => ({ ...current, [field]: value }));
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("access-token");
                const reshd = await APIs.get(endpoints['hoatdong']);
                const ressv = await APIs.get(endpoints['sinh_vien'], {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const resctbt = await APIs.get(`/thamgias/${thamgiabaothieu_id}`);
                const resmc = await APIs.get(`/thamgias/${thamgiabaothieu_id}/minhchungs/`);
                if (resmc.data.length > 0) {
                    const minhChungData = resmc.data[0];
                    setMinhChung({
                        description: minhChungData.description,
                        anh_minh_chung: { uri: minhChungData.anh_minh_chung }, 
                        tham_gia: thamgiabaothieu_id,
                        phan_hoi: minhChungData.phan_hoi,
                    });
                }

                setHoatDongs(reshd.data);
                setSv(ressv.data);
                setChiTietBaoThieu(resctbt.data);

                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tham gia báo thiếu:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
            let res = await APIs.patch((`/thamgias/${thamgiabaothieu_id}/capnhat/`), form, {
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

    const handlePhanHoiChange = (text) => {
        change('phan_hoi', text);
    };

    const updateTrangThaiKhongThanhCong = async () => {
        try {
            const updatedThamGia = { ...chiTietBaoThieu, trang_thai: 3 };
            const res = await APIs.patch(`/thamgias/${thamgiabaothieu_id}/`, updatedThamGia);
            if (res.status === 200) {
                setChiTietBaoThieu(updatedThamGia);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            Alert.alert("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };

    const updateTrangThaiThanhCong = async () => {
        try {
            const updatedThamGia = { ...chiTietBaoThieu, trang_thai: 1 };
            const res = await APIs.patch(`/thamgias/${thamgiabaothieu_id}/`, updatedThamGia);
            if (res.status === 200) {
                setChiTietBaoThieu(updatedThamGia);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            Alert.alert("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };

    const handleSubmitHopLe = async () => {
        if (!minhchung.phan_hoi) {
            Alert.alert("Vui lòng nhập phản hồi.");
            return;
        }

        await updateTrangThaiThanhCong();
        await PatchMinhChung();
    };

    const handleSubmitKhongHopLe = async () => {
        if (!minhchung.phan_hoi) {
            Alert.alert("Vui lòng nhập phản hồi.");
            return;
        }

        await updateTrangThaiKhongThanhCong();
        await PatchMinhChung();
    };

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

    const findSinhVienName = (sinhvienId) => {
        const foundSinhVien = Array.isArray(sv) && sv.find(s => s.id === sinhvienId);
        return foundSinhVien ? foundSinhVien.ho_ten : "";
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const baoThieuInfo = findHoatDongInfo(chiTietBaoThieu.hd_ngoaikhoa);

    const toggleImageSize = () => {
        setIsImageEnlarged(!isImageEnlarged);
    };


    return( 
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior='padding'
            keyboardVerticalOffset={80}
        >
            <ScrollView style={styles.container}>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Hoạt động ngoại khóa:</Text>
                    <Text style={styles.value}>{baoThieuInfo.name}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Điểm rèn luyện:</Text>
                    <Text style={styles.value}>{baoThieuInfo.drl}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Chi tiết:</Text>
                    <Text style={styles.value}>{baoThieuInfo.thongTin}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Ngày tổ chức:</Text>
                    <Text style={styles.value}>{baoThieuInfo.ngayTC}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Điều:</Text>
                    <Text style={styles.value}>{baoThieuInfo.dieu}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Sinh Viên: </Text> 
                    <Text style={styles.value}>{findSinhVienName(chiTietBaoThieu.sinh_vien)}</Text>
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
                    <Text style={styles.label}>Nhập phản hồi:</Text>
                        <PaperTextInput
                            style={styles.input}
                            placeholder="Nhập phản hồi..."
                            value={minhchung.phan_hoi}
                            onChangeText={handlePhanHoiChange}
                        />
                </View>

                <PaperButton style={styles.button} mode="contained" onPress={handleSubmitHopLe}>Hợp Lệ</PaperButton>
                <PaperButton style={styles.button} mode="contained" onPress={handleSubmitKhongHopLe}>Không Hợp Lệ</PaperButton>

            </ScrollView>
        </KeyboardAvoidingView>
    )
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
        marginTop: 16,
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

export default ChiTietBaoThieu;