import IOneWayTicketPrice from "../interfaces/OneWayTicketPrices.ts";
import IResponse from "../interfaces/response.ts";

import request from "../utils/request.ts";

const get = async () => {
  const response = (await request.get<IResponse<IOneWayTicketPrice[]>>("/oneWayTicketPrices/get")).data;
  return response;
};

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IOneWayTicketPrice>>(`/oneWayTicketPrices/get/${id}`)).data;
  return response;
};

const create = async (ticketPrice: Partial<IOneWayTicketPrice>) => {
  const response = (await request.post<IResponse<IOneWayTicketPrice>>("/oneWayTicketPrices/create", ticketPrice)).data;
  return response;
};

const update = async (id: string, ticketPrice: Partial<IOneWayTicketPrice>) => {
  const response = (await request.patch<IResponse<IOneWayTicketPrice>>(`/oneWayTicketPrices/update/${id}`, ticketPrice)).data;
  return response;
};

const del = async (id: string) => {
  const response = (await request.del<IResponse<IOneWayTicketPrice>>(`/oneWayTicketPrices/delete/${id}`)).data;
  return response;
};

const findByRoute = async (busRouteId: string) => {
  const response = (await request.get<IResponse<IOneWayTicketPrice[]>>(`/oneWayTicketPrices/route/${busRouteId}`)).data;
  return response;
};

const oneWayTicketPriceService = {
  get,
  getById,
  create,
  update,
  del,
  findByRoute,
};

export default oneWayTicketPriceService;
