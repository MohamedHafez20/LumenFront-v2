import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  ChevronLeft,
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
  Paperclip,
  Play,
  Pause,
  ExternalLink,
  X,
  Copy,
  User,
  MessageSquare,
  Target,
  HelpCircle,
} from "lucide-react";

const STATUS = {
  DRAFT:          { label: "Draft",           icon: FileText,    color: "rgba(255,255,255,0.62)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
  SENT:           { label: "Awaiting client", icon: Clock,       color: "#60a5fa",                bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)" },
  NEEDS_REVISION: { label: "Needs revision",  icon: RefreshCw,   color: "#f59e0b",                bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)" },
  CONFIRMED:      { label: "Confirmed",       icon: CheckCircle, color: "#22d3a0",                bg: "rgba(34,211,160,0.1)",   border: "rgba(34,211,160,0.25)" },
};

const pageStyles = `
  @keyframes userBriefRise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .user-briefs-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-image: url('/images/Body.png');
    background-size: cover;
    background-position: center;
  }

  .user-briefs-page {
    max-width: 1120px;
    margin: 0 auto;
    padding-bottom: 110px;
    animation: userBriefRise 0.45s ease both;
  }

  .user-briefs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  .user-briefs-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(220,176,0,0.12);
    border: 1px solid rgba(220,176,0,0.28);
    color: #dcb000;
    box-shadow: 0 0 18px rgba(220,176,0,0.10);
  }

  .user-briefs-header h1 {
    font-size: 22px;
    font-weight: 800;
    color: rgba(255,255,255,0.94);
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }

  .user-briefs-header p {
    font-size: 13.5px;
    color: rgba(255,255,255,0.64);
    margin: 0;
  }

  .user-back-btn,
  .user-copy-btn,
  .user-load-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    font-weight: 700;
  }

  .user-back-btn,
  .user-copy-btn {
    min-height: 36px;
    padding: 0 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.72);
    font-size: 12.5px;
  }

  .user-back-btn:hover,
  .user-copy-btn:hover {
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.96);
  }

  .user-back-btn:hover {
    transform: translateX(-2px);
  }

  .user-table-wrap {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .user-table {
    width: 100%;
    border-collapse: collapse;
  }

  .user-table thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .user-table th {
    padding: 12px 16px;
    font-size: 11.5px;
    font-weight: 700;
    color: rgba(255,255,255,0.56);
    text-align: left;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .user-table td {
    padding: 13px 16px;
    font-size: 13.5px;
    color: rgba(255,255,255,0.76);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .user-table tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .user-table tbody tr:hover {
    background: rgba(255,255,255,0.04);
  }

  .user-table tbody tr:last-child td {
    border-bottom: none;
  }

  .user-table td.primary {
    color: rgba(255,255,255,0.96);
    font-weight: 600;
  }

  .user-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid;
  }

  .user-mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12.5px;
    color: rgba(255,255,255,0.72);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 2px 7px;
  }

  .user-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.64);
    font-size: 16px;
    margin-left: auto;
    transition: all 0.2s ease;
  }

  .user-table tr:hover .user-arrow {
    background: rgba(220,176,0,0.1);
    border-color: rgba(220,176,0,0.25);
    color: #dcb000;
  }

  .user-empty-card,
  .user-detail-card {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow:
      0 18px 48px rgba(0,0,0,0.22),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .user-empty-card {
    text-align: center;
    padding: 58px 20px;
  }

  .user-empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    color: rgba(255,255,255,0.50);
  }

  .user-empty-title {
    font-size: 15px;
    font-weight: 800;
    color: rgba(255,255,255,0.76);
    margin: 0 0 6px;
  }

  .user-empty-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.52);
    margin: 0;
  }

  .user-load-btn {
    min-height: 40px;
    padding: 0 18px;
    background: rgba(220,176,0,0.10);
    border: 1px solid rgba(220,176,0,0.25);
    color: #dcb000;
    font-size: 13px;
  }

  .user-load-btn:hover {
    background: rgba(220,176,0,0.16);
    border-color: rgba(220,176,0,0.42);
    transform: translateY(-1px);
  }

  .user-detail-hero {
    background:
      radial-gradient(circle at top right, rgba(220,176,0,0.14), transparent 34%),
      linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035));
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 16px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .user-detail-title {
    font-size: clamp(26px, 4vw, 42px);
    line-height: 1.08;
    color: rgba(255,255,255,0.98);
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .user-detail-meta {
    color: rgba(255,255,255,0.66);
    font-size: 13.5px;
    margin-top: 8px;
  }

  .user-version-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .user-version-btn {
    min-height: 34px;
    padding: 0 13px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 800;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.70);
    transition: all 0.2s ease;
  }

  .user-version-btn.active {
    background: rgba(220,176,0,0.14);
    border-color: rgba(220,176,0,0.32);
    color: #dcb000;
  }

  .user-project-title {
    color: rgba(255,255,255,0.96);
    font-size: 21px;
    font-weight: 800;
    margin: 0 0 14px;
  }

  .user-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.13);
    color: rgba(255,255,255,0.68);
    font-size: 12.5px;
    font-weight: 700;
  }

  .user-tag strong {
    color: rgba(255,255,255,0.94);
  }

  .user-section {
    padding: 19px 0;
    border-top: 1px solid rgba(255,255,255,0.09);
  }

  .user-section:first-of-type {
    border-top: none;
    padding-top: 4px;
  }

  .user-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.86);
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 12px;
  }

  .user-section-icon {
    width: 26px;
    height: 26px;
    border-radius: 9px;
    background: rgba(220,176,0,0.11);
    border: 1px solid rgba(220,176,0,0.24);
    color: #dcb000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-body-text,
  .user-item {
    color: rgba(255,255,255,0.80);
    font-size: 14px;
    line-height: 1.75;
  }

  .user-body-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.85;
  }

  .user-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 9px;
  }

  .user-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #dcb000;
    box-shadow: 0 0 12px rgba(220,176,0,0.45);
    flex-shrink: 0;
    margin-top: 8px;
  }

  .user-feedback-card {
    background: rgba(245,158,11,0.10);
    border: 1px solid rgba(245,158,11,0.24);
    border-radius: 14px;
    padding: 16px;
    margin-top: 4px;
  }

  .user-attachment {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 12px;
    color: rgba(255,255,255,0.78);
  }

  .user-audio-btn {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: rgba(220,176,0,0.16);
    border: 1px solid rgba(220,176,0,0.30);
    color: #dcb000;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-progress {
    height: 5px;
    background: rgba(255,255,255,0.12);
    border-radius: 999px;
    overflow: hidden;
  }

  .user-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #dcb000, #60a5fa);
    border-radius: 999px;
    transition: width 0.1s;
  }

  .user-image-thumb {
    cursor: pointer;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.12);
    position: relative;
    display: inline-block;
    box-shadow: 0 10px 28px rgba(0,0,0,0.22);
  }

  .user-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.86);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(8px);
  }

  .user-original-text {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px;
    padding: 14px;
    color: rgba(255,255,255,0.72);
    font-size: 13.5px;
    line-height: 1.75;
    white-space: pre-wrap;
    max-height: 220px;
    overflow-y: auto;
  }
`;

const PAGE_SIZE = 5;

function AudioPlayer({ src, filename }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef();

  function toggle() {
    if (playing) {
      ref.current.pause();
      setPlaying(false);
    } else {
      ref.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="user-attachment">
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={() => setProgress((ref.current.currentTime / ref.current.duration) * 100 || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={toggle} className="user-audio-btn">
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.86)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {filename}
        </div>
        <div className="user-progress">
          <div className="user-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ src, filename, onClose }) {
  return (
    <div onClick={onClose} className="user-lightbox">
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={18} />
      </button>
      <img src={src} alt={filename} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 14, boxShadow: "0 18px 70px rgba(0,0,0,0.65)" }} />
    </div>
  );
}

function AttachmentItem({ a }) {
  const [lightbox, setLightbox] = useState(false);
  const url = a.file_url.startsWith("/") ? `http://localhost:3000${a.file_url}` : a.file_url;

  if (a.type === "AUDIO") return <AudioPlayer src={url} filename={a.original_filename} />;

  if (a.type === "IMAGE") return (
    <>
      <div onClick={() => setLightbox(true)} className="user-image-thumb">
        <img src={url} alt={a.original_filename} style={{ width: "100%", maxWidth: 240, height: 150, objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.42), transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 8, right: 8 }}>
          <ExternalLink size={15} color="#fff" />
        </div>
      </div>
      {lightbox && <ImageViewer src={url} filename={a.original_filename} onClose={() => setLightbox(false)} />}
    </>
  );

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div className="user-attachment" style={{ cursor: "pointer" }}>
        <FileText size={18} color="rgba(255,255,255,0.58)" />
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.84)", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {a.original_filename}
        </span>
        <ExternalLink size={13} color="rgba(255,255,255,0.52)" />
      </div>
    </a>
  );
}

