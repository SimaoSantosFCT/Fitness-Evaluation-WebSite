import { useState, useEffect } from 'react'
import { Field, SectionTitle, ResultCard, StatusBadge, inputCss } from '../components/UI.jsx'

const TODAY = new Date().toISOString().split('T')[0]

const INITIAL_PRESENCIAL = {
  name: '', age: '', genre: 'F', height: '', peso: '',
  fatMass: '', boneMass: '', water: '', muscleMass: '',
  visceralFat: '', basalMetabolism: '', metabolicAge: '',
  physicalLevel: '5', evaluationDate: TODAY, evaluationType: 'PRESENCIAL',
}

const INITIAL_ONLINE = {
  name: '', age: '', genre: 'F', heightCm: '', peso: '',
  waist: '', neck: '', hip: '',
  chestPerimeter: '', armPerimeter: '', thighPerimeter: '',
  bodyFrame: 'NORMAL', activityLevel: 'LEVEMENTE_ATIVO',
  evaluationDate: TODAY, evaluationType: 'ONLINE',
}

// ── Gauge SVG ──────────────────────────────────────────────────────────────
function Gauge({ value, min, max, zones, label, unit = '' }) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
  const angle = -140 + pct * 280
  const rad = (angle * Math.PI) / 180
  const cx = 80, cy = 75, r = 55
  const nx = cx + r * Math.cos(rad)
  const ny = cy + r * Math.sin(rad)

  return (
      <svg viewBox="0 0 160 100" style={{ width: 140, height: 88 }}>
        {/* Track */}
        <path d={describeArc(cx, cy, r, -140, 140)} fill="none" stroke="#e0dbd2" strokeWidth="10" strokeLinecap="round" />
        {/* Zones */}
        {zones.map((z, i) => (
            <path key={i} d={describeArc(cx, cy, r, z.from, z.to)} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" opacity="0.85" />
        ))}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1a1714" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#1a1714" />
        {/* Value */}
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1a1714">
          {value}{unit}
        </text>
      </svg>
  )
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToCartesian(cx, cy, r, endDeg)
  const end   = polarToCartesian(cx, cy, r, startDeg)
  const large  = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// ── Zone bar ───────────────────────────────────────────────────────────────
function ZoneBar({ zones, value, label }) {
  const total = zones.reduce((s, z) => s + z.width, 0)
  return (
      <div>
        <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
          {zones.map((z, i) => (
              <div key={i} style={{ flex: z.width, background: z.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'white', fontWeight: 700, letterSpacing: '0.5px' }}>{z.label}</span>
              </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginBottom: 2 }}>
          {zones.map((z, i) => i > 0 && <span key={i}>{z.threshold}</span>)}
          <span />
        </div>
        <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>* Valores de referência de acordo com género e idade</p>
      </div>
  )
}

// ── Avatar corporal ────────────────────────────────────────────────────────
function BodyAvatar({ imcStatus, genre }) {
  const avatars = [
    { key: 'underweight', label: 'ABAIXO DO PESO' },
    { key: 'normal',      label: 'NORMAL' },
    { key: 'overweight',  label: 'SOBREPESO' },
    { key: 'obese1',      label: 'OBESO' },
    { key: 'obese2',      label: 'HIPEROBESO' },
  ]
  const isFem = genre === 'F'
  return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        {avatars.map(({ key, label }) => {
          const active = imcStatus === key || (key === 'obese1' && (imcStatus === 'obese1' || imcStatus === 'obese2' || imcStatus === 'obese3'))
          return (
              <div key={key} style={{ textAlign: 'center', opacity: active ? 1 : 0.3 }}>
                <div style={{
                  width: 44, height: 80, margin: '0 auto 6px',
                  background: active ? (isFem ? '#5a7a5c' : '#3a6fa8') : '#ddd',
                  borderRadius: '50% 50% 40% 40% / 30% 30% 60% 60%',
                  position: 'relative',
                  border: active ? '2px solid white' : 'none',
                  boxShadow: active ? '0 0 0 3px ' + (isFem ? '#5a7a5c' : '#3a6fa8') : 'none',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: active ? (isFem ? '#5a7a5c' : '#3a6fa8') : '#ddd',
                    position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                  }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? (isFem ? '#5a7a5c' : '#3a6fa8') : '#aaa' }}>{label}</span>
              </div>
          )
        })}
      </div>
  )
}

