import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  FilePlus, FileText, Clock, CheckCircle, RefreshCw,
  Search, Copy, Check, X, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

const STATUS_MAP = {
  DRAFT:          { label: "Draft",           icon: FileText,   color: "rgba(255,255,255,0.62)",  bg: "rgba(255,255,255,0.06)",  border: "rgba(255,255,255,0.1)" },
  SENT:           { label: "Awaiting client", icon: Clock,      color: "#60a5fa",                 bg: "rgba(96,165,250,0.1)",    border: "rgba(96,165,250,0.25)" },
  NEEDS_REVISION: { label: "Resent",          icon: RefreshCw,  color: "#f59e0b",                 bg: "rgba(245,158,11,0.1)",    border: "rgba(245,158,11,0.25)" },
  CONFIRMED:      { label: "Confirmed",       icon: CheckCircle,color: "#22d3a0",                 bg: "rgba(34,211,160,0.1)",    border: "rgba(34,211,160,0.25)" },
};

const pageStyles = ``;

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

export default function AdminActivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get("/admin/briefs").then((r) => setBriefs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: "all",           label: "All",       icon: FileText   },
    { key: "DRAFT",         label: "Drafts",    icon: FileText   },
    { key: "SENT",          label: "Awaiting",  icon: Clock      },
    { key: "NEEDS_REVISION",label: "Resent",    icon: RefreshCw  },
    { key: "CONFIRMED",     label: "Confirmed", icon: CheckCircle},
  ];

  const filtered = useMemo(() => {
    let list = active === "all" ? briefs : briefs.filter((b) => b.status === active);
    if (search.trim()) list = list.filter((b) => b.client_name.toLowerCase().includes(search.toLowerCase()));
    if (dateFrom) list = list.filter((b) => new Date(b.created_at) >= new Date(dateFrom));
    if (dateTo) { const end = new Date(dateTo); end.setHours(23,59,59,999); list = list.filter((b) => new Date(b.created_at) <= end); }
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
          display: "flex", flexDirection: "column", minHeight: "100vh",
          backgroundImage: "url('/images/Body.png')",
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content">

            {/* Header */}
            <div className="lumen-activity-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1>My Activity</h1>
                <p>Briefs you've created</p>
              </div>
              <Link to="/briefs/new" className="lumen-new-btn">
                <FilePlus size={15} /> New brief
              </Link>
            </div>

            {/* Search + filters */}
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

            {/* Category tabs */}
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

            {/* Content */}
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
                              : "—"}
                          </td>
                          <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                              <CopyBtn token={b.share_token} />
                              <button className="lumen-arrow" onClick={() => navigate(`/briefs/${b.id}`)}>›</button>
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
