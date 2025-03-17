import ICustomer from "../interfaces/customer";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<ICustomer[]>>("/customers/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<ICustomer>>(`/customers/get/${id}`)).data;
  return response;
}

const create = async (customers: Partial<ICustomer>) => {
  const response = (await request.post<IResponse<ICustomer>>("/customers/create", customers)).data;
  return response;
}


const customerService = {
  get,
  getById,
  create
};
export default customerService;