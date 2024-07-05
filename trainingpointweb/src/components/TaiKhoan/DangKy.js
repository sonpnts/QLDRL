import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from 'axios';
import APIs, { endpoints } from "../../configs/APIs";

const DangKy = ({ route }) => {
    const [user, setUser] = useState({
        email: "",
        username: "",
        password: "",
        avatar: "",
        role: "4"
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        password: "",
        avatar: ""
    });
    // const history = useHistory();

    const change = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
        setErrors(current => ({ ...current, [field]: "" }));
    };

    const handleEmailChange = (e) => {
        change("email", e.target.value);
    };

    const handlePasswordChange = (e) => {
        change('password', e.target.value);
    };

    const handleUsernameChange = (e) => {
        change('username', e.target.value);
    };

    const handleChooseAvatar = async (e) => {
        const file = e.target.files[0];
        if (file) {
            change('avatar', file);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setErrors(current => ({ ...current, confirmPassword: "" }));
    };

    const validateEmail = (email) => {
        const re = /^\d{10}[a-zA-Z]+@ou\.edu\.vn$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateDangKy = async () => {
        let valid = true;
        let newErrors = { email: "", username: "", password: "", confirmPassword: "", avatar: "" };

        if (!validateEmail(user.email)) {
            newErrors.email = 'Email nhập không hợp lệ! Vui lòng nhập dạng 10 số + tên @ou.edu.vn';
            valid = false;
        }
        if (!validatePassword(user.password)) {
            newErrors.password = 'Password phải có từ 8 ký tự trở lên';
            valid = false;
        }
        if (user.password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
            valid = false;
        }
        if (!user.avatar) {
            newErrors.avatar = 'Avatar không tồn tại!';
            valid = false;
        }
        if (!user.username) {
            newErrors.username = 'Username không được để trống!';
            valid = false;
        }

        setErrors(newErrors);

        if (valid) {
            try {
                const check = await APIs.get(`${endpoints['tai_khoan_is_valid']}?email=${user.email}&username=${user.username}`);
                if (check.status === 200 && check.data.is_valid) {
                    Alert.alert('Có lỗi gì đó xảy ra', 'Tài khoản sinh viên đã tồn tại!');
                } else {
                    setSuccess(true);
                }
            } catch (ex) {
                setLoading(false);
                Alert.alert('Có lỗi gì đó đã xảy ra', 'Tài khoản sinh viên đã tồn tại!');
            }
        }
    };

    const PostTaiKhoan = async () => {
        if (success) {
            try {
                setLoading(true);
                let form = new FormData();
                for (let key in user) {
                    if (key === "avatar") {
                        form.append(key, user.avatar);
                    } else {
                        form.append(key, user[key]);
                    }
                }

                let res = await APIs.post(endpoints['dang_ky'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setLoading(false);
                if (res.status === 201) {
                    Alert.alert('Tạo tài khoản thành công!');
                    nav("/sinhviendangky", { email: user.email });
                }

            } catch (ex) {
                console.log(ex);
                Alert.alert('Có lỗi gì đó đã xảy ra trong lúc tạo tài khoản!', ex.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const login = () => {
        nav("/dang-nhap");
    };

    useEffect(() => {
        if (route && route.success) {
            setSuccess(route.success);
        }
    }, [route]);

    useEffect(() => {
        if (success) {
            PostTaiKhoan();
        }
    }, [success]);

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mb-4">Đăng Ký</h2>
                    {errors.avatar && <Alert variant="danger">{errors.avatar}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh đại diện</Form.Label>
                            <Form.Control type="file" onChange={handleChooseAvatar} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email"
                                value={user.email}
                                onChange={handleEmailChange}
                            />
                            {errors.email && <Alert variant="danger">{errors.email}</Alert>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={user.username}
                                onChange={handleUsernameChange}
                            />
                            {errors.username && <Alert variant="danger">{errors.username}</Alert>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                value={user.password}
                                onChange={handlePasswordChange}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Hiển thị mật khẩu"
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            {errors.password && <Alert variant="danger">{errors.password}</Alert>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                            {errors.confirmPassword && <Alert variant="danger">{errors.confirmPassword}</Alert>}
                        </Form.Group>
                        {loading ? <Spinner animation="border" /> : 
                            <>
                                <Button variant="primary" className="mb-3" onClick={validateDangKy}>
                                    Đăng ký
                                </Button>
                            </>
                        }
                        <Button variant="secondary" onClick={login}>
                            Đã có tài khoản? Đăng nhập
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default DangKy;
