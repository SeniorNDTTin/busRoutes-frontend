import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutDefault from "../layouts/default";
import Home from "../pages/home";
import BusRoute from "../pages/home/busroute"; // Import busroute.tsx
import BusRouteDetail from "../pages/home/BusRouteDetail";
import FindRouteDetail from "../pages/panalMap/findRouteDetai";
import DetailRoute from "../pages/panalMap/detailRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Home />} />
        <Route path="/detailRoute/:id" element={<DetailRoute />} />
        <Route path="/findRouteDetail/:key" element={<FindRouteDetail />} />
        </Route>
        {/* Route công khai cho "Tìm đường" (không cần auth/admin) */}
        <Route path="/pages/home/busroute" element={<BusRoute />} />
        <Route path="/bus-route/:id" element={<BusRouteDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;