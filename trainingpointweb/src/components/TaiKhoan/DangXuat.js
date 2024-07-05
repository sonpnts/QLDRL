import { useContext } from "react";
import { Button } from "react-bootstrap"; // Thay thế react-native-paper bằng react-bootstrap hoặc các thư viện UI khác cho ReactJS
import MyContext from "../../configs/MyContext";
import cookie from "react-cookies";


const DangXuat = () => {
    const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

    const logout = () => {
        dispatch({
            type: "logout"
        });
        setRole(null);
        console.log("Đăng xuất thành công!");

        // Xử lý localStorage trong ReactJS
        cookie.save('access-token', "null");
        setIsAuthenticated(false);
        cookie.save('firebase-token', "null");
    };

    return (
        <Button variant="outline-danger" onClick={logout} style={{ marginTop: 10 }} className="mx-2">
            Đăng xuất
        </Button>
    );
};

export default DangXuat;
