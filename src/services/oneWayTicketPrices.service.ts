import IOneWayTicketPrice from "../interfaces/OneWayTicketPrices.ts";
import IResponse from "../interfaces/response.ts";
import request from "../utils/request.ts";

const get = async (): Promise<IResponse<IOneWayTicketPrice[]>> => {
  try {
    const response = await request.get<IResponse<IOneWayTicketPrice[]>>("/oneWayTicketPrices/get");
    return response; // Trả về toàn bộ { data: { code, message, data } }
  } catch (error: any) {
    console.error("Error fetching all ticket prices:", error.message);
    throw error;
  }
};

const getById = async (id: string): Promise<IResponse<IOneWayTicketPrice>> => {
  try {
    const response = await request.get<IResponse<IOneWayTicketPrice>>(`/oneWayTicketPrices/get/${id}`);
    return response;
  } catch (error: any) {
    console.error(`Error fetching ticket price for ID ${id}:`, error.message);
    throw error;
  }
};

const findByRoute = async (busRouteId: string): Promise<IOneWayTicketPrice[]> => {
  try {
    const response = await request.get<IResponse<IOneWayTicketPrice[]>>("/oneWayTicketPrices/get");
    console.log("API response from /oneWayTicketPrices/get:", response);
    const filteredPrices = response.data.data.filter(
      (price: IOneWayTicketPrice) => price.busRouteId === busRouteId
    );
    return filteredPrices;
  } catch (error: any) {
    console.error(`Error fetching ticket prices for route ${busRouteId}:`, error.message);
    throw error;
  }
};
const oneWayTicketPriceService = {
  get,
  getById,
  findByRoute,
};

export default oneWayTicketPriceService;