import axios from "axios";

const baseUrl = `http://localhost:3000/api/v1`;
// const baseUrl = `https://music-backend-sigma.vercel.app/api/v1/${configs.PATH_ADMIN}`;

const get = async <T>(params: string): Promise<T> => {
  const response: T = await axios.get(`${baseUrl}${params}`);
  return response;
}

const post = async <T>(params: string, options: unknown): Promise<T> => {
  const response: T = await axios.post(`${baseUrl}${params}`, options);
  return response;
}

const put = async <T>(params: string, options: unknown): Promise<T> => {
  const response: T = await axios.put(`${baseUrl}${params}`, options);
  return response;
}

const patch = async <T>(params: string, options: unknown): Promise<T> => {
  const response: T = await axios.patch(`${baseUrl}${params}`, options);
  return response;
}

const del = async <T>(params: string): Promise<T> => {
  const response: T = await axios.delete(`${baseUrl}${params}`);
  return response;
}

const request = {
  get,
  post,
  put,
  patch,
  del
};
export default request;