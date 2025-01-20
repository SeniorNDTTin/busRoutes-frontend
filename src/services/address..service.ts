import IAddress from "../interfaces/address";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IAddress[]>>("/addresses/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IAddress>>(`/addresses/get/${id}`)).data;
  return response;
}

const create = async (address: Partial<IAddress>) => {
  const response = (await request.post<IResponse<IAddress>>("/addresses/create", address)).data;
  return response;
}

const update = async (id: string, address: Partial<IAddress>) => {
  const response = (await request.patch<IResponse<IAddress>>(`/addresses/update/${id}`, address)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IAddress>>(`/addresses/delete/${id}`)).data;
  return response;
}

const addressService = {
  get,
  getById,
  create,
  update,
  del
};
export default addressService;