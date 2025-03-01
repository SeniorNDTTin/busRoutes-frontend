import IBase from "./base";

interface IMonthTicketPrice extends IBase {
  timeStart: string;
  timeEnd: string;
  price: number;
  busRouteId: string;
};

export default IMonthTicketPrice;
