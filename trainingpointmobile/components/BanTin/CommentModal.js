import React, { useState, useEffect } from 'react';
import { Modal, View, BackHandler, Alert, ScrollView, Keyboard, TouchableWithoutFeedback, RefreshControl , ActivityIndicator} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import Styles from './Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';
import moment from 'moment';
import { isCloseToBottom } from '../Utils/tobottom';

const CommentModal = ({ visible, onClose, postId }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = React.useState(false);
    const [height, setHeight] = useState(80);
    const [isInputFocused, setInputFocused] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId, page]);

    const getAuthor = async (id) => {
        const token = await AsyncStorage.getItem("access-token");
        let auth = await APIs.get(endpoints['owner_binh_luan'](id));
        return auth.data;
    }

    const fetchComments = async () => {
        if(page>0){
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("access-token");
                const res = await APIs.get(endpoints['lay_binh_luan'](postId, page),{
                    headers:{
                        'Authorization': `Bearer ${token}`
                    }
                });
                const fetchedComments = res.data.results;
                const updatedComments = await Promise.all(fetchedComments.map(async (c) => {
                    const author = await getAuthor(c.id);
                    return { ...c, author: author ? author.username : "Unknown" };
                }));
                updatedComments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                if (res.data.next === null)
                    setPage(0);
    
                if (page === 1)
                    setComments(updatedComments);
                else
                    setComments(current => {
                        return [...current, ...updatedComments];
                    });
               
            } catch (error) {
                console.error('Error fetching comments:', error);
                
            }
            finally {
                setLoading(false);
            }
        }
        
    };

    const handlePostComment = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            await APIs.post(endpoints['binh_luan'](postId), { content: comment }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            Alert.alert('Bình luận thành công!');
            setComment('');
            setPage(1);
            setComments([]);
            fetchComments();
            Keyboard.dismiss();
            setInputFocused(false);
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            setTimeout(() => {
                setPage(page + 1);
            }, 100);
        }
    }

    useEffect(() => {
        const backAction = () => {
            onClose();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [onClose]);



    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
            <TouchableWithoutFeedback >
                <View style={Styles.modalBackground}>
                    <View style={Styles.modalContainer}>
                        <ScrollView onScroll={loadMore} style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} >
                            <RefreshControl onRefresh={()=> fetchComments()}/>
                            {loading && <ActivityIndicator />}
                                {comments.map((c, index) => (
                                    <View key={index} style={Styles.commentContainer}>
                                        <Text style={Styles.commentAuthor}>{c.author}</Text>
                                        <Text style={Styles.commentDate}>
                                            {moment(c.created_date).format('HH:mm - DD/MM/YYYY ')}
                                        </Text>
                                        <Text style={Styles.commentContent}>{c.content}</Text>
                                    </View>
                                ))}
                            {loading && page > 1 && <ActivityIndicator />}
                            {loading && page > 1 && <Text style={{textAlign: 'center', marginVertical: 10}}>Đang tải...</Text>}
                            </ScrollView>
                       
                        <TextInput
                            placeholder="Bình luận...."
                            value={comment}
                            multiline={true}
                            autoCapitalize="none"
                            mode="outlined"
                            dense={true}
                            onChangeText={text => setComment(text)}
                            onContentSizeChange={event => setHeight(event.nativeEvent.contentSize.height)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            style={[Styles.textInput, {marginBottom: isInputFocused ? 200 : 0 }]}
                            onSubmitEditing={handlePostComment}
                        />
                        <View style={Styles.buttonContainer}>
                            <Button mode="contained-tonal" onPress={handlePostComment} style={Styles.buttoncomment}>
                                Gửi
                            </Button>
                            <Button mode="contained" onPress={onClose} style={Styles.buttoncomment}>
                                Hủy
                            </Button>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CommentModal;
