import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import GlowButton from "../components/GlowButton";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.response?.data?.detail || err.response?.data?.detail || err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        minHeight: "100vh",
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/images/5.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 0,
      }}
    >
      <Logo />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h3
          style={{
            fontSize: isMobile ? "14px" : "20px",
            fontWeight: 100,
            color: "#FFCC00",
            letterSpacing: "-1px",
            marginBottom: 0,
            lineHeight: 1.1,
          }}
        >
          Now Live
        </h3>
        <h3
          style={{
            fontSize: isMobile ? "24px" : "40px",
            fontWeight: 200,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: -10,
            lineHeight: 1.1,
          }}
        >
          Introducing
        </h3>
        <h1
          style={{
            fontSize: isMobile ? "72px" : "clamp(72px, 8vw, 100px)",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Lumen
        </h1>

        {apiError && (
          <div
            className="alert alert-error"
            style={{ marginBottom: 18, width: "100%" }}
          >
            <span>{apiError}</span>
          </div>
        )}

        <form className="form_front" style={{ width: "100%" }}>
          <div
            style={{
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: 300,
              color: "#ffffff",
              letterSpacing: "-1px",
              marginBottom: 10,
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Sign in to your workspace
          </div>

          <div style={{ width: "100%" }}>
            <input
              className={`input ${errors.email ? "error" : ""}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoFocus
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ position: "relative" }}>
              <input
                className={`input ${errors.password ? "error" : ""}`}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  paddingRight: 40,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          <GlowButton type="button" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign in
              </>
            )}
          </GlowButton>
        </form>
      </div>
    </motion.div>
  );
}