function BriefPanel({ brief, onBack }) {
  const { toast } = useToast();
  const [activeV, setActiveV] = useState((brief.versions?.length || 1) - 1);
  const _rawV = brief.versions?.[activeV];
  // Flatten version_data so fields are accessible directly
  const v = _rawV
    ? { ...(_rawV.version_data || _rawV), version_number: _rawV.version_number }
    : null;
  const st = STATUS[brief.status] || STATUS.DRAFT;

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/p/${brief.share_token}`);
    toast("info", "Share link copied");
  }

  return (
    <motion.div
      className="user-briefs-page"
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="user-briefs-header">
        <div className="user-briefs-title">
          <button className="user-back-btn" onClick={onBack}>
            <ChevronLeft size={15} /> Back to briefs
          </button>
        </div>
        <button className="user-copy-btn" onClick={copyLink}>
          <Copy size={13} /> Copy share link
        </button>
      </div>

      <section className="user-detail-hero">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="user-detail-title">{brief.client_name}</h1>
            <p className="user-detail-meta">
              Created {new Date(brief.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {brief.confirmed_at && ` - Confirmed ${new Date(brief.confirmed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
            </p>
          </div>
          <span className="user-status-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
            <st.icon size={12} /> {st.label}
          </span>
        </div>
      </section>

      {(brief.versions || []).length > 1 && (
        <div className="user-version-tabs">
          {brief.versions.map((version, i) => (
            <button
              key={version.version_number || i}
              onClick={() => setActiveV(i)}
              className={`user-version-btn ${i === activeV ? "active" : ""}`}
            >
              V{version.version_number}
            </button>
          ))}
        </div>
      )}

      <div className="user-detail-card" style={{ marginBottom: 16 }}>
        {v?.project_title && <h3 className="user-project-title">{v.project_title}</h3>}
        {(v?.estimated_complexity || v?.suggested_timeline) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {v.estimated_complexity && <Tag label="Complexity" value={v.estimated_complexity} />}
            {v.suggested_timeline && <Tag label="Timeline" value={v.suggested_timeline} />}
          </div>
        )}

        <PanelSection title="Summary" icon={<MessageSquare size={14} />}>
          {v?.summary && <p className="user-body-text">{v.summary}</p>}
        </PanelSection>

        {(v?.goals || []).length > 0 && (
          <PanelSection title="Goals" icon={<Target size={14} />}>
            {v.goals.map((g, i) => <PanelItem key={i}>{g}</PanelItem>)}
          </PanelSection>
        )}

        {(v?.ambiguities || []).length > 0 && (
          <PanelSection title="Ambiguities" icon={<HelpCircle size={14} />}>
            {v.ambiguities.map((a, i) => <PanelItem key={i} warn>{a}</PanelItem>)}
          </PanelSection>
        )}

        {(v?.follow_up_questions || []).length > 0 && (
          <PanelSection title="Follow-up questions" icon={<HelpCircle size={14} />}>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              {v.follow_up_questions.map((q, i) => (
                <li key={i} style={{ color: "rgba(255,255,255,0.80)", fontSize: 14, marginBottom: 9, lineHeight: 1.7 }}>{q}</li>
              ))}
            </ol>
          </PanelSection>
        )}

        {v?.client_feedback && Object.values(v.client_feedback).some(Boolean) && (
          <div className="user-feedback-card">
            <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Client feedback</p>
            {Object.entries(v.client_feedback).filter(([, val]) => val).map(([k, val]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11.5, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px", fontWeight: 800 }}>{k}</p>
                <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {(brief.attachments || []).length > 0 && (
        <div className="user-detail-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Paperclip size={15} color="rgba(255,255,255,0.62)" />
            <p className="user-section-title" style={{ margin: 0 }}>Original attachments</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {brief.attachments.map((a, i) => <AttachmentItem key={i} a={a} />)}
          </div>
          {brief.raw_text_input && (
            <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.09)", paddingTop: 16 }}>
              <p className="user-section-title">Original text input</p>
              <div className="user-original-text">{brief.raw_text_input}</div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function UserBriefs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [targetUser, setTargetUser] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/users/${id}/briefs`),
      api.get("/admin/users"),
    ]).then(([b, u]) => {
      const data = b.data;
      // Backend returns paginated: { items, total, page, page_size, pages }
      setBriefs(data.items || data.briefs || data);
      setTargetUser(u.data.find((x) => x.id === id));
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function openBrief(briefId) {
    setLoadingBrief(true);
    try {
      // Try admin endpoint first, fall back to user endpoint
      let briefData;
      try {
        const r = await api.get(`/admin/briefs/${briefId}`);
        briefData = r.data;
      } catch {
        const r = await api.get(`/briefs/${briefId}`);
        briefData = r.data;
      }
      // Fetch versions separately and attach
      try {
        const vr = await api.get(`/briefs/${briefId}/versions`);
        briefData = { ...briefData, versions: vr.data || [] };
      } catch {
        briefData = { ...briefData, versions: [] };
      }
      setSelected(briefData);
    } catch {
      toast("error", "Could not load brief details");
    } finally {
      setLoadingBrief(false);
    }
  }

  const visible = briefs.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < briefs.length;

  if (loading) return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        className="user-briefs-shell"
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="spinner spinner-lg" />
          </main>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        className="user-briefs-shell"
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(12px)" }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content">
            {selected ? (
              <BriefPanel brief={selected} onBack={() => setSelected(null)} />
            ) : (
              <motion.div
                className="user-briefs-page"
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="user-briefs-header">
                  <div className="user-briefs-title">
                    <button className="user-back-btn" onClick={() => navigate("/admin")}>
                      <ChevronLeft size={15} /> Back to team
                    </button>
                    <div className="user-avatar">
                      <User size={19} />
                    </div>
                    <div>
                      <h1>{targetUser?.name || "User"}'s briefs</h1>
                      <p>{targetUser?.email} - {briefs.length} brief{briefs.length !== 1 ? "s" : ""} total</p>
                    </div>
                  </div>
                </div>

                {loadingBrief && (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <span className="spinner spinner-lg" />
                  </div>
                )}

                {!loadingBrief && briefs.length === 0 ? (
                  <div className="user-empty-card">
                    <div className="user-empty-icon"><FileText size={24} /></div>
                    <p className="user-empty-title">No briefs yet</p>
                    <p className="user-empty-sub">This user hasn't created any briefs.</p>
                  </div>
                ) : !loadingBrief && (
                  <>
                    <div className="user-table-wrap">
                      <table className="user-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Version</th>
                            <th>Created</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((b) => {
                            const s = STATUS[b.status] || STATUS.DRAFT;
                            return (
                              <tr key={b.id} onClick={() => openBrief(b.id)}>
                                <td className="primary">{b.client_name}</td>
                                <td>
                                  <span className="user-status-badge" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                                    <s.icon size={10} /> {s.label}
                                  </span>
                                </td>
                                <td><span className="user-mono">V{b.current_version}</span></td>
                                <td style={{ color: "rgba(255,255,255,0.58)", fontSize: 12.5 }}>
                                  {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <span className="user-arrow">{">"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {hasMore && (
                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        <button className="user-load-btn" onClick={() => setPage((p) => p + 1)}>
                          Load more ({briefs.length - visible.length} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </main>
        </div>
        <Footer />
      </motion.div>
    </>
  );
}

function PanelSection({ title, icon, children }) {
  return (
    <section className="user-section">
      <p className="user-section-title">
        <span className="user-section-icon">{icon}</span>
        {title}
      </p>
      {children}
    </section>
  );
}

function PanelItem({ children, warn }) {
  return (
    <div className="user-item">
      {warn ? <span style={{ color: "#f59e0b", fontWeight: 900, flexShrink: 0 }}>?</span> : <span className="user-dot" />}
      <span>{children}</span>
    </div>
  );
}

function Tag({ label, value }) {
  return (
    <span className="user-tag">
      {label}: <strong>{value}</strong>
    </span>
  );
}
