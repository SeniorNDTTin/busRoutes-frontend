import { Link } from "react-router-dom";

import { Button } from "antd";

import "./header.css";

function Header() {
  return (
    <>
      <header className="header">
        <div className="logo">
          <Link to={"/"}>Logo</Link>
        </div>
        <ul className="menu">
          <li className="menu-item">
            <Link to={"/topics"}>Chủ Đề</Link>
          </li>
        </ul>
        <div className="auth">
          <Button className="button-primary">Đăng nhập</Button>
        </div>
      </header>
    </>
  );
}

export default Header;