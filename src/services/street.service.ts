import IStreet from "../interfaces/street";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IStreet[]>>("/streets/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IStreet>>(`/streets/get/${id}`)).data;
  return response;
}

const create = async (street: Partial<IStreet>) => {
  const response = (await request.post<IResponse<IStreet>>("/streets/create", street)).data;
  return response;
}

const update = async (id: string, street: Partial<IStreet>) => {
  const response = (await request.patch<IResponse<IStreet>>(`/streets/update/${id}`, street)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IStreet>>(`/streets/delete/${id}`)).data;
  return response;
}

const findByWard = async (wardId: string) => {
  const response = (await request.get<IResponse<IStreet[]>>(`/streets/ward/${wardId}`)).data;
  return response;
};

const streetService = {
  get,
  getById,
  create,
  update,
  del,
  findByWard
};
export default streetService;