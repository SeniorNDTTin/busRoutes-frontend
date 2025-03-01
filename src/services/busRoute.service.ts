import IBusRoute from "../interfaces/busRoute";
import IResponse from "../interfaces/response";
import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IBusRoute[]>>("/busRoutes/get")).data;
  return response;
}
const getById = async (id: string) => {
  const response = (await request.get<IResponse<IBusRoute>>(`/busRoutes/get/${id}`)).data;
  return response;
}

const busRouteService = {
  get,
  getById
};

export default busRouteService;