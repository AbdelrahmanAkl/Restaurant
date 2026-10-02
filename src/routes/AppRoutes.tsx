import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import TablesPage from "../features/tables/pages/TablesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/restaurant"
              element={<div>Restaurant</div>}
            />

            <Route
              path="/branches"
              element={<div>Branches</div>}
            />

            <Route
              path="/users"
              element={<div>Users</div>}
            />

            <Route
              path="/menu"
              element={<div>Menu</div>}
            />

            <Route
              path="/tables"
              element={<TablesPage />}
            />

            <Route
              path="/orders"
              element={<div>Orders</div>}
            />

            <Route
              path="/payments"
              element={<div>Payments</div>}
            />

            <Route
              path="/reports"
              element={<div>Reports</div>}
            />

            <Route
              path="/settings"
              element={<div>Settings</div>}
            />
          </Route>
        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}