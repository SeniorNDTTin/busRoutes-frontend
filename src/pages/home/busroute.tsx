import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spin, Row, Col, message } from "antd"; // 🛠 Import từ Ant Design
import { RightOutlined } from "@ant-design/icons"; // 🎨 Icon
import "./main.css";
import IBusRoute from "../../interfaces/busRoute";
import busRouteService from "../../services/busRoute.service";
import Footer from "../../partials/footer";
import Header from "../../partials/header";

function BusRoute() {
  const [loading, setLoading] = useState<boolean>(true);
  const [busRoutes, setBusRoutes] = useState<IBusRoute[]>([]);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusRoutes = async () => {
      try {
        const response = await busRouteService.get();
        if (response && response.data) {
          setBusRoutes(response.data);
        } else {
          setError("Không có dữ liệu tuyến xe bus.");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Lỗi khi tải dữ liệu tuyến xe bus.");
        setError("Lỗi khi tải dữ liệu tuyến xe bus.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusRoutes();
  }, []);

  return (
    <>
      <Header /> {/* 🏷️ Thêm Header vào */}
      <main className="main-content">
        <div className="bus-route-panel">
          <h1 className="home-title">DANH SÁCH TUYẾN XE BUS</h1>

          {loading ? (
            <div className="loading">
              <Spin size="large" /> {/* 🌀 Hiển thị spinner */}
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <Row gutter={[16, 16]} justify="center">
              {busRoutes.map((busRoute) => (
                <Col xs={24} sm={12} md={8} lg={6} key={busRoute._id}>
                  <Card
                    title={busRoute.name}
                    bordered={false}
                    className="bus-route-card"
                    hoverable
                  >
                    <p>📏 Khoảng cách: {busRoute.fullDistance} km</p>
                    <p>💰 Giá vé: {busRoute.fullPrice.toLocaleString()} VND</p>
                    <p>🚍 Chuyến đầu: {busRoute.firstFlightStartTime}</p>
                    <p>🕘 Chuyến cuối: {busRoute.lastFlightStartTime}</p>

                    <Button
                      type="primary"
                      icon={<RightOutlined />}
                      className="view-more-btn"
                      onClick={() => navigate(`/bus-route/${busRoute._id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </main>
      <Footer /> {/* 🏷️ Thêm Footer vào */}
    </>
  );
}

export default BusRoute;
