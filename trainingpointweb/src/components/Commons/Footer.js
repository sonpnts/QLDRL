import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Styles1.css';

const Footer = () => {
    return (
        <footer className="footer1">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Về Chúng Tôi</h5>
                        <p>Công ty XYZ chuyên cung cấp các giải pháp phần mềm và dịch vụ IT.</p>
                    </Col>
                    <Col md={4}>
                        <h5>Liên Hệ</h5>
                        <p>Email: info@xyz.com</p>
                        <p>Điện thoại: 0123456789</p>
                    </Col>
                    <Col md={4}>
                        <h5>Theo Dõi Chúng Tôi</h5>
                        <p><a href="https://www.facebook.com" className="footer-link">Facebook</a></p>
                        <p><a href="https://www.twitter.com" className="footer-link">Twitter</a></p>
                        <p><a href="https://www.linkedin.com" className="footer-link">LinkedIn</a></p>
                    </Col>
                </Row>
                <Row>
                    <Col md="auto">
                        <p className="text-center">© 2024 Công ty XYZ. All rights reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
