import { useState } from 'react'
import { Link } from 'react-router-dom'

const PAGES = [
  { id: 'v3-pain-landscape', label: 'v3 Pain Landscape', src: '/data/v3-pain-landscape.html' },
  { id: 'narrative-cross-company', label: 'Cross-Company Narrative', src: '/data/narrative-cross-company.html' },
]

export default function Appendix() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Appendix</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Archive</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 680 }}>
        Earlier analysis phases, legacy reports, and superseded views.
      </p>

      {!active && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAGES.map(p => (
            <div
              key={p.id}
              onClick={() => setActive(p.id)}
              style={{
                padding: '14px 18px', background: 'var(--surface)', borderRadius: 8,
                cursor: 'pointer', border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.src}</div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Also available in-app:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              <Link to="/home">Home (original overview page)</Link>
              <Link to="/archetypes/edu-operator">Operator Archetype (480 pain points, scatter plot, process map, solutions)</Link>
              <Link to="/archetypes/saas-vendor">SaaS Vendor Archetype (268 pain points)</Link>
              <Link to="/archetypes/advisory">Advisory Archetype (204 pain points)</Link>
              <Link to="/pain-points">Pain Points by Org (heatmap, 141 pain points x 8 orgs)</Link>
              <Link to="/next-steps">Next Steps (peer group, competitive landscape, indicators, risks, economic forces)</Link>
              <Link to="/product-ideas">Product Ideas (54 scored AI product concepts)</Link>
              <Link to="/methodology">Methodology (scoring rubric, taxonomy, capabilities)</Link>
            </div>
          </div>
        </div>
      )}

      {active && (() => {
        const page = PAGES.find(p => p.id === active)
        if (!page) return null
        return (
          <div>
            <button
              onClick={() => setActive(null)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, border: 'none',
                cursor: 'pointer', borderRadius: 6, marginBottom: 12,
                color: 'var(--text-muted)', background: 'var(--surface)',
              }}
            >
              Back to Appendix
            </button>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{page.label}</div>
            <iframe
              src={page.src}
              style={{
                width: '100%', height: 'calc(100vh - 200px)', border: '1px solid var(--border)',
                borderRadius: 8, background: '#fff',
              }}
              title={page.label}
            />
          </div>
        )
      })()}
    </>
  )
}
