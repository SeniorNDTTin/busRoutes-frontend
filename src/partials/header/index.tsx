import { Link } from "react-router-dom";
import { Button } from "antd";
import busLogo from "../../assets/img/bus_logo.png"; 
import "./header.css";

function Header() {
  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link to="/">
          <img src={busLogo} alt="Transerco" />
          <span className="hanoibus-logo">HANOIBUS</span>
        </Link>
      </div>

      {/* Menu navigation */}
      <ul className="menu">
        <li className="menu-item">
          <Link to="/services">Dịch vụ thường</Link>
        </li>
        <li className="menu-item">
          <Link to="/pages/home/busroute">Danh Sách Tuyến</Link> 
        </li>
        <li className="menu-item">
          <Link to="/news">Tin tức</Link>
        </li>
        <li className="menu-item">
          <Link to="/routes">Lộ trình</Link>
        </li>
        <li className="menu-item">
          <Link to="/guide">Hướng dẫn</Link>
        </li>
        <li className="menu-item">
          <Link to="/feedback">Góp ý</Link>
        </li>
        <li className="menu-item">
          <Link to="/about">Giới thiệu</Link>
        </li>
      </ul>

      {/* Phần bên phải: Hotline và nút Đăng nhập */}
      <div className="auth-section">
        <div className="hotline">
          <span>HOTLINE: 1900 1296</span>
        </div>
        <div className="auth">
          <Button className="button-primary">Đăng nhập</Button>
        </div>
      </div>
    </header>
  );
}

export default Header;