import { Routes, Route } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CocinaPage } from "../modules/cocina/pages/CocinaPage";
import { PlatosPage } from "../modules/cocina/pages/PlatosPage";
import { PlatoFormPage } from "../modules/cocina/pages/PlatoFormPage";


export const AppRoutes = () => {
  return (
    <Routes>
      {/* Layout principal */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<CocinaPage />} />
        <Route path="/cocina" element={<CocinaPage />} />
        <Route path="/cocina/platos" element={<PlatosPage />} />
        <Route path="/cocina/platos/nuevo" element={<PlatoFormPage />} />
        <Route path="/cocina/platos/:id" element={<PlatoFormPage />} />
      </Route>
    </Routes>
  );
};