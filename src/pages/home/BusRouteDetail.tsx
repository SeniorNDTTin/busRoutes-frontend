import { Card, Descriptions, Button, Modal, Collapse, List ,Input} from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import busRouteService from "../../services/busRoute.service";
import busRouteDetailService from "../../services/busRouteDetail.service";
import busStopService from "../../services/busStop.service";
import directionService from "../../services/direction.service";
import oneWayTicketPriceService from "../../services/oneWayTicketPrices.service.ts";
import IBusRoute from "../../interfaces/busRoute";
import IBusRouteDetail from "../../interfaces/busRouteDetail";
import IBusStop from "../../interfaces/busStop";
import IDirection from "../../interfaces/direction";
import IOneWayTicketPrice from "../../interfaces/OneWayTicketPrices";

const { Panel } = Collapse;

const BusRouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [busRoute, setBusRoute] = useState<IBusRoute | null>(null);
  const [routeDetails, setRouteDetails] = useState<IBusRouteDetail[]>([]);
  const [busStops, setBusStops] = useState<IBusStop[]>([]);
  const [directions, setDirections] = useState<IDirection[]>([]);
  const [dailyTicket, setDailyTicket] = useState<IOneWayTicketPrice[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketLoading, setTicketLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isTicketInfoVisible, setIsTicketInfoVisible] = useState<boolean>(false);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchBusDetails = async () => {
      if (!id) {
        setError("Không có ID tuyến xe được cung cấp.");
        setLoading(false);
        return;
      }

      try {
        const [routeResponse, detailsResponse, stopsResponse, directionsResponse] = await Promise.all([
          busRouteService.getById(id),
          busRouteDetailService.get(),
          busStopService.get(),
          directionService.get(),
        ]);

        if (!routeResponse?.data) {
          throw new Error("Không tìm thấy thông tin tuyến xe từ API.");
        }
        setBusRoute(routeResponse.data);

        const filteredDetails = (detailsResponse?.data || []).filter(
          (detail: IBusRouteDetail) => String(detail.busRouteId) === String(id)
        );
        setRouteDetails(filteredDetails);

        setBusStops(stopsResponse?.data || []);
        setDirections(directionsResponse?.data || []);

        console.log("Bus Route:", routeResponse.data);
        console.log("Filtered Route Details:", filteredDetails);
        console.log("Bus Stops:", stopsResponse?.data);
        console.log("Directions:", directionsResponse?.data);
      } catch (error) {
        setError("Lỗi khi tải dữ liệu từ server: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [id]);

  const getBusStopName = (busStopId: string) => {
    if (!busStops.length) return "Đang tải trạm dừng...";
    const stop = busStops.find((s) => s._id === busStopId);
    return stop ? stop.name : `Không tìm thấy trạm (${busStopId})`;
  };

  const getDirectionDescription = (directionId: string) => {
    if (!directions.length) return "Đang tải hướng...";
    const direction = directions.find((d) => d._id === directionId);
    console.log(`Direction ID: ${directionId}, Found Direction:`, direction);
    return direction ? direction.description : `Không tìm thấy hướng (${directionId})`;
  };

  const showTicketModal = () => {
    setIsTicketModalVisible(true);
  };

  const handleTicketModalCancel = () => {
    setIsTicketModalVisible(false);
  };

  const handleBuyDailyTicket = async () => {
    if (!id || !busRoute) {
      setError("Không có ID tuyến xe hoặc thông tin tuyến xe để tải thông tin vé.");
      return;
    }

    setTicketLoading(true);
    setIsTicketModalVisible(false);

    try {
      const PRICE_PER_KM = 1000;
      const calculatedPrice = busRoute.fullDistance * PRICE_PER_KM;

      const dailyTicketData: IOneWayTicketPrice[] = [
        {
          busRouteId: id,
          unitPrice: calculatedPrice,
        } as IOneWayTicketPrice,
      ];

      setDailyTicket(dailyTicketData);
      setIsTicketInfoVisible(true);
    } catch (err: any) {
      console.error("Chi tiết lỗi:", err);
      setError(`Lỗi khi tính giá vé: ${err.message || "Không xác định"}`);
      setIsTicketInfoVisible(true);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleBuyMonthlyTicket = () => {
    setIsTicketModalVisible(false);
    if (id) {
      navigate(`/register-ticket/${id}`);
    }
  };

  const handleTicketInfoCancel = () => {
    setIsTicketInfoVisible(false);
    setDailyTicket(null);
    setError("");
  };

  return (
    <>
      <Modal
        title="Chi tiết tuyến xe"
        open={true}
        onCancel={() => navigate(-1)}
        footer={[
          <Button key="buy" type="primary" onClick={showTicketModal}>
            Mua vé
          </Button>,
          <Button key="close" onClick={() => navigate(-1)}>
            Đóng
          </Button>,
        ]}
      >
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : busRoute ? (
          <Card bordered={false}>
            <Descriptions title="Thông tin tuyến xe" column={1}>
              <Descriptions.Item label="Tên tuyến">{busRoute.name}</Descriptions.Item>
              <Descriptions.Item label="Khoảng cách">{busRoute.fullDistance} km</Descriptions.Item>
              <Descriptions.Item label="Giá vé">{busRoute.fullPrice.toLocaleString()} VND</Descriptions.Item>
              <Descriptions.Item label="Thời gian toàn tuyến">{busRoute.time}</Descriptions.Item>
              <Descriptions.Item label="Chuyến đầu">{busRoute.firstFlightStartTime}</Descriptions.Item>
              <Descriptions.Item label="Chuyến cuối">{busRoute.lastFlightStartTime}</Descriptions.Item>
              <Descriptions.Item label="Thời gian giữa hai chuyến">{busRoute.timeBetweenTwoFlight}</Descriptions.Item>
            </Descriptions>

            <Collapse defaultActiveKey={["0"]} style={{ marginTop: 16 }}>
              {directions.length > 0 ? (
                directions.map((direction, index) => {
                  const directionDetails = routeDetails
                    .filter((detail) => detail.directionId === direction._id)
                    .sort((a, b) => a.orderNumber - b.orderNumber);

                  console.log(`Direction: ${direction.description}, Details:`, directionDetails);

                  return (
                    <Panel header={direction.description} key={index.toString()}>
                      {directionDetails.length > 0 ? (
                        <List
                          dataSource={directionDetails}
                          renderItem={(item) => (
                            <List.Item>
                              {item.orderNumber}. {getBusStopName(item.busStopId)} (Cách điểm trước: {item.distancePre} km)
                            </List.Item>
                          )}
                        />
                      ) : (
                        <p style={{ color: "orange" }}>
                          Hướng "{direction.description}" hiện chưa có dữ liệu chi tiết. Vui lòng kiểm tra lại sau.
                        </p>
                      )}
                    </Panel>
                  );
                })
              ) : (
                <p>Không có dữ liệu hướng. Vui lòng kiểm tra dữ liệu từ API.</p>
              )}
            </Collapse>
          </Card>
        ) : (
          <p>Không có dữ liệu tuyến xe để hiển thị.</p>
        )}
      </Modal>

      <Modal
        title="Chọn loại vé"
        open={isTicketModalVisible}
        onCancel={handleTicketModalCancel}
        footer={[
          <Button key="cancel" onClick={handleTicketModalCancel}>
            Hủy
          </Button>,
          <Button key="daily" type="primary" onClick={handleBuyDailyTicket} loading={ticketLoading}>
            Xem vé ngày
          </Button>,
          <Button key="monthly" type="primary" onClick={handleBuyMonthlyTicket}>
            Mua vé tháng
          </Button>,
        ]}
      >
        <p>Vui lòng chọn loại vé bạn muốn mua:</p>
        <p>- Vé ngày: Sử dụng trong 24 giờ</p>
        <p>- Vé tháng: Sử dụng trong 30 ngày</p>
      </Modal>

 <Modal
      title="Thông tin vé ngày"
      open={isTicketInfoVisible}
      onCancel={handleTicketInfoCancel}
      footer={[
        <Button key="close" onClick={handleTicketInfoCancel}>
          Đóng
        </Button>,
        dailyTicket && dailyTicket.length > 0 && (
          <Button
            key="confirm"
            type="primary"
            onClick={() => {
              console.log("Confirmed daily ticket purchase:", dailyTicket);
              handleTicketInfoCancel();
            }}
          >
            Quay Lại
          </Button>
        ),
      ]}
    >
      {ticketLoading ? (
        <p>Đang tải thông tin vé...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : dailyTicket && dailyTicket.length > 0 ? (
        <Card bordered={false} style={{ padding: "16px", borderRadius: "8px" }}>
          <Descriptions
            title={`Tuyến số: ${busRoute?.name || "Không xác định"}`}
            column={1}
            labelStyle={{ fontWeight: "bold", color: "#333" }}
            contentStyle={{ color: "#555" }}
          >
            <Descriptions.Item label="Tên tuyến">
              {busRoute?.name || "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ hoạt động">
              {busRoute?.firstFlightStartTime} - {busRoute?.lastFlightStartTime}
            </Descriptions.Item>
            <Descriptions.Item label="Giá vé">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "150px" }}>Hành khách:</span>
                  <Input
                    value={dailyTicket[0].unitPrice.toLocaleString()}
                    suffix="VND"
                    disabled
                    style={{ width: "150px", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "150px" }}>Học sinh - Sinh viên:</span>
                  <Input
                    value={(dailyTicket[0].unitPrice * 0.5).toLocaleString()}
                    suffix="VND"
                    disabled
                    style={{ width: "150px", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "150px" }}>Chính sách:</span>
                  <Input
                    value={(dailyTicket[0].unitPrice * 0.75).toLocaleString()}
                    suffix="VND"
                    disabled
                    style={{ width: "150px", borderRadius: "4px" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "150px" }}>Hàng hóa:</span>
                  <Input
                    value={dailyTicket[0].unitPrice.toLocaleString()}
                    suffix="VND"
                    disabled
                    style={{ width: "150px", borderRadius: "4px" }}
                  />
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Quảng đường chạy toàn tuyến">
              {busRoute?.fullDistance} km
            </Descriptions.Item>
            <Descriptions.Item label="Giãn cách tuyến">
              {busRoute?.timeBetweenTwoFlight
                ? `${busRoute.timeBetweenTwoFlight.split(" - ")[0]} `
                : "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày mua">
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {(() => {
                const expirationDate = new Date();
                expirationDate.setHours(expirationDate.getHours() + 24);
                return expirationDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              CHI NHÁNH CẦN THƠ CÔNG TY CP TUYẾN BUS
            </Descriptions.Item>
            <Descriptions.Item label="Số Hotline">1900638494</Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <p>Không có thông tin vé ngày cho tuyến này. Vui lòng thử lại sau.</p>
      )}
    </Modal>
    </>
  );
};

export default BusRouteDetail;