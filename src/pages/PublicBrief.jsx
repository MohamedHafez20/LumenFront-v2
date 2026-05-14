import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { CheckCircle, XCircle, Send, ChevronLeft, Sparkles, Target, HelpCircle, MessageSquare, ListChecks, Telescope } from "lucide-react";
import Footer from "../components/Footer";

const pageStyles = `
  @keyframes publicRise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .public-lumen-bg {
    min-height: 100vh;
    background-image:
      linear-gradient(to bottom, rgba(5,6,18,0.30), rgba(5,6,18,0.72)),
      url('/images/Body.png');
    background-size: cover;
    background-position: center;
    padding: 34px 20px 46px;
    color: #fff;
  }

  .public-lumen-wrap {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    animation: publicRise 0.45s ease both;
  }

  .public-lumen-hero {
    text-align: center;
    margin-bottom: 22px;
  }

  .public-brand {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .public-lumen-logo {
    height: 58px;
    width: auto;
    display: block;
  }

  .public-wordmark {
    text-align: left;
  }

  .public-wordmark-name {
    color: rgba(255,255,255,0.98);
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .public-wordmark-sub {
    color: rgba(255,255,255,0.50);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .public-lumen-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: fit-content;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(220,176,0,0.12);
    border: 1px solid rgba(220,176,0,0.30);
    color: #dcb000;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 12px auto 0;
  }

  .public-lumen-title {
    font-size: clamp(30px, 5vw, 52px);
    line-height: 1.04;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
    color: rgba(255,255,255,0.98);
  }

  .public-lumen-meta {
    color: rgba(255,255,255,0.68);
    font-size: 14px;
    margin-top: 10px;
  }

  .public-lumen-card {
    background:
      radial-gradient(circle at top right, rgba(220,176,0,0.12), transparent 30%),
      rgba(255,255,255,0.065);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 18px;
    padding: 26px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 24px 72px rgba(0,0,0,0.34),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .public-note {
    color: rgba(255,255,255,0.76);
    line-height: 1.75;
    font-size: 14.5px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 14px;
    margin: 0 0 22px 0;
  }

  .public-section {
    padding: 20px 0;
    border-top: 1px solid rgba(255,255,255,0.10);
  }

  .public-section:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .public-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.88);
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 12px 0;
  }

  .public-section-icon,
  .public-pill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #dcb000;
  }

  .public-section-icon {
    width: 26px;
    height: 26px;
    border-radius: 9px;
    background: rgba(220,176,0,0.11);
    border: 1px solid rgba(220,176,0,0.24);
  }

  .public-body-text {
    color: rgba(255,255,255,0.82);
    font-size: 15px;
    line-height: 1.85;
    margin: 0;
  }

  .public-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: rgba(255,255,255,0.80);
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 10px;
  }

  .public-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #dcb000;
    box-shadow: 0 0 12px rgba(220,176,0,0.45);
    flex-shrink: 0;
    margin-top: 8px;
  }

  .public-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }

  .public-primary,
  .public-secondary {
    min-height: 52px;
    border-radius: 14px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }

  .public-primary {
    color: #fff;
    border: 1px solid rgba(34,211,160,0.34);
    background: linear-gradient(135deg, rgba(34,211,160,0.28), rgba(220,176,0,0.18));
  }

  .public-secondary {
    color: rgba(255,255,255,0.82);
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.07);
  }

  .public-primary:hover:not(:disabled),
  .public-secondary:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .public-primary:disabled,
  .public-secondary:disabled {
    opacity: 0.58;
    cursor: not-allowed;
  }

  .public-feedback-input {
    width: 100%;
    min-height: 88px;
    resize: vertical;
    background: rgba(255,255,255,0.09);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 12px;
    color: rgba(255,255,255,0.92);
    padding: 12px 13px;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.65;
    transition: all 0.2s ease;
  }

  .public-feedback-input::placeholder {
    color: rgba(255,255,255,0.46);
  }

  .public-feedback-input:focus {
    border-color: rgba(220,176,0,0.45);
    box-shadow: 0 0 0 3px rgba(220,176,0,0.10);
    background: rgba(255,255,255,0.13);
  }

  .public-field-label {
    display: block;
    color: rgba(255,255,255,0.78);
    font-size: 12.5px;
    font-weight: 800;
    margin-bottom: 7px;
    letter-spacing: 0.03em;
  }

  .public-state-card {
    text-align: center;
    padding: 54px 30px;
  }

  .public-state-card h2 {
    margin: 10px 0 8px;
    color: rgba(255,255,255,0.94);
  }

  .public-state-card p {
    color: rgba(255,255,255,0.62);
    margin: 0;
  }

  @media (max-width: 680px) {
    .public-actions {
      grid-template-columns: 1fr;
    }
    .public-lumen-card {
      padding: 20px;
    }
  }
`;

