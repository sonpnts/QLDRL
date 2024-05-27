import React, { useState } from 'react';
import { Modal, View, BackHandler } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Styles from './Styles';

const CommentModal = ({ visible, onClose }) => {
    const [comment, setComment] = useState('');
    const [height, setHeight] = useState(45);
    const handlePostComment = () => {
        // Xử lý logic gửi bình luận đi
        console.log('Bình luận:', comment);
        // Đặt comment về rỗng và đóng modal
        setComment('');
        onClose();
    };

    React.useEffect(() => {
        const backAction = () => {
            onClose();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <Modal visible={visible} animationType="slide">
            <View style={Styles.container}>
                <View style={{ flex: 1, flexDirection: 'row', width: '85%', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <TextInput
                        placeholder="Bình luận...."
                        value={comment}
                        multiline={true}
                        autoCapitalize="none"
                        mode="outlined"
                        dense={true}
                        onChangeText={text => {
                            setComment(text);
                        }}
                        onContentSizeChange={event => {
                            setHeight(event.nativeEvent.contentSize.height);
                        }}
                        style={{ maxWidth: '80%', width: '80%', height: height }}
                    />
                    <Button mode='contained-tonal' onPress={handlePostComment}>Gửi</Button>
                    <Button mode='contained' onPress={onClose}>X</Button>
                </View>
            </View>
        </Modal>
    );
};

export default CommentModal;
