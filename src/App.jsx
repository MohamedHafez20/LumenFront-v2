import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import AdminActivity from "./pages/AdminActivity";
import NewBrief from "./pages/NewBrief";
import BriefDetail from "./pages/BriefDetail";
import AdminHome from "./pages/AdminHome";
import UserBriefs from "./pages/UserBriefs";
import ApiSettings from "./pages/ApiSettings";
import PublicBrief from "./pages/PublicBrief";
import NotFound from "./pages/NotFound";
import Intro from "./pages/Intro";

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "user") return <Navigate to="/home" replace />;
  return <Navigate to="/admin" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/p/:token" element={<PublicBrief />} />
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/" element={<Intro />} />
        <Route path="/home" element={<Guard roles={["user"]}><UserHome /></Guard>} />
        <Route path="/activity" element={<Guard roles={["admin", "super_admin"]}><AdminActivity /></Guard>} />
        <Route path="/briefs/new" element={<Guard><NewBrief /></Guard>} />
        <Route path="/briefs/:id" element={<Guard><BriefDetail /></Guard>} />
        <Route path="/admin" element={<Guard roles={["admin", "super_admin"]}><AdminHome /></Guard>} />
        <Route path="/admin/users/:id/briefs" element={<Guard roles={["admin", "super_admin"]}><UserBriefs /></Guard>} />
        <Route path="/settings/api" element={<Guard roles={["super_admin"]}><ApiSettings /></Guard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AnimatedRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
