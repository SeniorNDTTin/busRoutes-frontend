import IBase from "./base";

interface ISchedule extends IBase{
    "timeStart" : string
    "timeEnd" : string
    "busId": string
    "busRouteId" : string
}

export default ISchedule

