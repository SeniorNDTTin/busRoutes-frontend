import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button,  Tabs , TabsProps, message} from "antd";
import { toast } from "react-toastify";
import { CaretLeftOutlined, EnvironmentTwoTone, RightCircleTwoTone } from "@ant-design/icons";

import { MapContainer, TileLayer, Marker, Popup , Polyline} from "react-leaflet";
import mapboxgl from 'mapbox-gl';

import "leaflet/dist/leaflet.css";
import styles from "../../assets/css/index/index.module.scss"
import L from "leaflet"
import busStopIcon from "../../assets/img/bus_stop2.png"

import busStopService from "../../services/busStop.service";
import IBusStop from "../../interfaces/busStop";
import busRouteService from "../../services/busRoute.service";
import busRouteDetailService from "../../services/busRouteDetail.service";
import IBusRouteDetail from "../../interfaces/busRouteDetail";
import IBusRoute from "../../interfaces/busRoute";
import streetService from "../../services/street.service";
import IStreet from "../../interfaces/street";
import wardService from "../../services/ward.service";
import IWard from "../../interfaces/ward";
import districtService from "../../services/district.service";
import IDistrict from "../../interfaces/district";
import RoutePolyline from "../../component/routePolyline";
import FindRoutePolyline from "../../component/findRoutePolyline";
import { direction } from "html2canvas/dist/types/css/property-descriptors/direction";
import directionService from "../../services/direction.service";
import IDirection from "../../interfaces/direction";



interface Position {
  lat: number;
  lng: number;
}


interface IOtherRoutes{
  busRouteId: string[] ;
  stopId: string[];
  stopCoor: { latitude: number; longitude: number }[];
  totalDistance: number
}

