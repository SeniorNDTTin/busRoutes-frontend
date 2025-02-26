import IBase from "./base";

interface IBusRoute extends IBase {
    name: string;
    fullDistance: number; 
    fullPrice: number;
    time: string;
    firstFlightStartTime: string;
    lastFlightStartTime: string;
    timeBetweenTwoFlight: string;
}
export default IBusRoute;