import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/Layout";
import Patients from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import ConsultationTypesPage from "./pages/ConsultaionTypesPage";
import TasksPage from "./pages/TasksPage";
import FinancePage from "./pages/FinancePage";

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route
                    path="/"
                    element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
                >
                    <Route path="patients" element={<Patients />} />
                    <Route path="doctors" element={<DoctorsPage />} />
                    <Route path="consultation-types" element={<ConsultationTypesPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="financial-records" element={<FinancePage />} />
                </Route>
                <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
