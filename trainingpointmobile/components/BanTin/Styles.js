import { StyleSheet } from "react-native";
export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        overflow: 'hidden',
    },
    baiViet: {
        borderWidth: 1,
        borderRadius: 20,
        width: '95%',
        marginBottom: 10,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
        width: '100%',
        maxWidth: "100%",
        overflow: 'hidden',
    },
    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: "100%",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    hashtag: {
        fontSize: 16,
        marginBottom: 10,
        alignSelf: "flex-start",
        color: "lightblue",
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        width: "100%",
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});