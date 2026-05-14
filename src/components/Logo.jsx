import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logo({ height = 70, mobileHeight = 48 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  function handleClick() {
    if (!user) return;
    navigate("/admin");
  }

  return (
    <img
      src="/images/logo.png"
      alt="lumen"
      onClick={handleClick}
      style={{
        position: "fixed",
        top: isMobile ? 16 : 24,
        left: isMobile ? 16 : 24,
        height: isMobile ? mobileHeight : height,
        width: "auto",
        zIndex: 10,
        cursor: user ? "pointer" : "default",
      }}
    />
  );
}
