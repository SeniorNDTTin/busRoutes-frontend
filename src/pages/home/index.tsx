import { useEffect, useState } from "react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Import CSS của Leaflet
import "./home.css"; // Thêm file CSS cho Home

// Giả định interface cho vị trí bản đồ
interface Position {
  lat: number;
  lng: number;
}

function Home() {
  
  const [loading, setLoading] = useState(true);
  const [startPoint, setStartPoint] = useState<string>("");
  const [endPoint, setEndPoint] = useState<string>("");
  const [mapPosition, setMapPosition] = useState<Position>({
    lat: 10.036718000266058,
    lng: 105.78768579479011,
  });
   // Cập nhật vị trí mới của Cần Thơ
  const [route, setRoute] = useState<Position[]>([]); // Giả định tuyến đường là mảng các vị trí

  useEffect(() => {
    const fetchApi = async () => {
      // try {
      //   const response = await addressService.get();
      //   setAddresses(response.data);
      // } catch (error) {
      //   console.error("Error fetching addresses:", error);
      // } finally {
      //   setLoading(false);
      // }
    };
    fetchApi();
  }, []);

  // const handleFindRoute = () => {
  //   // const start = addresses.find((addr) => addr.street === startPoint);
  //   // const end = addresses.find((addr) => addr.street === endPoint);
  
  //   if (start && end) {
  //     const sampleRoute: Position[] = [
  //       { lat: mapPosition.lat, lng: mapPosition.lng },
  //       { lat: mapPosition.lat + 0.01, lng: mapPosition.lng + 0.01 },
  //       { lat: mapPosition.lat + 0.02, lng: mapPosition.lng + 0.02 },
  //     ];
  //     setRoute(sampleRoute);
  
  //     setMapPosition({
  //       lat: sampleRoute[sampleRoute.length - 1].lat,
  //       lng: sampleRoute[sampleRoute.length - 1].lng,
  //     });
  //   } else {
  //     alert("Không tìm thấy điểm đi hoặc điểm đến!");
  //   }
  // };
  

  return (
    <main className="main-content">
      <div className="home-container">
        <div className="bus-route-panel">
          <h1 className="home-title">Tìm Đường Xe Buýt</h1>
          
          <div className="route-form">
            <div className="form-group">
              <label>Điểm đi:</label>
              <input
                type="text"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                placeholder="Nhập điểm đi"
                className="route-input"
              />
            </div>
            <div className="form-group">
              <label>Điểm đến:</label>
              <input
                type="text"
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                placeholder="Nhập điểm đến"
                className="route-input"
              />
            </div>
            {/* <button onClick={handleFindRoute} className="find-route-btn">
              Tìm đường
            </button> */}
          </div>

          {/* {loading ? (
            <div className="loading">Đang tải...</div>
          ) : addresses.length > 0 ? (
            <div className="address-list">
              <h2>Danh Sách Địa Chỉ Tuyến Xe</h2>
              {addresses.map((address, index) => (
                <div key={address.street || index} className="address-item">
                  <h3>{address.street || "Đường không có"}</h3>
                  <p>Phường/Xã: {address.ward || "Không có thông tin"}</p>
                  <p>Quận/Huyện: {address.district || "Không có thông tin"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Không có dữ liệu tuyến xe bus.</p>
          )} */}
        </div>

        <div className="map-container">
        <MapContainer center={mapPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='© OpenStreetMap contributors'
  />

            {/* Marker cố định cho Cần Thơ với tọa độ mới */}
            <Marker position={[mapPosition.lat, mapPosition.lng]}>
    <Popup>Cần Thơ - Trung tâm bản đồ</Popup>
  </Marker>
            {/* Các điểm trên tuyến đường */}
            {route.map((point, index) => (
              <Marker key={index} position={[point.lat, point.lng]}>
                <Popup>Điểm {index + 1} trên tuyến đường</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}

export default Home;
