import IBusRouteDetail from "../interfaces/busRouteDetail";
import IResponse from "../interfaces/response";
import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IBusRouteDetail[]>>("/busRouteDetails/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IBusRouteDetail>>(`/busRouteDetails/get/${id}`)).data;
  return response;
}

const busRouteDetailService = {
  get,
  getById
};

export default busRouteDetailService;
