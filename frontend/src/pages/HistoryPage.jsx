import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine
} from 'recharts'

const METRICS = [
  { key: 'weight',          label: 'Peso (kg)',           color: '#c8943a' },
  { key: 'fatMass',         label: 'Massa Gorda (%)',      color: '#c04a4a' },
  { key: 'muscleMass',      label: 'Massa Muscular (kg)',  color: '#5a7a5c' },
  { key: 'water',           label: 'Água Total (%)',       color: '#3a6fa8' },
  { key: 'imc',             label: 'IMC',                  color: '#8b4a9a' },
  { key: 'visceralFat',     label: 'Gordura Visceral',    color: '#b87333' },
  { key: 'basalMetabolism', label: 'IMB (Kcal)',           color: '#2a8a7a' },
  { key: 'boneMass',        label: 'Massa Óssea (kg)',     color: '#6a5a4a' },
]

const fmt = (v) => typeof v === 'number' ? Math.round(v * 10) / 10 : v

// Tooltip personalizado que mostra TODAS as métricas activas para aquela data
const CustomTooltip = ({ active, payload, label, activeMetrics }) => {
  if (!active || !payload || !payload.length) return null
  return (
      <div style={{
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 16px', fontSize: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>{label}</p>
        {payload.map(({ dataKey, value, color }) => {
          const metric = METRICS.find(m => m.key === dataKey)
          return (
              <div key={dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                <span style={{ color }}>{metric?.label || dataKey}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(value)}</span>
              </div>
          )
        })}
      </div>
  )
}

export default function HistoryPage({ onNewEvaluation }) {
  const [clients, setClients]      = useState([])
  const [selected, setSelected]    = useState('')
  const [history, setHistory]      = useState([])
  const [loading, setLoading]      = useState(false)
  const [activeMetrics, setActive] = useState(['weight', 'fatMass', 'muscleMass'])
  const [view, setView]            = useState('charts')
  const [chartType, setChartType]  = useState('line') // 'line' | 'bar'

  useEffect(() => {
    fetch('/api/clients')
        .then(r => r.json())
        .then(setClients)
        .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    fetch(`/api/history/${encodeURIComponent(selected)}`)
        .then(r => r.json())
        .then(data => { setHistory(data); setLoading(false) })
        .catch(() => setLoading(false))
  }, [selected])

  const toggleMetric = (key) => {
    setActive(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleDelete = async (id) => {
    if (!confirm('Apagar esta avaliação?')) return
    await fetch(`/api/evaluation/${id}`, { method: 'DELETE' })
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  // Botão "Nova Avaliação" — passa os dados fixos do cliente
  const handleNewEvaluation = () => {
    const last = history.at(-1)
    if (!last) return
    onNewEvaluation({
      clientName:    last.clientName,
      age:           last.age,
      genre:         last.genre,
      height:        last.height,
      physicalLevel: last.physicalLevel,
    })
  }

  // Dados para gráfico — cada ponto é uma avaliação
  const chartData = history.map(h => ({ ...h, date: h.evaluationDate }))

  // Calcular variação entre primeira e última avaliação
  const delta = (key) => {
    if (history.length < 2) return null
    const d = history.at(-1)[key] - history[0][key]
    return d
  }

  const deltaLabel = (key, unit = '') => {
    const d = delta(key)
    if (d === null) return '—'
    const sign = d > 0 ? '+' : ''
    return `${sign}${fmt(d)}${unit}`
  }

  const deltaColor = (key, lowerIsBetter = false) => {
    const d = delta(key)
    if (d === null || d === 0) return 'var(--ink-muted)'
    const good = lowerIsBetter ? d < 0 : d > 0
    return good ? 'var(--sage)' : 'var(--rose)'
  }

  return (
      <div style={{ padding: '32px 40px', minHeight: 'calc(100vh - 80px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 4 }}>Histórico de Avaliações</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              Acompanha a evolução de cada cliente ao longo do tempo.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Cliente
            </label>
            <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                style={{
                  padding: '9px 14px', border: '1.5px solid var(--border)',
                  borderRadius: 7, fontSize: 14, background: 'white',
                  color: 'var(--ink)', cursor: 'pointer', minWidth: 220,
                }}
            >
              <option value="">— Selecciona um cliente —</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Botão Nova Avaliação */}
            {selected && history.length > 0 && (
                <button
                    onClick={handleNewEvaluation}
                    style={{
                      padding: '9px 18px', background: 'var(--gold)', color: 'white',
                      border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.opacity = '0.85'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ✦ Nova Avaliação
                </button>
            )}
          </div>
        </div>

        {!selected && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, opacity: 0.4, gap: 12 }}>
              <span style={{ fontSize: 48 }}>📈</span>
              <h3 style={{ fontSize: 18 }}>Selecciona um cliente para ver o histórico</h3>
            </div>
        )}

        {selected && loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>A carregar...</div>
        )}

        {selected && !loading && history.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>
              Ainda não há avaliações para este cliente.
            </div>
        )}

        {selected && !loading && history.length > 0 && (
            <>
              {/* Summary strip com variações */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {[
                  { label: 'Avaliações', value: history.length, unit: '', plain: true },
                  { label: 'Primeira', value: history[0].evaluationDate, plain: true },
                  { label: 'Última', value: history.at(-1).evaluationDate, plain: true },
                ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', minWidth: 110 }}>
                      <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{value}</p>
                    </div>
                ))}

                {/* Cards de variação */}
                {[
                  { label: 'Peso', key: 'weight', unit: ' kg', lowerIsBetter: true },
                  { label: 'Massa Gorda', key: 'fatMass', unit: '%', lowerIsBetter: true },
                  { label: 'Massa Muscular', key: 'muscleMass', unit: ' kg', lowerIsBetter: false },
                  { label: 'IMC', key: 'imc', unit: '', lowerIsBetter: true },
                ].map(({ label, key, unit, lowerIsBetter }) => (
                    <div key={key} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', minWidth: 110 }}>
                      <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
                        Δ {label}
                      </p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: deltaColor(key, lowerIsBetter) }}>
                        {deltaLabel(key, unit)}
                      </p>
                    </div>
                ))}
              </div>

              {/* View toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 6, background: 'var(--cream-dark)', padding: 4, borderRadius: 8 }}>
                  {[['charts','📈 Gráficos'],['table','📋 Tabela']].map(([id, label]) => (
                      <button
                          key={id}
                          onClick={() => setView(id)}
                          style={{
                            padding: '7px 18px', border: 'none', borderRadius: 6,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            background: view === id ? 'white' : 'transparent',
                            color: view === id ? 'var(--ink)' : 'var(--ink-muted)',
                            boxShadow: view === id ? 'var(--shadow-sm)' : 'none',
                          }}
                      >
                        {label}
                      </button>
                  ))}
                </div>

                {/* Tipo de gráfico */}
                {view === 'charts' && (
                    <div style={{ display: 'flex', gap: 6, background: 'var(--cream-dark)', padding: 4, borderRadius: 8 }}>
                      {[['line','Linha'],['bar','Barras']].map(([id, label]) => (
                          <button
                              key={id}
                              onClick={() => setChartType(id)}
                              style={{
                                padding: '6px 14px', border: 'none', borderRadius: 6,
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                background: chartType === id ? 'white' : 'transparent',
                                color: chartType === id ? 'var(--ink)' : 'var(--ink-muted)',
                                boxShadow: chartType === id ? 'var(--shadow-sm)' : 'none',
                              }}
                          >
                            {label}
                          </button>
                      ))}
                    </div>
                )}
              </div>

              {/* ── CHARTS VIEW ── */}
              {view === 'charts' && (
                  <>
                    {/* Metric toggles */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      {METRICS.map(({ key, label, color }) => (
                          <button
                              key={key}
                              onClick={() => toggleMetric(key)}
                              style={{
                                padding: '5px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                border: `2px solid ${color}`,
                                background: activeMetrics.includes(key) ? color : 'transparent',
                                color: activeMetrics.includes(key) ? 'white' : color,
                                fontWeight: 500, transition: 'all 0.15s',
                              }}
                          >
                            {label}
                          </button>
                      ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '24px 20px' }}>
                      <ResponsiveContainer width="100%" height={400}>
                        {chartType === 'line' ? (
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--cream-dark)" />
                              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                              <Tooltip content={<CustomTooltip activeMetrics={activeMetrics} />} />
                              <Legend formatter={(value) => METRICS.find(m => m.key === value)?.label || value} />
                              {METRICS.filter(m => activeMetrics.includes(m.key)).map(({ key, color }) => (
                                  <Line
                                      key={key} type="monotone" dataKey={key}
                                      stroke={color} strokeWidth={2.5}
                                      dot={{ r: 5, fill: color, strokeWidth: 0 }}
                                      activeDot={{ r: 7 }}
                                  />
                              ))}
                            </LineChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--cream-dark)" />
                              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                              <Tooltip content={<CustomTooltip activeMetrics={activeMetrics} />} />
                              <Legend formatter={(value) => METRICS.find(m => m.key === value)?.label || value} />
                              {METRICS.filter(m => activeMetrics.includes(m.key)).map(({ key, color }) => (
                                  <Bar key={key} dataKey={key} fill={color} opacity={0.8} radius={[4,4,0,0]} />
                              ))}
                            </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Gráficos individuais por métrica activa */}
                    {activeMetrics.length > 1 && history.length > 1 && (
                        <div style={{ marginTop: 24 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
                            Evolução Individual
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {METRICS.filter(m => activeMetrics.includes(m.key)).map(({ key, label, color }) => {
                              const first = history[0][key]
                              const last  = history.at(-1)[key]
                              const diff  = last - first
                              return (
                                  <div key={key} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {label}
                            </span>
                                      <span style={{
                                        fontSize: 12, fontWeight: 700,
                                        color: diff === 0 ? 'var(--ink-muted)' : diff > 0 ? 'var(--rose)' : 'var(--sage)',
                                        background: diff === 0 ? 'var(--cream-dark)' : diff > 0 ? 'var(--rose-light)' : 'var(--sage-light)',
                                        padding: '2px 8px', borderRadius: 20,
                                      }}>
                              {diff > 0 ? '+' : ''}{fmt(diff)}
                            </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={120}>
                                      <LineChart data={chartData}>
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
                                            formatter={(v) => [fmt(v), label]}
                                            labelStyle={{ fontWeight: 600 }}
                                        />
                                        <Line
                                            type="monotone" dataKey={key}
                                            stroke={color} strokeWidth={2}
                                            dot={{ r: 4, fill: color, strokeWidth: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>
                                      <span>Inicial: <strong style={{ color: 'var(--ink)' }}>{fmt(first)}</strong></span>
                                      <span>Actual: <strong style={{ color }}>{fmt(last)}</strong></span>
                                    </div>
                                  </div>
                              )
                            })}
                          </div>
                        </div>
                    )}
                  </>
              )}

              {/* ── TABLE VIEW ── */}
              {view === 'table' && (
                  <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: 'var(--cream-dark)' }}>
                          {['Data','Peso','IMC','M.Gorda %','M.Muscular','Água %','G.Visceral','IMB','Id.Met.',''].map(h => (
                              <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                                {h}
                              </th>
                          ))}
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((h, i) => (
                            <tr key={h.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--cream)' }}>
                              <td style={{ padding: '11px 14px', fontWeight: 500 }}>{h.evaluationDate}</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.weight)} kg</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.imc)}</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.fatMass)}%</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.muscleMass)} kg</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.water)}%</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.visceralFat)}</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.basalMetabolism)}</td>
                              <td style={{ padding: '11px 14px' }}>{fmt(h.metabolicAge)}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <button
                                    onClick={() => handleDelete(h.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.4 }}
                                    title="Apagar avaliação"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              )}
            </>
        )}
      </div>
  )
}