import { Card, Descriptions, Button, Modal, Collapse, List } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import busRouteService from "../../services/busRoute.service";
import busRouteDetailService from "../../services/busRouteDetail.service";
import busStopService from "../../services/busStop.service";
import directionService from "../../services/direction.service";
import IBusRoute from "../../interfaces/busRoute";
import IBusRouteDetail from "../../interfaces/busRouteDetail";
import IBusStop from "../../interfaces/busStop";
import IDirection from "../../interfaces/direction";

const { Panel } = Collapse;

const BusRouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [busRoute, setBusRoute] = useState<IBusRoute | null>(null);
  const [routeDetails, setRouteDetails] = useState<IBusRouteDetail[]>([]);
  const [busStops, setBusStops] = useState<IBusStop[]>([]);
  const [directions, setDirections] = useState<IDirection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
    return direction ? direction.description : `Không tìm thấy hướng (${directionId})`;
  };

  return (
    <Modal
      title="Chi tiết tuyến xe"
      open={true}
      onCancel={() => navigate(-1)}
      footer={[
        <Button key="close" type="primary" onClick={() => navigate(-1)}>
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

                return (
                  <Panel
                    header={direction.description}
                    key={index.toString()}
                  >
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
                      <p>Chưa có dữ liệu chi tiết cho hướng này.</p>
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
  );
};

export default BusRouteDetail;