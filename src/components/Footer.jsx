export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontSize: 14,
        color: "var(--text3)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "16px 0",
      }}
    >
      <img
        src="/images/Synapx-logo.png"
        alt="lumen"
        style={{ height: 40, width: "auto" }}
      />
      Powered by <strong style={{ color: "var(--text3)" }}>SynapX</strong>
    </footer>
  );
}
