import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import api from '../services/api'
import { Mic, MicOff, Image, FileText, X, Sparkles, ChevronLeft, AlertCircle, Square } from 'lucide-react'

const pageStyles = `
  @keyframes lumenFloatIn {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes lumenSoftPulse {
    0%, 100% { box-shadow: 0 0 16px rgba(220,176,0,0.08); }
    50% { box-shadow: 0 0 28px rgba(220,176,0,0.18); }
  }

  .new-brief-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-image: url('/images/Body.png');
    background-size: cover;
    background-position: center;
  }

  .new-brief-wrap {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding-bottom: 110px;
    animation: lumenFloatIn 0.45s ease both;
  }

  .new-brief-card {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow:
      0 18px 48px rgba(0,0,0,0.24),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .new-brief-title {
    font-size: 22px;
    font-weight: 800;
    color: rgba(255,255,255,0.95);
    letter-spacing: -0.01em;
  }

  .new-brief-subtitle {
    font-size: 13px;
    color: rgba(255,255,255,0.48);
    margin-top: 3px;
  }

  .new-brief-label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.72);
    margin-bottom: 8px;
    display: block;
    letter-spacing: 0.03em;
  }

  .new-brief-input {
    width: 100%;
    background: rgba(255,255,255,0.11);
    color: rgba(255,255,255,0.96);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.22s ease;
    outline: none;
  }

  .new-brief-input::placeholder {
    color: rgba(255,255,255,0.46);
  }

  .new-brief-input:focus {
    background: rgba(255,255,255,0.16);
    border-color: rgba(220,176,0,0.48);
    box-shadow:
      0 0 0 3px rgba(220,176,0,0.10),
      0 0 22px rgba(220,176,0,0.08);
  }

  .new-brief-input.error {
    border-color: rgba(255,77,109,0.55);
    box-shadow: 0 0 0 3px rgba(255,77,109,0.10);
  }

  .new-brief-zone:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.22);
  }

  .new-brief-file-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: rgba(255,255,255,0.075);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
  }

  /* ── Mic recorder ── */
  @keyframes micPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,77,109,0.55); }
    50%       { box-shadow: 0 0 0 8px rgba(255,77,109,0); }
  }
  .mic-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .mic-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.72);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .mic-btn:hover { background: rgba(255,255,255,0.11); color: rgba(255,255,255,0.96); }
  .mic-btn.recording {
    background: rgba(255,77,109,0.18);
    border-color: rgba(255,77,109,0.5);
    color: #ff4d6d;
    animation: micPulse 1.2s ease-in-out infinite;
  }
  .mic-btn.recording:hover { background: rgba(255,77,109,0.26); }
  .mic-timer {
    font-size: 12px;
    font-weight: 700;
    color: #ff4d6d;
    font-variant-numeric: tabular-nums;
    min-width: 38px;
  }
  .mic-clip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255,255,255,0.78);
    flex-shrink: 0;
  }
  .mic-clip-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22d3a0;
    box-shadow: 0 0 8px rgba(34,211,160,0.6);
    flex-shrink: 0;
  }
  .mic-remove-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.4); padding: 0; display: flex;
    transition: color 0.15s;
  }
  .mic-remove-btn:hover { color: #ff4d6d; }

  .new-brief-submit {
    width: 100%;
    min-height: 52px;
    margin-bottom: 24px;
    border: 1px solid rgba(220,176,0,0.34);
    border-radius: 13px;
    background: linear-gradient(135deg, rgba(220,176,0,0.22), rgba(11,100,255,0.18));
    color: #fff;
    cursor: pointer;
    font-size: 15px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    animation: lumenSoftPulse 3s ease-in-out infinite;
  }

  .new-brief-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(220,176,0,0.55);
    background: linear-gradient(135deg, rgba(220,176,0,0.30), rgba(11,100,255,0.24));
  }

  .new-brief-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .new-brief-back {
    background: rgba(255,255,255,0.07) !important;
    border-color: rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.72) !important;
  }

  .new-brief-back:hover {
    background: rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.95) !important;
  }

  .new-brief-generating {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 18px;
    padding: 34px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    animation: lumenFloatIn 0.45s ease both;
    margin-bottom: 90px;
  }
`

const ZONE_TYPES = {
  audio:     { label: 'Recordings', icon: Mic,      accept: ['audio/mpeg','audio/mp4','audio/wav','audio/webm','audio/ogg','audio/x-m4a'], ext: 'MP3, M4A, WAV, OGG' },
  images:    { label: 'Images',     icon: Image,    accept: ['image/jpeg','image/png','image/webp','image/gif'],                            ext: 'JPG, PNG, WEBP' },
  documents: { label: 'Docs',       icon: FileText, accept: ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ext: 'PDF, DOC, DOCX' },
}

