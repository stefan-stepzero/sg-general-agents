import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { AreaSummary } from '../lib/types'
import { scoreColor } from '../lib/types'

interface Props {
  areas: AreaSummary[]
  areaFilter: string | null
  onAreaFilter: (area: string | null) => void
}

export default function Treemap({ areas, areaFilter, onAreaFilter }: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !areas.length) return

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const width = ref.current.parentElement?.clientWidth || 900
    const height = 200

    svg.attr('width', width).attr('height', height)

    const treeData = {
      name: 'root',
      children: areas.map(a => ({
        name: a.label,
        id: a.id,
        value: a.totalMatches,
        avgScore: a.avgTopScore,
        ppCount: a.ppCount,
        avgSalience: a.avgSalience,
      })),
    }

    const root = d3.hierarchy(treeData).sum(d => (d as any).value)
    d3.treemap().size([width, height]).padding(3).round(true)(root)

    const nodes = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        const id = (d.data as any).id
        onAreaFilter(areaFilter === id ? null : id)
      })

    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('rx', 4)
      .attr('fill', d => {
        const score = (d.data as any).avgScore
        const selected = areaFilter === (d.data as any).id
        const c = scoreColor(score)
        return selected ? c + '55' : c + '22'
      })
      .attr('stroke', d => areaFilter === (d.data as any).id ? scoreColor((d.data as any).avgScore) : 'transparent')
      .attr('stroke-width', 2)

    nodes.each(function (d) {
      const w = d.x1 - d.x0
      const h = d.y1 - d.y0
      if (w < 60 || h < 30) return

      const g = d3.select(this)
      const label = d.data.name.length > 20 && w < 140
        ? d.data.name.substring(0, 18) + '...'
        : d.data.name

      g.append('text')
        .attr('x', 8).attr('y', 16)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#e8eaf0')
        .text(label)

      if (h > 44) {
        g.append('text')
          .attr('x', 8).attr('y', 32)
          .attr('font-size', '10px')
          .attr('fill', '#6b7194')
          .text(`${(d.data as any).ppCount} pains · avg ${Math.round((d.data as any).avgScore)}`)
      }
    })
  }, [areas, areaFilter, onAreaFilter])

  return <svg ref={ref} />
}
