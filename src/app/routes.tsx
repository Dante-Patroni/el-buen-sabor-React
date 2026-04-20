import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CocinaPage } from "../modules/cocina/pages/CocinaPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cocina" element={<CocinaPage />} />
      </Routes>
    </BrowserRouter>
  );
};