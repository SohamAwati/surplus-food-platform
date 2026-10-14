import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import { LandingPage } from "./pages/public/LandingPage";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Unauthorized } from "./pages/auth/Unauthorized";

import { DonorDashboard } from "./pages/donor/DonorDashboard";
import { DonorOutlets } from "./pages/donor/DonorOutlets";
import { DonorListings } from "./pages/donor/DonorListings";
import { CreateListing } from "./pages/donor/CreateListing";
import { EditListing } from "./pages/donor/EditListing";
import { DonorTransactions } from "./pages/donor/DonorTransactions";

import NgoAvailableListings from "./pages/ngo/AvailableListings";
import NgoMyClaims from "./pages/ngo/MyClaims";

import VolunteerAvailableListings from "./pages/volunteer/AvailableListings";
import VolunteerMyClaims from "./pages/volunteer/MyClaims";

import { MyTransactions as NgoMyTransactions } from "./pages/ngo/MyTransactions";
import { MyTransactions as VolunteerMyTransactions } from "./pages/volunteer/MyTransactions";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

import { useAuthStore } from "./store/auth.store";

function App() {
  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <Routes>

      {/* Public Pages */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* DONOR PROTECTED AREA */}
      <Route element={<ProtectedRoute allowedRoles={["DONOR"]} />}>

        <Route
          path="/donor"
          element={<DonorDashboard />}
        />

        <Route
          path="/donor/outlets"
          element={<DonorOutlets />}
        />

        <Route
          path="/donor/listings"
          element={<DonorListings />}
        />

        <Route
          path="/donor/listings/new"
          element={<CreateListing />}
        />

        <Route
          path="/donor/listings/:listingId/edit"
          element={<EditListing />}
        />

        <Route
          path="/donor/transactions"
          element={<DonorTransactions />}
        />

      </Route>

      {/* NGO PROTECTED AREA */}
      <Route element={<ProtectedRoute allowedRoles={["NGO"]} />}>
        <Route
          path="/ngo/listings"
          element={<NgoAvailableListings />}
        />

        <Route
          path="/ngo/claims"
          element={<NgoMyClaims />}
        />

        <Route
          path="/ngo/transactions"
          element={<NgoMyTransactions />}
        />
      </Route>

      {/* VOLUNTEER PROTECTED AREA */}
      <Route element={<ProtectedRoute allowedRoles={["VOLUNTEER"]} />}>
        <Route
          path="/volunteer/listings"
          element={<VolunteerAvailableListings />}
        />

        <Route
          path="/volunteer/claims"
          element={<VolunteerMyClaims />}
        />

        <Route
          path="/volunteer/transactions"
          element={<VolunteerMyTransactions />}
        />
      </Route>

      {/* ADMIN PROTECTED AREA */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Route>

      {/* Default Catch-all */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;