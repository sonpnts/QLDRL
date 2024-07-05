import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import DateTimePicker from 'react-datetime-picker';
import APIs, { endpoints } from '../../configs/APIs';
import Styles from './Styles';

const SinhVienDangKy = ({ history }) => {
    const { email } = useParams();
    const [sv, setSv] = useState({
        email: email || '',
        mssv: email ? email.slice(0, 10) : '',
        ho_ten: '',
        ngay_sinh: new Date('2000-01-01'),
        lop: '',
        dia_chi: '',
        gioi_tinh: '1',
    });
    const [loading, setLoading] = useState(false);
    const [khoas, setKhoas] = useState([]);
    const [lops, setLops] = useState([]);
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');

    useEffect(() => {
        fetchKhoas();
    }, []);

    const fetchKhoas = async () => {
        try {
            const response = await APIs.get(endpoints['khoa']);
            if (response.data && Array.isArray(response.data)) {
                setKhoas(response.data);
            } else {
                setKhoas([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu khoa');
        }
    };

    const fetchLops = async (khoaId) => {
        try {
            const response = await APIs.get(`${endpoints['khoa']}${khoaId}/lops/`);
            if (response.data && Array.isArray(response.data)) {
                setLops(response.data);
            } else {
                setLops([]);
                console.error('Dữ liệu trả về không phải là một mảng');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu lớp');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateFields()) return;

        setLoading(true);

        try {
            const response = await APIs.post(endpoints['sinh_vien'], sv, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 201) {
                console.log(response.data);
                Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
                // history.push('/dang-nhap');
                history.goBack();
            } else {
                Alert.alert('Thất bại', 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            Alert.alert('Lỗi', error.message);
        } finally {
            setLoading(false);
        }
    };

    const validateFields = () => {
        const { email, ho_ten, ngay_sinh, lop, dia_chi, gioi_tinh } = sv;
        if (!email || !ho_ten || !ngay_sinh || !lop || !dia_chi || !gioi_tinh) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
            return false;
        }
        return true;
    };

    const handleDateChange = (date) => {
        setSv({ ...sv, ngay_sinh: date });
    };

    return (
        <Container className={Styles.containerlogin}>
            <h2 className={`${Styles.subject} ${Styles.align_item_center}`}>
                Cập nhật thông tin sinh viên
            </h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={sv.email}
                        readOnly
                    />
                </Form.Group>

                <Form.Group controlId="formHoTen">
                    <Form.Label>Họ tên</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập họ tên"
                        value={sv.ho_ten}
                        onChange={(e) => setSv({ ...sv, ho_ten: e.target.value })}
                    />
                </Form.Group>

                <Form.Group controlId="formNgaySinh">
                    <Form.Label>Ngày sinh</Form.Label>
                    <DateTimePicker
                        onChange={handleDateChange}
                        value={sv.ngay_sinh}
                        format="dd/MM/yyyy"
                    />
                </Form.Group>

                <Form.Group controlId="formKhoa">
                    <Form.Label>Chọn khoa</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedKhoa}
                        onChange={(e) => {
                            setSelectedKhoa(e.target.value);
                            fetchLops(e.target.value);
                        }}
                    >
                        <option value="">Chọn khoa</option>
                        {khoas.map((khoa) => (
                            <option key={khoa.id} value={khoa.id}>
                                {khoa.ten_khoa}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formLop">
                    <Form.Label>Chọn lớp</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedLop}
                        onChange={(e) => setSv({ ...sv, lop: e.target.value })}
                        disabled={!selectedKhoa}
                    >
                        <option value="">Chọn lớp</option>
                        {lops.map((lop) => (
                            <option key={lop.id} value={lop.id}>
                                {lop.ten_lop}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDiaChi">
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập địa chỉ"
                        value={sv.dia_chi}
                        onChange={(e) => setSv({ ...sv, dia_chi: e.target.value })}
                    />
                </Form.Group>

                <Form.Group controlId="formGioiTinh">
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Control
                        as="select"
                        value={sv.gioi_tinh}
                        onChange={(e) => setSv({ ...sv, gioi_tinh: e.target.value })}
                    >
                        <option value="1">Nam</option>
                        <option value="2">Nữ</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Cập nhật
                </Button>
            </Form>
        </Container>
    );
};

export default SinhVienDangKy;
