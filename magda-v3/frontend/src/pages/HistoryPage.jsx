import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const METRICS = [
  { key: 'weight',        label: 'Peso (kg)',            color: '#c8943a' },
  { key: 'fatMass',       label: 'Massa Gorda (%)',       color: '#c04a4a' },
  { key: 'muscleMass',    label: 'Massa Muscular (kg)',   color: '#5a7a5c' },
  { key: 'water',         label: 'Água Total (%)',        color: '#3a6fa8' },
  { key: 'imc',           label: 'IMC',                  color: '#8b4a9a' },
  { key: 'visceralFat',   label: 'Gordura Visceral',     color: '#b87333' },
  { key: 'basalMetabolism', label: 'IMB (Kcal)',         color: '#2a8a7a' },
  { key: 'boneMass',      label: 'Massa Óssea (kg)',      color: '#6a5a4a' },
]

const fmt = (v) => typeof v === 'number' ? Math.round(v * 10) / 10 : v

export default function HistoryPage() {
  const [clients, setClients]     = useState([])
  const [selected, setSelected]   = useState('')
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [activeMetrics, setActive] = useState(['weight', 'fatMass', 'muscleMass'])
  const [view, setView]           = useState('charts') // 'charts' | 'table'

  // Carregar lista de clientes
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(setClients)
      .catch(() => {})
  }, [])

  // Carregar histórico do cliente seleccionado
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

  // Dados formatados para o gráfico
  const chartData = history.map(h => ({
    ...h,
    date: h.evaluationDate,
  }))

  return (
    <div style={{ padding: '32px 40px', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Histórico de Avaliações</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            Acompanha a evolução de cada cliente ao longo do tempo.
          </p>
        </div>

        {/* Client selector */}
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
          {/* Summary strip */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { label: 'Avaliações', value: history.length },
              { label: 'Primeira', value: history[0].evaluationDate },
              { label: 'Última', value: history.at(-1).evaluationDate },
              { label: 'Peso inicial', value: fmt(history[0].weight) + ' kg' },
              { label: 'Peso actual', value: fmt(history.at(-1).weight) + ' kg' },
              { label: 'Variação peso',
                value: (fmt(history.at(-1).weight - history[0].weight) > 0 ? '+' : '') +
                       fmt(history.at(-1).weight - history[0].weight) + ' kg' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 18px', minWidth: 120,
              }}>
                <p style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
                  {label}
                </p>
                <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--cream-dark)', padding: 4, borderRadius: 8, width: 'fit-content' }}>
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

          {/* ── CHARTS VIEW ── */}
          {view === 'charts' && (
            <>
              {/* Metric toggles */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
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
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--cream-dark)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                      formatter={(value, name) => [fmt(value), METRICS.find(m => m.key === name)?.label || name]}
                    />
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
                </ResponsiveContainer>
              </div>
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
