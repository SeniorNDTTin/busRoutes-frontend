import IMonthTicketPrice from "../interfaces/monthTicketPrice";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IMonthTicketPrice[]>>("/monthTicketPrices/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IMonthTicketPrice>>(`/monthTicketPrices/get/${id}`)).data;
  return response;
}

const create = async (monthTicketPrice: Partial<IMonthTicketPrice>) => {
  const response = (await request.post<IResponse<IMonthTicketPrice>>("/monthTicketPrices/create", monthTicketPrice)).data;
  return response;
}

const update = async (id: string, monthTicketPrice: Partial<IMonthTicketPrice>) => {
  const response = (await request.patch<IResponse<IMonthTicketPrice>>(`/monthTicketPrices/update/${id}`, monthTicketPrice)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IMonthTicketPrice>>(`/monthTicketPrices/delete/${id}`)).data;
  return response;
}

const monthTicketPriceService = {
  get,
  getById,
  create,
  update,
  del
};
export default monthTicketPriceService;