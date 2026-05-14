import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, X, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

const TYPE_COLOR = {
  BRIEF_CONFIRMED: "#22d3a0",
  BRIEF_REJECTED: "#ff4d6d",
  BRIEF_RESENT: "#60a5fa",
};
const TYPE_ICON = {
  BRIEF_CONFIRMED: "✓",
  BRIEF_REJECTED: "✕",
  BRIEF_RESENT: "→",
};

function getWsBase() {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl.replace(/^http/, "ws");
  return "";
}

export default function Nav() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef();
  const wsRef = useRef(null);
  // FIX #6: Track seen notification IDs to prevent duplicate toasts
  const seenNotifIds = useRef(new Set());
  // FIX #6: Track if WS is intentionally closed (cleanup) to stop reconnect loop
  const closedIntentionally = useRef(false);

  const unread = notifs.filter((n) => !n.is_read).length;

  const handleWsMessage = useCallback(
    (event) => {
      try {
        const n = JSON.parse(event.data);
        if (!n || !n.type) return;

        // FIX #6: Deduplicate by notification ID — ignore if already shown
        const notifId = n.id || `${n.type}_${n.brief_id}_${n.title}`;
        if (seenNotifIds.current.has(notifId)) return;
        seenNotifIds.current.add(notifId);

        setNotifs((prev) => {
          // Also deduplicate against existing notifs list
          if (n.id && prev.some((x) => x.id === n.id)) return prev;
          return [{ ...n, is_read: false }, ...prev];
        });

        toast(
          n.type === "BRIEF_CONFIRMED"
            ? "success"
            : n.type === "BRIEF_REJECTED"
              ? "error"
              : "info",
          n.title,
          n.body,
          n.brief_id ? () => navigate(`/briefs/${n.brief_id}`) : null
        );
      } catch (_) {}
    },
    [toast, navigate]
  );

  useEffect(() => {
    if (!user) return;

    // Load existing notifications; seed seenIds from DB records
    api
      .get("/briefs/notifications/all")
      .then((r) => {
        const data = r.data || [];
        data.forEach((n) => {
          if (n.id) seenNotifIds.current.add(n.id);
        });
        setNotifs(data);
      })
      .catch(() => {});

    const wsBase = getWsBase();
    const wsUrl = wsBase
      ? `${wsBase}/ws/${user.id}`
      : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/${user.id}`;

    let reconnectTimer;
    closedIntentionally.current = false;

    function connect() {
      if (closedIntentionally.current) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = handleWsMessage;
      ws.onclose = () => {
        if (!closedIntentionally.current) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    return () => {
      closedIntentionally.current = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [user, handleWsMessage]);

  useEffect(() => {
    function handler(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function openPanel() {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      await api.post("/briefs/notifications/read-all").catch(() => {});
      setNotifs((n) => n.map((x) => ({ ...x, is_read: true })));
    }
  }

  function handleNotifClick(n) {
    setOpen(false);
    if (n.brief_id) navigate(`/briefs/${n.brief_id}`);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="lumen-nav">
        {user ? (
          <span className="lumen-role-pill">{user.role.replace("_", " ")}</span>
        ) : (
          <div style={{ minWidth: 80 }} />
        )}

        <Link
          to={
            user?.role === "admin" || user?.role === "super_admin"
              ? "/admin"
              : "/home"
          }
          className="lumen-logo-link"
        >
          <img src="/images/logo.png" alt="lumen" style={{ height: 50, width: "auto" }} />
          <div>
            <div className="lumen-logo-wordmark">Lumen</div>
            <div className="lumen-logo-tagline">Turn Chaos into a Brief</div>
          </div>
        </Link>

        {user && (
          <div className="lumen-nav-actions">
            {user.role === "super_admin" && (
              <Link to="/settings/api" style={{ textDecoration: "none" }}>
                <button className="lumen-icon-btn settings" title="API Settings">
                  <Settings size={16} />
                </button>
              </Link>
            )}

            {/* FIX #5: position:relative + z-index on panel to fix dropdown overlay */}
            <div style={{ position: "relative", zIndex: 200 }} ref={panelRef}>
              <button className="lumen-icon-btn" onClick={openPanel} title="Notifications">
                <Bell size={16} />
                {unread > 0 && (
                  <span className="lumen-badge">{unread > 99 ? "99+" : unread}</span>
                )}
              </button>

              {open && (
                <div
                  className="lumen-notif-panel"
                  style={{ position: "absolute", zIndex: 9999 }}
                >
                  <div className="lumen-notif-header">
                    <span className="lumen-notif-title">Notifications</span>
                    <button className="lumen-notif-close" onClick={() => setOpen(false)}>
                      <X size={13} />
                    </button>
                  </div>

                  <div className="lumen-notif-list">
                    {notifs.length === 0 ? (
                      <div className="lumen-notif-empty">No notifications yet</div>
                    ) : (
                      notifs.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={`lumen-notif-item ${!n.is_read ? "unread" : ""}`}
                          onClick={() => handleNotifClick(n)}
                          style={{ cursor: n.brief_id ? "pointer" : "default" }}
                        >
                          <div
                            className="lumen-notif-avatar"
                            style={{
                              background: `${TYPE_COLOR[n.type]}15`,
                              color: TYPE_COLOR[n.type],
                              border: `1px solid ${TYPE_COLOR[n.type]}30`,
                              boxShadow: `0 0 10px ${TYPE_COLOR[n.type]}18`,
                            }}
                          >
                            {TYPE_ICON[n.type] || "·"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className={`lumen-notif-item-title${n.is_read ? " read" : ""}`}>
                              {n.title}
                            </div>
                            <div className="lumen-notif-item-body">{n.body}</div>
                            <div className="lumen-notif-item-time">
                              {new Date(n.created_at).toLocaleString("en-GB", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {n.brief_id && (
                            <ChevronRight size={13} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 9 }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {notifs.length > 0 && (
                    <div className="lumen-notif-footer">
                      <button
                        className="lumen-mark-read-btn"
                        onClick={async () => {
                          await api.post("/briefs/notifications/read-all");
                          setNotifs((n) => n.map((x) => ({ ...x, is_read: true })));
                          setOpen(false);
                        }}
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="lumen-icon-btn logout" title="Sign out" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
