import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap'; // Import các thành phần từ Bootstrap
import axios from 'axios';
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';

const OTP = ({ route, history }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [randomOTP, setRandomOTP] = useState(null);
    const refs = useRef([]);

    useEffect(() => {
        let randomNumber = Math.floor(Math.random() * 10000);
        let otpNum = randomNumber.toString().padStart(4, '0');
        setRandomOTP(otpNum);
    }, []);

    useEffect(() => {
        if (randomOTP) {
            console.log(randomOTP);
            if (route.params && route.params.email) {
                const email = route.params.email;
                sendEmail(email);
            }
        }
    }, [randomOTP]);

    // Hàm gửi mail
    const sendEmail = async (email) => {
        try {
            const response = await axios.post(endpoints['send_mail'], {
                subject: 'Xác thực mã OTP tạo tài khoản sinh viên',
                message: `Mã OTP của bạn là ${randomOTP}`,
                recipient: email,
            });
            // console.log(response.data); // In ra dữ liệu trả về từ Django
        } catch (error) {
            console.error(error);
        }
    };

    // Hàm xử lý thay đổi giá trị của mỗi ô nhập
    const handleChangeText = (num, index) => {
        if (/^\d*$/.test(num) && num.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = num;
            setOtp(newOtp);

            if (index < otp.length - 1 && num.length === 1) {
                // Check if the ref is defined before calling focus()
                if (refs.current[index + 1]) {
                    refs.current[index + 1].focus();
                }
            }
        }
    };

    // Xử lý khi nhấn nút Xác nhận
    const handleSubmit = () => {
        const otpString = otp.join('');
        if (otpString === randomOTP) {
            history.push('/dang-ky', { success: true });
        } else {
            Alert.alert("Mã OTP nhập không đúng!", "Vui lòng kiểm tra lại OTP");
        }
    };

    return (
        <Container className={`${Styles.container} ${Styles.align_item_center} ${Styles.justify_content_center}`}>
            <h2 className={`${Styles.margin_bottom_40} ${Styles.subject}`}>Nhập mã OTP</h2>
            <Row className="justify-content-center align-items-center mb-4">
                {otp.map((value, index) => (
                    <Col key={index}>
                        <Form.Control
                            ref={ref => refs.current[index] = ref}
                            className={Styles.OTP_input}
                            value={value}
                            onChange={(e) => handleChangeText(e.target.value, index)}
                            type="number"
                            maxLength={1}
                            onKeyDown={(e) => {
                                if (e.keyCode === 13 && index < otp.length - 1) {
                                    refs.current[index + 1].focus();
                                }
                            }}
                        />
                    </Col>
                ))}
            </Row>
            <Row className="justify-content-center mb-5">
                <Button className="btn btn-primary" onClick={handleSubmit}>Xác nhận</Button>
            </Row>
        </Container>
    );
};

export default OTP;
