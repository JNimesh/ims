import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/Layout";
import Patients from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import ConsultaionTypesPage from "./pages/ConsultaionTypesPage";
import TasksPage from "./pages/TasksPage";
import FinancePage from "./pages/FinancePage";

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />}>
            <Route path="patients" element={<Patients/>} />
            <Route path="doctors" element={<DoctorsPage/>} />
            <Route path="consultation-types" element={<ConsultaionTypesPage/>} />
            <Route path="tasks" element={<TasksPage/>} />
            <Route path="financial-records" element={<FinancePage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
};

export default App;
