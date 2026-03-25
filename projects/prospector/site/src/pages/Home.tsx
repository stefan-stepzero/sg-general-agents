import { Link } from 'react-router-dom'
import { ARCHETYPES } from '../lib/types'

export default function Home() {
  return (
    <>
      <div className="page-hero">
        <h1>Education Sector Intelligence</h1>
        <div className="subtitle">
          We mapped 300 operational pain points across 10 process areas for education operators,
          then scored each against 34 AI capabilities to find where purpose-built AI products
          can address problems leaders are already trying to solve.
        </div>
        <div className="meta">Prospector v3 — March 2026 — StepZero</div>
      </div>

      <div className="section">
        <h2 className="section-title">Research Tracks</h2>
        <div className="note">Three customer archetypes, each with distinct pain landscapes and AI opportunity profiles.</div>

        <div className="archetype-grid">
          {ARCHETYPES.map(a => (
            <Link
              key={a.id}
              to={a.status === 'ready' ? `/archetypes/${a.id}` : '#'}
              className={`archetype-card ${a.status === 'pending' ? 'pending' : ''}`}
            >
              <div className="status" style={{ color: a.status === 'ready' ? 'var(--green)' : 'var(--text-muted)' }}>
                {a.status === 'ready' ? 'Complete' : 'Pending'}
              </div>
              <h3>{a.label}</h3>
              <p>{a.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">How to Read This Research</h2>
        <div className="card" style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>
            Each archetype page presents a <strong>pain landscape</strong> — a map of every operational
            pain point we identified, scored by how much it matters to leadership (salience) and
            how well AI can address it (composite score).
          </p>
          <p style={{ marginBottom: 12 }}>
            The composite score combines three dimensions: <strong>Pain Salience</strong> (does leadership
            care?), <strong>Adoption Likelihood</strong> (are there barriers or incumbents?), and <strong>Build
            Complexity</strong> (how hard is it to build?). Higher scores mean the opportunity is more
            urgent, more open, and more feasible.
          </p>
          <p>
            Start with the <strong>spotlight opportunities</strong> at the top — these are the pain points
            where AI fit is strongest. Then explore the scatter plot to see the full landscape, and
            drill into any area or pain point for detail.
          </p>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Methodology</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Process taxonomy, scoring rubric, and AI capability definitions.
        </p>
        <Link to="/methodology" style={{ fontSize: '13px' }}>
          View full methodology →
        </Link>
      </div>
    </>
  )
}
