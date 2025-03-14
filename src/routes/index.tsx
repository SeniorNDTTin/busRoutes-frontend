import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutDefault from "../layouts/default";
import Home from "../pages/home";
import BusRoute from "../pages/home/busroute"; // Import busroute.tsx
import BusRouteDetail from "../pages/home/BusRouteDetail";
import TicketPrice from "../pages/ticketPrice";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Home />} />
        </Route>
        {/* Route công khai cho "Tìm đường" (không cần auth/admin) */}
        <Route path="/pages/home/busroute" element={<BusRoute />} />
        <Route path="/bus-route/:id" element={<BusRouteDetail />} />

        <Route path="/pages/ticketprice" element={<TicketPrice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;