function Home() {
  const navigation = useNavigate()
  const [mapPosition, setMapPosition] = useState<Position>({
    lat: 10.036718000266058,
    lng: 105.78768579479011,

  });

  const [isOpen, setIsOpen] = useState(true)

   const [busStop, setBusStop] = useState<IBusStop[]>([]);
   const [busAllStop, setBusAllStop] = useState<IBusStop[]>([]);

   const [busRoute, setBusRoute] = useState<IBusRoute[]>([])
   const [busRouteDetail, setBusRouteDetail] = useState<IBusRouteDetail[]>([]);
   const [busRouteMap, setBusRouteMap] = useState<Record<string, { lat: number; lng: number; name: string; order: number }[]>>({});

   const [street, setStreet] = useState<IStreet[]>([])
   const [wards, setWards] = useState<IWard[]>([])
   const [districts, setDistricts] = useState<IDistrict[]>([])

   const [direction , setDirection] = useState<IDirection[]>([])

   const [showSuggestStart, setShowsuggestStart] = useState(false)
   const [showSuggestEnd, setShowsuggestEnd] = useState(false)

   const [startPoint, setStartPoint] = useState({id : "" , name: ""});
   const [endPoint, setEndPoint] = useState({id : "" , name: ""});

  const [commonRoute, setCommonRoute] = useState<IOtherRoutes[]>([]);
  const [otherRoute, setOtherRoute] = useState<IOtherRoutes[]>([]);
  const [combinedRoutes, setCombinedRoutes] = useState<IOtherRoutes[]>([]);
  const [shortestRoute, setShortestRoute] = useState<IOtherRoutes[] | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nameCurrentLocation, setNameCurrentLocation] = useState("");

  const colors = ["blue", "#ff5d96", "#52e9a5", "purple", "orange", "brown", "#ff9cb6"];

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
    iconAnchor: [15, 45], 
    popupAnchor: [0, -45] 
  });
  
  useEffect(() => {
    const fetchApi = async () => {
      const [stop, busRoutes , dir] = await Promise.all([
        busStopService.get(),
        busRouteService.get(),
        directionService.get()
      ])
      setBusStop(stop?.data ? stop.data : busStop)
      setBusAllStop(stop?.data ? stop.data : busAllStop)
      setDirection(dir?.data ? dir.data : direction)

      setBusRoute(busRoutes?.data ? busRoutes.data : busRoute)

      const details = (await busRouteDetailService.get()).data;
      setBusRouteDetail(details);

      const seenRoutes = new Set<string>(); 
      if (details.length > 0) {
        const listRoute = details.reduce<Record<string, { lat: number; lng: number; name: string; order: number }[]>>((acc, detail) => {
          if (seenRoutes.has(detail.busRouteId)) return acc; 

          const routeStops = details
            .filter(d => d.busRouteId === detail.busRouteId) 
            .sort((a, b) => a.directionId.localeCompare(b.directionId))
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .filter((d, _, arr) => d.directionId === arr[0].directionId) 
            .map(d => {
              const busStopInfo = stop.data.find((s: any) => s._id === d.busStopId);
              return busStopInfo
                ? {
                    lat: busStopInfo.latitude,
                    lng: busStopInfo.longitude,
                    name: busStopInfo.name,
                    order: d.orderNumber,
                  }
                : null;
            })
            .filter((stop): stop is { lat: number; lng: number; name: string; order: number } => stop !== null) 
            

          if (routeStops.length > 0) {
            acc[detail.busRouteId] = routeStops;
            seenRoutes.add(detail.busRouteId); 
          }

          return acc;
        }, {});

        setBusRouteMap(listRoute);
      }
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
  
  useEffect(() => {
    if (otherRoute.length > 0 || commonRoute.length > 0) {
      // const filterStops = busAllStop.filter(stop => 
      //   otherRoute.some(route => route.stopId.includes(stop._id)) || 
      //   commonRoute.some(route => route.stopId.includes(stop._id))
      // );
      const filterStops = busAllStop.filter(stop => stop._id === startPoint.id || stop._id === endPoint.id)
      setBusStop(filterStops);
      
    } else {
      setBusStop(busAllStop);
    }
    
    const otherRouteFilter = otherRoute.filter(other => other.busRouteId.length > 1)
    setCombinedRoutes([...commonRoute, ...otherRouteFilter])
    // setCombinedRoutes([...commonRoute, ...otherRoute])
    
  }, [commonRoute, otherRoute]); 

  useEffect(() => {
    if (combinedRoutes.length === 0) return;
    let shortestRouteData: IOtherRoutes[] = [];
    let minDistance = Infinity;
  
      for(const minRoute of combinedRoutes){
        if(minRoute.totalDistance < minDistance){
          minDistance = minRoute.totalDistance
          shortestRouteData = [minRoute]
        }else if(minRoute.totalDistance === minDistance){
          shortestRouteData.push(minRoute)
        }
       
        setShortestRoute(shortestRouteData.length > 0 ? shortestRouteData : null)
      }
 
  }, [combinedRoutes]); 


const toggelePanal = () => {
  setIsOpen(!isOpen)
}

  const getRouteDistance = async (stopCoordinates: { latitude: number; longitude: number }[]): Promise<number> => {
    if (stopCoordinates.length < 2) return 0;
  
    const coordinates = stopCoordinates.map(stop => `${stop.longitude},${stop.latitude}`).join(";");
  
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${mapboxgl.accessToken}&geometries=geojson`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].distance;
    }
  
    return 0;
  };
  

  const Search = async () => {
  if (!startPoint.name || !endPoint.name) {
    toast.error("Vui lòng chọn điểm đi và điểm đến");
    return;
  }

  const stopToRoutes = new Map();
  const busRouteMap = new Map();

  for (const detail of busRouteDetail) {
    if (!stopToRoutes.has(detail.busStopId)) {
      stopToRoutes.set(detail.busStopId, new Set());
    }
    stopToRoutes.get(detail.busStopId).add(detail.busRouteId);

    const dir = direction.find(d => d._id === detail.directionId);

    if (!busRouteMap.has(detail.busRouteId)) {
      busRouteMap.set(detail.busRouteId, { forward: new Set(), reverse: new Set() });
    }

    if (dir) {
      const route = busRouteMap.get(detail.busRouteId);
      if (dir.description === 'Lượt đi') {
        route.forward.add(detail.busStopId);
      } else {
        route.reverse.add(detail.busStopId);
      }
    }
  }

  const queue: { busRouteId: string[], stopId: string[], path: string[] }[] = [];
  const visitedRoutes = new Set();
  const commonRoutesData = [];
  const otherRoutesData = [];

  for (const routeId of stopToRoutes.get(startPoint.id) || []) {
    const routeData = busRouteMap.get(routeId);
    if (!routeData) continue;

    for (const direction of ['forward', 'reverse']) {
      const stops = Array.from(routeData[direction]);
      const startIndex = stops.indexOf(startPoint.id);
      const endIndex = stops.indexOf(endPoint.id);

      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const stopIds = stops.slice(startIndex, endIndex + 1) as string[];
        const stopCoordinates = await Promise.all(
          stopIds.map(async stop => (await busStopService.getById(stop as string)).data)
        );
        const totalDistance1 = await getRouteDistance(stopCoordinates);
        const totalDistance = Math.round(totalDistance1 / 1000)

        commonRoutesData.push({ busRouteId: [routeId], stopId: stopIds, stopCoor: stopCoordinates, totalDistance });
      }
      queue.push({ busRouteId: [routeId], stopId: stops.slice(startIndex) as string[], path: [routeId] });
      visitedRoutes.add(routeId);
    }
  }

  while (queue.length > 0) {
    const { busRouteId, stopId, path } = queue.shift()!;
    const lastStop = stopId[stopId.length - 1];
    if (lastStop === endPoint.id) {
      const stopCoordinates = await Promise.all(
        stopId.map(async stop => (await busStopService.getById(stop)).data)
      );
      const totalDistance1 = await getRouteDistance(stopCoordinates)
      const totalDistance = Math.round(totalDistance1 / 1000)
      
      otherRoutesData.push({ busRouteId, stopId, stopCoor: stopCoordinates, totalDistance });
      continue;
    }

    for (const nextRoute of stopToRoutes.get(lastStop) || []) {
      if (visitedRoutes.has(nextRoute)) continue;

      const nextRouteData = busRouteMap.get(nextRoute);
      if (!nextRouteData) continue;

      for (const direction of ['forward', 'reverse']) {
        const nextStops = Array.from(nextRouteData[direction]);
        const intersection = stopId.find(stop => nextStops.includes(stop));

        if (intersection) {
          const intersectionIndex = nextStops.indexOf(intersection);
          const endPointIndex = nextStops.indexOf(endPoint.id);

          if (intersectionIndex < endPointIndex) {
            visitedRoutes.add(nextRoute);
            const newPath = [...path, nextRoute];
            const newStopId = [...stopId, ...nextStops.slice(intersectionIndex + 1)];
            queue.push({ busRouteId: [...busRouteId, nextRoute], stopId: newStopId as string[], path: newPath });
          }
        }
      }
    }
  }

  setCommonRoute(commonRoutesData);
  setOtherRoute(otherRoutesData);
};

const handleInputStart = () => {
  setShowsuggestStart (true)
  setShowsuggestEnd(false)
}
const handleInputEnd = () => {
  setShowsuggestEnd (true)
  setShowsuggestStart(false)
}

// const findNearestBusStop = (lat: number, lng: number) => {
//   if (busAllStop.length === 0) return;

//   let minDistance = Infinity;
//   let nearestStop: IBusStop | undefined;

//   busAllStop.forEach((stop: IBusStop) => {
//       const distance = HaversineDistance(lat, lng, stop.latitude, stop.longitude);

//       if (distance < minDistance) {
//           minDistance = distance;
//           nearestStop = stop;
//       }
//   });

//   if (nearestStop !== null) {
//     setStartPoint({ id: nearestStop?._id ?? "", name: nearestStop?.name ?? "" });
//   }
// };


const getDrivingDistance = async (lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng1},${lat1};${lng2},${lat2}?access_token=${mapboxgl.accessToken}&geometries=geojson`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.routes && data.routes.length > 0) {
    return data.routes[0].distance; 
  }

  return 0
};

const findNearestBusStop = async (lat: number, lng: number) => {
  if (busAllStop.length === 0) return;

  let minDistance = Infinity;
  let nearestStop: IBusStop | undefined;

  for (const stop of busAllStop) {
      const distance = await getDrivingDistance(lat , lng , stop.latitude , stop.longitude)
      if (distance < minDistance) {
          minDistance = distance;
          nearestStop = stop;
      }
  };
  if (nearestStop !== null) {
    setStartPoint({ id: nearestStop?._id ?? "", name: nearestStop?.name ?? "" });
  }
};

const handleCurrentLocation = () =>{
  
  if (!navigator.geolocation) {
    message.error("Trình duyệt của bạn không hỗ trợ định vị!");
    return;
  }
  navigator.geolocation.getCurrentPosition (
    (position) => {
      const { latitude, longitude } = position.coords;

      setNameCurrentLocation("Vị trí hiện tại")
      setShowsuggestStart(false)
      setCurrentLocation({ latitude, longitude });
      findNearestBusStop(latitude , longitude)

      message.success("Lấy vị trí thành công!");
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        message.warning("Bạn chưa cấp quyền truy cập vị trí! Hãy bật định vị.");
      } else {
        message.error("Không thể lấy vị trí của bạn. Vui lòng thử lại.");
      }
    }
  )
}

const handleSelect = (id: string , name : string ) => {
  setNameCurrentLocation("")
  setStartPoint({id , name})
  setShowsuggestStart(false)
};

  const handleSelectEndPoint = (id: string ,name : string ) => {
    setEndPoint({id , name})
    setShowsuggestEnd(false)
  };

  const formatCurrency = (value? : number) =>{
      if(!value) return "0";
      return new Intl.NumberFormat("vi-VN").format(value)
  }
  
  mapboxgl.accessToken = 'pk.eyJ1IjoibmdodWllbiIsImEiOiJjbThsemZrbzEwYzE0Mmlwd21ud3JicXZnIn0.8Jpx_wzZc_A3j_5a6pLIfw';
  const getRoute = async (route: { lat: number; lng: number }[]) => {

        const coordinates = route.map((stop) => `${stop.lng},${stop.lat}`).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data.routes[0].geometry.coordinates.map(([lng, lat] : [number, number]) => [lat, lng]);
    };

  const handleRouteClick = async (route : IBusRoute ) => {
    const routeStops = busRouteMap[route._id] || [];
    const routeCoords = await getRoute(routeStops)
    const index = busRoute.findIndex(r => r._id === route._id);

    navigation(`/detailRoute/${route._id}`, {
      state: {
        routeData: route,
        currentLocation: currentLocation,
        routeCoords: routeCoords, 
        color: colors[index % colors.length]
      },
    });

  }

  const handleRouteClickDir = async (routeId : IBusRoute , route: IOtherRoutes, isShortest: boolean) => {
    const routeCoords = await getRoute(route.stopCoor.map(coord => ({ lat: coord.latitude, lng: coord.longitude })))
    const index = busRoute.findIndex(r => r._id === routeId._id);

    navigation(`/findRouteDetail/${routeId._id}`, {
      state: {
        routeData: route,
        currentLocation: currentLocation,
        routeCoords: routeCoords, 
        colors: isShortest ? 'red' : colors[index % colors.length],
        routeDirectly : routeId
      },
    });

  }

  const handleRouteClickOther = async (route: IOtherRoutes, colors : string) => {
    const routeCoords = await getRoute(route.stopCoor.map(coord => ({ lat: coord.latitude, lng: coord.longitude })))
    
    navigation(`/findRouteDetail/${route.busRouteId.join("-")}`, {
      state: {
        routeData: route,
        currentLocation: currentLocation,
        routeCoords: routeCoords, 
        colors: colors
      },
    });

  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Danh Sách Tuyến Xe',
      children: (
         <div className={styles.listRoute}>
            <div className={styles.itemRoute}>
              {busRoute.map(route => (               
                  <div className={styles.itemRoute1} onClick={() => handleRouteClick(route)}>
                    <p style={{color: 'red' , fontWeight: 'bold'}}>{route.name}</p>
                    <p><strong>Độ dài toàn tuyến:</strong> {route.fullDistance} Km</p>
                    <p><strong>Giá vé toàn tuyến:</strong> {formatCurrency(route.fullPrice)} VND</p>
                    <p><strong>Thời gian tuyến:</strong> {route.time}</p>
                  </div>
              ))}
            </div>
         </div>
      )
    },
    {
      key: '2',
      label: 'Tìm Đường',
      children:(
        
        <div>
           <div className={styles.search1}>
              <div className={styles.item1}>
                  <div className={styles.search_box1}>
                    <div className={styles.point1}>
                      <label className={styles.label1}>Điểm đi:</label>
                      <div className={styles.startInput1}>
                          <input type="text"  value={ nameCurrentLocation !== "" ? nameCurrentLocation :startPoint.name }  
                            onChange={(e) => {
                              setStartPoint({ ...startPoint, name: e.target.value });  

                              if (e.target.value=== "") {
                                setNameCurrentLocation("");  
                              } else if (e.target.value !== "Vị trí hiện tại") {
                                setNameCurrentLocation(e.target.value);
                              }
                            }} 
                            placeholder="Chọn điểm xuất phát"  className="route-input" 
                            onClick={ handleInputStart} />

                            {showSuggestStart && (
                              <ul className={styles.stopList1}>
                                   <li onClick={handleCurrentLocation} ><EnvironmentTwoTone />  Vị trí hiện tại</li>
                                  {busAllStop
                                  .filter((item) => item.name.toLowerCase().includes(startPoint.name.toLowerCase()))
                                  .map((item) =>(                                 
                                    <li key={item._id} onClick={ () => handleSelect(item._id, item.name)}>
                                        <EnvironmentTwoTone style={{ backgroundColor: 'green'}}/>  {item.name}
                                    </li>
                                  ))}
                              </ul>
                            )}
                      </div>
                  
                    </div>

                    <div className={styles.point1}>
                      <label className={styles.label1}>Điểm đến:</label>
                      <div className={styles.startInput1}>
                          <input type="text" value={endPoint.name} onChange={(e) => setEndPoint({...endPoint, name: e.target.value})} placeholder="Chọn điểm kết thúc" className="route-input" onClick={ handleInputEnd}  />
                          {showSuggestEnd && (
                              <ul className={styles.stopList1}>
                                  {busAllStop
                                    .filter((item) => item.name.toLowerCase().includes(endPoint.name.toLowerCase()))
                                    .map((item) => (
                                      <li key={item._id} onClick={() => handleSelectEndPoint( item._id, item.name )}>
                                          {item.name}
                                      </li>
                                    ))
                                  }
                              </ul>
                          )}
                      </div>
                    </div>
                  </div>
                    <Button className={styles.button1} color="primary" variant="outlined" onClick={Search}>Tìm</Button>
              </div>
          </div>
          
          {combinedRoutes.length > 0 ?
           (
            
            <div className={styles.listRoute}>
                <div className={styles.wrapperNote}>
                  <div className={styles.pipe}>.</div>
                  <div className={styles.note}> : Tuyến đường ngắn nhất</div>
                </div>
                      {commonRoute.length > 0 ? (
                        <div className={styles.itemRoute}>
                          <p > <strong>Các Tuyến Trực Tiếp : </strong>{startPoint.name} <RightCircleTwoTone/> {endPoint.name}</p>
                          {commonRoute.slice().sort((a, b) => a.totalDistance - b.totalDistance).map((route , index) => {
                              let matchedRoutes = busRoute.filter(r => route.busRouteId.includes(r._id));
                              matchedRoutes = matchedRoutes.sort((a, b) => a.fullDistance - b.fullDistance);
                              const shortestDistance = shortestRoute && shortestRoute.length > 0 ?  shortestRoute[0].totalDistance : 0
                              const isShortest = (shortestRoute && shortestRoute.some(r => Number(r.totalDistance) === Number(route.totalDistance))) ?? false;
                          
                              return matchedRoutes.length > 0 ? matchedRoutes.map(r => (
                                <div  key={index} className={styles.itemRoute1} onClick={() => handleRouteClickDir(r, route, isShortest)}>
                                      <p style={{color: 'red' , fontWeight: 'bold'}} >
                                          {matchedRoutes.map(r => r.name).join("")}
                                      </p>
                                      <p><strong>Độ dài toàn tuyến:</strong> {r.fullDistance} Km</p>
                                     <p><strong>Giá vé toàn tuyến:</strong> {formatCurrency(r.fullPrice)} VND</p>
                                     <p><strong>Thời gian tuyến:</strong> {r.time}</p>
                                     <div className={styles.totalDistance}>{route.totalDistance} Km</div>
                                </div>)) : (<div></div>)
                          })}
                        </div>
                        ) :( <h3></h3>)}

                      {otherRoute.length > 0 ? (
                        <div className={styles.itemRoute}>
                          <p style={{marginTop: '2.5rem'}}> <strong>Các Tuyến Trung Gian : </strong>{startPoint.name} <RightCircleTwoTone/> {endPoint.name}</p>
                          {combinedRoutes.filter(route => route.busRouteId.length > 1) .slice().sort((a, b) => a.totalDistance - b.totalDistance).map((route , index) => {
                            let matchedRoutes = busRoute.filter(r => route.busRouteId.includes(r._id));
                            matchedRoutes = matchedRoutes.sort((a, b) => a.fullDistance - b.fullDistance);
                            const isShortest = (shortestRoute && shortestRoute.some(r => Number(r.totalDistance) === Number(route.totalDistance))) ?? false;
                            const color = isShortest ? 'red' : colors[index % colors.length]

                           return matchedRoutes.length > 0 ? (                    
                                <div key={index} className={styles.itemRoute1} onClick={() => handleRouteClickOther(route, color)}>
                                    <p style={{color: 'red' , fontWeight: 'bold'}} >
                                          { matchedRoutes.map(r => r.name).join(" ---> ")}
                                    </p>
                                    <div className={styles.totalDistance}>{route.totalDistance} Km</div>
                                </div>                 
                            ) : (<div></div>)
                          })}
                        </div>
                        ) :( <h3></h3>)}

            </div>
           ) 
          : (<div></div> )} 
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
                      <Popup>
                            <div>
                                  <p>Vị trí hiện tại của bạn</p>
                                  <p>({currentLocation.latitude + ' - ' + currentLocation.longitude})</p>
                            </div>
                      </Popup>
                    </Marker>
                  )}

                   {combinedRoutes.length === 0 &&
                    Object.keys(busRouteMap).length > 0 &&
                    Object.entries(busRouteMap).map(([busRouteId, route], index) => {
                      const routeData = busRoute.find(r => r._id === busRouteId) as IBusRoute;  
                      return (
                        <RoutePolyline colors={colors[index % colors.length]} key={busRouteId} busRouteId={busRouteId}  route={route}  routeData={ routeData} currentLocation ={ currentLocation} />
                      )
                      })}

                  {combinedRoutes.map((route, index) => {
                    const isShortest = shortestRoute && shortestRoute.some(r => Number(r.totalDistance) === Number(route.totalDistance));
                    const shortestDistance = shortestRoute && shortestRoute.length > 0 ?  shortestRoute[0].totalDistance : 0;
                    const routeDirectly = route.busRouteId.length === 1 ? busRoute.find(r => r._id === route.busRouteId[0]) : undefined;
                    
                    return (
                      <FindRoutePolyline
                        colors={isShortest ? 'red' : colors[index % colors.length]}
                        key={`${route.busRouteId.join("-")}-${isShortest ? "red" : "blue"}`}
                        busRouteId={route.busRouteId.join("-")}
                        route={route.stopCoor.map(coord => ({ lat: coord.latitude, lng: coord.longitude }))}
                        routeData={route}
                        routeDirectly={routeDirectly}
                        currentLocation={currentLocation}                  
                      />
                    );
                  })}

              </MapContainer>
            </div>
          </div>
      </div>
    </main>

  );

}

export default Home;
