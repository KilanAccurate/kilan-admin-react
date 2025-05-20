// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLayout } from "./layouts/AdminLayout";
import { UsersTable } from "./pages/Users";
import AbsensiTable from "./pages/Absensi";
import CutiTable from "./pages/Cuti";
import LemburTable from "./pages/Lembur";
import SiteManagementPage from "./pages/Setting";
import ProtectedLayout from "./layouts/ProtectedLayout";

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedLayout>
                            <Home />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedLayout>
                            <AdminLayout />
                        </ProtectedLayout>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UsersTable />} />
                    <Route path="absensi" element={<AbsensiTable />} />
                    <Route path="lembur" element={<LemburTable />} />
                    <Route path="cuti" element={<CutiTable />} />
                    <Route path="settings" element={<SiteManagementPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
