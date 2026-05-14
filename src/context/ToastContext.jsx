import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((type, title, body = '', onClick = null) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, type, title, body, onClick, leaving: false }])
    setTimeout(() => dismiss(id), 4500)
  }, [])

  function dismiss(id) {
    // mark as leaving to trigger exit animation
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350)
  }

  const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle }
  const colors = {
    success: 'var(--success)', error: 'var(--danger)',
    info: 'var(--info)', warning: 'var(--warning)'
  }

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const Icon = icons[t.type] || Info
          return (
            <div key={t.id}
              onClick={() => { t.onClick?.(); dismiss(t.id) }}
              style={{
                background: '#fff', border: '1.5px solid var(--border)',
                borderLeft: `4px solid ${colors[t.type]}`,
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                minWidth: 300, maxWidth: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                pointerEvents: 'all', cursor: t.onClick ? 'pointer' : 'default',
                animation: t.leaving
                  ? 'toastOut 0.35s cubic-bezier(0.4,0,1,1) forwards'
                  : 'toastIn 0.25s cubic-bezier(0,0,0.2,1) forwards',
              }}>
              <Icon size={16} style={{ flexShrink: 0, marginTop: 1, color: colors[t.type] }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.title}</div>
                {t.body && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, lineHeight: 1.5 }}>{t.body}</div>}
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismiss(t.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(24px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastOut {
          from { transform: translateX(0);    opacity: 1; max-height: 100px; margin-bottom: 0; }
          to   { transform: translateX(32px); opacity: 0; max-height: 0;    margin-bottom: -8px; }
        }
      `}</style>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
