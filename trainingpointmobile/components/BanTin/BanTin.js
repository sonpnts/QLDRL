import React,  { useState, useEffect } from 'react'
import { View , ActivityIndicator, ScrollView, RefreshControl} from 'react-native';
import { Button, Text, Searchbar} from 'react-native-paper';
import BaiViet from './BaiViet';
import APIs, { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isCloseToBottom } from '../Utils/Tobottom';

const BanTin = ({ route, navigation }) => {
    const [q, setQ] = React.useState('');
    const [baiViets, setBaiViets] = React.useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = React.useState(false);

    const loadBaiViets = async () => {
        if(page > 0){
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('access-token');
            let baiviets = await authAPI(token).get(`${endpoints['bai_viet']}?page=${page}`);
            
            if(baiviets.data.next === null)
            {
                setPage(0);
            }
            if (page === 1) {
                setBaiViets(baiviets.data.results);
            } else {
                setBaiViets(current => {
                    return [...current, ...baiviets.data.results];
                });
            }
            
        } catch (ex) {
        console.log("Lỗi", ex);
        }
        finally {
            setLoading(false);
        }
        }
    }

    React.useEffect(() => {
        loadBaiViets();
    }, [page]);

    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            setPage(page + 1);
        }
    }

    return (
        <ScrollView onScroll={loadMore}>
            <RefreshControl onRefresh={()=> loadBaiViets()}/>
            <View style={{ margin: 10 }}>
                <Searchbar placeholder="Nhập từ khóa..." onChangeText={setQ} value={q} />
            </View>
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
                {loading && page > 1 && <ActivityIndicator />}
                {loading && page > 1 && <Text style={{textAlign: 'center', marginVertical: 10}}>Đang tải...</Text>}
        </ScrollView>
    )
}

export default BanTin;