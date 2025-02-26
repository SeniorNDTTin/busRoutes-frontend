import IDirection from "../interfaces/direction";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
  const response = (await request.get<IResponse<IDirection[]>>("/directions/get")).data;
  return response;
};

const getById = async (id: string) => {
  const response = (await request.get<IResponse<IDirection>>(`/directions/get/${id}`)).data;
  return response;
};



const directionService = {
  get,
  getById,

};

export default directionService;
