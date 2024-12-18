import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AppLayout from "./components/Layout";

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<div>Dashboard</div>} />
            <Route path="patients" element={<div>Patients Page</div>} />
            <Route path="doctors" element={<div>Doctors Page</div>} />
            <Route path="consultation-types" element={<div>Consultation Types Page</div>} />
            <Route path="tasks" element={<div>Tasks Page</div>} />
            <Route path="financial-records" element={<div>Financial Records Page</div>} />
            <Route path="my-tasks" element={<div>My Tasks Page</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
};

export default App;
