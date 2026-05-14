import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  ChevronLeft, Send, RefreshCw, CheckCircle, FileText, Paperclip,
  Clock, Play, Pause, ExternalLink, X, Sparkles, Copy, MessageSquare,
  Target, HelpCircle, Wand2, AlertTriangle, Lightbulb, ShieldAlert,
  Code2, Briefcase, Palette, ListChecks, Layers, Telescope, Pencil,
  Save, Download, Plus, Minus, ArrowRight, Eye, Zap,
} from "lucide-react";

const STATUS = {
  DRAFT:          { label: "Draft",           icon: FileText,    color: "rgba(255,255,255,0.72)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.14)" },
  SENT:           { label: "Awaiting client", icon: Clock,       color: "#60a5fa",                bg: "rgba(96,165,250,0.12)",   border: "rgba(96,165,250,0.28)" },
  NEEDS_REVISION: { label: "Needs revision",  icon: RefreshCw,   color: "#f59e0b",                bg: "rgba(245,158,11,0.12)",   border: "rgba(245,158,11,0.28)" },
  CONFIRMED:      { label: "Confirmed",       icon: CheckCircle, color: "#22d3a0",                bg: "rgba(34,211,160,0.12)",   border: "rgba(34,211,160,0.28)" },
};

const pageStyles = `
  @keyframes briefRise { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes premiumGlow { 0%,100%{box-shadow:0 0 16px rgba(220,176,0,0.08);}50%{box-shadow:0 0 30px rgba(220,176,0,0.18);} }
  .brief-detail-shell{display:flex;flex-direction:column;min-height:100vh;background-image:url('/images/Body.png');background-size:cover;background-position:center;}
  .brief-detail-page{max-width:1180px;margin:0 auto;padding-bottom:110px;animation:briefRise 0.45s ease both;}
  .brief-topbar{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
  .brief-back-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.11);color:rgba(255,255,255,0.72);transition:all 0.2s ease;}
  .brief-back-btn:hover{background:rgba(255,255,255,0.11);color:rgba(255,255,255,0.96);transform:translateX(-2px);}
  .brief-hero{position:relative;overflow:hidden;border-radius:18px;padding:26px;margin-bottom:18px;background:radial-gradient(circle at top right,rgba(220,176,0,0.16),transparent 34%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035));border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 24px 70px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.08);}
  .brief-client-ready{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;color:#dcb000;background:rgba(220,176,0,0.12);border:1px solid rgba(220,176,0,0.28);font-size:11.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;}
  .brief-pill-icon,.brief-section-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:#dcb000;}
  .brief-title{font-size:clamp(28px,4vw,46px);line-height:1.05;color:rgba(255,255,255,0.98);font-weight:900;letter-spacing:-0.02em;margin:0;}
  .brief-meta{margin-top:10px;color:rgba(255,255,255,0.68);font-size:14px;}
  .brief-status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid;}
  .brief-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start;}
  .brief-card{background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:22px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 48px rgba(0,0,0,0.22),inset 0 1px 0 rgba(255,255,255,0.06);}
  .brief-card+.brief-card{margin-top:16px;}
  .brief-project-title{color:rgba(255,255,255,0.96);font-size:22px;font-weight:800;margin:0 0 14px 0;}
  .brief-tag{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.13);color:rgba(255,255,255,0.68);font-size:12.5px;font-weight:600;}
  .brief-tag strong{color:rgba(255,255,255,0.94);}
  .brief-section{padding:20px 0;border-top:1px solid rgba(255,255,255,0.09);}
  .brief-section:first-of-type{border-top:none;padding-top:4px;}
  .brief-section-title{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.86);font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;}
  .brief-section-icon{width:26px;height:26px;border-radius:9px;background:rgba(220,176,0,0.11);border:1px solid rgba(220,176,0,0.24);}
  .brief-body-text{color:rgba(255,255,255,0.82);font-size:15px;line-height:1.85;margin:0;}
  .brief-item{display:flex;align-items:flex-start;gap:10px;color:rgba(255,255,255,0.78);font-size:14px;line-height:1.7;margin-bottom:10px;}
  .brief-dot{width:7px;height:7px;border-radius:999px;background:#dcb000;box-shadow:0 0 12px rgba(220,176,0,0.45);flex-shrink:0;margin-top:8px;}
  .brief-warn-dot{color:#f59e0b;font-weight:900;flex-shrink:0;}
  .brief-risk-dot{color:#ff4d6d;font-weight:900;flex-shrink:0;}
  .brief-side{position:sticky;top:84px;}
  .brief-action-card{background:radial-gradient(circle at top left,rgba(96,165,250,0.14),transparent 38%),rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);}
  .brief-side-title{color:rgba(255,255,255,0.92);font-size:14px;font-weight:800;margin:0 0 6px 0;}
  .brief-side-copy{color:rgba(255,255,255,0.58);font-size:12.5px;line-height:1.55;margin:0 0 14px 0;}
  .brief-primary-btn,.brief-secondary-btn,.brief-success-strip{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:12px;font-size:13px;font-weight:800;}
  .brief-primary-btn{color:#fff;cursor:pointer;border:1px solid rgba(220,176,0,0.36);background:linear-gradient(135deg,rgba(220,176,0,0.28),rgba(11,100,255,0.22));animation:premiumGlow 3s ease-in-out infinite;transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);}
  .brief-primary-btn:hover:not(:disabled){transform:translateY(-2px);border-color:rgba(220,176,0,0.58);}
  .brief-secondary-btn{color:rgba(255,255,255,0.78);cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);transition:all 0.2s ease;}
  .brief-secondary-btn:hover:not(:disabled){color:rgba(255,255,255,0.96);background:rgba(255,255,255,0.10);}
  .brief-primary-btn:disabled,.brief-secondary-btn:disabled{opacity:0.58;cursor:not-allowed;}
  .brief-success-strip{justify-content:flex-start;padding:11px 13px;min-height:auto;color:#22d3a0;background:rgba(34,211,160,0.10);border:1px solid rgba(34,211,160,0.24);}
  .brief-pdf-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;color:#22d3a0;border:1px solid rgba(34,211,160,0.34);background:linear-gradient(135deg,rgba(34,211,160,0.18),rgba(96,165,250,0.14));transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);}
  .brief-pdf-btn:hover:not(:disabled){transform:translateY(-2px);border-color:rgba(34,211,160,0.55);background:linear-gradient(135deg,rgba(34,211,160,0.26),rgba(96,165,250,0.20));}
  .brief-pdf-btn:disabled{opacity:0.58;cursor:not-allowed;}
  .brief-feedback-card{background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.24);border-radius:14px;padding:16px;margin-top:4px;}
  .brief-feedback-title{color:#f59e0b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px 0;}
  .brief-attachment{display:flex;align-items:center;gap:10px;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.11);border-radius:12px;color:rgba(255,255,255,0.78);}
  .brief-audio-play{width:34px;height:34px;border-radius:999px;background:rgba(220,176,0,0.16);border:1px solid rgba(220,176,0,0.30);color:#dcb000;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .brief-progress{height:5px;background:rgba(255,255,255,0.12);border-radius:999px;overflow:hidden;}
  .brief-progress-fill{height:100%;background:linear-gradient(90deg,#dcb000,#60a5fa);border-radius:999px;transition:width 0.1s;}
  .brief-image-thumb{cursor:pointer;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);position:relative;display:inline-block;box-shadow:0 10px 28px rgba(0,0,0,0.22);}
  .brief-lightbox{position:fixed;inset:0;background:rgba(0,0,0,0.86);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);}
  .brief-text-input{background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:14px;color:rgba(255,255,255,0.72);font-size:13.5px;line-height:1.75;white-space:pre-wrap;max-height:220px;overflow-y:auto;}
  .brief-edit-banner{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;margin-bottom:16px;background:rgba(220,176,0,0.10);border:1px solid rgba(220,176,0,0.28);color:#dcb000;font-size:13px;font-weight:700;}
  .brief-edit-input{width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:10px 12px;color:rgba(255,255,255,0.92);font-size:14px;font-family:inherit;line-height:1.7;outline:none;transition:border-color 0.2s ease;}
  .brief-edit-input:focus{border-color:rgba(220,176,0,0.4);background:rgba(255,255,255,0.10);}
  .brief-edit-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;}
  .brief-edit-item-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px 10px;color:rgba(255,255,255,0.9);font-size:13.5px;font-family:inherit;line-height:1.6;outline:none;resize:vertical;transition:border-color 0.2s;}
  .brief-edit-item-input:focus{border-color:rgba(220,176,0,0.38);}
  .brief-edit-del-btn{background:rgba(255,77,109,0.12);border:1px solid rgba(255,77,109,0.22);color:#ff4d6d;border-radius:7px;padding:6px;cursor:pointer;display:flex;align-items:center;flex-shrink:0;transition:background 0.15s;}
  .brief-edit-del-btn:hover{background:rgba(255,77,109,0.22);}
  .brief-edit-add-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.68);margin-top:6px;transition:all 0.15s;}
  .brief-edit-add-btn:hover{background:rgba(255,255,255,0.10);color:rgba(255,255,255,0.92);}
  .brief-section-icon.risk{background:rgba(255,77,109,0.1);border-color:rgba(255,77,109,0.25);color:#ff4d6d;}
  .brief-section-icon.green{background:rgba(34,211,160,0.1);border-color:rgba(34,211,160,0.25);color:#22d3a0;}
  .brief-section-icon.blue{background:rgba(96,165,250,0.1);border-color:rgba(96,165,250,0.25);color:#60a5fa;}
  .brief-section-icon.purple{background:rgba(167,139,250,0.1);border-color:rgba(167,139,250,0.25);color:#a78bfa;}
  .brief-kv-grid{display:flex;flex-direction:column;gap:8px;}
  .brief-kv-row{display:flex;gap:10px;padding:9px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:9px;font-size:13.5px;}
  .brief-kv-key{color:rgba(255,255,255,0.56);font-weight:700;min-width:140px;flex-shrink:0;}
  .brief-kv-val{color:rgba(255,255,255,0.84);}
  .diff-added{background:rgba(34,211,160,0.10);border-left:3px solid #22d3a0;padding:6px 10px;border-radius:0 8px 8px 0;margin-bottom:6px;color:rgba(255,255,255,0.86);font-size:13.5px;display:flex;align-items:flex-start;gap:8px;}
  .diff-removed{background:rgba(255,77,109,0.08);border-left:3px solid #ff4d6d;padding:6px 10px;border-radius:0 8px 8px 0;margin-bottom:6px;color:rgba(255,255,255,0.55);font-size:13.5px;text-decoration:line-through;display:flex;align-items:flex-start;gap:8px;}
  .diff-changed{background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;padding:6px 10px;border-radius:0 8px 8px 0;margin-bottom:6px;color:rgba(255,255,255,0.86);font-size:13.5px;display:flex;align-items:flex-start;gap:8px;}
  .diff-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px;}
  .diff-badge.added{background:rgba(34,211,160,0.2);color:#22d3a0;}
  .diff-badge.removed{background:rgba(255,77,109,0.18);color:#ff4d6d;}
  .diff-badge.changed{background:rgba(245,158,11,0.18);color:#f59e0b;}
  .feedback-review-card{background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.22);border-radius:16px;padding:20px;margin-top:16px;}
  .feedback-review-section{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.07);}
  .feedback-review-section:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none;}
  .feedback-section-label{font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px 0;}
  .feedback-section-content{font-size:13.5px;color:rgba(255,255,255,0.82);line-height:1.65;margin:0;}
  .feedback-edit-area{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:9px;padding:9px 11px;color:rgba(255,255,255,0.9);font-size:13.5px;font-family:inherit;line-height:1.6;outline:none;resize:vertical;min-height:72px;transition:border-color 0.2s;}
  .feedback-edit-area:focus{border-color:rgba(245,158,11,0.5);background:rgba(255,255,255,0.09);}
  @media(max-width:980px){.brief-layout{grid-template-columns:1fr;}.brief-side{position:static;}}
`;

