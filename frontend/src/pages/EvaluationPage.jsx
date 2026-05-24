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
  evaluationDate: TODAY, evaluationType: 'ONLINE',
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
    const base = {
      name:          prefill.clientName || '',
      age:           String(prefill.age || ''),
      genre:         prefill.genre || 'F',
      evaluationDate: TODAY,
      evaluationType: evalType,
    }
    if (evalType === 'PRESENCIAL') {
      setForm({ ...INITIAL_PRESENCIAL, ...base, height: String(prefill.height || ''), physicalLevel: String(prefill.physicalLevel || '5') })
    } else {
      setForm({ ...INITIAL_ONLINE, ...base, heightCm: String(prefill.heightCm || prefill.height ? (prefill.height * 100).toFixed(0) : '') })
    }
    setResult(null); setSaved(false); setError(null)
  }, [prefill, evalType])

  const switchType = (type) => {
    setEvalType(type)
    setForm(type === 'PRESENCIAL' ? { ...INITIAL_PRESENCIAL, evaluationType: 'PRESENCIAL' } : { ...INITIAL_ONLINE, evaluationType: 'ONLINE' })
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
        hip: form.genre === 'F' ? parseFloat(form.hip) : 0,
        chestPerimeter: parseFloat(form.chestPerimeter) || 0,
        armPerimeter: parseFloat(form.armPerimeter) || 0,
        thighPerimeter: parseFloat(form.thighPerimeter) || 0,
      }

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <input style={inputCss} name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder} />
  )

  return (
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', minHeight: 'calc(100vh - 80px)' }}>

        {/* ── Form ── */}
        <div style={{ background: 'white', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ padding: '28px 28px 40px' }}>

            {/* Selector tipo */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {[['PRESENCIAL','🏋️ Presencial'],['ONLINE','📱 Online']].map(([type, label]) => (
                  <button
                      key={type} type="button"
                      onClick={() => switchType(type)}
                      style={{
                        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600,
                        background: evalType === type ? 'var(--ink)' : 'white',
                        color: evalType === type ? 'var(--cream)' : 'var(--ink-muted)',
                        transition: 'all 0.15s',
                      }}
                  >
                    {label}
                  </button>
              ))}
            </div>

            <h2 style={{ fontSize: 18, marginBottom: 4 }}>
              {evalType === 'PRESENCIAL' ? 'Avaliação Presencial' : 'Avaliação Online'}
            </h2>
            <p style={{ fontSize: 12, color: evalType === 'ONLINE' ? 'var(--sky)' : 'var(--ink-muted)', marginBottom: 4, fontWeight: evalType === 'ONLINE' ? 500 : 300 }}>
              {evalType === 'PRESENCIAL'
                  ? 'Dados recolhidos com equipamento profissional.'
                  : '📱 Medidas com fita métrica — os restantes valores são calculados automaticamente.'}
            </p>

            {prefill && (
                <p style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 4, fontWeight: 500 }}>
                  ✦ Dados fixos pré-preenchidos.
                </p>
            )}

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
                      {[['1','1 — Obesidade Oculta'],['2','2 — Obesidade'],['3','3 — Constituição Sólida'],
                        ['4','4 — Falta de Exercício'],['5','5 — Normal'],['6','6 — Musculação Normal'],
                        ['7','7 — Magro'],['8','8 — Magro e Musculado'],['9','9 — Muito Musculado'],
                      ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                </>
            )}

            {/* ── ONLINE ── */}
            {evalType === 'ONLINE' && (
                <>
                  <SectionTitle>Medidas Obrigatórias</SectionTitle>
                  <Field label="Altura (cm)">{inp('heightCm', 'ex: 165', 'number')}</Field>
                  <Field label="Peso (kg)">{inp('peso', 'ex: 68.5', 'number')}</Field>
                  <Field label="Cintura (cm)">{inp('waist', 'ex: 82', 'number')}</Field>
                  <Field label="Pescoço (cm)">{inp('neck', 'ex: 35', 'number')}</Field>
                  {form.genre === 'F' && (
                      <Field label="Anca (cm) — obrigatório para mulheres">{inp('hip', 'ex: 95', 'number')}</Field>
                  )}

                  <SectionTitle>Perímetros (Recomendável)</SectionTitle>
                  <Field label="Peito (cm)">{inp('chestPerimeter', 'ex: 90', 'number')}</Field>
                  <Field label="Braço (cm)">{inp('armPerimeter', 'ex: 30', 'number')}</Field>
                  <Field label="Coxa (cm)">{inp('thighPerimeter', 'ex: 55', 'number')}</Field>

                  <div style={{ background: 'var(--sky-light)', borderRadius: 8, padding: '12px 14px', marginTop: 8, marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: 'var(--sky)', fontWeight: 500, marginBottom: 4 }}>ℹ️ Calculado automaticamente:</p>
                    <p style={{ fontSize: 11, color: 'var(--sky)', lineHeight: 1.6 }}>
                      % Gordura (US Navy) · Massa gorda e magra · TMB (Mifflin-St Jeor) · Risco visceral (WHtR) · Idade metabólica estimada
                    </p>
                  </div>
                </>
            )}

            <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', marginTop: 12, padding: '13px',
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
                <span style={{ fontSize: 48 }}>{evalType === 'ONLINE' ? '📱' : '📋'}</span>
                <h3 style={{ fontSize: 18 }}>Os resultados aparecem aqui</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Preenche os dados e clica em "Gerar Avaliação"
                </p>
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
                    <div style={{
                      background: 'var(--sage-light)', border: '1px solid rgba(90,122,92,0.3)',
                      borderRadius: 10, padding: '12px 18px', marginBottom: 20,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sage)' }}>Avaliação guardada</p>
                        <p style={{ fontSize: 12, color: 'var(--sage)' }}>Data: {result.evaluationDate} · ID #{result.savedId}</p>
                      </div>
                    </div>
                )}

                {/* Header do resultado */}
                <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <p style={{ fontSize: 10, letterSpacing: '2.5px', color: 'var(--gold)', fontWeight: 500 }}>
                      AVALIAÇÃO GERADA — {result.evaluationDate}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: result.evaluationType === 'ONLINE' ? 'rgba(58,111,168,0.3)' : 'rgba(200,148,58,0.3)',
                      color: result.evaluationType === 'ONLINE' ? '#7ab0e8' : 'var(--gold)',
                    }}>
                  {result.evaluationType === 'ONLINE' ? '📱 Online' : '🏋️ Presencial'}
                </span>
                  </div>
                  <h2 style={{ fontSize: 20, color: 'var(--cream)', marginBottom: 4 }}>
                    {result.clientSummary?.split('|')[0]}
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(250,248,244,0.5)' }}>
                    {result.clientSummary?.split('|').slice(1).join(' · ')}
                  </p>
                </div>

                {/* Online — cards calculados */}
                {result.evaluationType === 'ONLINE' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: '% Gordura (US Navy)', value: result.calculatedFatMassPercent + '%', color: 'var(--rose)' },
                        { label: 'Massa Gorda', value: result.calculatedFatMassKg + ' kg', color: 'var(--amber)' },
                        { label: 'Massa Magra', value: result.calculatedLeanMassKg + ' kg', color: 'var(--sage)' },
                        { label: 'TMB (Mifflin)', value: result.calculatedBasalMetabolism + ' Kcal', color: 'var(--sky)' },
                        { label: 'Risco Visceral (WHtR)', value: result.whtr + ' — ' + result.visceralRiskLabel, color: result.visceralRiskLabel === 'Baixo' ? 'var(--sage)' : result.visceralRiskLabel === 'Moderado' ? 'var(--amber)' : 'var(--rose)' },
                        { label: 'IMC', value: result.imcValue, color: 'var(--ink)' },
                      ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                            <p style={{ fontSize: 18, fontWeight: 700, color }}>{value}</p>
                          </div>
                      ))}
                    </div>
                )}

                {/* IMC gauge */}
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
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, fontWeight: 300, marginTop: 14 }}>
                    {result.imcEvaluation}
                  </p>
                </div>

                <ResultCard icon="🧈" title="Massa Gorda" text={result.fatMassEvaluation} status={result.fatMassStatus} />
                <ResultCard icon="🩺" title="Gordura Visceral" text={result.visceralFatEvaluation} status={result.visceralFatStatus} />

                {result.evaluationType === 'PRESENCIAL' && (
                    <>
                      <ResultCard icon="💧" title="Água Total" text={result.waterEvaluation} status={result.waterStatus} />
                      <ResultCard icon="🦴" title="Massa Óssea" text={result.boneMassEvaluation} />
                      <ResultCard icon="💪" title="Constituição Física" text={result.physicalLevelEvaluation} />
                    </>
                )}

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