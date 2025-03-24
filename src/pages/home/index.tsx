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
      const [stop, busRoutes] = await Promise.all([
        busStopService.get(),
        busRouteService.get()
      ])
      setBusStop(stop?.data ? stop.data : busStop)
      setBusAllStop(stop?.data ? stop.data : busAllStop)

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
    setCombinedRoutes([...commonRoute, ...otherRoute])
    

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
  // const Search = async () => {
  //   if (!startPoint.name || !endPoint.name) {
  //     toast.error("Vui lòng chọn điểm đi và điểm đến")
  //     return
  //   }

  //   const routes = busRouteDetail.filter(route => route.busStopId == startPoint.id ||  route.busStopId === endPoint.id)

  //   async function fetchBusRoutes() {
  //     const commonRoutesData  = [];
  //     const otherRoutesData  = [];
  //     const progressCommon = new Set<string>()
  //     const progressOther = new Set<string>()

  //       for (const route of routes) {
  //         if(progressCommon.has(route.busRouteId)) continue;
  //         progressCommon.add(route.busRouteId)

  //         const list = (await busRouteDetailService.getByRouteId(route.busRouteId)).data;
  //         // const list = await getRouteDetails(route.busRouteId)
  //         const startIndex = list.findIndex(stop => stop.busStopId === startPoint.id);
  //         const endIndex = list.findIndex(stop => stop.busStopId === endPoint.id);
          
  //         if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  //           const coordinatesCommon = await Promise.all(
  //              list.slice(startIndex, endIndex + 1).map(async stop =>{
  //               const {latitude , longitude } = ( await busStopService.getById( stop.busStopId)).data
  //               return {latitude , longitude}
  //             }
  //           )
  //         )
  //         commonRoutesData.push({
  //           busRouteId: route.busRouteId,
  //           stopId: list.slice(startIndex, endIndex + 1).map(stop => stop.busStopId),
  //           stopCoor: coordinatesCommon
  //         });
  //         }
  //       }

  //       for (const i of routes) { 
  //           const list1 = (await busRouteDetailService.getByRouteId(i.busRouteId)).data;
           
  //           const startIndex = list1.findIndex(stop => stop.busStopId === startPoint.id);
  //           if (startIndex === -1) continue; 

  //           for (const j of routes) {
  //             if (i.busRouteId === j.busRouteId) continue;

  //             const pairKey = `${i.busRouteId} - ${j.busRouteId}`
  //             if(progressOther.has(pairKey)) continue;
  //             progressOther.add(pairKey)

  //             const list2 = (await busRouteDetailService.getByRouteId(j.busRouteId)).data;
  //             const endIndex = list2.findIndex(stop => stop.busStopId === endPoint.id);
  //             if (endIndex === -1) continue; 

  //             const commonStops = list1.filter(stop1 => list2.some(stop2 => stop1.busStopId === stop2.busStopId))
  //             if(commonStops.length > 0){
  //               for (const cm of commonStops) {
  //                 const midIndex1 = list1.findIndex(stop1 => stop1.busStopId === cm.busStopId)
  //                 const midIndex2 = list2.findIndex(stop2 => stop2.busStopId === cm.busStopId)

  //                 if(midIndex1 !== -1 && midIndex2 !== -1 &&  startIndex < midIndex1 && midIndex2 < endIndex){
  //                   const coordinates = await Promise.all([
     
  //                     ...list1.slice(startIndex, midIndex1 + 1).map( async stop => {
  //                       const {latitude , longitude}= (await busStopService.getById(stop.busStopId)).data;
  //                       return {latitude , longitude}

  //                     }),
  //                     ...list2.slice(midIndex2 + 1, endIndex + 1).map( async stop => {
  //                       const {latitude , longitude} =  (await busStopService.getById(stop.busStopId)).data;
  //                       return  {latitude , longitude}
  //                     })
  //                   ]);
  //                   // list2.slice(midIndex2 + 1, endIndex + 1).map(stop =>  busStopService.getById( stop.busStopId).then(res => res.data))
        
  //                   const mergeRoute = [ 
  //                     ...list1.slice(startIndex , midIndex1 + 1).map(stop => stop.busStopId), 
  //                     ...list2.slice(midIndex2 + 1, endIndex + 1).map(stop => stop.busStopId)
  //                   ]

  //                   otherRoutesData.push({
  //                     busRouteId:  [i.busRouteId , j.busRouteId],
  //                     stopId: mergeRoute,
  //                     stopCoor: coordinates
  //                   });
  //                   // setOtherRoute(pre => [
  //                   //   ...pre,
  //                   //   {busRouteId : [i.busRouteId , j.busRouteId], stopId: mergeRoute, stopCoor: coordinates}
  //                   // ])
  //                 }
  //               }
  //             } 
              
  //         }
  //       }
  //       console.log(commonRoutesData)
  //       console.log(otherRoutesData)
  //       setCommonRoute(commonRoutesData)
  //       setOtherRoute(otherRoutesData)

  //   }

  //   fetchBusRoutes()
  // }



  const HaversineDistance = (lat1: number , long1: number, lat2: number, long2: number) => {
      const toRad = (angel: number) => (angel * Math.PI) / 180

      const R = 6371
      const dLat = toRad(lat2 - lat1)
      const dLong = toRad(long2 - long1)

      const a =Math.sin(dLat / 2) * Math.sin(dLat / 2) +Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = Math.round(R * c)
      return d
  }

  const Search = async () => {
    if (!startPoint.name || !endPoint.name) {
      toast.error("Vui lòng chọn điểm đi và điểm đến");
      return;
    }
     
    const stopToRoutes = new Map<string, Set<string>>(); 
    const busRouteMap = new Map<string, Set<string>>();  
    
    for (const detail of busRouteDetail) {
      if (!stopToRoutes.has(detail.busStopId)) {
        stopToRoutes.set(detail.busStopId, new Set());
      }
      stopToRoutes.get(detail.busStopId)?.add(detail.busRouteId);
  
      if (!busRouteMap.has(detail.busRouteId)) {
        busRouteMap.set(detail.busRouteId, new Set());
      }
      busRouteMap.get(detail.busRouteId)?.add(detail.busStopId);
    }
    console.log("busRouteMap", busRouteMap)
  
   
    const queue: { busRouteId: string[], stopId: string[], path: string[] }[] = [];
    const visitedRoutes = new Set<string>(); 
    const commonRoutesData = [];
    const otherRoutesData = [];
  
    for (const routeId of stopToRoutes.get(startPoint.id) || []) {
      const routeStops = Array.from(busRouteMap.get(routeId) || []);
      const startIndex = routeStops.indexOf(startPoint.id);
      const endIndex = routeStops.indexOf(endPoint.id);
  

      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const stopIds = routeStops.slice(startIndex, endIndex + 1);
      
        const stopCoordinates = await Promise.all(
          stopIds.map(async (stop) => {
            const { latitude, longitude} = (await busStopService.getById(stop)).data;
            return { latitude, longitude};
          })
        );
        const list = (await busRouteDetailService.getByRouteId(routeId)).data;
        const totalDistance = list.reduce((sum, stop) => sum + (stop.distancePre || 0), 0);   
       
        commonRoutesData.push({ busRouteId: [routeId], stopId: stopIds, stopCoor: stopCoordinates , totalDistance: totalDistance});
      }
  
      const stopIds = routeStops.slice(startIndex);
      queue.push({ busRouteId: [routeId], stopId: stopIds, path: [routeId] });
      visitedRoutes.add(routeId);
    }
  
    while (queue.length > 0) {
      const { busRouteId, stopId, path } = queue.shift()!;
      const lastStop = stopId[stopId.length - 1];
    
      if (lastStop === endPoint.id) {
        const stopCoordinates = await Promise.all(
          stopId.map(async (stop) => {
            const { latitude, longitude } = (await busStopService.getById(stop)).data;
            return { latitude, longitude };
          })
        );

        const totalDistance = stopCoordinates.reduce((distancePre, stopCur, index , arr) => {
            if(index === 0 ) return 0;
            const distance = HaversineDistance(arr[index - 1].latitude, arr[index - 1].longitude, stopCur.latitude, stopCur.longitude)
            return distancePre + distance
        }, 0)
        
        if (busRouteId.length > 1) {
         
          otherRoutesData.push({ busRouteId, stopId, stopCoor: stopCoordinates, totalDistance: totalDistance });
        }
        continue;
      }
    
      for (const nextRoute of stopToRoutes.get(lastStop) || []) {
        if (visitedRoutes.has(nextRoute)) continue;
        

        const nextRouteStops = Array.from(busRouteMap.get(nextRoute) || []);
        const endPointIndex = nextRouteStops.indexOf(endPoint.id);
    
        const lastIntersection = stopId.find(stop => nextRouteStops.includes(stop));
    
        if (lastIntersection) {
          const intersectionIndex = nextRouteStops.indexOf(lastIntersection);
    
          if (intersectionIndex < endPointIndex) {
            visitedRoutes.add(nextRoute);
    
            const newPath = [...path, nextRoute];
            const newStopId = [...stopId];
    
            for (const stop of nextRouteStops) {
              if (!newStopId.includes(stop)) {
                newStopId.push(stop);
              }
            }
    
            queue.push({ busRouteId: [...busRouteId, nextRoute], stopId: newStopId, path: newPath });
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

const findNearestBusStop = (lat: number, lng: number) => {
  if (busAllStop.length === 0) return;

  let minDistance = Infinity;
  let nearestStop: IBusStop | undefined;

  busAllStop.forEach((stop: IBusStop) => {
      const distance = HaversineDistance(lat, lng, stop.latitude, stop.longitude);

      if (distance < minDistance) {
          minDistance = distance;
          nearestStop = stop;;
      }
  });

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
                    <p><strong>Độ dài tuyến:</strong> {route.fullDistance} Km</p>
                    <p><strong>Giá vé:</strong> {formatCurrency(route.fullPrice)} VND</p>
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
                          <input type="text"  value={ nameCurrentLocation !== "" ? nameCurrentLocation :startPoint.name } onChange={(e) => setStartPoint({...startPoint, name: e.target.value})} placeholder="Chọn điểm xuất phát"  className="route-input" onClick={ handleInputStart} />

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
                      {commonRoute.length > 0 ? (
                        <div className={styles.itemRoute}>
                          <p > <strong>Các Tuyến Trực Tiếp : </strong>{startPoint.name} <RightCircleTwoTone/> {endPoint.name}</p>
                          {combinedRoutes.filter(route => route.busRouteId.length === 1) .map((route , index) => {
                              let matchedRoutes = busRoute.filter(r => route.busRouteId.includes(r._id));
                              matchedRoutes = matchedRoutes.sort((a, b) => a.fullDistance - b.fullDistance);
                              const shortestDistance = shortestRoute && shortestRoute.length > 0 ?  shortestRoute[0].totalDistance : 0
                              const isShortest = (shortestRoute && shortestRoute.some(r => Number(r.totalDistance) === Number(route.totalDistance))) ?? false;
                          
                              return matchedRoutes.length > 0 ? matchedRoutes.map(r => (
                                <div  key={index} className={styles.itemRoute1} onClick={() => handleRouteClickDir(r, route, isShortest)}>
                                      <p style={{color: 'red' , fontWeight: 'bold'}} >
                                          {matchedRoutes.map(r => r.name).join("")}
                                      </p>
                                      <p><strong>Độ dài tuyến:</strong> {r.fullDistance} Km</p>
                                     <p><strong>Giá vé:</strong> {formatCurrency(r.fullPrice)} VND</p>
                                     <p><strong>Thời gian tuyến:</strong> {r.time}</p>
                                </div>)) : (<div></div>)
                          })}
                        </div>
                        ) :( <h3></h3>)}

                      {otherRoute.length > 0 ? (
                        <div className={styles.itemRoute}>
                          <p style={{marginTop: '2.5rem'}}> <strong>Các Tuyến Trung Gian : </strong>{startPoint.name} <RightCircleTwoTone/> {endPoint.name}</p>
                          {combinedRoutes.filter(route => route.busRouteId.length > 1) .map((route , index) => {
                            let matchedRoutes = busRoute.filter(r => route.busRouteId.includes(r._id));
                            matchedRoutes = matchedRoutes.sort((a, b) => a.fullDistance - b.fullDistance);
                            const isShortest = (shortestRoute && shortestRoute.some(r => Number(r.totalDistance) === Number(route.totalDistance))) ?? false;
                            const color = isShortest ? 'red' : colors[index % colors.length]

                           return matchedRoutes.length > 0 ? (                    
                                <div key={index} className={styles.itemRoute1} onClick={() => handleRouteClickOther(route, color)}>
                                    <p style={{color: 'red' , fontWeight: 'bold'}} >
                                          { matchedRoutes.map(r => r.name).join(" ---> ")}
                                    </p>
                                    <p><strong>Độ dài: </strong>{route.totalDistance} Km</p>
                                    <p><strong>Giá vé: </strong></p>                 
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
