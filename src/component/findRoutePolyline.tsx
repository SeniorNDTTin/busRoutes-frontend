import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Polyline} from "react-leaflet";
import mapboxgl from 'mapbox-gl';
import IBusRoute from "../interfaces/busRoute";

mapboxgl.accessToken = 'pk.eyJ1IjoibmdodWllbiIsImEiOiJjbThsemZrbzEwYzE0Mmlwd21ud3JicXZnIn0.8Jpx_wzZc_A3j_5a6pLIfw';
const getRoute = async (route: { lat: number; lng: number }[]) => {
    try {
      const coordinates = route.map((stop) => `${stop.lng},${stop.lat}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.routes[0].geometry.coordinates.map(([lng, lat] : [number, number]) => [lat, lng]);
    } catch (error) {
      console.error("Lỗi khi lấy tuyến đường:", error);
      return [];
    }
  };

  interface IOtherRoutes{
    busRouteId: string[] ;
    stopId: string[];
    stopCoor: { latitude: number; longitude: number }[];
    totalDistance: number
  }
  
interface RoutePolylineProps {
    colors: string
    busRouteId: string;
    route: { lat: number; lng: number; }[]
    routeData: IOtherRoutes,
    routeDirectly: IBusRoute | undefined,
    currentLocation:{ latitude: number; longitude: number; } | null

  }
  
  
  const FindRoutePolyline = ({ colors ,busRouteId, route, routeData, routeDirectly, currentLocation }: RoutePolylineProps) => {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchRoute = async () => {
        const data = await getRoute(route);
        setRouteCoords(data);
      };
      fetchRoute();
    }, [route]); 
  
    return (
      <Polyline
        key={busRouteId}
        positions={routeCoords}
        color={colors}
        weight={7}
        eventHandlers={{
          click: () => {
            navigate(`/findRouteDetail/${busRouteId}`, {
              state: { 
                routeData : routeData,
                currentLocation: currentLocation ,
                routeCoords: routeCoords,
                colors: colors,
                routeDirectly: routeDirectly
              },
            });
          },
        }}
      />
    );
  };
  

  export default FindRoutePolyline
  