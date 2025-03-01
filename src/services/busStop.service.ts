import IBusStop from "../interfaces/busStop";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IBusStop[]>>("/busStops/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IBusStop>>(`/busStops/get/${id}`)).data;
  return response;
}


const busStopService = {
  get,
  getById,
 
};
export default busStopService;