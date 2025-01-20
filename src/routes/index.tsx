import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutDefault from "../layouts/default";
import Home from "../pages/home";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;