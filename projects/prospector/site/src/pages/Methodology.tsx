import { Link } from 'react-router-dom'

const checklistStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  fontSize: 12,
  color: 'var(--text-secondary)',
  lineHeight: 1.8,
}

const checkItemStyle: React.CSSProperties = {
  padding: '4px 0',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
}

function CheckItem({ text }: { text: string }) {
  return (
    <li style={checkItemStyle}>
      <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 11, flexShrink: 0 }}>+1</span>
      <span>{text}</span>
    </li>
  )
}

export default function Methodology() {
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Methodology</span>
      </div>

      <div className="page-hero">
        <h1>Methodology</h1>
        <div className="subtitle">
          How we identified, scored, and ranked AI opportunities across education operator pain points.
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="section">
        <h2 className="section-title">Pipeline</h2>
        <div className="card" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <ol style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>Define archetype</strong> — Who is the customer?
              Multi-site education operator, SaaS vendor, or upstream advisory.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>Build process taxonomy</strong> — Map every operational
              process into areas (e.g., Enrollment, Teaching, Finance) and sub-processes, then identify
              terminal pain points for each.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>Market scoring</strong> — Score each pain point on three
              dimensions using binary checklists: Pain Salience, Adoption Likelihood, and Build Complexity.
              This gives every pain point a standalone market score independent of any AI capability.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>AI capability matching</strong> — Overlay AI capability
              fit against the scored pain points to identify where purpose-built AI products can address
              the highest-value opportunities.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>Aggregation</strong> — Roll up scores to identify
              hot areas, top opportunities, and capability clusters.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Narrative synthesis</strong> — Surface spotlight
              opportunities with actionable sketches.
            </li>
          </ol>
        </div>
      </div>

      {/* Scoring rubric */}
      <div className="section">
        <h2 className="section-title">Scoring Rubric</h2>
        <div className="note">
          Each dimension is scored as a binary checklist (0-4 flags), mapped to 1-5.
          Composite = (Pain Salience x Adoption Likelihood x Build Complexity) / 1.25, normalized 0-100.
        </div>

        <div className="rubric-grid">
          <div className="rubric-card">
            <h4 style={{ color: 'var(--red)' }}>Pain Salience</h4>
            <div className="scale">
              <span>0 flags = 1</span>
              <span>4 flags = 5</span>
            </div>
            <ul style={checklistStyle}>
              <CheckItem text="Directly causes revenue loss, churn, or failed deals" />
              <CheckItem text="Creates friction for teams beyond the owning function" />
              <CheckItem text="Felt weekly or more (not quarterly/annual)" />
              <CheckItem text="Would surface in a board report or investor due diligence" />
            </ul>
          </div>

          <div className="rubric-card">
            <h4 style={{ color: 'var(--amber)' }}>Adoption Likelihood</h4>
            <div className="scale">
              <span>0 flags = 1</span>
              <span>4 flags = 5</span>
            </div>
            <ul style={checklistStyle}>
              <CheckItem text="Data inputs are structured/digital (not tacit knowledge)" />
              <CheckItem text="Augments existing workflow (doesn't require behavior change)" />
              <CheckItem text="No regulatory barrier specific to student/minor data" />
              <CheckItem text="No adequate solution exists today (greenfield)" />
            </ul>
          </div>

          <div className="rubric-card">
            <h4 style={{ color: 'var(--green)' }}>Build Complexity (inverted)</h4>
            <div className="scale">
              <span>0 flags = 1</span>
              <span>4 flags = 5</span>
            </div>
            <ul style={checklistStyle}>
              <CheckItem text="Single system / no integration required" />
              <CheckItem text="Standard LLM/ML pattern (not custom model)" />
              <CheckItem text="Value demonstrable in < 2 weeks (fast feedback loop)" />
              <CheckItem text="No change management beyond the direct user" />
            </ul>
          </div>
        </div>
      </div>

      {/* Two-layer model */}
      <div className="section">
        <h2 className="section-title">Two-Layer Model</h2>
        <div className="note">Pain points are scored twice: once for market signal, once for AI fit.</div>
        <div className="rubric-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="rubric-card">
            <h4 style={{ color: 'var(--accent)' }}>Layer 1: Market Score</h4>
            <p style={{ marginBottom: 8 }}>
              Every pain point is scored on the three dimensions above <strong>without reference to
              any AI capability</strong>. This gives a pure market signal: how painful is this, how
              open is the market, and how buildable is a solution in general?
            </p>
            <p>
              This layer answers: <em>"Is this problem worth solving at all?"</em>
            </p>
          </div>
          <div className="rubric-card">
            <h4 style={{ color: 'var(--green)' }}>Layer 2: AI Capability Fit</h4>
            <p style={{ marginBottom: 8 }}>
              Each scored pain point is then matched against specific AI capabilities to determine
              whether AI is the right approach. This overlay identifies where purpose-built AI
              products have a differentiated advantage.
            </p>
            <p>
              This layer answers: <em>"Can AI specifically address this better than alternatives?"</em>
            </p>
          </div>
        </div>
      </div>

      {/* Score bands */}
      <div className="section">
        <h2 className="section-title">Score Interpretation</h2>
        <div className="card">
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Range</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Band</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '80-100', band: 'Exceptional', color: '#34d399', meaning: 'All flags hit across all dimensions. Rare — act immediately.' },
                { range: '60-79', band: 'Strong', color: '#34d399', meaning: 'Strong opportunity. Worth deep-dive validation and prototyping.' },
                { range: '40-59', band: 'Moderate', color: '#f59e0b', meaning: 'Viable if one dimension is very strong. May need niche positioning.' },
                { range: '20-39', band: 'Weak', color: '#fb923c', meaning: 'One or more dimensions have few flags. Likely not worth pursuing unless strategic.' },
                { range: '0-19', band: 'Poor', color: '#6b7194', meaning: 'Low across all dimensions. Not a viable opportunity.' },
              ].map(row => (
                <tr key={row.range} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: row.color }}>{row.range}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{row.band}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quadrant model */}
      <div className="section">
        <h2 className="section-title">Quadrant Model</h2>
        <div className="note">Market Score (Y) vs AI Capability Fit (X) defines four strategic quadrants.</div>
        <div className="rubric-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {[
            { q: 'Act Now', color: 'var(--green)', desc: 'High market score + high AI fit. The problem is urgent, the market is open, and AI is the right tool. Prioritize these.' },
            { q: 'Strategic Bet', color: 'var(--amber)', desc: 'High market score but lower AI fit. The problem matters but AI may not be the best approach, or building is complex.' },
            { q: 'Quick Win', color: 'var(--accent)', desc: 'Good AI fit but lower market score. Easy to build with AI but leadership may not prioritize buying it.' },
            { q: 'Deprioritize', color: 'var(--text-muted)', desc: 'Low market score, low AI fit. Not worth pursuing unless as a feature within a larger product.' },
          ].map(q => (
            <div className="rubric-card" key={q.q}>
              <h4 style={{ color: q.color }}>{q.q}</h4>
              <p>{q.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
