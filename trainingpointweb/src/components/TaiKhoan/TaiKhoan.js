import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Button as PaperButton, Card, Form } from 'react-bootstrap'; // Assuming you have react-bootstrap installed
import { endpoints } from '../../configs/APIs';
import Styles from './Styles';

const UserInfo = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [sv, setSv] = useState(null);
    const [lops, setLops] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [changedFields, setChangedFields] = useState([]);
    const [errors, setErrors] = useState({
        avatar: ""
    });

    const roles = {
        1: 'Admin',
        2: 'Cộng Tác Sinh Viên',
        3: 'Trợ Lý Sinh Viên',
        4: 'Sinh Viên'
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Simulating AsyncStorage behavior with local storage for demo purposes
                const token = localStorage.getItem("access-token");
                const reslop = await APIs.get(endpoints['lop']);
                const response = await APIs.get(endpoints['current_taikhoan'], {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setLops(reslop.data.results);
                setUser(response.data);

                // If the user is a student, fetch student information
                if (response.data.role === 4) {
                    const ressv = await APIs.get(endpoints['current_sinhvien'], {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setSv(ressv.data);
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const findClassName = (classId) => {
        const foundClass = Array.isArray(lops) && lops.find(lop => lop.id === classId);
        return foundClass ? foundClass.ten_lop : "";
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const selectedDate = date.toISOString().slice(0, 10); // Get yyyy-MM-dd format
        change("ngay_sinh", selectedDate);
        hideDatePicker();
    };

    const change = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
        if (!changedFields.includes(field)) {
            setChangedFields([...changedFields, field]);
        }
        setErrors(current => ({ ...current, [field]: "" })); // Clear error message when the field changes
    };

    const changesv = (field, value) => {
        setSv(current => ({ ...current, [field]: value }));
        if (!changedFields.includes(field)) {
            setChangedFields([...changedFields, field]);
        }
    };

    const handleChooseAvatar = async () => {
        const result = await window.prompt("Enter image URL (for demo only):");
        if (result) {
            change('avatar', result);
        }
    };

    const changinfo = async () => {
        try {
            const token = localStorage.getItem("access-token");
            const form = new FormData();
            changedFields.forEach(field => {
                if (field === 'avatar') {
                    // Add image data to FormData
                    form.append('avatar', user.avatar);
                } else {
                    // Update other data fields
                    form.append(field, user[field]);
                }
            });
            console.log(form);
            const response = await APIs.patch(endpoints['current_taikhoan'], form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/form-data'
                }
            });
            if (user.role === 4 && sv) {
                // Create object containing changed fields of student
                const updatedSvData = {};
                changedFields.forEach(field => {
                    updatedSvData[field] = sv[field];
                });
                console.log(updatedSvData);
                const ressv = await APIs.patch(endpoints['current_sinhvien'], updatedSvData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (ressv.status === 200) {
                    Alert.alert('Thông báo', 'Cập nhật thông tin sinh viên thành công!');
                    setChangedFields([]); // Clear list of changed fields after successful update
                }
            }
            if (response.status === 200) {
                Alert.alert('Thông báo', 'Cập nhật thông tin tài khoản thành công!');
                setChangedFields([]); // Clear list of changed fields after successful update
            }
        } catch (error) {
            console.error("Error updating information:", error);
        }
    };

    if (!user) {
        return (
            <View style={[Styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView>
            <View className="container">
                <Card className="my-3">
                    <Card.Body>
                        <View className="text-center mb-4">
                            <TouchableOpacity onPress={handleChooseAvatar}>
                                <Avatar.Image 
                                    src={changedFields.includes('avatar') ? user.avatar : user.avatar} 
                                    size={150} 
                                    className="mb-3"
                                />
                            </TouchableOpacity>
                            { errors.avatar ? <Text className="text-danger">{errors.avatar}</Text> : null}
                        </View>
                        <Form>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={user.username}
                                    onChange={(e) => change("username", e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={user.email}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group controlId="role">
                                <Form.Label>Loại tài khoản</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={roles[user.role]}
                                    disabled
                                />
                            </Form.Group>
                            {user.role === 4 && sv && (
                                <>
                                    <Form.Group controlId="ho_ten">
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sv.ho_ten}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="dia_chi">
                                        <Form.Label>Địa chỉ</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sv.dia_chi}
                                            onChange={(e) => changesv("dia_chi", e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="gioi_tinh">
                                        <Form.Label>Giới tính</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sv.gioi_tinh === 1 ? 'Nam' : 'Nữ'}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="lop">
                                        <Form.Label>Lớp</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={findClassName(sv.lop)}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="ngay_sinh">
                                        <Form.Label>Ngày sinh</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sv.ngay_sinh}
                                            disabled
                                        />
                                    </Form.Group>
                                </>
                            )}
                        </Form>
                    </Card.Body>
                </Card>
                <PaperButton 
                    variant="contained" 
                    className="my-3"
                    onClick={changinfo}
                    disabled={!changedFields.length} // Disable button when no information is changed
                >
                    Chỉnh sửa thông tin
                </PaperButton>
            </View>
        </ScrollView>
    );
};

export default UserInfo;
