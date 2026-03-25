import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VehicleList from "./pages/vehicles/VehicleList";
import VehicleDetail from "./pages/vehicles/VehicleDetail";

// Placeholder for vehicle create / edit form (to be built)
function VehicleForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Vehicle Form</h2>
      <p className="text-muted-foreground">Vehicle form coming soon.</p>
    </div>
  );
}

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
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/new" element={<VehicleForm />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
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
