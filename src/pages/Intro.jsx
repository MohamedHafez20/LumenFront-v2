import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
const IMAGES = [
  "/images/1.png",
  // "/images/2.png",
  // "/images/3.png",
  "/images/4.png",
];

export default function Intro() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (current === IMAGES.length - 1) {
      setTimeout(() => setShowContent(true), 200);
      return;
    }
    const interval = setInterval(() => {
      const nextIndex = current + 1;
      setNext(nextIndex);
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(nextIndex);
        setTransitioning(false);
      }, 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${IMAGES[current]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${IMAGES[next]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
          opacity: transitioning ? 1 : 0,
          transition: transitioning ? "opacity 1000ms ease-in-out" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 20px ",
          opacity: showContent ? 1 : 0,
          filter: showContent ? "blur(0px)" : "blur(6px)",
          transition: "opacity 1000ms ease, filter 500ms ease",
          overflow: "hidden",
        }}
      >
        <Logo />
        <h3
          style={{
            fontSize: isMobile ? "14px" : "clamp(20px, 6vw, 20px)",
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
            fontSize: isMobile ? "24px" : "clamp(36px, 6vw, 40px)",
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
            fontSize: isMobile ? "72px" : "clamp(36px, 6vw, 128px)",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Lumen
        </h1>
        <p
          style={{
            fontSize: isMobile ? "13px" : "clamp(16px, 2vw, 22px)",
            color: "rgba(255,255,255,0.75)",
            marginBottom: isMobile ? 48 : 100,
            fontWeight: 100,
            maxWidth: isMobile ? 300 : 490,
            lineHeight: 1.6,
          }}
        >
          LIGHT ON WHAT CLIENTS ACTUALLY MEAN
        </p>
        <button
          onClick={() => navigate("/login")}
          className="glow-btn"
          style={{
            margin: "50px ",
            padding: isMobile ? "12px 48px" : "12px 90px",
            border: "none",
            fontSize: isMobile ? "1rem" : "1.2rem",
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
            gap: "5px",
            fontWeight: 400,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none">
              <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
              <path
                d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"
                fill="currentColor"
              />
            </g>
          </svg>
          Get Started
        </button>
        <Footer />
      </div>
    </motion.div>
  );
}
