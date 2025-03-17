import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button,  Tabs} from "antd";
import type { TabsProps } from 'antd';
import { toast } from "react-toastify";
import { ArrowLeftOutlined, CaretLeftOutlined } from "@ant-design/icons";

import { MapContainer, TileLayer, Marker, Popup , Polyline} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import styles from "../../assets/css/index/findRouteDetail.module.scss"
import L from "leaflet"
import busStopIcon from "../../assets/img/bus_stop2.png"

import busStopService from "../../services/busStop.service";
import IBusStop from "../../interfaces/busStop";
import busRouteService from "../../services/busRoute.service";
import busRouteDetailService from "../../services/busRouteDetail.service";
import IBusRouteDetail from "../../interfaces/busRouteDetail";
import IBusRoute from "../../interfaces/busRoute";
import streetService from "../../services/street.service";
import wardService from "../../services/ward.service";
import districtService from "../../services/district.service";
import IStreet from "../../interfaces/street";
import IWard from "../../interfaces/ward";
import IDistrict from "../../interfaces/district";



interface Position {
  lat: number;
  lng: number;
}

const FindRouteDetail = () =>{
  const location = useLocation();
  const routeData = location.state?.routeData;
  const shortestDistance = location.state?.shortestDistance;
  const routeDirectly = location.state?.routeDirectly;
  const currentLocation = location.state?.currentLocation;

  const navigation = useNavigate()
  const [mapPosition, setMapPosition] = useState<Position>({
    lat: 10.036718000266058,
    lng: 105.78768579479011,
  });
  
  const [busRouteDetail, setBusRouteDetail] = useState<IBusRouteDetail[]>([]);
  
  const [busStop, setBusStop] = useState<IBusStop[]>([]);
  const [busAllStop, setBusAllStop] = useState<IBusStop[]>([]);
  const [busRoute, setBusRoute] = useState<IBusRoute[]>([])
  const [isOpen, setIsOpen] = useState(true)
  
  const [street, setStreet] = useState<IStreet[]>([])
  const [wards, setWards] = useState<IWard[]>([])
  const [districts, setDistricts] = useState<IDistrict[]>([])

  const busIcon = L.divIcon({
    html: `<div style="
            background-color: #65ffa5; 
            width: 30px; 
            height: 35px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 50%; 
            position: relative;
            box-shadow: 0px px 10px rgba(0, 0, 0, 0.3);">
            <img src="${busStopIcon}" style="width: 20px; height: 20px; border-radius: 50%;" />
            <div style="
                position: absolute;
                bottom: -7px; 
                left: 50%;
                width: 0;
                height: 0;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-top: 10px solid #65ffa5;
                transform: translateX(-50%);
            "></div>
          </div>`,
    iconSize: [0,0],
    iconAnchor: [15, 42], 
    popupAnchor: [0, -45] 
  });
  
  useEffect(() => {
    const fetchApi = async () => {
      const stops = (await busStopService.get()).data;
      setBusAllStop(stops)

      const stopId = [routeData.stopId[0], routeData.stopId[routeData.stopId.length - 1]].flatMap((stop : string) => stops.filter(st => st._id === stop))
      setBusStop(stopId);

      const busRoute = (await busRouteService.get()).data;
      setBusRoute(busRoute)
    };
  
    fetchApi();
   
  }, []); 

   
    useEffect(() => {
      if (busStop.length === 0) return;
    
      const fetchStreets = async () => {
        const streetApi = await Promise.all(
          busStop.map(async (stop) => (await streetService.getById(stop.streetId)).data)
        );
        setStreet(streetApi);
      };
    
      fetchStreets();
    }, [busStop]);
    
    useEffect(() => {
      if (street.length === 0) return;
    
      const fetchWards = async () => {
        const wardApi = await Promise.all(
          street.map(async (str) => (await wardService.getById(str.wardId)).data)
        );
        setWards(wardApi);
      };
    
      fetchWards();
    }, [street]);
  
    useEffect(() => {
      if (wards.length === 0) return;
    
      const fetchDistricts = async () => {
        const districtApi = await Promise.all(
          wards.map(async (w) => (await districtService.getById(w.districtId)).data)
        );
        setDistricts(districtApi);
      };
    
      fetchDistricts();
    }, [wards]);
    
  

const formatCurrency= (value? : number) => {
    if(!value) return '0';
     return new Intl.NumberFormat("vi-VN").format(value)
}

const toggelePanal = () => {
  setIsOpen(!isOpen)
}

const backIndex = () => {
    navigation(`/`)
}

const detailRoutes = routeData.busRouteId.map((id : string) => busRoute.find(route => route._id === id))
const detailStops = routeData.stopId.map((id: string) => busAllStop.find(stop => stop._id === id))

  const items: TabsProps['items'] = [

    {
      key: '1',
      label: 'Tìm Đường',
      children:(   
          <div>
            <Button onClick={backIndex}>
                    <ArrowLeftOutlined />
            </Button>
           
                {routeDirectly ? (
                    <div className={styles.detailRoute}>                      
                        <p style={{color: 'red', fontWeight: 'bold'}}> {detailRoutes.map((route: { name: string }) => route?.name ).join(" ---> ")}</p>
                        <p><strong>Độ dài tổng:</strong> {routeData.totalDistance} Km</p>
                        <p><strong>Giá vé:</strong>  {formatCurrency(routeDirectly.fullPrice)} VND</p>
                        <p><strong>Thời gian tuyến:</strong> {routeDirectly.time}</p>
                        <p><strong>TGBD chuyến đầu:</strong> {routeDirectly.firstFlightStartTime}</p>
                       <p><strong>TGBD chuyến cuối:</strong> {routeDirectly.lastFlightStartTime}</p>
                       <p><strong>Giãn cách tuyến:</strong> {routeDirectly.timeBetweenTwoFlight}</p>
                       <p > 
                            <span style={{backgroundColor: 'rgb(255, 221, 231)', fontWeight: 'bold', padding: '2px', marginRight: '5px'}}>Các trạm đi qua: </span>
                            {detailStops.map((stop: { name: string }) => stop?.name ).join(" ---> ")}
                       </p>
                    </div>
                ): (            
                    <div className={styles.detailRoute}>
                        <p style={{color: 'red', fontWeight: 'bold'}}> {detailRoutes.map((route: { name: string }) => route?.name ).join(" ---> ")}</p>
                        <p><strong>Độ dài tổng:</strong> {routeData.totalDistance} Km</p>
                        <p><strong>Giá vé:</strong>  VND</p>               
                       <p > 
                            <span style={{backgroundColor: 'rgb(255, 221, 231)', fontWeight: 'bold', padding: '2px', marginRight: '5px'}}>Các trạm đi qua: </span>
                            {detailStops.map((stop: { name: string }) => stop?.name ).join(" ---> ")}
                       </p>
                    </div>
                )}
          
          
        </div>
      )
    },
 
  ];

  return (
    <main className={styles.main_index}>
      <div className={`${styles.detailPanal} ${isOpen ? styles.open : styles.closed}`}>
         <div className={styles.content}>
          <Tabs defaultActiveKey="1" items={items}  />
         </div>
      </div>
      <Button className={`${styles.buttonEvent} ${isOpen ? styles.open : styles.closed}`}  color="default" variant="outlined" onClick={toggelePanal}><CaretLeftOutlined /></Button>

      <div className={styles.home}>
          <div className={styles.wrapper}>
            <div className={styles.map}>
              <MapContainer center={mapPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors'/>
                {busStop.map((point) => {
                      const detailStreet = street.find(st => st._id === point.streetId)
                      const detailWard = wards.find(w => w._id === detailStreet?.wardId)
                      const detailDistrict = districts.find(d => d._id === detailWard?.districtId)
                      const listRoute = busRouteDetail.filter(route => route.busStopId === point._id)
                      const detailRoute = Array.from(new Set(busRoute.filter(route => listRoute.some(dt => dt.busRouteId === route._id)) ) );

                      return (
                        <Marker key={point._id} position={[point.latitude, point.longitude]} icon={busIcon}>
                          <Popup>
                              <div>
                                  <p style={{fontWeight: 'bold'}}>{point.name} - {detailStreet ? detailStreet.name : ""} - {detailWard ? detailWard.name : ""} -  {detailDistrict ? detailDistrict.name : ""}</p>
                                  <p><strong>Vĩ độ : </strong>{point.latitude} , <strong>Kinh độ : </strong>{point.longitude}</p>   
                                  {detailRoute.length > 0 ? (                                 
                                      <p><strong>Các tuyến đi qua : </strong>{ detailRoute.map(dt => dt.name).join(" - ")}</p>        
                                  ):(<p>Không có tuyến đường nào qua trạm.</p>)}
                              </div>
                          </Popup>
                        </Marker>
                      )
                  })}

                  {currentLocation && (
                        <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
                        <Popup>Vị trí hiện tại của bạn</Popup>
                      </Marker>
                    )} 
                <Polyline key={`${routeData.busRouteId.join("-")}`}
                    positions={routeData.stopCoor.map((coord: { latitude: number; longitude: number }) => [coord.latitude, coord.longitude])} color={routeData.totalDistance == (shortestDistance ?? -1) ? 'red' :'blue' }  weight={7} 
                />

              </MapContainer>
            </div>
          </div>
      </div>
    </main>

  );

}

export default FindRouteDetail;
