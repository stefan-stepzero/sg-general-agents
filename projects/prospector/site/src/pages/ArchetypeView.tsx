import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ARCHETYPES, type ReportData, type PainPoint, scoreColor, scoreBand, salienceLabel, buildLabel, adoptionLabel, quadrant } from '../lib/types'
import ScatterPlot from '../components/ScatterPlot'
import Treemap from '../components/Treemap'
import PainPointList from '../components/PainPointList'
import ProcessMap from '../components/ProcessMap'

function getMarket(pp: PainPoint) {
  return pp.market || { pain: pp.maxSalience, adoption: 3, build: 3, composite: pp.topScore }
}

export default function ArchetypeView() {
  const { archetypeId } = useParams<{ archetypeId: string }>()
  const archetype = ARCHETYPES.find(a => a.id === archetypeId)
  const [data, setData] = useState<ReportData | null>(null)
  const [areaFilter, setAreaFilter] = useState<string | null>(null)

  useEffect(() => {
    setAreaFilter(null)
    setData(null)
    fetch(`/data/archetypes/${archetypeId}/report-data.json`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [archetypeId])

  if (!archetype) return <div className="placeholder-card"><h3>Archetype not found</h3></div>
  if (archetype.status === 'pending') {
    return (
      <div className="placeholder-card">
        <h3>{archetype.label}</h3>
        <p>Analysis pending — process taxonomy and capability matching not yet run.</p>
      </div>
    )
  }
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>

  const s = data.summary
  const hasMatches = s.totalMatches > 0

  // Top opportunities: highest composite score with salience >= 4
  const spotlights = [...data.painPoints]
    .filter(pp => getMarket(pp).pain >= 4 && pp.topScore >= 50)
    .sort((a, b) => b.topScore - a.topScore)
    .slice(0, 6)

  // Executive insight
  const topArea = data.areas[0]
  const topScorePP = [...data.painPoints].sort((a, b) => b.topScore - a.topScore)[0]
  const actNowCount = data.painPoints.filter(pp => getMarket(pp).pain >= 4 && pp.topScore >= 50).length

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Archetypes</span>
        <span className="sep">/</span>
        <span>{archetype.shortLabel}</span>
      </div>

      {/* Hero */}
      <div className="page-hero">
        <h1>{archetype.label}</h1>
        <div className="subtitle">{archetype.description}</div>
        <div className="meta">
          {s.totalPainPoints} pain points
          {hasMatches && ` · ${s.totalMatches.toLocaleString()} AI capability matches`}
          {' '}· Generated {new Date(data.generated).toLocaleDateString()}
        </div>
      </div>

      {/* Layer indicator */}
      {!hasMatches && (
        <div style={{
          background: 'var(--amber-dim)', border: '1px solid var(--amber)',
          borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20,
          fontSize: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <strong>Market Scoring Only</strong>
          <span style={{ color: 'var(--text-secondary)' }}>
            — Pain points scored on binary checklists. AI capability matching (Layer 2) not yet run.
          </span>
        </div>
      )}

      {/* Executive narrative */}
      <div className="card" style={{ marginBottom: 28, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: 10 }}>
            We identified <strong style={{ color: 'var(--text)' }}>{s.totalPainPoints} operational pain points</strong> across
            {' '}{data.areas.length} process areas. Of these, <strong style={{ color: 'var(--red)' }}>{s.highSaliencePains} are
            executive-level concerns</strong> (salience 4+) and <strong style={{ color: 'var(--green)' }}>{actNowCount} score
            above 50</strong> on the market composite.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: 'var(--text)' }}>{topArea.label}</strong> is the highest-salience process area
            (avg {topArea.avgSalience}/5), with {topArea.ppCount} pain points averaging a composite of {topArea.avgTopScore}.
          </p>
          <p>
            The single strongest signal is <strong style={{ color: 'var(--text)' }}>"{topScorePP.label}"</strong> in{' '}
            {(data.areas.find(a => a.id === topScorePP.area) || { label: topScorePP.area }).label},{' '}
            scoring {topScorePP.topScore} ({scoreBand(topScorePP.topScore)}).
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-row">
        {[
          { val: s.totalPainPoints, label: 'Pain Points', color: 'var(--accent)' },
          { val: s.highSaliencePains, label: 'Executive-Level (4+)', color: 'var(--red)' },
          { val: actNowCount, label: 'Score ≥ 50', color: 'var(--green)' },
          { val: s.avgScore, label: 'Avg Composite', color: 'var(--amber)' },
        ].map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-value" style={{ color: stat.color }}>{stat.val}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Spotlight opportunities */}
      {spotlights.length > 0 && (
        <div className="section">
          <h2 className="section-title">Spotlight Opportunities</h2>
          <div className="note">
            Pain points with highest market composite where leadership salience is 4+.
            {hasMatches ? ' Includes AI capability match detail.' : ' AI capability overlay pending.'}
          </div>
          <div className="spotlight-grid">
            {spotlights.map(pp => {
              const m = getMarket(pp)
              const topMatch = pp.matches?.[0]
              const area = data.areas.find(a => a.id === pp.area)
              const q = quadrant(m.pain, pp.topScore)
              const qColor = q === 'Act Now' ? 'var(--green)' : q === 'Strategic Bet' ? 'var(--amber)' : 'var(--accent)'
              return (
                <div className="spotlight-card" key={pp.id}>
                  <div className="quadrant-badge" style={{ background: `${qColor}18`, color: qColor }}>
                    {q} · {pp.topScore}
                  </div>
                  <h3>{pp.label}</h3>
                  <div className="area-tag">{area?.label || pp.area}</div>
                  {topMatch ? (
                    <>
                      <div className="sketch">{topMatch.sketch}</div>
                      <div className="dims">
                        <div className="dim-item"><span>{salienceLabel(topMatch.pain)}</span> pain</div>
                        <div className="dim-item"><span>{adoptionLabel(topMatch.adoption)}</span> market</div>
                        <div className="dim-item"><span>{buildLabel(topMatch.build)}</span> build</div>
                      </div>
                    </>
                  ) : (
                    <>
                      {pp.rationale && <div className="sketch">{pp.rationale}</div>}
                      <div className="dims">
                        <div className="dim-item"><span>{salienceLabel(m.pain)}</span> pain</div>
                        <div className="dim-item"><span>{adoptionLabel(m.adoption)}</span> market</div>
                        <div className="dim-item"><span>{buildLabel(m.build)}</span> build</div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Process Map */}
      <div className="section">
        <h2 className="section-title">Process Map</h2>
        <div className="note">
          Generic process taxonomy for this archetype. Click an area to see sub-processes and their pain points.
        </div>
        <ProcessMap areas={data.areas} painPoints={data.painPoints} />
      </div>

      {/* Scatter plot */}
      <div className="section">
        <h2 className="section-title">Pain Landscape</h2>
        <div className="note">
          Each dot is a pain point. X = market composite score, Y = pain salience.
          Top-right = highest urgency + strongest market signal.
        </div>
        <div className="card" style={{ padding: 16 }}>
          <ScatterPlot
            painPoints={data.painPoints}
            areas={data.areas}
            areaFilter={areaFilter}
            onAreaFilter={setAreaFilter}
          />
        </div>
      </div>

      {/* Treemap */}
      <div className="section">
        <h2 className="section-title">Process Areas</h2>
        <div className="note">
          Size = pain point count, color = average composite score. Click to filter.
        </div>
        <div className="card" style={{ padding: 16 }}>
          <Treemap
            areas={data.areas.map(a => ({
              ...a,
              totalMatches: a.totalMatches || a.ppCount, // Use ppCount for sizing when no matches
            }))}
            areaFilter={areaFilter}
            onAreaFilter={setAreaFilter}
          />
        </div>
      </div>

      {/* Full drill-down list */}
      <div className="section">
        <PainPointList
          painPoints={data.painPoints}
          areas={data.areas}
          areaFilter={areaFilter}
          onAreaFilter={setAreaFilter}
        />
      </div>
    </>
  )
}