export default function EvaluationPage({ prefill }) {
  const [evalType, setEvalType]   = useState('PRESENCIAL')
  const [form, setForm]           = useState(INITIAL_PRESENCIAL)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    if (!prefill) return
    const base = { name: prefill.clientName || '', age: String(prefill.age || ''), genre: prefill.genre || 'F', evaluationDate: TODAY, evaluationType: evalType }
    if (evalType === 'PRESENCIAL') {
      setForm({ ...INITIAL_PRESENCIAL, ...base, height: String(prefill.height || ''), physicalLevel: String(prefill.physicalLevel || '5') })
    } else {
      const hcm = prefill.heightCm || (prefill.height ? Math.round(prefill.height * 100) : '')
      setForm({ ...INITIAL_ONLINE, ...base, heightCm: String(hcm) })
    }
    setResult(null); setSaved(false); setError(null)
  }, [prefill, evalType])

  const switchType = (type) => {
    setEvalType(type)
    setForm(type === 'PRESENCIAL' ? { ...INITIAL_PRESENCIAL } : { ...INITIAL_ONLINE })
    setResult(null); setSaved(false); setError(null)
  }

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setSaved(false)
    try {
      const payload = evalType === 'PRESENCIAL' ? {
        name: form.name, age: parseInt(form.age), genre: form.genre,
        evaluationType: 'PRESENCIAL', evaluationDate: form.evaluationDate,
        height: parseFloat(form.height), peso: parseFloat(form.peso),
        fatMass: parseFloat(form.fatMass), boneMass: parseFloat(form.boneMass),
        water: parseFloat(form.water), muscleMass: parseFloat(form.muscleMass),
        visceralFat: parseFloat(form.visceralFat), basalMetabolism: parseFloat(form.basalMetabolism),
        metabolicAge: parseFloat(form.metabolicAge), physicalLevel: parseInt(form.physicalLevel),
      } : {
        name: form.name, age: parseInt(form.age), genre: form.genre,
        evaluationType: 'ONLINE', evaluationDate: form.evaluationDate,
        heightCm: parseFloat(form.heightCm), peso: parseFloat(form.peso),
        waist: parseFloat(form.waist), neck: parseFloat(form.neck),
        hip: form.genre === 'F' ? parseFloat(form.hip) || 0 : 0,
        chestPerimeter: parseFloat(form.chestPerimeter) || 0,
        armPerimeter: parseFloat(form.armPerimeter) || 0,
        thighPerimeter: parseFloat(form.thighPerimeter) || 0,
        bodyFrame: form.bodyFrame,
        activityLevel: form.activityLevel,
      }
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Erro no servidor.')
      setResult(await res.json()); setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const inp = (name, placeholder, type = 'text') => (
      <input style={inputCss} name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder} />
  )

  const frameOptions = [
    { value: 'PEQUENO', label: 'Pequeno', desc: 'Os dedos sobrepõem-se' },
    { value: 'NORMAL',  label: 'Normal',  desc: 'Os dedos tocam-se levemente' },
    { value: 'GRANDE',  label: 'Grande',  desc: 'Os dedos não se tocam' },
  ]

  const activityOptions = [
    { value: 'SEDENTARIO',          label: 'Sedentário',           desc: 'Pouco ou nenhum exercício', dots: 1 },
    { value: 'LEVEMENTE_ATIVO',     label: 'Levemente Ativo',      desc: 'Exercício leve, 1–3 vezes/semana', dots: 2 },
    { value: 'MODERADAMENTE_ATIVO', label: 'Moderadamente Ativo',  desc: 'Exercício moderado, 3–5 vezes/semana', dots: 3 },
    { value: 'MUITO_ATIVO',         label: 'Muito Ativo',          desc: 'Exercício intenso, 6–7 vezes/semana', dots: 4 },
    { value: 'SUPER_ATIVO',         label: 'Super Ativo',          desc: 'Atleta, treina duas vezes ao dia', dots: 5 },
  ]

  return (
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: 'calc(100vh - 80px)' }}>

        {/* ── FORM ── */}
        <div style={{ background: 'white', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ padding: '28px 28px 40px' }}>

            {/* Selector tipo */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {[['PRESENCIAL','🏋️ Presencial'],['ONLINE','📱 Online']].map(([type, label]) => (
                  <button key={type} type="button" onClick={() => switchType(type)} style={{
                    flex: 1, padding: '11px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: evalType === type ? 'var(--ink)' : 'white',
                    color: evalType === type ? 'var(--cream)' : 'var(--ink-muted)', transition: 'all 0.15s',
                  }}>{label}</button>
              ))}
            </div>

            {prefill && <p style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 12, fontWeight: 500 }}>✦ Dados fixos pré-preenchidos.</p>}

            <SectionTitle>Identificação</SectionTitle>
            <Field label="Nome do Cliente">{inp('name', 'ex: Maria Silva')}</Field>
            <Field label="Data da Avaliação"><input style={inputCss} type="date" name="evaluationDate" value={form.evaluationDate} onChange={set} /></Field>
            <Field label="Idade">{inp('age', 'ex: 35', 'number')}</Field>
            <Field label="Género">
              <select style={{ ...inputCss, cursor: 'pointer' }} name="genre" value={form.genre} onChange={set}>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </Field>

            {/* ── PRESENCIAL ── */}
            {evalType === 'PRESENCIAL' && (
                <>
                  <Field label="Altura (m)">{inp('height', 'ex: 1.65', 'number')}</Field>
                  <Field label="Peso (kg)">{inp('peso', 'ex: 68.5', 'number')}</Field>
                  <SectionTitle>Composição Corporal</SectionTitle>
                  <Field label="Massa Gorda (%)">{inp('fatMass', 'ex: 28.5', 'number')}</Field>
                  <Field label="Massa Óssea (kg)">{inp('boneMass', 'ex: 2.40', 'number')}</Field>
                  <Field label="Água Total (%)">{inp('water', 'ex: 52.3', 'number')}</Field>
                  <Field label="Massa Muscular (kg)">{inp('muscleMass', 'ex: 24.8', 'number')}</Field>
                  <Field label="Gordura Visceral">{inp('visceralFat', 'ex: 8', 'number')}</Field>
                  <SectionTitle>Metabolismo</SectionTitle>
                  <Field label="IMB (Kcal)">{inp('basalMetabolism', 'ex: 1450', 'number')}</Field>
                  <Field label="Idade Metabólica">{inp('metabolicAge', 'ex: 32', 'number')}</Field>
                  <Field label="Nível Físico">
                    <select style={{ ...inputCss, cursor: 'pointer' }} name="physicalLevel" value={form.physicalLevel} onChange={set}>
                      {[['1','1 — Obesidade Oculta'],['2','2 — Obesidade'],['3','3 — Constituição Sólida'],['4','4 — Falta de Exercício'],['5','5 — Normal'],['6','6 — Musculação Normal'],['7','7 — Magro'],['8','8 — Magro e Musculado'],['9','9 — Muito Musculado']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                </>
            )}

            {/* ── ONLINE ── */}
            {evalType === 'ONLINE' && (
                <>
                  <div style={{ background: 'var(--sky-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: 'var(--sky)', fontWeight: 500 }}>📱 Medidas com fita métrica — calculamos o resto automaticamente.</p>
                  </div>

                  <SectionTitle>Medidas Obrigatórias</SectionTitle>
                  <Field label="Altura (cm)">{inp('heightCm', 'ex: 165', 'number')}</Field>
                  <Field label="Peso (kg)">{inp('peso', 'ex: 68.5', 'number')}</Field>
                  <Field label="Cintura (cm)">
                    <div>
                      {inp('waist', 'ex: 75', 'number')}
                      <p style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 3 }}>Medir na parte mais estreita do torso, acima do umbigo.</p>
                    </div>
                  </Field>
                  <Field label="Pescoço (cm)">
                    <div>
                      {inp('neck', 'ex: 31.5', 'number')}
                      <p style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 3 }}>Medir abaixo da laringe com a fita métrica.</p>
                    </div>
                  </Field>
                  {form.genre === 'F' && (
                      <Field label="Anca / Quadril (cm) — obrigatório">
                        <div>
                          {inp('hip', 'ex: 97', 'number')}
                          <p style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 3 }}>Medir na parte mais larga dos quadris e nádegas.</p>
                        </div>
                      </Field>
                  )}

                  {/* Tipo de corpo */}
                  <SectionTitle>Tipo de Corpo</SectionTitle>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 10 }}>
                    Coloca a mão dominante à volta do pulso oposto com o polegar e o dedo indicador:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {frameOptions.map(({ value, label, desc }) => (
                        <div
                            key={value}
                            onClick={() => setForm(p => ({ ...p, bodyFrame: value }))}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                              border: '1.5px solid ' + (form.bodyFrame === value ? 'var(--gold)' : 'var(--border)'),
                              background: form.bodyFrame === value ? 'var(--gold-pale)' : 'white',
                              transition: 'all 0.15s',
                            }}
                        >
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label.toUpperCase()}</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{desc}</p>
                          </div>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            border: '2px solid ' + (form.bodyFrame === value ? 'var(--gold)' : 'var(--border)'),
                            background: form.bodyFrame === value ? 'var(--gold)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {form.bodyFrame === value && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                          </div>
                        </div>
                    ))}
                  </div>

                  {/* Nível de actividade */}
                  <SectionTitle>Frequência de Actividade Física</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {activityOptions.map(({ value, label, desc, dots }) => (
                        <div
                            key={value}
                            onClick={() => setForm(p => ({ ...p, activityLevel: value }))}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                              border: '1.5px solid ' + (form.activityLevel === value ? 'var(--gold)' : 'var(--border)'),
                              background: form.activityLevel === value ? 'var(--gold-pale)' : 'white',
                              transition: 'all 0.15s',
                            }}
                        >
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label.toUpperCase()}</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{desc}</p>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[1,2,3,4,5].map(d => (
                                  <div key={d} style={{ width: 10, height: 10, borderRadius: '50%', background: d <= dots ? '#e8943a' : '#ddd' }} />
                              ))}
                            </div>
                          </div>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            border: '2px solid ' + (form.activityLevel === value ? 'var(--gold)' : 'var(--border)'),
                            background: form.activityLevel === value ? 'var(--gold)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {form.activityLevel === value && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                          </div>
                        </div>
                    ))}
                  </div>

                  <SectionTitle>Perímetros (Recomendável)</SectionTitle>
                  <Field label="Peito (cm)">{inp('chestPerimeter', 'ex: 90', 'number')}</Field>
                  <Field label="Braço (cm)">{inp('armPerimeter', 'ex: 30', 'number')}</Field>
                  <Field label="Coxa (cm)">{inp('thighPerimeter', 'ex: 55', 'number')}</Field>
                </>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: 12, padding: '13px',
              background: loading ? 'var(--ink-muted)' : 'var(--ink)',
              color: 'var(--cream)', border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 500, letterSpacing: '1.5px',
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'A calcular...' : 'Gerar Avaliação'}
            </button>
          </form>
        </div>

        {/* ── RESULTS ── */}
        <div style={{ background: '#f7f5f0', overflowY: 'auto', padding: '32px 36px' }}>
          {!result && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, gap: 12 }}>
                <span style={{ fontSize: 48 }}>{evalType === 'ONLINE' ? '📱' : '📋'}</span>
                <h3 style={{ fontSize: 18 }}>Os resultados aparecem aqui</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>Preenche os dados e clica em "Gerar Avaliação"</p>
              </div>
          )}

          {error && (
              <div style={{ background: 'var(--rose-light)', borderRadius: 10, padding: '20px', color: 'var(--rose)' }}>
                <p style={{ fontWeight: 500 }}>Erro — {error}</p>
              </div>
          )}

          {result && (
              <>
                {saved && (
                    <div style={{ background: '#e8f0e8', border: '1px solid rgba(90,122,92,0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#3d6b3e' }}>Avaliação guardada</p>
                        <p style={{ fontSize: 12, color: '#3d6b3e' }}>Data: {result.evaluationDate} · ID #{result.savedId}</p>
                      </div>
                    </div>
                )}

                {/* Header */}
                <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <p style={{ fontSize: 10, letterSpacing: '2.5px', color: 'var(--gold)', fontWeight: 500 }}>AVALIAÇÃO — {result.evaluationDate}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: result.evaluationType === 'ONLINE' ? 'rgba(58,111,168,0.3)' : 'rgba(200,148,58,0.3)',
                      color: result.evaluationType === 'ONLINE' ? '#7ab0e8' : 'var(--gold)',
                    }}>
                  {result.evaluationType === 'ONLINE' ? '📱 Online' : '🏋️ Presencial'}
                </span>
                  </div>
                  <h2 style={{ fontSize: 20, color: 'var(--cream)', marginBottom: 4 }}>{result.clientSummary?.split('|')[0]}</h2>
                  <p style={{ fontSize: 12, color: 'rgba(250,248,244,0.5)' }}>{result.clientSummary?.split('|').slice(1).join(' · ')}</p>
                  {result.evaluationType === 'ONLINE' && (
                      <p style={{ fontSize: 11, color: 'rgba(250,248,244,0.4)', marginTop: 6 }}>
                        {result.bodyFrameLabel} · {result.activityLevelLabel}
                      </p>
                  )}
                </div>

                {/* ── ONLINE RESULTS ── */}
                {result.evaluationType === 'ONLINE' && (
                    <>
                      {/* Avatar */}
                      <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid var(--border)', marginBottom: 16, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 12 }}>AVATAR</p>
                        <BodyAvatar imcStatus={result.imcStatus} genre={result.clientSummary?.includes('anos') ? (result.remainingInformation?.includes('kg') ? 'F' : 'M') : 'F'} />
                      </div>

                      {/* Gauges IMC + Gordura */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        <div style={{ background: 'white', borderRadius: 12, padding: '18px 16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 8 }}>ÍNDICE DE MASSA CORPORAL</p>
                          <Gauge
                              value={result.imcValue} min={10} max={50}
                              zones={[
                                { from: -140, to: -70, color: '#3a6fa8' },
                                { from: -70,  to:  0,  color: '#5a7a5c' },
                                { from:  0,   to:  60, color: '#b87333' },
                                { from:  60,  to: 140, color: '#c04a4a' },
                              ]}
                          />
                          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>{result.imcValue}</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: result.imcStatus === 'normal' ? '#5a7a5c' : result.imcStatus === 'underweight' ? '#3a6fa8' : '#c04a4a' }}>
                            {result.imcStatus === 'normal' ? 'NORMAL' : result.imcStatus === 'underweight' ? 'ABAIXO DO PESO' : result.imcStatus === 'overweight' ? 'SOBREPESO' : 'OBESIDADE'}
                          </p>
                        </div>

                        <div style={{ background: 'white', borderRadius: 12, padding: '18px 16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 8 }}>PERCENTUAL DE GORDURA</p>
                          <Gauge
                              value={result.calculatedFatMassPercent} min={5} max={50}
                              zones={[
                                { from: -140, to: -60, color: '#3a6fa8' },
                                { from:  -60, to:  20, color: '#5a7a5c' },
                                { from:   20, to:  80, color: '#b87333' },
                                { from:   80, to: 140, color: '#c04a4a' },
                              ]}
                              unit="%"
                          />
                          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>{result.calculatedFatMassPercent}%</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: result.fatMassZone === 'bom' ? '#5a7a5c' : result.fatMassZone === 'elevado' ? '#c04a4a' : '#b87333' }}>
                            {result.fatMassZone?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Água corporal com barra de zonas */}
                      <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid var(--border)', marginBottom: 16 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>SUA ÁGUA CORPORAL</p>
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                          <div style={{ width: 80, height: 80, borderRadius: 12, background: '#5a7a5c', margin: '8px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 22, color: 'white' }}>💧</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{result.calculatedWaterPercent}%</span>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#5a7a5c' }}>
                            {result.waterZone === 'baixo' ? 'BAIXO' : result.waterZone === 'saudavel' ? 'SAUDÁVEL' : result.waterZone === 'alto' ? 'ALTO' : 'MUITO ALTO'}
                          </p>
                        </div>
                        <ZoneBar
                            zones={[
                              { label: 'BAIXO', color: '#e53935', width: 25, threshold: '' },
                              { label: 'SAUDÁVEL', color: '#29b6f6', width: 25, threshold: '49%' },
                              { label: 'ALTO', color: '#66bb6a', width: 25, threshold: '52%' },
                              { label: 'MUITO ALTO', color: '#2e7d32', width: 25, threshold: '58%' },
                            ]}
                            value={result.calculatedWaterPercent}
                        />
                      </div>

                      {/* Cards: Peso actual vs Ideal + Massa Muscular */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        <div style={{ background: 'white', borderRadius: 12, padding: '18px', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 12 }}>SEU PESO</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ width: 50, height: 50, borderRadius: 10, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 22 }}>⚖️</span>
                              </div>
                              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{form.peso || '—'} kg</p>
                              <p style={{ fontSize: 11, color: '#5a7a5c', fontWeight: 600 }}>NORMAL</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, marginBottom: 4 }}>SEU PESO IDEAL</p>
                              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{result.calculatedIdealWeight} kg</p>
                              <p style={{ fontSize: 10, color: 'var(--ink-muted)' }}>({result.calculatedIdealWeightMin} – {result.calculatedIdealWeightMax} kg)</p>
                              <p style={{ fontSize: 11, marginTop: 6, color: '#3a6fa8' }}>
                                {parseFloat(form.peso) < result.calculatedIdealWeight
                                    ? `Objetivo: aumentar ${Math.abs(round1(result.calculatedIdealWeight - parseFloat(form.peso)))} kg`
                                    : parseFloat(form.peso) > result.calculatedIdealWeightMax
                                        ? `Objetivo: perder ${round1(parseFloat(form.peso) - result.calculatedIdealWeight)} kg`
                                        : 'Peso ideal ✓'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: 12, padding: '18px', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 12 }}>MASSA MUSCULAR</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ width: 50, height: 50, borderRadius: 10, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 22 }}>💪</span>
                              </div>
                              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{result.calculatedLeanMassKg} kg</p>
                              <p style={{ fontSize: 11, color: '#5a7a5c', fontWeight: 600 }}>{result.muscleMassZone?.toUpperCase()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, marginBottom: 4 }}>RESULTADOS</p>
                              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{round1((result.calculatedLeanMassKg / parseFloat(form.peso || 1)) * 100)}%</p>
                              <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6 }}>Objectivo: manter massa muscular</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
                            {[['#e53935',25],['#29b6f6',25],['#66bb6a',25],['#2e7d32',25]].map(([c,w],i) => (
                                <div key={i} style={{ flex: w, background: c }} />
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#aaa', marginTop: 2 }}>
                            <span>BAIXO</span><span>SAUDÁVEL</span><span>BOM</span><span>EXCELENTE</span>
                          </div>
                        </div>
                      </div>

                      {/* Idade Metabólica + TDEE */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        <div style={{ background: 'white', borderRadius: 12, padding: '18px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ width: 60, height: 60, borderRadius: 12, background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <span style={{ fontSize: 26 }}>🧬</span>
                          </div>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 6 }}>IDADE METABÓLICA</p>
                          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>{result.calculatedMetabolicAge}</p>
                          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>anos</p>
                        </div>
                        <div style={{ background: 'white', borderRadius: 12, padding: '18px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ width: 60, height: 60, borderRadius: 12, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <span style={{ fontSize: 26 }}>🔥</span>
                          </div>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 6 }}>GASTO ENERGÉTICO DIÁRIO</p>
                          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{result.calculatedTDEE}</p>
                          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Kcal/dia ({result.activityLevelLabel})</p>
                        </div>
                      </div>

                      {/* Risco Visceral WHtR */}
                      <div style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid var(--border)', marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: 4 }}>RISCO VISCERAL (WHtR)</p>
                            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{result.whtr}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: result.visceralRiskLabel === 'Baixo' ? '#5a7a5c' : result.visceralRiskLabel === 'Moderado' ? '#b87333' : '#c04a4a' }}>
                              {result.visceralRiskLabel}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: 'var(--ink-muted)' }}>
                            <span style={{ color: '#5a7a5c' }}>{'< 0.50'} — Baixo risco</span>
                            <span style={{ color: '#b87333' }}>0.50–0.59 — Moderado</span>
                            <span style={{ color: '#c04a4a' }}>{'≥ 0.60'} — Elevado</span>
                          </div>
                        </div>
                      </div>

                      {/* Nota */}
                      <div style={{ background: '#f5f5f5', borderRadius: 10, padding: '14px 16px', fontSize: 11, color: '#888', lineHeight: 1.6 }}>
                        Os dados exibidos foram calculados com base nas informações fornecidas e correspondem a estimativas feitas usando algoritmos e fórmulas matemáticas (US Navy, Mifflin-St Jeor, Watson, Devine).
                      </div>
                    </>
                )}

                {/* ── PRESENCIAL RESULTS ── */}
                {result.evaluationType === 'PRESENCIAL' && (
                    <>
                      {/* IMC gauge */}
                      <div style={{ background: 'white', borderRadius: 12, padding: '18px 22px', border: '1px solid var(--border)', marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>⚖️</span>
                            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Índice de Massa Corporal</span>
                          </div>
                          <StatusBadge status={result.imcStatus} />
                        </div>
                        <div style={{ position: 'relative', marginBottom: 8 }}>
                          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                            {[['#3a6fa8',20],['#5a7a5c',20],['#b87333',18],['#c06040',14],['#c04a4a',14],['#8b2020',14]].map(([c,w],i) => (
                                <div key={i} style={{ flex: w, background: c, opacity: 0.7 }} />
                            ))}
                          </div>
                          <div style={{
                            position: 'absolute', top: -4,
                            left: `${Math.min(Math.max((result.imcValue - 10) / 35, 0), 1) * 100}%`,
                            transform: 'translateX(-50%)',
                            background: 'var(--ink)', color: 'white',
                            fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 10, whiteSpace: 'nowrap',
                          }}>
                            {result.imcValue}
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, fontWeight: 300, marginTop: 14 }}>{result.imcEvaluation}</p>
                      </div>
                      <ResultCard icon="🧈" title="Massa Gorda"        text={result.fatMassEvaluation}       status={result.fatMassStatus} />
                      <ResultCard icon="🩺" title="Gordura Visceral"   text={result.visceralFatEvaluation}   status={result.visceralFatStatus} />
                      <ResultCard icon="💧" title="Água Total"         text={result.waterEvaluation}         status={result.waterStatus} />
                      <ResultCard icon="🦴" title="Massa Óssea"        text={result.boneMassEvaluation} />
                      <ResultCard icon="💪" title="Constituição Física" text={result.physicalLevelEvaluation} />
                      <div style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '16px 20px' }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Dados Adicionais</p>
                        <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 300 }}>{result.remainingInformation}</p>
                      </div>
                    </>
                )}
              </>
          )}
        </div>
      </div>
  )
}

function round1(v) { return Math.round(v * 10) / 10 }