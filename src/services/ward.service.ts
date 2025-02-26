import IWard from "../interfaces/ward";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IWard[]>>("/wards/get")).data;
  return response;
}

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IWard>>(`/wards/get/${id}`)).data;
  return response;
}

const create = async (ward: Partial<IWard>) => {
  const response = (await request.post<IResponse<IWard>>("/wards/create", ward)).data;
  return response;
}

const update = async (id: string, ward: Partial<IWard>) => {
  const response = (await request.patch<IResponse<IWard>>(`/wards/update/${id}`, ward)).data;
  return response;
}

const del = async (id: string) => {
  const response = (await request.del<IResponse<IWard>>(`/wards/delete/${id}`)).data;
  return response;
}

const findByDistrict = async (districtId: string) => {
  const response = (await request.get<IResponse<IWard[]>>(`/wards/district/${districtId}`)).data;
  return response;
};

const wardService = {
  get,
  getById,
  create,
  update,
  del,
  findByDistrict
};
export default wardService;