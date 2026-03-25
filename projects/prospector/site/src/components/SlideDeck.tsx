import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Slide {
  id: string
  label?: string
  content: React.ReactNode
}

interface SlideDeckProps {
  slides: Slide[]
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -400 : 400, opacity: 0 }),
}

export default function SlideDeck({ slides }: SlideDeckProps) {
  const [[page, direction], setPage] = useState([0, 0])

  const paginate = (dir: number) => {
    const next = page + dir
    if (next >= 0 && next < slides.length) setPage([next, dir])
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Slide container */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--surface)', borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        minHeight: 480,
      }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ padding: '48px 56px' }}
          >
            {slides[page].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 16, padding: '0 4px',
      }}>
        {/* Prev */}
        <button
          onClick={() => paginate(-1)}
          disabled={page === 0}
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: 600, border: 'none',
            cursor: page === 0 ? 'default' : 'pointer', borderRadius: 6,
            color: page === 0 ? 'var(--text-muted)' : 'var(--text)',
            background: page === 0 ? 'transparent' : 'var(--surface)',
            opacity: page === 0 ? 0.3 : 1,
          }}
        >
          Previous
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setPage([i, i > page ? 1 : -1])}
              title={s.label || `Slide ${i + 1}`}
              style={{
                width: i === page ? 24 : 8, height: 8, borderRadius: 4,
                border: 'none', cursor: 'pointer',
                background: i === page ? 'var(--accent)' : 'var(--surface3)',
                transition: 'all 0.2s',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
            {page + 1} / {slides.length}
          </span>
        </div>

        {/* Next */}
        <button
          onClick={() => paginate(1)}
          disabled={page === slides.length - 1}
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: 600, border: 'none',
            cursor: page === slides.length - 1 ? 'default' : 'pointer', borderRadius: 6,
            color: page === slides.length - 1 ? 'var(--text-muted)' : 'var(--text)',
            background: page === slides.length - 1 ? 'transparent' : 'var(--surface)',
            opacity: page === slides.length - 1 ? 0.3 : 1,
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}
