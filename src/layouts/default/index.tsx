import { Outlet } from "react-router-dom";

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

import { ToastContainer } from 'react-toastify';

import Header from "../../partials/header";
import Footer from "../../partials/footer";

import "./default.css";

function LayoutDefault() {
  return (
    <>
      <Header />

      <main className="main">
        <ToastContainer />

        <Layout>
          <Content className="layout-content">
            <Outlet />
          </Content>
        </Layout>
      </main>

      <Footer />
    </>
  );
}

export default LayoutDefault;