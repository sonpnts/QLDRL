import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button as PaperButton } from 'react-native-paper'
import RenderHtml from 'react-native-render-html';
import Styles from './Styles';
import CommentModal from './CommentModal';
import APIs, { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BaiViet = (props, { navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [baiViet, setBaiViet] = useState(null);
    const [author, setAuthor] = useState(null);
    const [tags, setTags] = useState([]);
    
    const [liked, setLiked] = useState(false);
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
        // console.log(auth.data);
        setAuthor(auth.data);
    }

    const renderContent = () => {
        if (expanded) {
            return <RenderHtml contentWidth={300} source={{ html: baiViet.content }} />;
        } else {
            const shortContent = baiViet.content.split(' ').slice(0, 20).join(' ') + '...';
            return <RenderHtml contentWidth={300} source={{ html: shortContent }} />;
        }
    };

    const getTags = async (id) => {
        let response = await APIs.get(endpoints['baiviet_tag'](id));
        console.log(response.data);
        setTags(response.data);
    };


    const checkLiked = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await APIs.get(endpoints['baiviet_like'](id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLiked(response.data.liked);
        } catch (error) {
            console.error("Error checking liked status:", error);
        }
    };

   const handleLike = async (id) => {
    try {
        const token = await AsyncStorage.getItem("access-token");
        
        if (liked) {
            // Nếu đã like, gửi yêu cầu "unlike" bằng cách đặt active thành false
            await APIs.post(endpoints['baiviet_like'](id), null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLiked(false);
        } else {
            // Nếu chưa like, gửi yêu cầu "like"
            await APIs.post(endpoints['baiviet_like'](id), null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLiked(true);
        }
    } catch (error) {
        console.error("Error handling like:", error);
    }
};

    React.useEffect(() => {
        if (props && props.baiviet) {
            getAuthor(props.baiviet.id);
            setBaiViet(props.baiviet);
            getTags(props.baiviet.id);
        }
    }, [props]);

    React.useEffect(() => {
        // console.log(author);
        // console.log(baiViet);
        // console.log(tags);
    }, [baiViet, author])

    return (
        <View style={[Styles.container, Styles.baiViet]}>
            {/* {author === null ? <></> :
                <View style={Styles.header}>
                    <Image source={{ uri: author.avatar }} style={Styles.avatar} />
                    <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.username}>
                        {author.username}
                    </Text>
                </View>
            } */}
            {baiViet === null ? <></> : <>
                <Text numberOfLines={1} ellipsizeMode="tail" style={Styles.title}>{baiViet.title}</Text>

                <Text numberOfLines={expanded ? 99 : 4} ellipsizeMode="tail" style={Styles.content} onPress={toggleExpand}>
                {renderContent()}
                    {'\n'}
                    <Text style={Styles.hashtag}>
                            {tags.map(tag => `#${tag.name} `)}
                        </Text>
                </Text>

                {!expanded && (
                    <PaperButton onPress={toggleExpand}>Xem thêm</PaperButton>
                )}
                <Image source={{ uri: baiViet.image }} style={Styles.image} />
                <View style={Styles.bottom}>
                    <PaperButton mode='contained-tonal' style={{ marginRight: 5, borderRadius: 10 }} onPress={() => handleLike(baiViet.id)}>
                            {liked ? <Text style={{ fontWeight: 'bold' }}>Liked</Text> : 'Like'}
                        </PaperButton>
                    <PaperButton onPress={handleModalVisible} mode='outlined'>Bình luận</PaperButton>
                    <PaperButton mode='contained' style={{ marginRight: 5, borderRadius: 10 }}>Đăng ký</PaperButton>
                    
                    <CommentModal visible={modalVisible} onClose={handleCloseModal} ></CommentModal>
                </View>
            </>
            }
        </View>
    );
};


export default BaiViet;
