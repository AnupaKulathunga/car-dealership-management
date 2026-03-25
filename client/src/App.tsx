import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VehicleList from "./pages/vehicles/VehicleList";
import VehicleDetail from "./pages/vehicles/VehicleDetail";
import VehicleForm from "./pages/vehicles/VehicleForm";
import CustomerList from "./pages/customers/CustomerList";
import CustomerDetail from "./pages/customers/CustomerDetail";
import CustomerForm from "./pages/customers/CustomerForm";
import SalesList from "./pages/sales/SalesList";
import SaleDetail from "./pages/sales/SaleDetail";
import CreateSale from "./pages/sales/CreateSale";
import AppointmentList from "./pages/appointments/AppointmentList";
import CreateAppointment from "./pages/appointments/CreateAppointment";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Vehicles */}
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/new" element={<VehicleForm />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/vehicles/:id/edit" element={<VehicleForm />} />

              {/* Customers */}
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />

              {/* Sales */}
              <Route path="/sales" element={<SalesList />} />
              <Route path="/sales/new" element={<CreateSale />} />
              <Route path="/sales/:id" element={<SaleDetail />} />

              {/* Appointments */}
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/appointments/new" element={<CreateAppointment />} />

              {/* Coming Soon (Cycle 3+) */}
              <Route path="/reports" element={<ComingSoon />} />
              <Route path="/reports/*" element={<ComingSoon />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
