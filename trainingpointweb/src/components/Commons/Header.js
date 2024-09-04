import React, { useContext, useState } from "react";
import { Badge, Button, Col, Container, Form, Image, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContext";
import APIs, { endpoints } from "../../configs/APIs";
import './Styles.css';

const Header = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [hovered, setHovered] = useState(null);
    const nav = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch({ type: "logout" });
        nav('/'); // Navigate to the home page or any other desired route after logout
    };

    const handleNavigate = (e, path) => {
        e.preventDefault();
        nav(path);
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary1 navbar-sticky">
            <Container>
                <Navbar.Brand href="/" style={{ fontWeight: 'bold' }}>QUẢN LÝ ĐIỂM RÈN LUYỆN</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link 
                            className="nav-link"              
                            onClick={(e) => handleNavigate(e, "/")}
                        >
                            <i className="fa-solid fa-house"></i> Trang chủ
                        </Nav.Link>
                        {user === null ? (
                            <>
                                {/* <Nav.Link 
                                    className="nav-link"
                                    onClick={(e) => handleNavigate(e, "/dang-ky")}
                                >
                                    <i className="fa-solid fa-user-plus"></i> Đăng ký
                                </Nav.Link> */}
                                <Nav.Link 
                                    className="nav-link"
                                    onClick={(e) => handleNavigate(e, "/dang-nhap")}
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i> Đăng nhập
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                {user.role === 4 && (
                                    <>
                                        <Nav.Link 
                                            className="nav-link"
                                            onClick={(e) => handleNavigate(e, "/chat")}
                                        >
                                            <i className="fa-solid fa-comments"></i> Chat
                                        </Nav.Link>
                                        <Nav.Link 
                                            className="nav-link"
                                            onClick={(e) => handleNavigate(e, "/hdnk-diem-danh")}
                                        >
                                            <i className="fa-regular fa-star"></i> Xem thành tích cá nhân
                                        </Nav.Link>
                                        <Nav.Link 
                                            className="nav-link"
                                            onClick={(e) => handleNavigate(e, "/hdnk-chua-diem-danh")}
                                        >
                                            <i className="fa-brands fa-slack"></i> Báo thiếu
                                        </Nav.Link>
                                    </>
                                )}
                                {(user.role === 2 || user.role === 3) && (
                                    <>
                                        <NavDropdown title={<span><i className="fa-solid fa-sliders"></i> Hoạt động</span>} id="basic-nav-dropdown">
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/quan-ly-hoat-dong")} className="nav-link">
                                                <i className="fa-solid fa-tasks"></i> Quản lý các hoạt động
                                            </NavDropdown.Item>
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/tao-hoat-dong")} className="nav-link">
                                                <i className="fa-solid fa-plus"></i> Tạo hoạt động
                                            </NavDropdown.Item>
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/hoat-dong-chua-co-bai-viet")} className="nav-link">
                                                <i className="fa-solid fa-pen"></i> Tạo bài viết
                                            </NavDropdown.Item>
                                            {/* <NavDropdown.Item onClick={(e) => e.preventDefault()} className="nav-link">
                                                <i className="fa-solid fa-trash"></i> Xem lại hoạt động đã xóa
                                            </NavDropdown.Item> */}
                                        </NavDropdown>
                                        <NavDropdown title={<span><i className="fa-solid fa-gears"></i> Thao tác</span>} id="basic-nav-dropdown">
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/diem-danh")}>
                                                <i className="fa-solid fa-check"></i> Điểm danh sinh viên
                                            </NavDropdown.Item>
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/danh-sach-bao-thieu")}>
                                                <i className="fa-solid fa-exclamation"></i> Báo thiếu
                                            </NavDropdown.Item>
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/export-bao-cao")} title="Xuất báo cáo">
                                                <i className="fa-solid fa-file-export"></i> Xuất báo cáo
                                            </NavDropdown.Item>
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/danh-sach-sinh-vien")}>
                                                <i className="fa-solid fa-star"></i> Xem thành tích sinh viên
                                            </NavDropdown.Item>
                                            {user.role === 2 && (
                                                <NavDropdown.Item onClick={(e) => handleNavigate(e, "/them-tro-ly-khoa")}>
                                                    <i className="fa-solid fa-user-plus"></i> Thêm trợ lý sinh viên khoa
                                                </NavDropdown.Item>
                                            )}
                                            <NavDropdown.Item onClick={(e) => handleNavigate(e, "/chat-list")}>
                                                <i className="fa-solid fa-comments"></i> Tin nhắn hỗ trợ
                                            </NavDropdown.Item>
                                        </NavDropdown>
                                    </>
                                )}
                                <Nav.Link 
                                    className={'nav-link text-success'}
                                    onClick={(e) => handleNavigate(e, "/profile")}
                                >
                                    <Image src={user.avatar} width="30" height="30" roundedCircle />
                                </Nav.Link>
                                <Nav.Link href="/profile" style={{marginLeft:0}} className="nav-link text-info" onClick={(e) => e.preventDefault()}>
                                    {user.username}
                                </Nav.Link>
                                <Nav.Link 
                                    onClick={handleLogout} 
                                    className="nav-link"
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse> 
            </Container>
        </Navbar>
    );
}

export default Header;
