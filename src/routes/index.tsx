import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutDefault from "../layouts/default";
import Home from "../pages/home";
import BusRoute from "../pages/home/busroute";
import BusRouteDetail from "../pages/home/BusRouteDetail";
import RegisterTicket from "../pages/home/register_ticket.tsx";
import FindRouteDetail from "../pages/panalMap/findRouteDetai";
import DetailRoute from "../pages/panalMap/detailRoute";
import TicketPrice from "../pages/ticketPrice";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Home />} />
        <Route path="/detailRoute/:id" element={<DetailRoute />} />
        <Route path="/findRouteDetail/:key" element={<FindRouteDetail />} />
        </Route>
        <Route path="/pages/home/busroute" element={<BusRoute />} />
        <Route path="/bus-route/:id" element={<BusRouteDetail />} />
        <Route path="/register-ticket/:id" element={<RegisterTicket />} />
        <Route path="/pages/ticketprice" element={<TicketPrice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;