import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  FilePlus,
  Activity,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <aside
      style={{
        background: `linear-gradient(
          135deg,
          rgba(10, 10, 28, 0.72) 0%,
          rgba(18, 14, 40, 0.68) 50%,
          rgba(10, 10, 28, 0.72) 100%
        )`,
        width: 200,
        flexShrink: 0,
        padding: "12px 8px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {user?.role === "user" && (
        <>
          <SectionLabel>Workspace</SectionLabel>
          <SideLink to="/home" icon={<LayoutDashboard size={15} />}>
            Activity
          </SideLink>
          <SideLink to="/briefs/new" icon={<FilePlus size={15} />}>
            New brief
          </SideLink>
        </>
      )}

      {isAdmin && (
        <>
          <SectionLabel>Management</SectionLabel>
          <SideLink to="/admin" icon={<Users size={15} />}>
            Users
          </SideLink>

          <SectionLabel>My briefs</SectionLabel>
          <SideLink to="/activity" icon={<Activity size={15} />}>
            Activity
          </SideLink>
          <SideLink to="/briefs/new" icon={<FilePlus size={15} />}>
            New brief
          </SideLink>

          {user?.role === "super_admin" && (
            <>
              <SectionLabel>System</SectionLabel>
              <SideLink to="/settings/api" icon={<Settings size={15} />}>
                API settings
              </SideLink>
            </>
          )}
        </>
      )}
    </aside>
  );
}

function SideLink({ to, icon, children }) {
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            fontSize: 13,
            letterSpacing: "1px",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.58)",
            background: isActive
              ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
              : "transparent",
            border: isActive
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid transparent",
            boxShadow: isActive
              ? "0 0 12px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "none",
            transition: "all 200ms ease",
            cursor: "pointer",
            backdropFilter: isActive ? "blur(10px)" : "none",
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              e.currentTarget.style.transform = "translateX(3px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              e.currentTarget.style.transform = "translateX(0)";
            }
          }}
        >
          <span
            style={{
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
              display: "flex",
              filter: isActive
                ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))"
                : "none",
              transition: "all 200ms ease",
            }}
          >
            {icon}
          </span>
          {children}
          {isActive && (
            <div
              style={{
                marginLeft: "auto",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              }}
            />
          )}
        </div>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(255, 255, 255, 0.91)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "0 12px",
        marginBottom: 4,
        marginTop: 20,
      }}
    >
      {children}
    </div>
  );
}