import React, { useState, useEffect } from 'react';
import { Modal, View, BackHandler, Alert, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import Styles from './Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';
import moment from 'moment';

const CommentModal = ({ visible, onClose, postId }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    
    const [height, setHeight] = useState(80);
    const [isInputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const getAuthor = async (id) => {
        const token = await AsyncStorage.getItem("access-token");
        let auth = await APIs.get(endpoints['owner_binh_luan'](id));
        return auth.data;
    }

    const fetchComments = async () => {
        try {
            const response = await APIs.get(endpoints['lay_binh_luan'](postId));
            // const fetchedComments = response.data.results;
            const fetchedComments = response.data;
            const updatedComments = await Promise.all(fetchedComments.map(async (c) => {
                const author = await getAuthor(c.id);
                return { ...c, author: author ? author.username : "Unknown" };
            }));
            
            updatedComments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

            setComments(updatedComments);
            
            // console.log(response.data.results);
        } catch (error) {
            console.error('Error fetching comments:', error);
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
            fetchComments();
            Keyboard.dismiss();
            setInputFocused(false);
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={Styles.modalBackground}>
                    <View style={Styles.modalContainer}>
                        <ScrollView style={{ width: '100%' }}>
                            {comments.map((c, index) => (
                                <View key={index} style={Styles.commentContainer}>
                                    <Text style={Styles.commentAuthor}>{c.author}</Text>
                                    <Text style={Styles.commentDate}>
                                        {moment(c.created_date).format('HH:mm - DD/MM/YYYY ')}
                                    </Text>
                                    <Text style={Styles.commentContent}>{c.content}</Text>
                                </View>
                            ))}
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
                            style={[Styles.textInput, { height: height, marginBottom: isInputFocused ? 10 : 0 }]}
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
