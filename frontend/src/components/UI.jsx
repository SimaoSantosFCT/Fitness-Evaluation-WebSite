// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  normal:      { bg: 'var(--sage-light)',  text: 'var(--sage)',  label: 'Normal' },
  healthy:     { bg: 'var(--sage-light)',  text: 'var(--sage)',  label: 'Saudável' },
  low:         { bg: 'var(--sky-light)',   text: 'var(--sky)',   label: 'Baixo' },
  underweight: { bg: 'var(--sky-light)',   text: 'var(--sky)',   label: 'Abaixo do Peso' },
  high:        { bg: 'var(--amber-light)', text: 'var(--amber)', label: 'Elevado' },
  overweight:  { bg: 'var(--amber-light)', text: 'var(--amber)', label: 'Sobrepeso' },
  very_high:   { bg: 'var(--rose-light)',  text: 'var(--rose)',  label: 'Muito Elevado' },
  excessive:   { bg: 'var(--rose-light)',  text: 'var(--rose)',  label: 'Excessivo' },
  obese1:      { bg: 'var(--rose-light)',  text: 'var(--rose)',  label: 'Obesidade 1' },
  obese2:      { bg: 'var(--rose-light)',  text: 'var(--rose)',  label: 'Obesidade 2' },
  obese3:      { bg: 'var(--rose-light)',  text: 'var(--rose)',  label: 'Obesidade 3' },
}

export function StatusBadge({ status }) {
  if (!status) return null
  const s = STATUS_MAP[status] || STATUS_MAP.normal
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', background: s.bg, color: s.text,
      borderRadius: '20px', fontSize: '11px', fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.text, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────
export function ResultCard({ icon, title, text, status }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: '18px 22px',
      border: '1px solid var(--border)', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            {title}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, fontWeight: 300 }}>{text}</p>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputCss = {
  width: '100%', padding: '9px 13px',
  border: '1.5px solid var(--border)', borderRadius: 7,
  fontSize: 13, background: 'var(--cream)', color: 'var(--ink)', outline: 'none',
}

export function SectionTitle({ children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px',
      textTransform: 'uppercase', margin: '22px 0 14px',
      paddingBottom: 7, borderBottom: '1px solid var(--cream-dark)',
    }}>
      {children}
    </p>
  )
}
