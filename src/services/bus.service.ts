import IBus from "../interfaces/bus";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IBus[]>>("/buses/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IBus>>(`/buses/get/${id}`)).data;
  return response;
}

const create = async (bus: Partial<IBus>) => {
  const response = (await request.post<IResponse<IBus>>("/buses/create", bus)).data;
  return response;
}

const update = async (id: string, bus: Partial<IBus>) => {
  const response = (await request.patch<IResponse<IBus>>(`/buses/update/${id}`, bus)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IBus>>(`/buses/delete/${id}`)).data;
  return response;
}

const busService = {
  get,
  getById,
  create,
  update,
  del
};

export default busService;
