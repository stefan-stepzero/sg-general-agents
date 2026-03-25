import { Link } from 'react-router-dom'

const PHASES = [
  {
    id: '1',
    label: 'Data Collection',
    color: 'var(--accent)',
    parallel: true,
    agents: ['Annual Report Extractor', 'Sector Data Filter', 'Web Researcher'],
    description: 'Download and extract structured facts from public sources — annual reports, ACARA data, sector filings, news. Python tools handle large files outside agent context.',
    outputs: ['School list', 'System statistics', 'ACARA enrolments + ICSEA + demographics', 'Historical trends', 'Leadership changes', 'Recent announcements'],
    principle: 'Extract, don\'t generate. Every fact cites a document.',
  },
  {
    id: '2',
    label: 'Profile & Benchmarks',
    color: 'var(--green)',
    parallel: true,
    agents: ['Profile Builder', 'Signals Assembler'],
    description: 'Assemble the organisation profile from extracted data. Scorecard uses "Observed vs Benchmark" framing — real metrics against sector norms, not AI estimates.',
    outputs: ['Organisation profile', 'Strategic scorecard (observed vs benchmark)', 'Signals (tailwinds, headwinds, risks)', 'News timeline'],
    principle: 'Assemble, don\'t estimate. If data is missing, flag it as a gap.',
  },
  {
    id: '3',
    label: 'Peer Research',
    color: 'var(--amber)',
    parallel: false,
    agents: ['Peer Researcher'],
    description: 'Identify structurally similar organisations and actual competitors. Research what they\'ve built, adopted, invested in — from their annual reports and published strategies.',
    outputs: ['Lookalikes with research detail', 'Competitors grouped by relationship', 'Market solutions with outcomes', 'Unaddressed gaps'],
    principle: 'Research, don\'t imagine. Every peer solution cites a real source.',
  },
  {
    id: '4',
    label: 'Pain Points',
    color: 'var(--red)',
    parallel: false,
    agents: ['Pain Analyser'],
    description: 'Derive pain points from the delta between where the org is and where it\'s trying to go. Cross-reference with peer evidence. Use archetype process taxonomy as a coverage checklist last — not as a generator.',
    outputs: ['Evidence-backed pain points by domain', 'Severity ratings with justification', 'Unknowns flagged per pain point', 'Source citations'],
    principle: 'The gap IS the pain point. Taxonomy checks coverage, doesn\'t generate.',
  },
  {
    id: '5',
    label: 'Synthesis & Persuasion',
    color: 'var(--green)',
    parallel: false,
    agents: ['Synthesiser', 'Persuasion Brief Generator'],
    description: 'Link each pain point to market evidence and produce concrete opportunities. Map AI capabilities per opportunity. Generate a persuasion-structured pitch brief using evidence-based framing techniques.',
    outputs: ['Opportunities with pain→evidence→action flow', 'AI capability mapping per opportunity', 'Pitch brief with conversation starters', 'Executive summary slides'],
    principle: 'Every opportunity traces to a pain point and peer evidence. Confidence is honest.',
  },
  {
    id: '6',
    label: 'Validation & Deploy',
    color: 'var(--text-muted)',
    parallel: false,
    agents: ['Schema Validator'],
    description: 'Validate all outputs against JSON schemas derived from the frontend TypeScript interfaces. Block deployment if any file fails. Deploy to the site data directory.',
    outputs: ['Schema validation report', 'Deployed site data'],
    principle: 'The frontend contract is the source of truth. Data that doesn\'t match doesn\'t ship.',
  },
]

export default function PipelineMethodology() {
  return (
    <>
      <div className="breadcrumb">
        <Link to="/organizations/cspd">Prospector</Link>
        <span className="sep">/</span>
        <span>Methodology</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Pipeline Methodology</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 640, lineHeight: 1.7 }}>
        How the intelligence pipeline works. Each phase produces structured outputs that feed the next.
        Agents extract from real sources — nothing is generated without evidence.
      </p>

      {/* Pipeline flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {PHASES.map((phase, i) => (
          <div key={phase.id}>
            {/* Phase card */}
            <div style={{
              background: 'var(--surface)', borderRadius: 10,
              border: '1px solid var(--border-subtle)', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500,
                    color: phase.color, width: 32, textAlign: 'center',
                  }}>
                    {phase.id}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{phase.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {phase.agents.join(' + ')}
                      {phase.parallel && <span style={{ color: 'var(--green)', marginLeft: 8 }}>parallel</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                  {phase.description}
                </p>

                <div style={{ display: 'flex', gap: 24 }}>
                  {/* Outputs */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Outputs
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {phase.outputs.map((o, oi) => (
                        <div key={oi} style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 10, borderLeft: `2px solid ${phase.color}` }}>
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Principle */}
                  <div style={{
                    flex: '0 0 240px', padding: '12px 16px',
                    background: 'var(--surface2)', borderRadius: 6,
                    fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic',
                  }}>
                    {phase.principle}
                  </div>
                </div>
              </div>
            </div>

            {/* Connector arrow */}
            {i < PHASES.length - 1 && (
              <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--text-muted)', fontSize: 16 }}>
                ↓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grounding principles */}
      <div style={{ marginTop: 40, padding: '24px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Grounding Principles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Extract, don\'t generate', detail: 'Every fact cites a specific source document, page number, or URL.' },
            { label: 'Unknowns are flagged', detail: 'What we don\'t know is as valuable as what we do. Every pain point lists its gaps.' },
            { label: 'Taxonomy checks coverage', detail: 'Archetype process taxonomies ensure we haven\'t missed a domain — they don\'t generate content.' },
            { label: 'Confidence is honest', detail: 'High = multiple sources + peer validation. Medium = some evidence. Low = coverage-check derived.' },
            { label: 'Persuasion is ethical', detail: 'Making true things clearer and good options easier to choose. Evidence-based framing, not manipulation.' },
            { label: 'Schema-validated', detail: 'All outputs validated against TypeScript interfaces before deployment. Data that doesn\'t match doesn\'t ship.' },
          ].map((p, i) => (
            <div key={i} style={{ padding: '12px 16px', borderLeft: '3px solid var(--accent)', background: 'var(--surface2)', borderRadius: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