function AudioPlayer({ src, filename }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef();
  function toggle() {
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }
  return (
    <div className="brief-attachment">
      <audio ref={audioRef} src={src}
        onTimeUpdate={() => setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); }} />
      <button onClick={toggle} className="brief-audio-play">
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.86)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{filename}</div>
        <div className="brief-progress"><div className="brief-progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  );
}

function ImageViewer({ src, filename, onClose }) {
  return (
    <div onClick={onClose} className="brief-lightbox">
      <button onClick={onClose} style={{ position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:"50%",width:38,height:38,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <X size={18} />
      </button>
      <img src={src} alt={filename} onClick={(e) => e.stopPropagation()} style={{ maxWidth:"90vw",maxHeight:"85vh",borderRadius:14,boxShadow:"0 18px 70px rgba(0,0,0,0.65)" }} />
    </div>
  );
}

function AttachmentItem({ a }) {
  const [lightbox, setLightbox] = useState(false);
  const url = a.file_url?.startsWith("/") ? `http://localhost:3000${a.file_url}` : a.file_url;
  if (a.type === "AUDIO") return <AudioPlayer src={url} filename={a.original_filename} />;
  if (a.type === "IMAGE") return (
    <>
      <div onClick={() => setLightbox(true)} className="brief-image-thumb">
        <img src={url} alt={a.original_filename} style={{ width:"100%",maxWidth:240,height:150,objectFit:"cover",display:"block" }} />
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.42),transparent 55%)" }} />
        <div style={{ position:"absolute",bottom:8,right:8 }}><ExternalLink size={15} color="#fff" /></div>
      </div>
      {lightbox && <ImageViewer src={url} filename={a.original_filename} onClose={() => setLightbox(false)} />}
    </>
  );
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
      <div className="brief-attachment" style={{ cursor:"pointer" }}>
        <FileText size={18} color="rgba(255,255,255,0.58)" />
        <span style={{ fontSize:13.5,color:"rgba(255,255,255,0.84)",fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.original_filename}</span>
        <ExternalLink size={13} color="rgba(255,255,255,0.52)" />
      </div>
    </a>
  );
}

