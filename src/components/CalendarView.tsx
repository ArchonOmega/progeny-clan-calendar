'use client'

import { useState, useMemo } from 'react'
import type { ClanEvent } from '@/lib/types'
import { CATEGORY_STYLES } from '@/lib/types'
import { formatEventTime, type TimeZoneMode } from './TimeToggle'

interface CalendarViewProps {
  events: ClanEvent[]
  tzMode: TimeZoneMode
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toSLTDate(isoUtc: string): { year: number; month: number; day: number } {
  const d = new Date(new Date(isoUtc).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
}

const CATEGORY_ICONS: Record<string, string> = {
  Education: '📖',
  Combat:    '⚔️',
  Ceremony:  '🕯️',
}

export default function CalendarView({ events, tzMode }: CalendarViewProps) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected,  setSelected]  = useState<number | null>(null)
  const [hovered,   setHovered]   = useState<number | null>(null)

  const eventsByDay = useMemo(() => {
    const map: Record<number, ClanEvent[]> = {}
    events.forEach((e) => {
      const { year, month, day } = toSLTDate(e.start_time)
      if (year === viewYear && month === viewMonth) {
        if (!map[day]) map[day] = []
        map[day].push(e)
      }
    })
    return map
  }, [events, viewYear, viewMonth])

