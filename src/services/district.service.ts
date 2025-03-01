import IDistrict from "../interfaces/district";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IDistrict[]>>("/districts/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IDistrict>>(`/districts/get/${id}`)).data;
  return response;
}

const create = async (district: Partial<IDistrict>) => {
  const response = (await request.post<IResponse<IDistrict>>("/districts/create", district)).data;
  return response;
}

const update = async (id: string, district: Partial<IDistrict>) => {
  const response = (await request.patch<IResponse<IDistrict>>(`/districts/update/${id}`, district)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IDistrict>>(`/districts/delete/${id}`)).data;
  return response;
}

const districtService = {
  get,
  getById,
  create,
  update,
  del
};
export default districtService;