import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button as PaperButton } from 'react-native-paper'
import Styles from './Styles';
import CommentModal from './CommentModal';
import APIs, { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BaiViet = (props, { navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [baiViet, setBaiViet] = useState(null);
    const [author, setAuthor] = useState(null);
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
        const token = await AsyncStorage.getItem("access-token");
        let auth = await APIs.get(endpoints['tac_gia'](id));
        console.log(auth.data);
        setAuthor(auth.data);
    }


    React.useEffect(() => {
        if (props && props.baiviet) {
            getAuthor(props.baiviet.id);
            setBaiViet(props.baiviet);
        }
    }, [props]);

    React.useEffect(() => {
        console.log(author);
        console.log(baiViet);
    }, [baiViet, author])

    return (
        <View style={[Styles.container, Styles.baiViet]}>
            {author === null ? <></> :
                <View style={Styles.header}>
                    <Image source={{ uri: author.avatar }} style={Styles.avatar} />
                    <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.username}>
                        {author.username}
                    </Text>
                </View>
            }
            {baiViet === null ? <></> : <>
                <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.title}>{baiViet.title}</Text>

                <Text numberOfLines={expanded ? 99 : 4} ellipsizeMode="tail" style={Styles.content} onPress={toggleExpand}>
                    {baiViet.content}
                    {'\n'}
                    <Text style={Styles.hashtag}>#Hashtag</Text>
                </Text>

                {!expanded && (
                    <PaperButton onPress={toggleExpand}>Xem thêm</PaperButton>
                )}
                <Image source={{ uri: baiViet.image }} style={Styles.image} />
                <View style={Styles.bottom}>
                    <PaperButton mode='contained' style={{ marginRight: 5, borderRadius: 10 }}>Đăng ký</PaperButton>
                    <PaperButton mode='contained-tonal' style={{ marginRight: 5, borderRadius: 10 }}>Like</PaperButton>
                    <PaperButton onPress={handleModalVisible} mode='outlined'>Bình luận</PaperButton>
                    <CommentModal visible={modalVisible} onClose={handleCloseModal} ></CommentModal>
                </View>
            </>
            }
        </View>
    );
};


export default BaiViet;
