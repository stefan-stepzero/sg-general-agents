import { useState } from 'react'
import type { AreaSummary, PainPoint } from '../lib/types'

interface ProcessMapProps {
  areas: AreaSummary[]
  painPoints: PainPoint[]
}

export default function ProcessMap({ areas, painPoints }: ProcessMapProps) {
  const [expandedArea, setExpandedArea] = useState<string | null>(null)

  // Group pain points by area, then extract unique sub-process labels from IDs
  const areaMap = areas.map(area => {
    const pps = painPoints.filter(pp => pp.area === area.id)
    // Derive sub-processes from pain point IDs: area-subProcess-detail
    const subGroups: Record<string, PainPoint[]> = {}
    for (const pp of pps) {
      // Extract sub-process from ID by removing the area prefix and the last segment
      const remainder = pp.id.replace(area.id + '-', '')
      const parts = remainder.split('-')
      // Sub-process is typically the first 2-3 segments before the detail
      // Use the pain point description's first INCLUDES clause as the group key
      // Simpler: group by the first few segments after removing area prefix
      let subKey = parts.slice(0, 2).join('-')
      // Clean up trailing -dup markers
      subKey = subKey.replace(/-dup$/, '')
      if (!subGroups[subKey]) subGroups[subKey] = []
      subGroups[subKey].push(pp)
    }

    return {
      ...area,
      painPoints: pps,
      subProcesses: Object.entries(subGroups).map(([key, items]) => ({
        key,
        label: formatSubLabel(key),
        painPoints: items,
        avgScore: items.reduce((s, p) => s + p.topScore, 0) / items.length,
      })),
    }
  })

  return (
    <div>
      {areaMap.map(area => {
        const isExpanded = expandedArea === area.id
        return (
          <div key={area.id} style={{ marginBottom: 4 }}>
            <div
              onClick={() => setExpandedArea(isExpanded ? null : area.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: isExpanded ? '8px 8px 0 0' : 8,
                cursor: 'pointer', transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 16, textAlign: 'center' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{area.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{area.ppCount} pain points</span>
                <span>{area.subProcesses.length} sub-processes</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: area.avgTopScore >= 50 ? 'var(--green-dim, rgba(52,211,153,0.1))' : 'var(--surface3)',
                  color: area.avgTopScore >= 50 ? 'var(--green)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}>
                  avg {area.avgTopScore}
                </span>
              </div>
            </div>

            {isExpanded && (
              <div style={{
                border: '1px solid var(--border-subtle)', borderTop: 'none',
                borderRadius: '0 0 8px 8px', overflow: 'hidden',
              }}>
                {area.subProcesses.map((sub, si) => (
                  <div key={sub.key} style={{
                    padding: '8px 14px 8px 40px',
                    borderBottom: si < area.subProcesses.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: si % 2 === 0 ? 'var(--surface2)' : 'transparent',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {sub.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {sub.painPoints.length} pain points · avg {sub.avgScore.toFixed(0)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {sub.painPoints.map(pp => (
                        <span key={pp.id} title={pp.description || pp.label} style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 3,
                          background: pp.topScore >= 60 ? 'rgba(52,211,153,0.15)' :
                            pp.topScore >= 40 ? 'rgba(245,158,11,0.15)' : 'var(--surface3)',
                          color: pp.topScore >= 60 ? 'var(--green)' :
                            pp.topScore >= 40 ? 'var(--amber)' : 'var(--text-muted)',
                          fontWeight: 500,
                        }}>
                          {pp.label.length > 50 ? pp.label.substring(0, 47) + '...' : pp.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatSubLabel(key: string): string {
  return key
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
