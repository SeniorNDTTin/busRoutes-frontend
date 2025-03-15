import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutDefault from "../layouts/default";
import Home from "../pages/home";
import BusRoute from "../pages/home/busroute";
import BusRouteDetail from "../pages/home/BusRouteDetail";
import RegisterTicket from "../pages/home/register_ticket.tsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Home />} />
        </Route>
        <Route path="/pages/home/busroute" element={<BusRoute />} />
        <Route path="/bus-route/:id" element={<BusRouteDetail />} />
        <Route path="/register-ticket/:id" element={<RegisterTicket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;