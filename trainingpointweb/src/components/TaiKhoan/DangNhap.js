import React, { useState, useContext } from 'react';
// import { useHistory } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
// import axios from 'axios';
import MyContext from "../../configs/MyContext";
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import cookie from "react-cookies";

const DangNhap = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    // const history = useHistory();
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const login = async () => {
        
        try {
            let res = await APIs.post(endpoints['dang_nhap'], {
                'username': username,
                'password': password,
                'client_id': "sdUIX9LsM0sEZH8ipS6op9WPiNjEK8mGU2wV1v8u",
                'client_secret': "rUygoi2fiap7rBvHjOULOulzYWDItVEQ8xC2QkPgn8iD0xIuSNB6gFvUhtHMtJFxg8GGveIkIYK7JDClKknom3ETDZop5Le8BRezqehWcRywwGHTxb6xjtio5xwRLAq7",
                'grant_type': "password"
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 200) {
                cookie.save("token", res.data.access_token);
                console.info(res.data);
                let user = await authAPI(res.data.access_token).get(endpoints['current_taikhoan']);
                cookie.save('user', user.data);
                setRole(user.data.role);
                setIsAuthenticated(true);
                dispatch({
                    "type": "login",
                    "payload": user.data
                });
                let firebase = await APIs.get(endpoints['firebase'], {
                    headers: {
                        Authorization: `Bearer ${res.data.access_token}`,
                    },
                });
                cookie.save('firebase-token', firebase.data.token);
                console.log("Đăng nhập thành công!");
                nav("/main"); // Điều hướng tới trang chính sau khi đăng nhập thành công
            } else {
                setError("Sai tên đăng nhập hoặc mật khẩu");
            }

        } catch (ex) {
            console.error("Lỗi tại màn hình đăng nhập:", ex);
            setError("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
    };

    const register = () => {
        nav("/dang-ky");
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mb-4">Đăng Nhập</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Form.Group controlId="formBasicUsername" className="mb-3">
                            <Form.Label>Tên đăng nhập</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Hiển thị mật khẩu"
                                onChange={toggleShowPassword}
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={login} className="mb-3">
                            Đăng nhập
                        </Button>
                        <Button variant="secondary" onClick={register}>
                            Đăng ký
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default DangNhap;
