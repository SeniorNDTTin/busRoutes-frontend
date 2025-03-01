import IBase from "./base";

interface IBusRouteDetail extends IBase {
  orderNumber: number;
  distancePre: number;
  busRouteId: string;
  busStopId: string;
  directionId: string;
}

export default IBusRouteDetail;
