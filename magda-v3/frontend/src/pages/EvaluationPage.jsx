import { useState } from 'react'
import { Field, SectionTitle, ResultCard, StatusBadge, inputCss } from '../components/UI.jsx'

const TODAY = new Date().toISOString().split('T')[0]

const INITIAL = {
  name: '', age: '', genre: 'F', height: '', peso: '',
  fatMass: '', boneMass: '', water: '', muscleMass: '',
  visceralFat: '', basalMetabolism: '', metabolicAge: '',
  physicalLevel: '5', evaluationDate: TODAY,
}

export default function EvaluationPage() {
  const [form, setForm]     = useState(INITIAL)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [saved, setSaved]   = useState(false)

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setSaved(false)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          height: parseFloat(form.height),
          peso: parseFloat(form.peso),
          fatMass: parseFloat(form.fatMass),
          boneMass: parseFloat(form.boneMass),
          water: parseFloat(form.water),
          muscleMass: parseFloat(form.muscleMass),
          visceralFat: parseFloat(form.visceralFat),
          basalMetabolism: parseFloat(form.basalMetabolism),
          metabolicAge: parseFloat(form.metabolicAge),
          physicalLevel: parseInt(form.physicalLevel),
        }),
      })
      if (!res.ok) throw new Error('Erro no servidor.')
      setResult(await res.json())
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = (name, placeholder, type = 'text') => (
    <input
      style={inputCss} name={name} type={type}
      value={form[name]} onChange={set} placeholder={placeholder}
    />
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: 'calc(100vh - 80px)' }}>

      {/* ── Form ── */}
      <div style={{ background: 'white', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ padding: '28px 28px 40px' }}>
          <h2 style={{ fontSize: 19, marginBottom: 4 }}>Nova Avaliação</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 4 }}>
            Preenche todos os campos e clica em Gerar.
          </p>

          <SectionTitle>Identificação</SectionTitle>
          <Field label="Nome do Cliente">{inp('name', 'ex: Maria Silva')}</Field>
          <Field label="Data da Avaliação">
            <input style={inputCss} type="date" name="evaluationDate" value={form.evaluationDate} onChange={set} />
          </Field>
          <Field label="Idade">{inp('age', 'ex: 35', 'number')}</Field>
          <Field label="Género">
            <select style={{ ...inputCss, cursor: 'pointer' }} name="genre" value={form.genre} onChange={set}>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </Field>
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
              {[
                ['1','1 — Obesidade Oculta'],['2','2 — Obesidade'],['3','3 — Constituição Sólida'],
                ['4','4 — Falta de Exercício'],['5','5 — Normal'],['6','6 — Musculação Normal'],
                ['7','7 — Magro'],['8','8 — Magro e Musculado'],['9','9 — Muito Musculado'],
              ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', marginTop: 8, padding: '13px',
              background: loading ? 'var(--ink-muted)' : 'var(--ink)',
              color: 'var(--cream)', border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 500, letterSpacing: '1.5px',
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'A calcular...' : 'Gerar Avaliação'}
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      <div style={{ background: 'var(--cream)', overflowY: 'auto', padding: '32px 36px' }}>
        {!result && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, gap: 12 }}>
            <span style={{ fontSize: 48 }}>📋</span>
            <h3 style={{ fontSize: 18 }}>Os resultados aparecem aqui</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>
              Preenche os dados e clica em "Gerar Avaliação"
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--rose-light)', borderRadius: 10, padding: '20px', color: 'var(--rose)' }}>
            <p style={{ fontWeight: 500 }}>Erro — {error}</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Verifica se o servidor Spring Boot está a correr em localhost:8080</p>
          </div>
        )}

        {result && (
          <>
            {/* Saved banner */}
            {saved && (
              <div style={{
                background: 'var(--sage-light)', border: '1px solid rgba(90,122,92,0.3)',
                borderRadius: 10, padding: '12px 18px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sage)' }}>
                    Avaliação guardada na base de dados
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--sage)' }}>
                    Data: {result.evaluationDate} · ID #{result.savedId}
                  </p>
                </div>
              </div>
            )}

            {/* Client header */}
            <div style={{
              background: 'var(--ink)', borderRadius: 12, padding: '20px 24px', marginBottom: 20,
            }}>
              <p style={{ fontSize: 10, letterSpacing: '2.5px', color: 'var(--gold)', fontWeight: 500, marginBottom: 6 }}>
                AVALIAÇÃO GERADA — {result.evaluationDate}
              </p>
              <h2 style={{ fontSize: 20, color: 'var(--cream)', marginBottom: 4 }}>
                {result.clientSummary?.split('|')[0]}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(250,248,244,0.5)' }}>
                {result.clientSummary?.split('|').slice(1).join(' · ')}
              </p>
            </div>

            {/* IMC */}
            <div style={{ background: 'white', borderRadius: 12, padding: '18px 22px', border: '1px solid var(--border)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚖️</span>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                    Índice de Massa Corporal
                  </span>
                </div>
                <StatusBadge status={result.imcStatus} />
              </div>
              {/* Gauge */}
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
                  fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 10,
                  whiteSpace: 'nowrap',
                }}>
                  {result.imcValue}
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, fontWeight: 300, marginTop: 14 }}>
                {result.imcEvaluation}
              </p>
            </div>

            <ResultCard icon="🧈" title="Massa Gorda"       text={result.fatMassEvaluation}       status={result.fatMassStatus} />
            <ResultCard icon="🩺" title="Gordura Visceral"  text={result.visceralFatEvaluation}   status={result.visceralFatStatus} />
            <ResultCard icon="💧" title="Água Total"        text={result.waterEvaluation}         status={result.waterStatus} />
            <ResultCard icon="🦴" title="Massa Óssea"       text={result.boneMassEvaluation} />
            <ResultCard icon="💪" title="Constituição Física" text={result.physicalLevelEvaluation} />

            <div style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>
                Dados Adicionais
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 300 }}>{result.remainingInformation}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
