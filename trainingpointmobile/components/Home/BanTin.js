import React from 'react'
import { ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';


const BanTin = ({ route, navigation }) => {

    const dangNhap = () => {
        navigation.replace("DangNhap");
    }

    return (
        <ScrollView>
            <Text>Bản tin</Text>
            <Button onPress={dangNhap}>Test</Button>
        </ScrollView>
    )
}

export default BanTin;