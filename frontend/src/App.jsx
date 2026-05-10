import { useState } from 'react'
import EvaluationPage from './pages/EvaluationPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'

export default function App() {
  const [page, setPage] = useState('evaluate') // 'evaluate' | 'history'

  const navBtn = (id, label, icon) => (
    <button
      onClick={() => setPage(id)}
      style={{
        background: page === id ? 'var(--gold)' : 'transparent',
        color: page === id ? 'white' : 'rgba(250,248,244,0.55)',
        border: 'none',
        padding: '8px 18px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
      }}
    >
      <span>{icon}</span>{label}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--ink)', padding: '18px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--gold)', fontWeight: 500 }}>
            PERSONAL TRAINER
          </p>
          <h1 style={{ fontSize: '22px', color: 'var(--cream)', marginTop: '2px' }}>
            Avaliações Magda Santos
          </h1>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '5px', borderRadius: '10px' }}>
          {navBtn('evaluate', 'Nova Avaliação', '📋')}
          {navBtn('history',  'Histórico',      '📈')}
        </nav>

        <p style={{ fontSize: '11px', color: 'rgba(250,248,244,0.25)', textAlign: 'right' }}>
          Desenvolvido por Simão Santos<br />LEI · NOVA FCT
        </p>
      </header>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        {page === 'evaluate' && <EvaluationPage />}
        {page === 'history'  && <HistoryPage />}
      </main>
    </div>
  )
}
