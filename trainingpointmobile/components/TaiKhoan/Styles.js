import { StyleSheet } from "react-native";

export default StyleSheet.create({
    containerlogin: {
        flex: 1,
        marginTop: 20,
        padding: 20
    }, 
    subject: {
        fontSize: 30,
        fontWeight: "bold",
    }, row: {
        flexDirection: "row"
    }, wrap: {
        flexWrap: "wrap"
    }, margin: {
        margin: 5
    }, avatar: {
        width: 200,
        height: 200,
        borderRadius: 100
    }, margin_bottom_40: {
        marginBottom: 40
    }, margin_bottom_20: {
        marginBottom: 20
    }, align_item_center: {
        alignItems: "center"
    }, justify_content_center: {
        justifyContent: "center"
    }, OTP_input: {
        borderWidth: 0.5,
        borderRadius: 10,
        width: 60,
        height: 60,
        marginHorizontal: 5,
        textAlign: 'center',
        fontSize: 30
    },
    error: {
        color: 'red',
        marginBottom: 10,
        marginLeft: 10,
    },
    container: {
        flex: 1,
        marginTop: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        width: '90%',
        marginVertical: 20,
    },
    cardContent: {
        alignItems: 'center',
    },
    title: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 16,
        color: '#777',
    },
    button: {
        marginTop: 20,
        paddingHorizontal: 40,
        paddingVertical: 10,
    },
    input: {
        marginBottom: 10,
        width: '100%',
    },
    avatar: {
        marginBottom: 50,
    },
    showPasswordButton: {
        marginLeft: 10, 
    },
    passwordInput: {
        flex: 1,
        height: 40, 
        
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
       
        borderColor: '#CCCCCC', // Màu border
        borderRadius: 5, // Bo góc border
        // paddingHorizontal: 10, // Padding ngang
    },


});