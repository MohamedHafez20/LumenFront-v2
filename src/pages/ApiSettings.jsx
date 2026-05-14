import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Key,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  Zap,
} from "lucide-react";

const MODELS = [
  {
    id: "groq",
    name: "Groq",
    use: "Brief generation (V1 + V2)",
    model: "llama-3.1-8b + llama-3.3-70b",
    color: "#f97316",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    use: "Image & screenshot analysis",
    model: "gemini-2.5-flash",
    color: "#2563eb",
  },
];

const pageStyles = `
  
`;

export default function ApiSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [forms, setForms] = useState({});
  const [show, setShow] = useState({});
  const [testing, setTesting] = useState({});
  const [testRes, setTestRes] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (user?.role !== "super_admin") {
      navigate("/");
      return;
    }
    loadSettings();
  }, [user]);

  async function loadSettings() {
    try {
      const r = await api.get("/admin/api-keys");
      // Backend returns: [{provider, is_configured, label, model_override, expiry_date, is_paid, updated_by, updated_at}]
      const map = {};
      r.data.forEach((s) => { map[s.provider] = s; });
      setSettings(map);
      const f = {};
      r.data.forEach((s) => {
        f[s.provider] = {
          value: "",
          expiry: s.expiry_date ? new Date(s.expiry_date).toISOString().split("T")[0] : "",
          isPaid: s.is_paid || false,
          model: s.model_override || "",
        };
      });
      setForms(f);
    } catch (e) {
      console.error(e);
    }
  }

  function setField(modelId, field, val) {
    setForms((f) => ({
      ...f,
      [modelId]: { ...(f[modelId] || {}), [field]: val },
    }));
  }

  async function handleSave(modelId) {
    const f = forms[modelId] || {};
    if (!f.value) {
      toast("error", "API key is required to save");
      return;
    }
    setSaving((s) => ({ ...s, [modelId]: true }));
    try {
      const m = MODELS.find((x) => x.id === modelId);
      await api.post("/admin/api-keys", {
        provider: modelId,
        api_key: f.value,
        label: m.name,
        model_override: f.model || m.model,
        expiry_date: f.expiry || null,
        is_paid: f.isPaid,
      });
      toast(
        "success",
        `${m.name} key saved`,
        "Active immediately — no restart needed",
      );
      setForms((f2) => ({ ...f2, [modelId]: { ...f2[modelId], value: "" } }));
      loadSettings();
    } catch (e) {
      toast("error", e.response?.data?.error || "Failed to save");
    } finally {
      setSaving((s) => ({ ...s, [modelId]: false }));
    }
  }

  async function handleTest(modelId) {
    setTesting((t) => ({ ...t, [modelId]: true }));
    setTestRes((r) => ({ ...r, [modelId]: null }));
    try {
      const r = await api.post(`/admin/api-keys/${modelId}/test`);
      // Normalize: backend returns {success, error}; map to {ok, message}
      const tr = r.data;
      setTestRes((t) => ({ ...t, [modelId]: { ok: tr.success, message: tr.error || (tr.success ? "Key is valid" : "Key test failed") } }));
    } catch (e) {
      setTestRes((t) => ({
        ...t,
        [modelId]: {
          ok: false,
          message: e.response?.data?.error || "Request failed",
        },
      }));
    } finally {
      setTesting((t) => ({ ...t, [modelId]: false }));
    }
  }

  function expiryBadge(dateStr) {
    if (!dateStr) return null;
    const days = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (days < 0)
      return { label: "Expired", color: "#ff4d6d", bg: "rgba(255,77,109,0.1)" };
    if (days <= 7)
      return {
        label: `Expires in ${days}d`,
        color: "#f97316",
        bg: "rgba(249,115,22,0.1)",
      };
    if (days <= 30)
      return {
        label: `Expires in ${days}d`,
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.1)",
      };
    return {
      label: `Expires in ${days}d`,
      color: "#4ade80",
      bg: "rgba(74,222,128,0.1)",
    };
  }

  return (
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
      <style>{pageStyles}</style>
      <Nav />
      <div className="app-layout" style={{ flex: 1 }}>
        <Sidebar />
        <main className="main-content">
          <div className="lumen-admin-header" style={{ marginBottom: 28 }}>
            <h1>API settings</h1>
            <p>
              Manage AI model keys. Changes take effect immediately — no server
              restart needed.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MODELS.map((m) => {
              const s = settings[m.id];
              const f = forms[m.id] || {};
              const exp = expiryBadge(s?.expiry_date);
              const test = testRes[m.id];

              return (
                <div
                  key={m.id}
                  className="lumen-table-wrap"
                  style={{ padding: 20 }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${m.color}18`,
                        border: `1.5px solid ${m.color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Key size={20} color={m.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.88)",
                          marginBottom: 2,
                        }}
                      >
                        {m.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.3)",
                          marginBottom: 2,
                        }}
                      >
                        Model: {m.model}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                      >
                        Used for: {m.use}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {s?.has_key !== false && s && (
                        <span
                          style={{
                            fontSize: 11.5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "rgba(34,197,94,0.1)",
                            color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.2)",
                            fontWeight: 600,
                          }}
                        >
                          Key saved
                        </span>
                      )}
                      {s?.is_paid && (
                        <span
                          style={{
                            fontSize: 11.5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "rgba(220,176,0,0.1)",
                            color: "#dcb000",
                            border: "1px solid rgba(220,176,0,0.25)",
                            fontWeight: 600,
                          }}
                        >
                          Paid plan
                        </span>
                      )}
                      {exp && (
                        <span
                          style={{
                            fontSize: 11.5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: exp.bg,
                            color: exp.color,
                            fontWeight: 600,
                          }}
                        >
                          {exp.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <label className="lumen-field-label">
                        API key{" "}
                        {s ? "(leave blank to keep current)" : "(required)"}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          className="lumen-input"
                          type={show[m.id] ? "text" : "password"}
                          value={f.value || ""}
                          onChange={(e) =>
                            setField(m.id, "value", e.target.value)
                          }
                          placeholder={
                            s
                              ? "Enter new key to update"
                              : "Paste your API key here"
                          }
                          style={{ paddingRight: 40 }}
                        />
                        <button
                          onClick={() =>
                            setShow((s2) => ({ ...s2, [m.id]: !s2[m.id] }))
                          }
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.3)",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          {show[m.id] ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="lumen-field-label">
                        Expiry date{" "}
                        <span
                          style={{
                            color: "rgba(255,255,255,0.25)",
                            fontWeight: 400,
                          }}
                        >
                          (optional)
                        </span>
                      </label>
                      <input
                        className="lumen-input"
                        type="date"
                        value={f.expiry || ""}
                        onChange={(e) =>
                          setField(m.id, "expiry", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="lumen-field-label">Plan</label>
                      <select
                        className="lumen-input"
                        value={f.isPaid ? "true" : "false"}
                        onChange={(e) =>
                          setField(m.id, "isPaid", e.target.value === "true")
                        }
                      >
                        <option value="false">Free tier</option>
                        <option value="true">Paid plan</option>
                      </select>
                    </div>

                    <div>
                      <label className="lumen-field-label">
                        Model override{" "}
                        <span
                          style={{
                            color: "rgba(255,255,255,0.25)",
                            fontWeight: 400,
                          }}
                        >
                          (optional)
                        </span>
                      </label>
                      <input
                        className="lumen-input"
                        value={f.model || ""}
                        onChange={(e) =>
                          setField(m.id, "model", e.target.value)
                        }
                        placeholder={m.model}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                      paddingTop: 14,
                    }}
                  >
                    <button
                      className="lumen-btn-submit"
                      onClick={() => handleSave(m.id)}
                      disabled={saving[m.id]}
                    >
                      {saving[m.id] ? (
                        <>
                          <span className="spinner" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={13} /> Save key
                        </>
                      )}
                    </button>
                    <button
                      className="lumen-btn-cancel"
                      onClick={() => handleTest(m.id)}
                      disabled={testing[m.id]}
                    >
                      {testing[m.id] ? (
                        <>
                          <span className="spinner" /> Testing...
                        </>
                      ) : (
                        <>
                          <Zap size={13} /> Test connection
                        </>
                      )}
                    </button>
                    {test && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                        }}
                      >
                        {test.ok ? (
                          <>
                            <CheckCircle size={14} color="#4ade80" />
                            <span style={{ color: "#4ade80" }}>
                              {test.message}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={14} color="#ff4d6d" />
                            <span style={{ color: "#ff4d6d" }}>
                              {test.message}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(96,165,250,0.06)",
              border: "1px solid rgba(96,165,250,0.15)",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginTop: 24,
              lineHeight: 1.6,
            }}
          >
            <AlertTriangle
              size={15}
              color="#60a5fa"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <div>
              Keys are stored securely in the database and loaded at runtime.
              Changes take effect on the next AI call with no restart required.
              The{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                .env
              </code>{" "}
              file serves as a fallback if no database key is found.
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </motion.div>
  );
}
