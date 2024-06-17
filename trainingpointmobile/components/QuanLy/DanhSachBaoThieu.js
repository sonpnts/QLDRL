import React, { useEffect, useState, useCallback } from 'react';
import { View, Button, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import APIs, { endpoints, authAPI } from '../../configs/APIs';
import { StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DanhSachBaoThieu = ({navigation}) => {
    const [loading, setLoading] = useState(true);
    const [thamGiaBaoThieu, setThamGiaBaoThieu] = useState([]);
    const [hoatDongs, setHoatDongs] = useState([]);
    const [sv, setSv] = useState([]);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const reshd = await APIs.get(endpoints['hoatdong']);
            const ressv = await APIs.get(endpoints['sinh_vien'], {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const restgbt = await APIs.get(endpoints['tham_gia_bao_thieu']);
            
            setHoatDongs(reshd.data);
            setSv(ressv.data);
            setThamGiaBaoThieu(restgbt.data);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tham gia báo thiếu:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const findHoatDongName = (hoatdongId) => {
        const foundHoatDong = Array.isArray(hoatDongs) && hoatDongs.find(hd => hd.id === hoatdongId);
        return foundHoatDong ? foundHoatDong.ten_HD_NgoaiKhoa : "";
    };

    const findHoatDongDRL = (hoatdongId) => {
        const foundHoatDong = Array.isArray(hoatDongs) && hoatDongs.find(hd => hd.id === hoatdongId);
        return foundHoatDong ? foundHoatDong.diem_ren_luyen : "";
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

    return(
        <View>

            <Text style={styles.title}>Danh sách hoạt động báo thiếu của sinh viên</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.hoatDongNameColumn]}>Tên hoạt động</Text>
                        <Text style={[styles.tableHeaderText, styles.diemRenLuyenColumn]}>ĐRL</Text>
                        <Text style={[styles.tableHeaderText, styles.sinhVienNameColumn]}>Sinh Viên</Text>
            </View>
            <ScrollView>
                {thamGiaBaoThieu.map((tgbt) => (
                    <TouchableOpacity key={tgbt.id} 
                        style={styles.hoatDongContainer}
                        onPress={() => navigation.navigate('ChiTietBaoThieu', { thamgiabaothieu_id: tgbt.id })}
                    >
                        <View key={tgbt.id} style={styles.tableRow}>
                            <Text style={styles.hoatDongNameColumn}>{findHoatDongName(tgbt.hd_ngoaikhoa)}</Text>
                            <Text style={styles.diemRenLuyenColumn}>{findHoatDongDRL(tgbt.hd_ngoaikhoa)}</Text>
                            <Text style={styles.sinhVienNameColumn}>{findSinhVienName(tgbt.sinh_vien)}</Text>
                        </View>
                    </TouchableOpacity>
                ))}    
            </ScrollView>

        </View>
    )
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        margin: 15,
        textAlign: 'center',
        color: 'red'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableHeaderText: {
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    hoatDongNameColumn: {
        flex: 3,
    },
    sinhVienNameColumn: {
        flex: 2,
    },
    diemRenLuyenColumn: {
        flex: 1,
        textAlign: 'center',
    },
});

export default DanhSachBaoThieu;