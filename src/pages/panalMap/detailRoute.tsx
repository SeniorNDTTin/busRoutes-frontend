import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button,  Tabs} from "antd";
import type { TabsProps } from 'antd';

import { CaretLeftOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup , Polyline} from "react-leaflet";

// import Map, { Marker, Popup } from "react-map-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
// import mapboxgl from "mapbox-gl";

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
import { details, div, p } from "framer-motion/client";
import DirectionRoute from "../../component/directionRoute";



interface Position {
  lat: number;
  lng: number;

}

const DetailRoute = () =>{

  const { id } = useParams();
  const location = useLocation();
  const routeData = location.state?.routeData;
  const routeCoords = location.state?.routeCoords; 
  const color = location.state?.color; 

  const currentLocation = location.state?.currentLocation;

  const navigation = useNavigate()
  const [mapPosition, setMapPosition] = useState<Position>({
    lat: 10.036718000266058,
    lng: 105.78768579479011,
  });
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
  

  const [busRoute, setBusRoute] = useState<IBusRoute[]>([])
  const [busRouteDetail, setBusRouteDetail] = useState<IBusRouteDetail[]>([]);
  const [direction, setDirection] = useState<IDirection[]>([]);
  
  const [busAllStop, setBusAllStop] = useState<IBusStop[]>([]);
  const [busStop, setBusStop] = useState<IBusStop[]>([]);
  const [isOpen, setIsOpen] = useState(true)
  
  const [street, setStreet] = useState<IStreet[]>([])
  const [wards, setWards] = useState<IWard[]>([])
  const [districts, setDistricts] = useState<IDistrict[]>([])


  const prevStreet = useRef<IStreet[]>([]);
  const prevWards = useRef<IWard[]>([]);
  const prevDistricts = useRef<IDistrict[]>([]);
  

  useEffect(() => {
    const fetchApi = async () => {
        if (!id) return;

        const [stops, details, directions, busRoutes] = await Promise.all([
            busStopService.get(),
            busRouteDetailService.getByRouteId(id as string),
            directionService.get(),
            busRouteService.get()
          ]);
                
          setBusAllStop(stops?.data ? stops.data : busAllStop);
          setBusRouteDetail(details?.data ? details.data : busRouteDetail);
          setDirection(directions?.data ? directions.data : direction);
          setBusRoute(busRoutes?.data ? busRoutes.data : busRoute);
        };
        
        fetchApi();
        
    }, [id]); 
    

    const filteredBusStops = useMemo(() => {
     
        return busAllStop.filter(stop => 
          busRouteDetail.some(detail => detail.busStopId === stop._id && detail.busRouteId === id)
        );
      }, [busAllStop, busRouteDetail, id]);

    useEffect(() => {
      if (!filteredBusStops.length) return;

      const fetchStreets = async () => {
        const streetApi = await Promise.all(
            filteredBusStops.map(async (stop) => (await streetService.getById(stop.streetId)).data)
        );

          if (JSON.stringify(prevStreet.current) !== JSON.stringify(streetApi)) {
              prevStreet.current = streetApi;
              setStreet(streetApi);
          }
        setBusStop(filteredBusStops)
      };
    
      fetchStreets();
    }, [filteredBusStops]);
    
    useEffect(() => {
      if (street.length === 0) return;
    
      const fetchWards = async () => {
        const wardApi = await Promise.all(
          street.map(async (str) => (await wardService.getById(str.wardId)).data)
        );

        if (JSON.stringify(prevWards.current) !== JSON.stringify(wardApi)) {
            prevWards.current = wardApi;
            setWards(wardApi);
        }
      };
    
      fetchWards();
    }, [street]);

    useEffect(() => {
      if (!wards.length || JSON.stringify(prevWards.current) === JSON.stringify(wards)) return;
      prevWards.current = wards;
      if (wards.length === 0) return;
    
      const fetchDistricts = async () => {
        const districtApi = await Promise.all(
          wards.map(async (w) => (await districtService.getById(w.districtId)).data)
        );

        if (JSON.stringify(prevDistricts.current) !== JSON.stringify(districtApi)) {
          prevDistricts.current = districtApi;
          setDistricts(districtApi);
        }
      };
    
      fetchDistricts();
    }, [wards]);
    


const toggelePanal = () => {
  setIsOpen(!isOpen)
}

const backIndex = () => {
    navigation(`/`)
}
const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Danh Sách Tuyến Xe',
    children: routeData ? (
      <DirectionRoute
        routeData={routeData}
        busRouteDetail={busRouteDetail}
        busAllStop={busAllStop}
        direction={direction}
        backIndex={backIndex}
      />
    ) : (
      <div>Trống...</div>
    ),
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
                <Polyline  key={id}positions={routeCoords} color= {color}  weight={7} />

              </MapContainer> 

                
            </div>
          </div>
      </div> 
    </main>

  );

}

export default DetailRoute;
