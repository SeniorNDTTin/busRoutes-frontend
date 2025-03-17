import { useEffect, useMemo, useState } from "react";
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
import directionService from "../../services/direction.service";
import IDirection from "../../interfaces/direction";



interface Position {
  lat: number;
  lng: number;
}

const DetailRoute = () =>{
  const location = useLocation();
  const routeData = location.state?.routeData;

  const currentLocation = location.state?.currentLocation;

  const navigation = useNavigate()
  const [mapPosition, setMapPosition] = useState<Position>({
    lat: 10.036718000266058,
    lng: 105.78768579479011,
  });

  const [busRoute, setBusRoute] = useState<IBusRoute[]>([])
  const [busRouteDetail, setBusRouteDetail] = useState<IBusRouteDetail[]>([]);
  const [direction, setDirection] = useState<IDirection[]>([]);
  
  const [busAllStop, setBusAllStop] = useState<IBusStop[]>([]);
  const [busStop, setBusStop] = useState<IBusStop[]>([]);
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
        if (!routeData?._id) return;

        const [stops, details, directions, busRoutes] = await Promise.all([
            busStopService.get(),
            busRouteDetailService.getByRouteId(routeData._id),
            directionService.get(),
            busRouteService.get()
          ]);
                
          setBusAllStop(stops.data);
          setBusRouteDetail(details.data);
          setDirection(directions.data);
          setBusRoute(busRoutes.data);
        };
        
        fetchApi();
        
    }, [routeData]); 
    
    const filteredBusStops = useMemo(() => {
        return busAllStop.filter(stop => 
          busRouteDetail.some(detail => detail.busStopId === stop._id && detail.busRouteId === routeData._id)
        );
      }, [busAllStop, busRouteDetail, routeData._id]);
    
    useEffect(() => {
      if (filteredBusStops.length === 0) return;
    
      const fetchStreets = async () => {
        const streetApi = await Promise.all(
            filteredBusStops.map(async (stop) => (await streetService.getById(stop.streetId)).data)
        );
        setStreet(streetApi);

        const stopFilter =  busAllStop.filter(stop => busRouteDetail.some(detail => detail.busStopId === stop._id && detail.busRouteId === routeData._id))
        setBusStop(stopFilter)
      };
    
      fetchStreets();
    }, [filteredBusStops]);
    
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

    // const detailRoutes = routeData.busRouteId.map((id : string) => busRoute.find(route => route._id === id))
    // const detailStops = routeData.stopId.map((id: string) => busAllStop.find(stop => stop._id === id))

  const items: TabsProps['items'] = [

    {
      key: '1',
      label: 'Danh Sách Tuyến Xe',
      children:(   
          <div>
            <Button onClick={backIndex}>
                    <ArrowLeftOutlined />
            </Button>
           
            {routeData ? (
                <div className={styles.detailRoute}>  
                    <p style={{color: 'red', fontWeight: 'bold'}}> {routeData.name}</p>
                    <p><strong>Độ dài tổng:</strong> {routeData.totalDistance} Km</p>
                    <p><strong>Giá vé:</strong>  {formatCurrency(routeData.fullPrice)} VND</p>
                    <p><strong>Thời gian tuyến:</strong> {routeData.time}</p>
                    <p><strong>TGBD chuyến đầu:</strong> {routeData.firstFlightStartTime}</p>
                    <p><strong>TGBD chuyến cuối:</strong> {routeData.lastFlightStartTime}</p>
                    <p><strong>Giãn cách tuyến:</strong> {routeData.timeBetweenTwoFlight}</p>        

                    {direction.length > 0 ? (
                        direction.map((d) => {
                            const stops = busRouteDetail.filter(r => r.directionId === d._id);
                            const detailStop = busStop.filter(dt => stops.some(st => dt._id === st.busStopId));

                            return (
                            <p key={d._id}>
                                <strong style={{
                                backgroundColor: d.description === 'Xuôi' ? 'rgb(255, 221, 231)' : 'rgb(255, 241, 221)',
                                padding: '2px', 
                                marginRight: '5px'
                                }}>
                                {d.description === "Xuôi" ? "Lượt đi:" : "Lượt về:"}
                                </strong>
                                {detailStop.length > 0 ? detailStop.map(dt => dt.name).join(" ---> ") : ''}
                            </p>
                            );  
                        })
                        ) : (
                        <p>Không xác định được chiều...</p>
                    )}
                </div>
            ) : (                  
                <div>Trống...</div>
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
                <Polyline 
                    key={routeData._id}
                    positions={
                        busStop
                        .filter(stop => busRouteDetail.some(detail => detail.busStopId === stop._id && detail.busRouteId === routeData._id))
                        .map(stop => [stop.latitude, stop.longitude])
                    } 
                    color={'blue'}  
                    weight={7} 
                />

              </MapContainer> 
            </div>
          </div>
      </div> 
    </main>

  );

}

export default DetailRoute;