export default function PublicBrief() {
  const { token } = useParams();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState("view");
  const [feedback, setFeedback] = useState({ summary: "", goals: "", missing: "", extra: "" });
  const [fbErrors, setFbErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/briefs/p/${token}`).then((r) => {
      setBrief(r.data);
      if (r.data.status === "CONFIRMED") setStep("already_confirmed");
    }).catch(() => setError("This link is invalid or has expired.")).finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await api.post(`/briefs/p/${token}/confirm`);
      setStep("confirmed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function validateFeedback() {
    const e = {};
    if (!feedback.summary.trim() && !feedback.goals.trim() && !feedback.missing.trim() && !feedback.extra.trim()) {
      e.general = "Please fill in at least one section before sending feedback";
    }
    return e;
  }

  async function handleReject() {
    const e = validateFeedback();
    if (Object.keys(e).length) {
      setFbErrors(e);
      return;
    }
    setFbErrors({});
    setSubmitting(true);
    try {
      await api.post(`/briefs/p/${token}/reject`, feedback);
      setStep("feedback_sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <>
      <style>{pageStyles}</style>
      <div className="public-lumen-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner spinner-lg" />
      </div>
    </>
  );

  return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        className="public-lumen-bg"
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(12px)" }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
      >
        <div className="public-lumen-wrap">
          <header className="public-lumen-hero">
            <div className="public-brand">
              <img src="/images/logo.png" alt="Lumen" className="public-lumen-logo" />
              <div className="public-wordmark">
                <div className="public-wordmark-name">Lumen</div>
                <div className="public-wordmark-sub">Turn chaos into a brief</div>
              </div>
            </div>
            <h1 className="public-lumen-title">{brief?.client_name || "Project brief"}</h1>
            <div className="public-lumen-pill">
              <span className="public-pill-icon"><Sparkles size={13} strokeWidth={2.4} /></span>
              Project brief
            </div>
            <p className="public-lumen-meta">
              V{brief?.version} - {brief && new Date(brief.created_at || brief.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </header>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {step === "already_confirmed" && (
            <div className="public-lumen-card public-state-card">
              <CheckCircle size={48} color="#22d3a0" />
              <h2>Already confirmed</h2>
              <p>This brief has already been confirmed. The studio is ready to begin.</p>
            </div>
          )}

          {step === "confirmed" && (
            <div className="public-lumen-card public-state-card">
              <CheckCircle size={48} color="#22d3a0" />
              <h2>Brief confirmed</h2>
              <p>Thank you. The studio has been notified and will be in touch shortly.</p>
            </div>
          )}

          {step === "feedback_sent" && (
            <div className="public-lumen-card public-state-card">
              <Send size={48} color="#60a5fa" />
              <h2>Feedback sent</h2>
              <p>The studio has been notified. They'll review your feedback and send an updated brief shortly.</p>
            </div>
          )}

          {step === "view" && brief && (
            <>
              <div className="public-lumen-card">
                <p className="public-note">
                  Based on everything you shared, here is our understanding of your project. Please read through carefully and either confirm this is correct, or let us know what needs to change.
                </p>

                <PubSection title="What we understand you want" icon={<MessageSquare size={14} />}>
                  <p className="public-body-text">{brief.summary}</p>
                </PubSection>

                {(brief.goals || []).length > 0 && (
                  <PubSection title="Goals" icon={<Target size={14} />}>
                    {brief.goals.map((g, i) => (
                      <div key={i} className="public-item">
                        <span className="public-dot" />
                        <span>{g}</span>
                      </div>
                    ))}
                  </PubSection>
                )}

                {(brief.ambiguities || []).length > 0 && (
                  <PubSection title="Things we still need from you" icon={<HelpCircle size={14} />}>
                    {brief.ambiguities.map((a, i) => (
                      <div key={i} className="public-item">
                        <span style={{ color: "#f59e0b", fontWeight: 900, flexShrink: 0 }}>?</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </PubSection>
                )}

                {(brief.follow_up_questions || []).length > 0 && (
                  <PubSection title="Questions for you" icon={<HelpCircle size={14} />}>
                    <ol style={{ paddingLeft: 20, margin: 0 }}>
                      {brief.follow_up_questions.map((q, i) => (
                        <li key={i} style={{ marginBottom: 9, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.80)" }}>{q}</li>
                      ))}
                    </ol>
                  </PubSection>
                )}
              </div>

              <div className="public-actions">
                <button className="public-primary" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Confirming...</> : <><CheckCircle size={17} /> Yes, this is correct</>}
                </button>
                <button className="public-secondary" onClick={() => setStep("feedback")}>
                  <XCircle size={17} /> Something needs changing
                </button>
              </div>
            </>
          )}

          {/* Section-by-section feedback form */}
          {step === "feedback" && brief && (
            <>
              <button className="public-secondary" style={{ width: "auto", minHeight: 38, padding: "0 14px", marginBottom: 16 }} onClick={() => setStep("view")}>
                <ChevronLeft size={14} /> Back to brief
              </button>
              <div className="public-lumen-card">
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "rgba(255,255,255,0.94)" }}>What needs to change?</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.60)", margin: "0 0 24px" }}>
                  Each section of the brief is shown below. Correct what's wrong and answer any open questions — the more specific you are, the better the updated brief.
                </p>

                {fbErrors.general && <div className="alert alert-error" style={{ marginBottom: 16 }}>{fbErrors.general}</div>}

                {/* Summary */}
                {brief.summary && (
                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px 0" }}>Summary (from brief)</p>
                    <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.65, margin: "0 0 8px 0", padding: "10px 13px", background: "rgba(255,255,255,0.05)", borderRadius: 10, borderLeft: "3px solid rgba(220,176,0,0.35)" }}>{brief.summary}</p>
                    <label className="public-field-label">Your correction on the summary</label>
                    <textarea className="public-feedback-input" placeholder="What is wrong or unclear in the summary?" value={feedback.summary} onChange={(e) => setFeedback(f => ({ ...f, summary: e.target.value }))} />
                  </div>
                )}

                {/* Goals */}
                {(brief.goals || []).length > 0 && (
                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px 0" }}>Goals (from brief)</p>
                    <ul style={{ margin: "0 0 8px 0", paddingLeft: 18 }}>
                      {brief.goals.map((g, i) => <li key={i} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.65, marginBottom: 4 }}>{g}</li>)}
                    </ul>
                    <label className="public-field-label">Your correction on the goals</label>
                    <textarea className="public-feedback-input" placeholder="Which goals are wrong, missing, or need changing?" value={feedback.goals} onChange={(e) => setFeedback(f => ({ ...f, goals: e.target.value }))} />
                  </div>
                )}

                {/* Open questions / ambiguities */}
                {((brief.follow_up_questions || []).length > 0 || (brief.ambiguities || []).length > 0) && (
                  <div style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px 0" }}>Open questions (from brief)</p>
                    <ol style={{ margin: "0 0 8px 0", paddingLeft: 20 }}>
                      {[...(brief.follow_up_questions || []), ...(brief.ambiguities || [])].map((q, i) => <li key={i} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.65, marginBottom: 4 }}>{q}</li>)}
                    </ol>
                    <label className="public-field-label">Your answers to the open questions</label>
                    <textarea className="public-feedback-input" style={{ minHeight: 110 }} placeholder="Please answer each question as clearly as possible..." value={feedback.missing} onChange={(e) => setFeedback(f => ({ ...f, missing: e.target.value }))} />
                  </div>
                )}

                {/* Anything else */}
                <div style={{ marginBottom: 8 }}>
                  <label className="public-field-label">Anything else to add or change</label>
                  <textarea className="public-feedback-input" placeholder="Any additional context, corrections, or requirements not covered above..." value={feedback.extra} onChange={(e) => setFeedback(f => ({ ...f, extra: e.target.value }))} />
                </div>
              </div>
              <button className="public-primary" style={{ width: "100%", marginTop: 14 }} onClick={handleReject} disabled={submitting}>
                {submitting ? <><span className="spinner" /> Sending...</> : <><Send size={17} /> Send feedback to studio</>}
              </button>
            </>
          )}

        </div>
          <Footer />
      </motion.div>
    </>
  );
}

function PubSection({ title, icon, children }) {
  return (
    <section className="public-section">
      <p className="public-section-title">
        <span className="public-section-icon">{icon}</span>
        {title}
      </p>
      {children}
    </section>
  );
}
