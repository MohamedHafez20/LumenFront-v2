import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  FilePlus, FileText, Clock, CheckCircle, RefreshCw,
  Search, Copy, Check, X, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

const STATUS_MAP = {
  DRAFT:          { label: "Draft",           icon: FileText,    color: "rgba(255,255,255,0.62)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  SENT:           { label: "Awaiting client", icon: Clock,       color: "#60a5fa",                bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)" },
  NEEDS_REVISION: { label: "Resent",          icon: RefreshCw,   color: "#f59e0b",                bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)" },
  CONFIRMED:      { label: "Confirmed",       icon: CheckCircle, color: "#22d3a0",                bg: "rgba(34,211,160,0.1)",   border: "rgba(34,211,160,0.25)" },
};

const pageStyles = `
  .lumen-activity-header h1 {
    font-size: 20px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.91);
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }
  .lumen-activity-header p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.68);
    margin: 0;
  }

  .lumen-new-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 10px;
    letter-spacing: 1px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: rgba(220,176,0,0.12);
    border: 1px solid rgba(220,176,0,0.28);
    color: #dcb000;
    text-decoration: none;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 0 16px rgba(220,176,0,0.08);
  }
  .lumen-new-btn:hover {
    background: rgba(220,176,0,0.18);
    border-color: rgba(220,176,0,0.45);
    box-shadow: 0 4px 20px rgba(220,176,0,0.2);
    transform: translateY(-1px);
  }

  .lumen-search-wrap { position: relative; flex: 1; max-width: 360px; }
  .lumen-search-icon {
    position: absolute; left: 11px; top: 50%;
    transform: translateY(-50%);
    color: rgb(255, 255, 255); pointer-events: none;
  }
  .lumen-search-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 9px 12px 9px 34px;
    font-size: 13px;
    color: rgb(255, 255, 255);
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .lumen-search-input::placeholder { color: rgba(255,255,255,0.52); }
  .lumen-search-input:focus {
    border-color: rgba(220,176,0,0.3);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(220,176,0,0.06);
  }
  .lumen-search-clear {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgb(255, 255, 255); display: flex; padding: 0;
    transition: color 0.15s;
  }
  .lumen-search-clear:hover { color: rgba(255, 0, 0, 0.92); }

  .lumen-date-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.72);
    transition: all 0.2s ease;
  }
  .lumen-date-btn:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.75);
  }
  .lumen-date-btn.active {
    background: rgba(220,176,0,0.1);
    border-color: rgba(220,176,0,0.28);
    color: #dcb000;
  }

  .lumen-clear-btn {
    padding: 8px 14px; border-radius: 10px;
    font-size: 12.5px; font-weight: 500; cursor: pointer;
    background: rgba(222, 12, 12, 0.57);
    border: 1px solid rgba(255,77,109,0.15);
    color: #ffffff;
    transition: all 0.2s ease;
  }
  .lumen-clear-btn:hover {
    background: rgba(228, 15, 54, 0.81);
    border-color: rgba(255,77,109,0.3);
  }

  .lumen-date-panel {
    display: flex; gap: 12px; margin-top: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    align-items: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .lumen-date-label {
    font-size: 13px; color: rgba(255,255,255,0.68);
    font-weight: 500; white-space: nowrap;
  }
  .lumen-date-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 8px;
    padding: 7px 11px;
    font-size: 13px;
    color: rgba(255,255,255,0.86);
    outline: none;
    width: 160px;
    transition: all 0.2s ease;
    color-scheme: dark;
  }
  .lumen-date-input:focus {
    border-color: rgba(220,176,0,0.3);
    box-shadow: 0 0 0 3px rgba(220,176,0,0.06);
  }

  .lumen-cat-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .lumen-cat-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.68);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s ease;
  }
  .lumen-cat-tab:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.75);
  }
  .lumen-cat-tab.active {
    background: rgba(220,176,0,0.12);
    border-color: rgba(220,176,0,0.3);
    color: #dcb000;
    box-shadow: 0 0 16px rgba(220,176,0,0.1);
    font-weight: 600;
  }
  .lumen-cat-count {
    border-radius: 20px; padding: 1px 7px;
    font-size: 11.5px; font-weight: 600;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.66);
  }
  .lumen-cat-tab.active .lumen-cat-count {
    background: rgba(220,176,0,0.2);
    color: #dcb000;
  }

  .lumen-table-wrap {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .lumen-table { width: 100%; border-collapse: collapse; }
  .lumen-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.07); }
  .lumen-table th {
    padding: 12px 16px; font-size: 11.5px; font-weight: 700;
    color: rgba(255,255,255,0.56); text-align: left;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .lumen-table td {
    padding: 13px 16px; font-size: 13.5px;
    color: rgba(255,255,255,0.76);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .lumen-table tbody tr:last-child td { border-bottom: none; }
  .lumen-table tbody tr { transition: background 0.15s ease; }
  .lumen-table tbody tr:hover { background: rgba(255,255,255,0.04); }
  .lumen-table td.primary { color: rgba(255,255,255,0.96); font-weight: 600; }

  .lumen-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
    border: 1px solid;
  }

  .lumen-mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12.5px;
    color: rgba(255,255,255,0.72);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 2px 7px;
  }

  .lumen-copy-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; transition: all 0.2s ease;
  }
  .lumen-copy-btn:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.15);
  }

  .lumen-arrow {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.64);
    font-size: 16px; cursor: pointer;
    transition: all 0.2s ease;
  }
  .lumen-arrow:hover {
    background: rgba(220,176,0,0.1);
    border-color: rgba(220,176,0,0.25);
    color: #dcb000;
  }

  .lumen-empty-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 56px 20px;
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .lumen-empty-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    color: rgba(255,255,255,0.46);
  }
  .lumen-empty-title {
    font-size: 15px; font-weight: 700;
    color: rgba(255,255,255,0.72); margin: 0 0 6px 0;
  }
  .lumen-empty-sub {
    font-size: 13px; color: rgba(255,255,255,0.52); margin: 0 0 18px 0;
  }
  .lumen-empty-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    font-size: 12.5px; font-weight: 600; cursor: pointer;
    background: rgba(220,176,0,0.1);
    border: 1px solid rgba(220,176,0,0.25);
    color: #dcb000; text-decoration: none;
    transition: all 0.2s ease;
  }
  .lumen-empty-btn:hover {
    background: rgba(220,176,0,0.16);
    border-color: rgba(220,176,0,0.4);
  }
`;

function CopyBtn({ token }) {
  const [copied, setCopied] = useState(false);
  function copy(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/p/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="lumen-copy-btn" title="Copy share link" style={{ opacity: copied ? 1 : 0.6 }}>
      {copied ? <Check size={13} color="#22d3a0" /> : <Copy size={13} color="rgba(255,255,255,0.5)" />}
    </button>
  );
}

export default function UserHome() {
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
    api.get(`/briefs${params}`).then((r) => setBriefs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: "all",            label: "All",       icon: FileText },
    { key: "DRAFT",          label: "Drafts",    icon: FileText },
    { key: "SENT",           label: "Awaiting",  icon: Clock },
    { key: "NEEDS_REVISION", label: "Resent",    icon: RefreshCw },
    { key: "CONFIRMED",      label: "Confirmed", icon: CheckCircle },
  ];

  const filtered = useMemo(() => {
    let list = active === "all" ? briefs : briefs.filter((b) => b.status === active);
    if (search.trim()) list = list.filter((b) => b.client_name.toLowerCase().includes(search.toLowerCase()));
    if (dateFrom) list = list.filter((b) => new Date(b.created_at) >= new Date(dateFrom));
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((b) => new Date(b.created_at) <= end);
    }
    return list;
  }, [briefs, active, search, dateFrom, dateTo]);

  const count = (key) => {
    let list = key === "all" ? briefs : briefs.filter((b) => b.status === key);
    if (search.trim()) list = list.filter((b) => b.client_name.toLowerCase().includes(search.toLowerCase()));
    return list.length;
  };

  const hasFilters = search || dateFrom || dateTo;
  function clearFilters() { setSearch(""); setDateFrom(""); setDateTo(""); }

  return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(12px)" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundImage: "url('/images/Body.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content">
            <div className="lumen-activity-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1>My Activity</h1>
                <p>All your project briefs in one place</p>
              </div>
              <Link to="/briefs/new" className="lumen-new-btn">
                <FilePlus size={15} /> New brief
              </Link>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="lumen-search-wrap">
                  <Search size={14} className="lumen-search-icon" />
                  <input
                    className="lumen-search-input"
                    style={{ paddingRight: search ? 32 : 12 }}
                    placeholder="Search by client name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="lumen-search-clear" onClick={() => setSearch("")}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                <button
                  className={`lumen-date-btn ${showFilters ? "active" : ""}`}
                  onClick={() => setShowFilters((f) => !f)}
                >
                  <Calendar size={13} /> Date range
                  {(dateFrom || dateTo) && (
                    <span style={{ background: "#ff4d6d", borderRadius: "50%", width: 6, height: 6, display: "inline-block" }} />
                  )}
                </button>

                {hasFilters && (
                  <button className="lumen-clear-btn" onClick={clearFilters}>Clear filters</button>
                )}
              </div>

              {showFilters && (
                <div className="lumen-date-panel">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label className="lumen-date-label">From</label>
                    <input type="date" className="lumen-date-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label className="lumen-date-label">To</label>
                    <input type="date" className="lumen-date-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button className="lumen-clear-btn" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</button>
                  )}
                </div>
              )}
            </div>

            <div className="lumen-cat-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActive(cat.key)}
                  className={`lumen-cat-tab ${active === cat.key ? "active" : ""}`}
                >
                  <cat.icon size={13} />
                  {cat.label}
                  <span className="lumen-cat-count">{count(cat.key)}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <span className="spinner spinner-lg" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="lumen-empty-card">
                <div className="lumen-empty-icon"><FileText size={22} /></div>
                <p className="lumen-empty-title">{hasFilters ? "No results found" : "No briefs yet"}</p>
                <p className="lumen-empty-sub">{hasFilters ? "Try adjusting your search or date range." : "Create your first brief to get started."}</p>
                {hasFilters ? (
                  <button className="lumen-empty-btn" onClick={clearFilters}>Clear filters</button>
                ) : (
                  <Link to="/briefs/new" className="lumen-empty-btn">
                    <FilePlus size={14} /> New brief
                  </Link>
                )}
              </div>
            ) : (
              <div className="lumen-table-wrap">
                <table className="lumen-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Version</th>
                      <th>Created</th>
                      <th>Confirmed</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => {
                      const s = STATUS_MAP[b.status] || STATUS_MAP.DRAFT;
                      return (
                        <tr key={b.id} onClick={() => navigate(`/briefs/${b.id}`)} style={{ cursor: "pointer" }}>
                          <td className="primary">{b.client_name}</td>
                          <td>
                            <span className="lumen-status-badge" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                              <s.icon size={10} /> {s.label}
                            </span>
                          </td>
                          <td><span className="lumen-mono">V{b.current_version}</span></td>
                          <td style={{ color: "rgba(255,255,255,0.58)", fontSize: 12.5 }}>
                            {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ fontSize: 12.5, color: b.confirmed_at ? "#22d3a0" : "rgba(255,255,255,0.45)" }}>
                            {b.confirmed_at
                              ? new Date(b.confirmed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                              : "-"}
                          </td>
                          <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                              <CopyBtn token={b.share_token} />
                              <button className="lumen-arrow" onClick={() => navigate(`/briefs/${b.id}`)}>{">"}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
        <Footer />
      </motion.div>
    </>
  );
}
