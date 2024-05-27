import React from 'react'
import { ScrollView, View } from 'react-native';
import { Button, Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import BaiViet from './BaiViet';
import APIs, { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BanTin = ({ route, navigation }) => {
    const [q, setQ] = React.useState('');
    const [baiViets, setBaiViets] = React.useState([]);
    const loadBaiViets = async () => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            if (token) {
                console.log("Token ", token);
                let baiviets = await authAPI(token).get(endpoints['bai_viet']);
                setBaiViets(baiviets.data);
            }
        } catch (ex) {
            console.log("Lỗi");
        }
    }
    React.useEffect(() => {
        loadBaiViets();
    }, []);

    return (
        <ScrollView>
            <View style={{ margin: 10 }}>
                <Searchbar placeholder="Nhập từ khóa..." onChangeText={setQ} value={q} />
            </View>
            <ScrollView keyboardShouldPersistTaps='handled'>
                {baiViets === null ? <Text>Hello</Text> :
                    <>
                        {baiViets.map(b => {
                            return (
                                <BaiViet
                                    key={b.id}
                                    baiviet={b}
                                />
                            );
                        })}
                    </>}
            </ScrollView>
        </ScrollView>
    )
}

export default BanTin;