function BSection({ title, icon, iconClass = "", children }) {
  return (
    <div className="brief-section">
      <p className="brief-section-title">
        <span className={`brief-section-icon ${iconClass}`}>{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function BItem({ children, dot = "gold" }) {
  const dotEl = dot === "gold" ? <span className="brief-dot" /> : dot === "warn" ? <span className="brief-warn-dot">?</span> : <span className="brief-risk-dot">!</span>;
  return <div className="brief-item">{dotEl}<span>{children}</span></div>;
}

function KVBlock({ data }) {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data).filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : true));
  if (!entries.length) return null;
  return (
    <div className="brief-kv-grid">
      {entries.map(([k, v]) => (
        <div key={k} className="brief-kv-row">
          <span className="brief-kv-key">{k.replace(/_/g, " ")}</span>
          <span className="brief-kv-val">{Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Tag({ label, value }) {
  return <span className="brief-tag">{label}: <strong>{value}</strong></span>;
}

function EditableText({ value, onChange, rows = 4, placeholder = "" }) {
  return <textarea className="brief-edit-input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function EditableList({ items, onChange }) {
  function update(idx, val) { const next = [...items]; next[idx] = val; onChange(next); }
  function remove(idx) { onChange(items.filter((_, i) => i !== idx)); }
  function add() { onChange([...items, ""]); }
  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} className="brief-edit-item">
          <textarea className="brief-edit-item-input" rows={2} value={item} onChange={(e) => update(idx, e.target.value)} />
          <button className="brief-edit-del-btn" onClick={() => remove(idx)}><X size={13} /></button>
        </div>
      ))}
      <button className="brief-edit-add-btn" onClick={add}>+ Add item</button>
    </div>
  );
}

const SECTION_LABELS = {
  summary:"Summary",goals:"Goals",mvp_scope:"MVP Scope",future_scope:"Future Scope",
  explicit_facts:"Explicit Facts",inferred_needs:"Inferred Needs",ambiguities:"Ambiguities",
  follow_up_questions:"Follow-up Questions",risks:"Risks",recommendations:"Recommendations",
  design_content_notes:"Design Notes",project_title:"Project Title",
  estimated_complexity:"Complexity",suggested_timeline:"Timeline",
};

function DiffView({ diff }) {
  if (!diff || !diff.changes || diff.changes.length === 0)
    return <div style={{ padding:"14px",textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13 }}>No changes detected between versions</div>;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:4 }}>
        <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#22d3a0" }}><Plus size={11} /> Added</span>
        <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#ff4d6d" }}><Minus size={11} /> Removed</span>
        <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#f59e0b" }}><ArrowRight size={11} /> Changed</span>
      </div>
      {diff.changes.map((change, i) => {
        const label = SECTION_LABELS[change.section] || change.section;
        const oldVal = change.old_value; const newVal = change.new_value;
        return (
          <div key={i}>
            <p style={{ fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.07em",margin:"0 0 6px 0" }}>{label}</p>
            {change.status === "ADDED" && (Array.isArray(newVal) ? newVal : [String(newVal)]).map((s,j) =>
              <div key={j} className="diff-added"><span className="diff-badge added"><Plus size={9}/> new</span><span>{s}</span></div>)}
            {change.status === "REMOVED" && (Array.isArray(oldVal) ? oldVal : [String(oldVal)]).map((s,j) =>
              <div key={j} className="diff-removed"><span className="diff-badge removed"><Minus size={9}/> gone</span><span>{s}</span></div>)}
            {change.status === "CHANGED" && Array.isArray(oldVal) && Array.isArray(newVal) ? (
              <>
                {oldVal.filter(s=>!newVal.includes(s)).map((s,j)=><div key={`r${j}`} className="diff-removed"><span className="diff-badge removed"><Minus size={9}/></span><span>{s}</span></div>)}
                {newVal.filter(s=>!oldVal.includes(s)).map((s,j)=><div key={`a${j}`} className="diff-added"><span className="diff-badge added"><Plus size={9}/></span><span>{s}</span></div>)}
              </>
            ) : change.status === "CHANGED" ? (
              <div className="diff-changed"><span className="diff-badge changed"><ArrowRight size={9}/></span><span>{String(newVal)}</span></div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const FEEDBACK_LABELS = { summary:"On the summary", goals:"On the goals", missing:"Answers to open questions", extra:"Additional context" };

function FeedbackReviewPanel({ feedback, onToggleEdit, editMode, editedFeedback, onEditedChange }) {
  if (!feedback) return null;
  const entries = Object.entries(feedback).filter(([,v]) => v);
  if (!entries.length) return null;
  return (
    <div className="feedback-review-card">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
        <p style={{ fontSize:12,fontWeight:800,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.07em",margin:0 }}>Client feedback — section by section</p>
        <button onClick={onToggleEdit} style={{ background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.28)",color:"#f59e0b",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
          <Pencil size={11}/> {editMode ? "Done" : "Enhance feedback"}
        </button>
      </div>
      {entries.map(([k,v]) => (
        <div key={k} className="feedback-review-section">
          <p className="feedback-section-label">{FEEDBACK_LABELS[k] || k}</p>
          {editMode
            ? <textarea className="feedback-edit-area" value={editedFeedback[k] ?? v} onChange={(e) => onEditedChange(k, e.target.value)} />
            : <p className="feedback-section-content">{editedFeedback[k] ?? v}</p>}
        </div>
      ))}
    </div>
  );
}

export default function BriefDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeV, setActiveV] = useState(0);
  const [sending, setSending] = useState(false);
  const [regen, setRegen] = useState(false);
  const [sent, setSent] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [diff, setDiff] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [feedbackEditMode, setFeedbackEditMode] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState({});

  async function loadBrief() {
    try {
      const [briefRes, versionsRes] = await Promise.all([api.get(`/briefs/${id}`), api.get(`/briefs/${id}/versions`)]);
      const enriched = { ...briefRes.data, versions: versionsRes.data || [] };
      setBrief(enriched);
      setActiveV(Math.max(0, (versionsRes.data?.length || 1) - 1));
      if (briefRes.data.status === "SENT") setSent(true);
    } catch { navigate("/home"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadBrief(); }, [id]);

  useEffect(() => {
    if (!brief || brief.versions.length < 2 || activeV === 0) { setDiff(null); return; }
    const cur = brief.versions[activeV]; const prev = brief.versions[activeV - 1];
    if (!cur || !prev) return;
    setDiffLoading(true);
    api.get(`/briefs/${id}/diff?v1=${prev.version_number}&v2=${cur.version_number}`)
      .then(r => setDiff(r.data)).catch(() => setDiff(null)).finally(() => setDiffLoading(false));
  }, [brief?.versions?.length, activeV, id]);

  async function copyShareLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/p/${brief.share_token}`);
    toast("info", "Share link copied", "Paste it anywhere to share with the client");
  }

  async function handleSend() {
    setSending(true);
    try {
      await api.post(`/briefs/${id}/resend`);
      await navigator.clipboard.writeText(`${window.location.origin}/p/${brief.share_token}`);
      setSent(true);
      const [rBrief, rVers] = await Promise.all([api.get(`/briefs/${id}`), api.get(`/briefs/${id}/versions`)]);
      setBrief({ ...rBrief.data, versions: rVers.data || [] });
      toast("success", "Sent & link copied!");
    } catch { toast("error", "Failed to send"); }
    finally { setSending(false); }
  }

  async function handleRegen() {
    setRegen(true);
    try {
      await api.post(`/briefs/${id}/regenerate`);
      const [rBrief, rVers] = await Promise.all([api.get(`/briefs/${id}`), api.get(`/briefs/${id}/versions`)]);
      const enriched = { ...rBrief.data, versions: rVers.data || [] };
      setBrief(enriched);
      setActiveV(Math.max(0, (rVers.data?.length || 1) - 1));
      setSent(false); setEditMode(false); setFeedbackEditMode(false); setEditedFeedback({});
      toast("success", `V${rBrief.data.current_version} generated`);
    } catch { toast("error", "Regeneration failed"); }
    finally { setRegen(false); }
  }

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const res = await api.get(`/briefs/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumen-brief-${(brief.client_name || id).replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("success", "PDF downloaded");
    } catch { toast("error", "PDF export failed", "Brief must be confirmed first"); }
    finally { setPdfLoading(false); }
  }

  function enterEdit() {
    setEditDraft({
      summary: brief.summary || "",
      goals: (brief.goals || []).map(String),
      follow_up_questions: (brief.follow_up_questions || []).map(String),
      explicit_facts: (brief.explicit_facts || []).map(String),
      inferred_needs: (brief.inferred_needs || []).map(String),
      mvp_scope: (brief.mvp_scope || []).map(String),
      future_scope: (brief.future_scope || []).map(String),
      ambiguities: (brief.ambiguities || []).map(String),
      design_content_notes: (brief.design_content_notes || []).map(String),
      risks: (brief.risks || []).map(String),
      recommendations: (brief.recommendations || []).map(String),
    });
    setEditMode(true);
  }

  function cancelEdit() { setEditMode(false); setEditDraft(null); }

  async function saveEdit() {
    setSaving(true);
    try {
      await api.patch(`/briefs/${id}`, editDraft);
      const [rBrief, rVers] = await Promise.all([api.get(`/briefs/${id}`), api.get(`/briefs/${id}/versions`)]);
      setBrief({ ...rBrief.data, versions: rVers.data || [] });
      setEditMode(false); setEditDraft(null);
      toast("success", "Brief saved");
    } catch { toast("error", "Failed to save edits"); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <><style>{pageStyles}</style>
    <div className="brief-detail-shell"><Nav /><div className="app-layout" style={{flex:1}}><Sidebar />
    <main className="main-content" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><span className="spinner spinner-lg"/></main>
    </div></div></>
  );
  if (!brief) return null;

  const _rawV = brief.versions[activeV];
  const v = _rawV ? {
    ...(_rawV.version_data || _rawV),
    client_feedback: _rawV.per_section_feedback
      ? (typeof _rawV.per_section_feedback === "string" ? JSON.parse(_rawV.per_section_feedback) : _rawV.per_section_feedback)
      : null,
    version_number: _rawV.version_number,
  } : null;
  const st = STATUS[brief.status] || STATUS.DRAFT;
  const getList = (key) => editMode ? (editDraft[key] || []) : (brief[key] || []);
  const getText = (key) => editMode ? (editDraft[key] || "") : (brief[key] || "");
  const setField = (key) => (val) => setEditDraft(d => ({ ...d, [key]: val }));

  // Latest version's client feedback for NEEDS_REVISION
  const latestV = brief.versions[brief.versions.length - 1];
  const clientFeedback = latestV?.per_section_feedback
    ? (typeof latestV.per_section_feedback === "string" ? JSON.parse(latestV.per_section_feedback) : latestV.per_section_feedback)
    : null;

  return (
    <><style>{pageStyles}</style>
    <motion.div className="brief-detail-shell"
      initial={{opacity:0,filter:"blur(12px)"}} animate={{opacity:1,filter:"blur(0px)"}}
      exit={{opacity:0,filter:"blur(12px)"}} transition={{duration:0.75,ease:"easeInOut"}}>
      <Nav />
      <div className="app-layout" style={{flex:1}}>
        <Sidebar />
        <main className="main-content">
          <div className="brief-detail-page">
            <div className="brief-topbar">
              <button className="brief-back-btn" onClick={()=>navigate(-1)}><ChevronLeft size={15}/> Back</button>
            </div>

            <section className="brief-hero">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:18,flexWrap:"wrap"}}>
                <div>
                  <div className="brief-client-ready"><span className="brief-pill-icon"><Sparkles size={13} strokeWidth={2.4}/></span>Client-ready preview</div>
                  <h1 className="brief-title">{brief.client_name}</h1>
                  <p className="brief-meta">Created {new Date(brief.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</p>
                </div>
                <span className="brief-status-badge" style={{color:st.color,background:st.bg,borderColor:st.border}}><st.icon size={13}/> {st.label}</span>
              </div>
            </section>

            {editMode && (
              <div className="brief-edit-banner">
                <Pencil size={15}/> Editing brief — changes are local until you save
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button onClick={cancelEdit} className="brief-secondary-btn" style={{width:"auto",minHeight:34,padding:"0 14px",animation:"none"}}>Cancel</button>
                  <button onClick={saveEdit} disabled={saving} className="brief-primary-btn" style={{width:"auto",minHeight:34,padding:"0 14px",animation:"none"}}>
                    {saving?<><span className="spinner"/> Saving...</>:<><Save size={14}/> Save</>}
                  </button>
                </div>
              </div>
            )}

            <div className="brief-layout">
              <div>
                <section className="brief-card">
                  {v?.project_title && <h2 className="brief-project-title">{v.project_title}</h2>}
                  {(v?.estimated_complexity||v?.suggested_timeline) && (
                    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
                      {v.estimated_complexity && <Tag label="Complexity" value={v.estimated_complexity}/>}
                      {v.suggested_timeline && <Tag label="Timeline" value={v.suggested_timeline}/>}
                    </div>
                  )}
                  <BSection title="Summary" icon={<MessageSquare size={14}/>}>
                    {editMode ? <EditableText value={getText("summary")} onChange={setField("summary")} rows={5} placeholder="Project summary..."/> : <p className="brief-body-text">{brief.summary}</p>}
                  </BSection>
                  {(getList("explicit_facts").length>0||editMode) && <BSection title="What the client explicitly said" icon={<MessageSquare size={14}/>} iconClass="blue">{editMode?<EditableList items={getList("explicit_facts")} onChange={setField("explicit_facts")}/>:getList("explicit_facts").map((f,i)=><BItem key={i}>{f}</BItem>)}</BSection>}
                  {(getList("inferred_needs").length>0||editMode) && <BSection title="Inferred needs" icon={<Lightbulb size={14}/>} iconClass="purple">{editMode?<EditableList items={getList("inferred_needs")} onChange={setField("inferred_needs")}/>:getList("inferred_needs").map((n,i)=><BItem key={i}>{n}</BItem>)}</BSection>}
                  {(getList("goals").length>0||editMode) && <BSection title="Goals" icon={<Target size={14}/>}>{editMode?<EditableList items={getList("goals")} onChange={setField("goals")}/>:getList("goals").map((g,i)=><BItem key={i}>{g}</BItem>)}</BSection>}
                  {(getList("mvp_scope").length>0||editMode) && <BSection title="MVP Scope" icon={<ListChecks size={14}/>} iconClass="green">{editMode?<EditableList items={getList("mvp_scope")} onChange={setField("mvp_scope")}/>:getList("mvp_scope").map((s,i)=><BItem key={i}>{s}</BItem>)}</BSection>}
                  {(getList("future_scope").length>0||editMode) && <BSection title="Future scope" icon={<Telescope size={14}/>} iconClass="blue">{editMode?<EditableList items={getList("future_scope")} onChange={setField("future_scope")}/>:getList("future_scope").map((s,i)=><BItem key={i}>{s}</BItem>)}</BSection>}
                  {(getList("ambiguities").length>0||editMode) && <BSection title="Ambiguities" icon={<HelpCircle size={14}/>}>{editMode?<EditableList items={getList("ambiguities")} onChange={setField("ambiguities")}/>:getList("ambiguities").map((a,i)=><BItem key={i} dot="warn">{a}</BItem>)}</BSection>}
                  {(getList("follow_up_questions").length>0||editMode) && (
                    <BSection title="Follow-up questions" icon={<HelpCircle size={14}/>}>
                      {editMode?<EditableList items={getList("follow_up_questions")} onChange={setField("follow_up_questions")}/>:<ol style={{paddingLeft:20,margin:0}}>{getList("follow_up_questions").map((q,i)=><li key={i} style={{color:"rgba(255,255,255,0.78)",fontSize:14,marginBottom:9,lineHeight:1.7}}>{q}</li>)}</ol>}
                    </BSection>
                  )}
                </section>

                <section className="brief-card">
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
                    <Layers size={14} color="rgba(255,255,255,0.4)"/>
                    <span style={{fontSize:11.5,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Internal — not shown to client</span>
                  </div>
                  {Object.keys(brief.technical_details||{}).length>0 && <BSection title="Technical details" icon={<Code2 size={14}/>} iconClass="blue"><KVBlock data={brief.technical_details}/></BSection>}
                  {Object.keys(brief.business_details||{}).length>0 && <BSection title="Business context" icon={<Briefcase size={14}/>} iconClass="purple"><KVBlock data={brief.business_details}/></BSection>}
                  {(getList("design_content_notes").length>0||editMode) && <BSection title="Design & content notes" icon={<Palette size={14}/>}>{editMode?<EditableList items={getList("design_content_notes")} onChange={setField("design_content_notes")}/>:getList("design_content_notes").map((n,i)=><BItem key={i}>{n}</BItem>)}</BSection>}
                  {(getList("risks").length>0||editMode) && <BSection title="⚠ Risks" icon={<ShieldAlert size={14}/>} iconClass="risk">{editMode?<EditableList items={getList("risks")} onChange={setField("risks")}/>:getList("risks").map((r,i)=><BItem key={i} dot="risk">{r}</BItem>)}</BSection>}
                  {(getList("recommendations").length>0||editMode) && <BSection title="Recommendations" icon={<Lightbulb size={14}/>} iconClass="green">{editMode?<EditableList items={getList("recommendations")} onChange={setField("recommendations")}/>:getList("recommendations").map((r,i)=><BItem key={i}>{r}</BItem>)}</BSection>}
                </section>

                {/* Client feedback review panel — NEEDS_REVISION only */}
                {brief.status === "NEEDS_REVISION" && clientFeedback && (
                  <FeedbackReviewPanel
                    feedback={clientFeedback}
                    onToggleEdit={() => { if(!feedbackEditMode) setEditedFeedback(typeof clientFeedback==="object"?{...clientFeedback}:{}); setFeedbackEditMode(f=>!f); }}
                    editMode={feedbackEditMode}
                    editedFeedback={editedFeedback}
                    onEditedChange={(k,val) => setEditedFeedback(prev=>({...prev,[k]:val}))}
                  />
                )}

                {/* Version diff — auto-loads when switching to a version > 1 */}
                {brief.versions.length > 1 && activeV > 0 && (
                  <section className="brief-card" style={{marginTop:16}}>
                    <button onClick={()=>setShowDiff(d=>!d)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.72)",fontSize:13,fontWeight:700,padding:0,marginBottom:showDiff?16:0}}>
                      <Eye size={14}/> {showDiff?"Hide":"Show"} changes V{brief.versions[activeV-1]?.version_number} → V{brief.versions[activeV]?.version_number}
                    </button>
                    {showDiff && (diffLoading ? <div style={{textAlign:"center",padding:20}}><span className="spinner"/></div> : <DiffView diff={diff}/>)}
                  </section>
                )}

                {(brief.attachments||[]).length>0 && (
                  <section className="brief-card">
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Paperclip size={15} color="rgba(255,255,255,0.62)"/><p className="brief-section-title" style={{margin:0}}>Original attachments</p></div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>{brief.attachments.map((a,i)=><AttachmentItem key={i} a={a}/>)}</div>
                    {brief.raw_text_input && <div style={{marginTop:16,borderTop:"1px solid rgba(255,255,255,0.09)",paddingTop:16}}><p className="brief-section-title">Original text input</p><div className="brief-text-input">{brief.raw_text_input}</div></div>}
                  </section>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside className="brief-side">
                <div className="brief-action-card">
                  <p className="brief-side-title">Share with client</p>
                  <p className="brief-side-copy">Send the polished brief and copy the review link.</p>

                  {brief.status !== "CONFIRMED" && (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {sent ? (
                        <>
                          <div className="brief-success-strip"><CheckCircle size={16}/> Link copied and ready</div>
                          <button className="brief-secondary-btn" onClick={handleSend} disabled={sending}>
                            {sending?<><span className="spinner"/> Resending...</>:<><Send size={15}/> Resend link</>}
                          </button>
                        </>
                      ) : (
                        <button className="brief-primary-btn" onClick={handleSend} disabled={sending}>
                          {sending?<><span className="spinner"/> Sending...</>:<><Send size={15}/> Send to client</>}
                        </button>
                      )}
                      <button className="brief-secondary-btn" onClick={copyShareLink}><Copy size={15}/> Copy share link</button>
                    </div>
                  )}

                  {brief.status === "CONFIRMED" && (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <div className="brief-success-strip"><CheckCircle size={16}/> Confirmed by client</div>
                      <button className="brief-pdf-btn" onClick={handleDownloadPdf} disabled={pdfLoading}>
                        {pdfLoading?<><span className="spinner"/> Exporting...</>:<><Download size={15}/> Download PDF</>}
                      </button>
                      <button className="brief-secondary-btn" onClick={copyShareLink}><Copy size={15}/> Copy share link</button>
                    </div>
                  )}

                  {brief.status === "NEEDS_REVISION" && (
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
                      <button className="brief-primary-btn" onClick={handleRegen} disabled={regen}>
                        {regen?<><span className="spinner"/> Regenerating...</>:<><Zap size={15}/> Regenerate V{(brief.current_version||1)+1}</>}
                      </button>
                      <button className="brief-secondary-btn" onClick={copyShareLink}><Copy size={15}/> Copy share link</button>
                    </div>
                  )}
                </div>

                {brief.status !== "CONFIRMED" && !editMode && (
                  <div className="brief-action-card" style={{marginTop:14}}>
                    <p className="brief-side-title">Edit brief</p>
                    <p className="brief-side-copy">Refine the AI output before sending to the client.</p>
                    <button className="brief-secondary-btn" onClick={enterEdit}><Pencil size={15}/> Edit brief</button>
                  </div>
                )}

                {brief.versions.length > 0 && (
                  <div className="brief-action-card" style={{marginTop:14}}>
                    <p className="brief-side-title">Versions ({brief.versions.length})</p>
                    <p className="brief-side-copy">Review all generated versions.</p>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {brief.versions.map((version,i)=>(
                        <button key={version.version_number||i}
                          onClick={()=>{setActiveV(i);setEditMode(false);setShowDiff(false);}}
                          className={i===activeV?"brief-primary-btn":"brief-secondary-btn"}
                          style={{width:"auto",minHeight:34,padding:"0 12px",animation:"none"}}>
                          V{version.version_number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>
      <Footer/>
    </motion.div></>
  );
}
