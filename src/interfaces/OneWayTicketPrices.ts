import IBase from "./base";

interface IOneWayTicketPrice extends IBase {
  busRouteId: string; 
  maxKilometer: number;  
  unitPrice: number;      
};

export default IOneWayTicketPrice;
