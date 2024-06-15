import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  multilineInput: {
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  picker: {
    // height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#3498db', // Màu xanh nhạt hơn
    borderRadius: 20, // Đổi radius bo tròn thành 20
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'center', // Chỉnh chữ nằm giữa nút
   
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dialogButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  dialogButtonText: {
    color: '#000',
    fontSize: 16,
    marginRight:10,
    textAlign: 'center',
  },
  containerDSHD: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerdshd: {
    // height: 50,
    width: '100%',
    // marginBottom: 20,
    borderColor: '#ccc'
  },
  item: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontWeight: 'bold',
  },
  createPostButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  containercrepost: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  labelcrepost: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  marginBottomcrepost: {
    marginBottom: 10,
  },
  activityItem: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
