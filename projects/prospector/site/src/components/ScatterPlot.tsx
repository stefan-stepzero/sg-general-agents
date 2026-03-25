import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { PainPoint, AreaSummary } from '../lib/types'
import { scoreColor } from '../lib/types'

interface Props {
  painPoints: PainPoint[]
  areas: AreaSummary[]
  areaFilter: string | null
  onAreaFilter: (area: string | null) => void
}

const AREA_COLORS = [
  '#7b93ff', '#34d399', '#f59e0b', '#f87171', '#a78bfa',
  '#fb923c', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24',
]

export default function ScatterPlot({ painPoints, areas, areaFilter, onAreaFilter }: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !painPoints.length) return

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const width = 900
    const height = 360
    const margin = { top: 20, right: 160, bottom: 40, left: 50 }
    const iw = width - margin.left - margin.right
    const ih = height - margin.top - margin.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const x = d3.scaleLinear().domain([0, 100]).range([0, iw])
    const y = d3.scaleLinear().domain([0.5, 5.5]).range([ih, 0])

    // Area color map
    const areaColorMap: Record<string, string> = {}
    areas.forEach((a, i) => { areaColorMap[a.id] = AREA_COLORS[i % AREA_COLORS.length] })

    // Quadrant backgrounds
    const quadrants = [
      { x0: 0, x1: 50, y0: 4, y1: 5.5, label: 'Strategic Bets', color: 'var(--amber)' },
      { x0: 50, x1: 100, y0: 4, y1: 5.5, label: 'Act Now', color: 'var(--green)' },
      { x0: 0, x1: 50, y0: 0.5, y1: 4, label: 'Deprioritize', color: 'var(--text-muted)' },
      { x0: 50, x1: 100, y0: 0.5, y1: 4, label: 'Quick Wins', color: 'var(--accent)' },
    ]

    quadrants.forEach(q => {
      g.append('rect')
        .attr('x', x(q.x0)).attr('y', y(q.y1))
        .attr('width', x(q.x1) - x(q.x0))
        .attr('height', y(q.y0) - y(q.y1))
        .attr('fill', 'none')
        .attr('stroke', '#1e2230')
        .attr('stroke-dasharray', '4,4')

      g.append('text')
        .attr('x', x((q.x0 + q.x1) / 2))
        .attr('y', y(q.y1) + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#3a3f52')
        .attr('font-weight', '600')
        .text(q.label)
    })

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}`))
      .selectAll('text').attr('fill', '#6b7194').attr('font-size', '10px')
    g.selectAll('.domain, .tick line').attr('stroke', '#262b3a')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}`))
      .selectAll('text').attr('fill', '#6b7194').attr('font-size', '10px')

    // Axis labels
    g.append('text')
      .attr('x', iw / 2).attr('y', ih + 34)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('fill', '#6b7194')
      .text('Composite Score (AI Fit)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -ih / 2).attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('fill', '#6b7194')
      .text('Pain Salience')

    // Tooltip
    const tooltip = d3.select(ref.current.parentElement!)
      .append('div')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', '#1b1f2b')
      .style('border', '1px solid #262b3a')
      .style('border-radius', '6px')
      .style('padding', '8px 12px')
      .style('font-size', '12px')
      .style('color', '#e8eaf0')
      .style('display', 'none')
      .style('z-index', '100')
      .style('max-width', '280px')

    // Dots
    const jitter = () => (Math.random() - 0.5) * 0.3

    g.selectAll('circle')
      .data(painPoints)
      .join('circle')
      .attr('cx', d => x(d.topScore) + (Math.random() - 0.5) * 8)
      .attr('cy', d => y(d.maxSalience + jitter()))
      .attr('r', d => {
        if (areaFilter && d.area !== areaFilter) return 2
        return d.topScore >= 60 ? 6 : 4
      })
      .attr('fill', d => {
        if (areaFilter && d.area !== areaFilter) return '#2a2f3e'
        return areaColorMap[d.area] || '#6b7194'
      })
      .attr('opacity', d => {
        if (areaFilter && d.area !== areaFilter) return 0.25
        return 0.8
      })
      .attr('stroke', d => d.topScore >= 60 ? '#fff' : 'none')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (e, d) => {
        const area = areas.find(a => a.id === d.area)
        tooltip
          .style('display', 'block')
          .html(`<strong>${d.label}</strong><br/><span style="color:#7b93ff">${area?.label || d.area}</span><br/>Score: ${d.topScore} · Salience: ${d.maxSalience}`)
      })
      .on('mousemove', (e) => {
        const rect = ref.current!.parentElement!.getBoundingClientRect()
        tooltip
          .style('left', `${e.clientX - rect.left + 12}px`)
          .style('top', `${e.clientY - rect.top - 10}px`)
      })
      .on('mouseout', () => tooltip.style('display', 'none'))
      .on('click', (_, d) => {
        onAreaFilter(areaFilter === d.area ? null : d.area)
      })

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 16}, ${margin.top})`)

    areas.forEach((a, i) => {
      const lg = legend.append('g').attr('transform', `translate(0, ${i * 18})`)
        .style('cursor', 'pointer')
        .on('click', () => onAreaFilter(areaFilter === a.id ? null : a.id))

      lg.append('circle')
        .attr('r', 4)
        .attr('cx', 4).attr('cy', 0)
        .attr('fill', areaColorMap[a.id])
        .attr('opacity', (!areaFilter || areaFilter === a.id) ? 0.8 : 0.25)

      lg.append('text')
        .attr('x', 14).attr('y', 4)
        .attr('font-size', '10px')
        .attr('fill', (!areaFilter || areaFilter === a.id) ? '#b0b4c4' : '#3a3f52')
        .text(a.label.length > 18 ? a.label.substring(0, 16) + '...' : a.label)
    })

    return () => { tooltip.remove() }
  }, [painPoints, areas, areaFilter, onAreaFilter])

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={ref} />
    </div>
  )
}
