import { Link } from "react-router-dom";
import busLogo from "../../assets/img/bus_logo.png"; // Import logo từ thư mục src/assets/img
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section logo-section">
          <Link to="/">
            <img src={busLogo} alt="Transerco" />
            <span className="hanoibus-logo">HANOIBUS</span>
          </Link>
        </div>

        <div className="footer-section links">
          <h4>Thông tin</h4>
          <ul>
            <li>
              <Link to="/services">Dịch vụ thường</Link>
            </li>
            <li>
              <Link to="/routes">Lộ trình</Link>
            </li>
            <li>
              <Link to="/guide">Hướng dẫn</Link>
            </li>
            <li>
              <Link to="/about">Giới thiệu</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Liên hệ</h4>
          <p>HOTLINE: 1900 1296</p>
          <p>Email: support@hanoibus.vn</p>
          <p>Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội</p>
        </div>

        <div className="footer-section social">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            <a href="https://facebook.com/hanoibus" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="https://twitter.com/hanoibus" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://instagram.com/hanoibus" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright © 2025 HANOIBUS. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;