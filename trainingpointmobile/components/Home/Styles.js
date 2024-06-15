import { StyleSheet,Dimensions } from "react-native";
const windowWidth = Dimensions.get('window').width;


export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        padding: 20
    }, subject: {
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
    containerqly: {
        flex: 1,
        marginTop: 20,
        marginLeft:10,
        padding: 20,
        flexDirection: "row", // Xếp các nút theo chiều dọc
        flexWrap: "wrap", // Các nút sẽ xuống dòng khi không đủ chỗ
        
      },
    buttonHomePly: {
        backgroundColor: '#007bff',
        padding: 10,
        marginBottom: 10,
        marginRight: 10,
        width: windowWidth / 2.5,
        alignItems: 'center',
        borderRadius: 20,
      },
      buttonTextQly: {
        color: '#fff',
        fontSize: 18,
      },
      buttonRow: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        marginBottom: 20,
      },
      icon: {
        marginRight: 10,
      },

});