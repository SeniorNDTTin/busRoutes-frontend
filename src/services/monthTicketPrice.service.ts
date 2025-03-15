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

const monthTicketPriceService = {
  get,
  getById,
  create
};
export default monthTicketPriceService;