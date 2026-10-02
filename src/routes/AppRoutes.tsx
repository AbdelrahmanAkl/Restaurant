import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import RestaurantPage from "../features/restaurant/pages/RestaurantPage";
import BranchesPage from "../features/branches/pages/BranchesPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import TablesPage from "../features/tables/pages/TablesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Protected Application */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Restaurant */}
            <Route
              path="/restaurant"
              element={<RestaurantPage />}
            />

            {/* Branches */}
            <Route
              path="/branches"
              element={<BranchesPage />}
            />

            {/* Users */}
            <Route
              path="/users"
              element={<div>Users</div>}
            />

            {/* Menu */}
            <Route
              path="/menu"
              element={<div>Menu</div>}
            />

            {/* Tables & QR */}
            <Route
              path="/tables"
              element={<TablesPage />}
            />

            {/* Orders */}
            <Route
              path="/orders"
              element={<div>Orders</div>}
            />

            {/* Payments */}
            <Route
              path="/payments"
              element={<div>Payments</div>}
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={<div>Reports</div>}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<div>Settings</div>}
            />

          </Route>
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Unknown routes */}
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