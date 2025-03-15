// monthTicket.ts
import IBase from "./base";

interface IMonthTicket extends IBase {
  registerDate: string;
  expiredDate: string;
  expired: boolean;
  customerId: string;
  monthTicketPriceId?: string; // Liên kết với monthTicketPrice
}

export default IMonthTicket;