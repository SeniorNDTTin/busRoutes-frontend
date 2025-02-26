import ISchedule from "../interfaces/schedule";
import IResponse from "../interfaces/response";
import request from "../utils/request";

const get = async() => {
    const res = (await request.get<IResponse<ISchedule[] >>('/schedules/get')).data
    return res
}

const getById = async (id: string) => {
    const res = (await request.get<IResponse<ISchedule>>(`/schedules/get/${id}`)).data;
    return res;
}


const scheduleService = {get, getById}

export default scheduleService