import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Users,
  UserPlus,
  Building2,
  ChevronRight,
  Trash2,
  X,
  Search,
  Check,
  Copy,
} from "lucide-react";

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
    <button
      onClick={copy}
      className="lumen-copy-btn"
      title="Copy share link"
      style={{ opacity: copied ? 1 : 0.6 }}
    >
      {copied
        ? <Check size={13} color="#22d3a0" />
        : <Copy size={13} color="rgba(255,255,255,0.5)" />}
    </button>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const isSuper = user?.role === "super_admin";

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const reqs = [api.get("/admin/users")];
      if (isSuper) {
        reqs.push(api.get("/admin/departments"));
        reqs.push(api.get("/admin/admins"));
      }
      const [u, d, a] = await Promise.all(reqs);
      setUsers(u.data);
      if (d) setDepts(d.data);
      if (a) setAdmins(a.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id, name, e) {
    e.stopPropagation();
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast("success", "User deleted");
      load();
    } catch (err) {
      toast("error", err.response?.data?.detail || err.response?.data?.error || "Failed to delete");
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const tabs = ["users", ...(isSuper ? ["admins", "departments"] : [])];

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

            {/* Header */}
            <div
              className="lumen-admin-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <div>
                <h1>Team management</h1>
                <p>
                  {isSuper
                    ? "Manage departments, admins and users"
                    : "Manage users in your department"}
                </p>
              </div>
              <button
                className="lumen-add-btn"
                onClick={() =>
                  setModal(
                    tab === "departments" ? "dept" : tab === "admins" ? "admin" : "user"
                  )
                }
              >
                <UserPlus size={15} />
                Add {tab === "departments" ? "department" : tab === "admins" ? "admin" : "user"}
              </button>
            </div>

            {/* Tabs */}
            <div className="lumen-tabs">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSearch(""); }}
                  className={`lumen-tab ${tab === t ? "active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            {tab === "users" && (
              <div className="lumen-search-wrap">
                <Search size={14} className="lumen-search-icon" />
                <input
                  className="lumen-search-input"
                  style={{ paddingRight: search ? 32 : 12 }}
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="lumen-search-clear" onClick={() => setSearch("")}>
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="lumen-spinner-wrap">
                <span className="spinner spinner-lg" />
              </div>
            ) : (
              <>
                {/* Users Table */}
                {tab === "users" && (
                  <div className="lumen-table-wrap">
                    <table className="lumen-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>Briefs</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="lumen-empty">
                                <p className="lumen-empty-title">
                                  {search ? "No users match your search" : "No users yet"}
                                </p>
                                <p className="lumen-empty-sub">
                                  {search ? "Try a different name or email." : "Add your first user to get started."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr
                              key={u.id}
                              onClick={() => navigate(`/admin/users/${u.id}/briefs`)}
                              style={{ cursor: "pointer" }}
                            >
                              <td className="primary">{u.name}</td>
                              <td>{u.email}</td>
                              <td>
                                {new Date(u.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </td>
                              <td>
                                <span className="lumen-view-link">
                                  <ChevronRight size={13} color="rgba(255,255,255,0.2)" />
                                  View history
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="lumen-delete-btn"
                                  onClick={(e) => deleteUser(u.id, u.name, e)}
                                >
                                  <Trash2 size={14} color="#ff4d6d" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Admins Table */}
                {tab === "admins" && (
                  <div className="lumen-table-wrap">
                    <table className="lumen-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.length === 0 ? (
                          <tr>
                            <td colSpan={4}>
                              <div className="lumen-empty">
                                <p className="lumen-empty-title">No admins yet</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          admins.map((a) => (
                            <tr key={a.id}>
                              <td className="primary">{a.name}</td>
                              <td>{a.email}</td>
                              <td>{depts.find((d) => d.id === a.dept_id)?.name || "—"}</td>
                              <td>
                                {new Date(a.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Departments Table */}
                {tab === "departments" && (
                  <div className="lumen-table-wrap">
                    <table className="lumen-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {depts.length === 0 ? (
                          <tr>
                            <td colSpan={3}>
                              <div className="lumen-empty">
                                <p className="lumen-empty-title">No departments yet</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          depts.map((d) => (
                            <tr key={d.id}>
                              <td className="primary">{d.name}</td>
                              <td>{d.description || "—"}</td>
                              <td>
                                {new Date(d.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
        <Footer />

        {modal && (
          <CreateModal
            type={modal}
            depts={depts}
            userRole={user?.role}
            userDeptId={user?.dept_id}
            onClose={() => setModal(null)}
            onCreated={() => { setModal(null); load(); }}
            toast={toast}
          />
        )}
      </motion.div>
    </>
  );
}

function CreateModal({ type, depts, userRole, userDeptId, onClose, onCreated, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", dept_id: "", description: "", admin_name: "", admin_email: "", admin_password: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const titles = { user: "Add user", admin: "Add admin", dept: "Add department" };

  function validate() {
    const e = {};
    if (type !== "dept") {
      if (!form.name.trim()) e.name = "Name is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!form.password.trim()) e.password = "Password is required";
      if (userRole === "super_admin" && !form.dept_id) e.dept_id = "Department is required";
    } else {
      if (!form.name.trim()) e.name = "Department name is required";
      if (!form.admin_email.trim()) e.admin_email = "Admin email is required";
      if (!form.admin_password.trim()) e.admin_password = "Admin password is required";
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (type === "user") await api.post("/admin/users", { ...form, dept_id: userRole === "admin" ? userDeptId : form.dept_id });
      if (type === "admin") await api.post("/admin/admins", form);
      if (type === "dept") await api.post("/admin/departments", { name: form.name, description: form.description, admin_email: form.admin_email, admin_password: form.admin_password, admin_name: form.admin_name || form.admin_email.split("@")[0] });
      toast("success", `${titles[type]} created`);
      onCreated();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || "Something went wrong";
      if (msg.includes("already")) setErrors({ email: "This email is already in use" });
      else toast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div
      className="lumen-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="lumen-modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 className="lumen-modal-title">{titles[type]}</h3>
          <button className="lumen-modal-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {type !== "dept" ? (
            <>
              {[
                ["name", "Full name", "text", "Sara Ahmed"],
                ["email", "Email address", "email", "sara@studio.com"],
                ["password", "Password", "password", "Min. 8 characters"],
              ].map(([k, l, t, p]) => (
                <div className="lumen-field" key={k}>
                  <label className="lumen-field-label">{l}</label>
                  <input
                    className={`lumen-input ${errors[k] ? "error" : ""}`}
                    type={t}
                    value={form[k]}
                    onChange={set(k)}
                    placeholder={p}
                  />
                  {errors[k] && <p className="lumen-field-error">{errors[k]}</p>}
                </div>
              ))}
              {userRole === "super_admin" && (
                <div className="lumen-field">
                  <label className="lumen-field-label">Department</label>
                  <select
                    className={`lumen-input ${errors.dept_id ? "error" : ""}`}
                    value={form.dept_id}
                    onChange={set("dept_id")}
                  >
                    <option value="">Select department</option>
                    {depts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.dept_id && <p className="lumen-field-error">{errors.dept_id}</p>}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="lumen-field">
                <label className="lumen-field-label">Department name</label>
                <input
                  className={`lumen-input ${errors.name ? "error" : ""}`}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Design Department"
                />
                {errors.name && <p className="lumen-field-error">{errors.name}</p>}
              </div>
              <div className="lumen-field">
                <label className="lumen-field-label">
                  Description{" "}
                  <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="lumen-input"
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Optional description"
                />
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "16px 0 14px", paddingTop: 14 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>Department Admin Account</p>
              </div>
              {[
                ["admin_name", "Admin full name", "text", "e.g. Sara Ahmed", false],
                ["admin_email", "Admin email", "email", "admin@studio.com", true],
                ["admin_password", "Admin password", "password", "Min. 8 characters", true],
              ].map(([k, l, t, p, req]) => (
                <div className="lumen-field" key={k}>
                  <label className="lumen-field-label">{l}{req && " *"}</label>
                  <input
                    className={`lumen-input ${errors[k] ? "error" : ""}`}
                    type={t}
                    value={form[k]}
                    onChange={set(k)}
                    placeholder={p}
                  />
                  {errors[k] && <p className="lumen-field-error">{errors[k]}</p>}
                </div>
              ))}
            </>
          )}

          <div className="lumen-modal-actions">
            <button type="button" className="lumen-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="lumen-btn-submit" disabled={saving}>
              {saving ? <><span className="spinner" /> Creating...</> : `Create ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}