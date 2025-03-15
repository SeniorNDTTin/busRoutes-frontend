import IMonthTicket from "../interfaces/monthTicket.ts";
import IResponse from "../interfaces/response";

import request from "../utils/request";

const get = async () => {
    const response = (await request.get<IResponse<IMonthTicket[]>>("/monthTickets/get")).data;
    return response;
}

const getById = async (id: string) => {
    const response = (await request.get<IResponse<IMonthTicket>>(`/monthTickets/get/${id}`)).data;
    return response;
}

const create = async (monthTicket: Partial<IMonthTicket>) => {
    const response = (await request.post<IResponse<IMonthTicket>>("/monthTickets/create", monthTicket)).data;
    return response;
}

const update = async (id: string, monthTicket: Partial<IMonthTicket>) => {
    const response = (await request.patch<IResponse<IMonthTicket>>(`/monthTickets/update/${id}`, monthTicket)).data;
    return response;
}

const del = async (id: string) => {
    const response = (await request.del<IResponse<IMonthTicket>>(`/monthTickets/delete/${id}`)).data;
    return response;
}

const monthTicketService = {
    get,
    getById,
    create,
    update,
    del
};

export default monthTicketService;