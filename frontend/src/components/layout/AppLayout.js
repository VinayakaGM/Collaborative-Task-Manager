import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getInitials } from "../../utils/helpers";
import toast from "react-hot-toast";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: IconGrid },
  { to: "/tasks", label: "Tasks", icon: IconTasks },
  { to: "/activity", label: "Activity", icon: IconActivity },
];

export default function AppLayout() {
  const { user, logout, isManager } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--bg-sidebar)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transition: "transform 0.3s",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "28px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11l3 3L22 4"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "white",
                letterSpacing: "-0.5px",
              }}
            >
              TaskFlow
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: "14px 24px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 20,
              background: isManager
                ? "rgba(99,102,241,0.25)"
                : "rgba(16,185,129,0.2)",
              color: isManager ? "#a5b4fc" : "#6ee7b7",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {isManager ? "⚡ Manager" : "👤 User"}
          </span>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                color: isActive ? "white" : "rgba(148,163,184,0.8)",
                background: isActive ? "rgba(99,102,241,0.25)" : "transparent",
                textDecoration: "none",
                fontFamily: "Syne, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.15s",
                borderLeft: isActive
                  ? "3px solid #6366f1"
                  : "3px solid transparent",
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user card */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              cursor: "pointer",
              color: "rgba(148,163,184,0.8)",
              fontFamily: "Syne, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {dark ? "☀️" : "🌙"} {dark ? "Light Mode" : "Dark Mode"}
          </button>

          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 8px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 12,
                fontFamily: "Syne, sans-serif",
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: "Syne, sans-serif",
                  truncate: true,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  color: "rgba(100,116,139,0.9)",
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(239,68,68,0.8)",
              fontFamily: "Syne, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <IconLogout size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--bg-secondary)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function IconGrid({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconTasks({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function IconActivity({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconLogout({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