  const selectedEvents = selected ? (eventsByDay[selected] ?? []) : []

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Figure out which row each cell is in (0-indexed) so we can flip tooltip
  const totalRows = cells.length / 7
  const getCellRow = (cellIndex: number) => Math.floor(cellIndex / 7)

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelected(null)
  }

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* ── Calendar grid ──────────────────────────────────── */}
      <div style={{
        flex: selected ? '0 0 auto' : '1',
        width: selected ? 'min(580px, 60%)' : '100%',
        transition: 'width 0.3s ease',
        background: 'linear-gradient(135deg, #140d1e, #1e1528)',
        border: '1px solid #2a1e3a',
        borderRadius: '4px',
        overflow: 'visible',   // allow tooltips to escape
      }}>

        {/* Month nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #2a1e3a',
          background: 'rgba(139,0,0,0.08)',
          borderRadius: '4px 4px 0 0',
        }}>
          <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #4a3860', color: '#8b7aa0', padding: '4px 12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Share Tech Mono', monospace", fontSize: '14px' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '16px', color: '#d4c5e8', letterSpacing: '0.1em', margin: 0 }}>{MONTHS[viewMonth]}</p>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#c9a84c', letterSpacing: '0.3em', marginTop: '2px' }}>{viewYear}</p>
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #4a3860', color: '#8b7aa0', padding: '4px 12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Share Tech Mono', monospace", fontSize: '14px' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #2a1e3a' }}>
          {DAYS.map((d) => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '0.15em', color: '#4a3860', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return (
              <div key={`empty-${i}`} style={{ minHeight: '80px', borderRight: '1px solid #1e1528', borderBottom: '1px solid #1e1528' }} />
            )

            const dayEvents  = eventsByDay[day] ?? []
            const hasEvents  = dayEvents.length > 0
            const isTodayDay = isToday(day)
            const isSelected = selected === day
            const isHovered  = hovered === day
            const cellRow    = getCellRow(i)
            // Flip tooltip upward if in the last 2 rows
            const tooltipAbove = cellRow >= totalRows - 2

            let bg = 'transparent'
            if (isSelected)             bg = 'rgba(201,168,76,0.12)'
            else if (isHovered && hasEvents) bg = 'rgba(201,168,76,0.06)'

            return (
              <div
                key={day}
                onClick={() => hasEvents && setSelected(selected === day ? null : day)}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  minHeight: '80px',
                  padding: '6px',
                  borderRight: '1px solid #1e1528',
                  borderBottom: '1px solid #1e1528',
                  background: bg,
                  cursor: hasEvents ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'background 0.15s',
                }}
              >
                {/* Day number */}
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cinzel', serif", fontSize: '12px',
                  fontWeight: isTodayDay ? 'bold' : 'normal',
                  background: isTodayDay ? '#8b0000' : 'transparent',
                  color: isTodayDay ? '#ffd0d0' : isSelected ? '#c9a84c' : '#8b7aa0',
                  boxShadow: isTodayDay ? '0 0 10px rgba(139,0,0,0.6)' : 'none',
                }}>
                  {day}
                </div>

                {/* Event pills */}
                {hasEvents && (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} style={{
                        fontSize: '10px', fontFamily: "'Share Tech Mono', monospace",
                        color: '#c9a84c', background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.3)', borderRadius: '2px',
                        padding: '1px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {CATEGORY_ICONS[e.category]} {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: '9px', color: '#4a3860', fontFamily: "'Share Tech Mono', monospace", paddingLeft: '4px' }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* Hover tooltip — flips above if near bottom */}
                {isHovered && hasEvents && !isSelected && (
                  <div style={{
                    position: 'absolute',
                    // If near bottom rows, show above; otherwise show below
                    ...(tooltipAbove
                      ? { bottom: '100%', marginBottom: '6px' }
                      : { top: '100%',    marginTop: '6px'    }),
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 200,
                    background: '#0d0714',
                    border: '1px solid #c9a84c',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    minWidth: '180px',
                    maxWidth: '240px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                  }}>
                    {dayEvents.map((e) => (
                      <div key={e.id} style={{ marginBottom: '6px' }}>
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', color: '#d4c5e8', margin: '0 0 2px 0' }}>{e.title}</p>
                        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#c9a84c', margin: 0 }}>
                          🕐 {formatEventTime(e.start_time, tzMode)}
                        </p>
                      </div>
                    ))}
                    <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#4a3860', margin: '4px 0 0', textAlign: 'center' }}>
                      Click to expand
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #2a1e3a', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#8b0000', boxShadow: '0 0 6px rgba(139,0,0,0.6)' }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0' }}>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '8px', borderRadius: '2px', background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)' }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0' }}>Has Events</span>
          </div>
        </div>
      </div>

      {/* ── Selected day panel ─────────────────────────────── */}
      {selected && selectedEvents.length > 0 && (
        <div style={{
          flex: '1', background: 'linear-gradient(135deg, #140d1e, #1e1528)',
          border: '1px solid #c9a84c', borderRadius: '4px',
          overflow: 'hidden', minWidth: '280px',
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #2a1e3a',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(201,168,76,0.06)',
          }}>
            <div>
              <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', color: '#c9a84c', margin: 0, letterSpacing: '0.1em' }}>
                {MONTHS[viewMonth]} {selected}
              </p>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0', margin: '2px 0 0', letterSpacing: '0.2em' }}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8b7aa0', fontSize: '16px', cursor: 'pointer', padding: '4px' }}>✕</button>
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedEvents.map((e) => {
              const catStyle = CATEGORY_STYLES[e.category]
              return (
                <div key={e.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2a1e3a', borderRadius: '3px', padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '2px', border: '1px solid', fontWeight: 'bold' }} className={catStyle.badge}>
                      {CATEGORY_ICONS[e.category]} {e.category}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '2px', border: '1px solid', color: '#94a3b8', borderColor: '#475569' }}>
                      {e.status}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '15px', color: '#d4c5e8', margin: '0 0 6px', lineHeight: 1.3 }}>{e.title}</p>
                  {e.description && (
                    <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#8b7aa0', margin: '0 0 8px', lineHeight: 1.6 }}>{e.description}</p>
                  )}
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', color: '#c9a84c', margin: '0 0 4px', fontWeight: 'bold' }}>
                    🕐 {formatEventTime(e.start_time, tzMode)}
                  </p>
                  {e.location && (
                    <a href={e.location} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      📍 Teleport to Location ↗
                    </a>
                  )}
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#4a3860', margin: '8px 0 0' }}>
                    Posted by {e.author_username} · {e.author_role}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
