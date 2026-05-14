export default function GlowButton({
  type = "button",
  onClick,
  disabled,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="glow-btn"
      style={{
        width: "100%",
        padding: "14px 24px",
        border: "none",
        fontSize: "1rem",
        cursor: "pointer",
        position: "relative",
        background: "linear-gradient(90deg, #0b64ff, #D4C9BE, #FFCC00)",
        borderRadius: "12px",
        color: "#fff",
        transition: "all 0.3s ease",
        boxShadow:
          "inset 0px 0px 5px #ffffffa9, inset 0px 35px 30px #131548, 0px 5px 10px #575454cc",
        textShadow: "1px 1px 1px #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 400,
        marginTop: 8,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