function UploadZone({ zoneKey, files, onAdd, onRemove }) {
  const ref         = useRef()
  const [dragOver,  setDragOver]  = useState(false)
  const [wrongType, setWrongType] = useState(false)
  const { label, icon: Icon, accept, ext } = ZONE_TYPES[zoneKey]

  function isAccepted(file) { return accept.includes(file.type) }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    setWrongType(false)
    const dropped = Array.from(e.dataTransfer.files)
    const good    = dropped.filter(isAccepted)
    const bad     = dropped.filter(f => !isAccepted(f))
    if (bad.length > 0 && good.length === 0) {
      setWrongType(true)
      setTimeout(() => setWrongType(false), 2500)
      return
    }
    if (good.length) onAdd(good)
  }

  function handleDragOver(e) {
    e.preventDefault()
    // peek at file types during drag
    const types = Array.from(e.dataTransfer.items || []).map(i => i.type)
    const anyGood = types.some(t => accept.includes(t))
    setDragOver(true)
    if (!anyGood && types.length > 0) setWrongType(true)
    else setWrongType(false)
  }

  function handleDragLeave() { setDragOver(false); setWrongType(false) }

  function handleFileInput(e) {
    const picked = Array.from(e.target.files).filter(isAccepted)
    if (picked.length) onAdd(picked)
    e.target.value = ''
  }

  const borderColor = wrongType ? 'rgba(255,77,109,0.55)' : dragOver ? 'rgba(220,176,0,0.55)' : files.length ? 'rgba(34,211,160,0.45)' : 'rgba(255,255,255,0.18)'
  const bg          = wrongType ? 'rgba(255,77,109,0.10)' : dragOver ? 'rgba(220,176,0,0.10)' : files.length ? 'rgba(34,211,160,0.09)' : 'rgba(255,255,255,0.07)'
  const iconColor   = files.length ? '#22d3a0' : dragOver ? '#dcb000' : 'rgba(255,255,255,0.62)'

  return (
    <div>
      <div
        className="new-brief-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !wrongType && ref.current.click()}
        style={{
          border: `1px dashed ${borderColor}`, borderRadius: 12,
          padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
          background: bg, transition: 'all 0.22s ease', minHeight: 124,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
        }}
      >
        <input ref={ref} type="file" multiple accept={accept.join(',')}
          style={{ display: 'none' }} onChange={handleFileInput} />

        {wrongType ? (
          <>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,77,109,0.18)', border: '1px solid rgba(255,77,109,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <X size={20} color="#fff" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ff4d6d', marginBottom: 2 }}>Wrong file type</div>
            <div style={{ fontSize: 11, color: 'rgba(255,77,109,0.82)' }}>This zone only accepts {ext}</div>
          </>
        ) : (
          <>
            <Icon size={26} strokeWidth={1.5} color={iconColor} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: files.length ? '#22d3a0' : 'rgba(255,255,255,0.90)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.46)' }}>{dragOver ? 'Drop here' : `Drag & drop or click - ${ext}`}</div>
            {files.length > 0 && (
              <div style={{ fontSize: 12, color: '#22d3a0', fontWeight: 700, marginTop: 5 }}>
                {files.length} file{files.length > 1 ? 's' : ''} ready
              </div>
            )}
          </>
        )}
      </div>

      {/* File chips */}
      {files.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {files.map((f, i) => (
            <div key={i} className="new-brief-file-chip">
              <Icon size={13} color="rgba(255,255,255,0.45)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, flex: 1, color: 'rgba(255,255,255,0.78)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={e => { e.stopPropagation(); onRemove(zoneKey, i) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 0, flexShrink: 0, display: 'flex' }}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── WAV encoder ──────────────────────────────────────────────────────────────
// Converts a Web Audio AudioBuffer → WAV Blob (PCM 16-bit, mono, 16 kHz).
// Groq Whisper works best with WAV; this avoids the codec-suffix MIME problem.
function audioBufferToWav(buffer) {
  const numChannels = 1          // mono — whisper doesn't need stereo
  const sampleRate  = 16000      // 16 kHz is ideal for speech
  const bitDepth    = 16
  const bytesPerSample = bitDepth / 8

  // Down-mix to mono
  let samples
  if (buffer.numberOfChannels === 1) {
    samples = buffer.getChannelData(0)
  } else {
    const ch0 = buffer.getChannelData(0)
    const ch1 = buffer.getChannelData(1)
    samples = new Float32Array(ch0.length)
    for (let i = 0; i < ch0.length; i++) samples[i] = (ch0[i] + ch1[i]) / 2
  }

  // Resample to 16 kHz using linear interpolation
  const ratio       = buffer.sampleRate / sampleRate
  const outLength   = Math.floor(samples.length / ratio)
  const resampled   = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const src = i * ratio
    const lo  = Math.floor(src)
    const hi  = Math.min(lo + 1, samples.length - 1)
    resampled[i] = samples[lo] + (src - lo) * (samples[hi] - samples[lo])
  }

  // PCM 16-bit clamp
  const pcm = new Int16Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const s = Math.max(-1, Math.min(1, resampled[i]))
    pcm[i]  = s < 0 ? s * 0x8000 : s * 0x7FFF
  }

  // WAV header
  const dataSize   = pcm.byteLength
  const headerSize = 44
  const wav        = new ArrayBuffer(headerSize + dataSize)
  const view       = new DataView(wav)
  function writeStr(off, str) { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)) }
  writeStr(0,  'RIFF')
  view.setUint32(4,  36 + dataSize, true)
  writeStr(8,  'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)            // PCM sub-chunk size
  view.setUint16(20, 1,  true)            // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true)
  view.setUint16(32, numChannels * bytesPerSample, true)
  view.setUint16(34, bitDepth, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)
  new Int16Array(wav, headerSize).set(pcm)
  return new Blob([wav], { type: 'audio/wav' })
}

// Decodes any audio blob → WAV using OfflineAudioContext
async function blobToWav(blob) {
  const arrayBuf = await blob.arrayBuffer()
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const decoded  = await audioCtx.decodeAudioData(arrayBuf)
  audioCtx.close()
  return audioBufferToWav(decoded)
}

// ── MicRecorder component ─────────────────────────────────────────────────────
function MicRecorder({ onRecorded }) {
  const [recording,  setRecording]  = useState(false)
  const [converting, setConverting] = useState(false)
  const [seconds,    setSeconds]    = useState(0)
  const [clips,      setClips]      = useState([])   // { name, file, url }
  const [error,      setError]      = useState('')
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const timerRef  = useRef(null)
  const streamRef = useRef(null)

  function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      // Record in whatever format the browser supports natively — we convert to WAV on stop
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'].find(m => MediaRecorder.isTypeSupported(m)) || ''
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setConverting(true)
        try {
          // Re-assemble raw blob (any format)
          const rawBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
          // Convert to WAV — guaranteed mime audio/wav, no codec suffix
          const wavBlob = await blobToWav(rawBlob)
          const idx     = Date.now()           // unique even for rapid recordings
          const name    = `recording-${idx}.wav`
          // mime MUST be exactly 'audio/wav' — matches AUDIO_TYPES on backend
          const file    = new File([wavBlob], name, { type: 'audio/wav' })
          const url     = URL.createObjectURL(wavBlob)
          setClips(prev => {
            const updated = [...prev, { name, file, url }]
            onRecorded(updated.map(c => c.file))
            return updated
          })
        } catch (e) {
          setError('Recording conversion failed — please try again.')
          console.error('[MicRecorder] WAV conversion error:', e)
        } finally {
          setConverting(false)
        }
      }
      mr.start(250)
      mediaRef.current = mr
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setError('Microphone access denied — please allow mic access in your browser settings.')
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    setRecording(false)
    if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
  }

  function removeClip(idx) {
    setClips(prev => {
      URL.revokeObjectURL(prev[idx].url)
      const updated = prev.filter((_, i) => i !== idx)
      onRecorded(updated.map(c => c.file))
      return updated
    })
  }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    clips.forEach(c => URL.revokeObjectURL(c.url))
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div className="mic-bar">
      <button
        type="button"
        className={`mic-btn ${recording ? 'recording' : ''}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={converting}
        title={recording ? 'Stop recording' : 'Record a voice note'}
      >
        {recording ? <Square size={12} fill="#ff4d6d" /> : <Mic size={13} />}
        {converting ? 'Processing...' : recording ? 'Stop' : 'Record voice note'}
      </button>

      {recording && <span className="mic-timer">{fmt(seconds)}</span>}
      {converting && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Converting to WAV…</span>}

      {clips.map((clip, i) => (
        <div key={i} className="mic-clip">
          <span className="mic-clip-dot" />
          <audio src={clip.url} controls style={{ height: 24, maxWidth: 140 }} />
          <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{clip.name}</span>
          <button className="mic-remove-btn" type="button" onClick={() => removeClip(i)} title="Remove">
            <X size={12} />
          </button>
        </div>
      ))}

      {error && <span style={{ fontSize: 12, color: '#ff4d6d' }}>{error}</span>}
    </div>
  )
}

export default function NewBrief() {
  const navigate  = useNavigate()
  const [client,  setClient]  = useState('')
  const [text,    setText]    = useState('')
  const [files,   setFiles]   = useState({ audio: [], images: [], documents: [] })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState('')
  const [step,    setStep]    = useState('input')

  function addFiles(zone, newFiles) {
    setFiles(f => ({ ...f, [zone]: [...f[zone], ...newFiles] }))
  }

  function removeFile(zone, idx) {
    setFiles(f => ({ ...f, [zone]: f[zone].filter((_, i) => i !== idx) }))
  }

  function validate() {
    const e = {}
    if (!client.trim()) e.client = 'Client name is required'
    const hasInput = text.trim() || files.audio.length || files.images.length || files.documents.length
    if (!hasInput) e.input = 'Please provide at least some input - text, a recording, image, or document'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setApiErr(''); setLoading(true); setStep('generating')
    try {
      const fd = new FormData()
      fd.append('client_name', client)
      // backend Form field is named text_input (not raw_text_input)
      if (text.trim()) fd.append('text_input', text)
      // backend expects: audio_files, image_files, document_files
      files.audio.forEach(f     => fd.append('audio_files',    f))
      files.images.forEach(f    => fd.append('image_files',    f))
      files.documents.forEach(f => fd.append('document_files', f))
      // Do NOT set Content-Type manually — axios must set it with the correct boundary
      const res = await api.post('/briefs', fd)
      navigate(`/briefs/${res.data.id}`)
    } catch (err) {
      setApiErr(err.response?.data?.detail || err.response?.data?.error || 'Something went wrong. Please try again.')
      setStep('input'); setLoading(false)
    }
  }

  if (step === 'generating') return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        className="new-brief-shell"
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="new-brief-generating" style={{ textAlign: 'center', maxWidth: 430 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(220,176,0,0.12)', border: '1px solid rgba(220,176,0,0.28)', borderRadius: 16, color: '#dcb000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: 8 }}>Generating brief</h2>
              <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, marginBottom: 28 }}>AI is reading everything you submitted and structuring it into a clean project brief.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Reading your input...','Extracting goals and requirements...','Identifying ambiguities...','Structuring the brief...'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(255,255,255,0.075)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="spinner" />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </motion.div>
    </>
  )

  return (
    <>
      <style>{pageStyles}</style>
      <motion.div
        className="new-brief-shell"
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        <Nav />
        <div className="app-layout" style={{ flex: 1 }}>
          <Sidebar />
          <main className="main-content" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="new-brief-wrap">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                
                <div>
                  <h1 className="new-brief-title">New brief</h1>
                  <p className="new-brief-subtitle">Paste everything the client sent - the AI handles the rest</p>
                </div>
              </div>

              {apiErr && (
                <div className="alert alert-error" style={{ marginBottom: 20 }}>
                  <AlertCircle size={15} /> {apiErr}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="new-brief-card" style={{ marginBottom: 16 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="new-brief-label">Client name *</label>
                    <input className={`new-brief-input ${errors.client ? 'error' : ''}`}
                      value={client} onChange={e => setClient(e.target.value)}
                      placeholder="e.g. Nour Store, Mohamed's Agency..." />
                    {errors.client && <p className="field-error">{errors.client}</p>}
                  </div>
                </div>

                <div className="new-brief-card" style={{ marginBottom: 16 }}>
                  <label className="new-brief-label">Client messages & notes</label>
                  <textarea className="new-brief-input" style={{ minHeight: 210 }}
                    value={text} onChange={e => setText(e.target.value)}
                    placeholder="Paste everything here - WhatsApp messages, email threads, voice note summaries, random notes. The messier the better." />
                  {/* Mic recorder — recordings go straight into audio_files */}
                  <MicRecorder onRecorded={(recordedFiles) => setFiles(f => ({ ...f, audio: [...f.audio.filter(x => !x.name.startsWith('recording-')), ...recordedFiles] }))} />
                  {errors.input && !text.trim() && !files.audio.length && !files.images.length && !files.documents.length && (
                    <p className="field-error">{errors.input}</p>
                  )}
                </div>

                <div className="new-brief-card" style={{ marginBottom: 24 }}>
                  <label className="new-brief-label" style={{ marginBottom: 14 }}>
                    Attachments <span style={{ color: 'rgba(255,255,255,0.42)', fontWeight: 400 }}>- drag & drop or click to browse</span>
                  </label>
                  <div className="grid-3">
                    {Object.keys(ZONE_TYPES).map(zone => (
                      <UploadZone
                        key={zone}
                        zoneKey={zone}
                        files={files[zone]}
                        onAdd={f => addFiles(zone, f)}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="new-brief-submit" disabled={loading}>
                  <Sparkles size={17} /> Generate brief with AI
                </button>
              </form>
            </div>
          </main>
        </div>
        <Footer />
      </motion.div>
    </>
  )
}
