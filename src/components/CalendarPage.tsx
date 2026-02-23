'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import EventCard from '@/components/EventCard'
import TimeToggle from '@/components/TimeToggle'
import CreateEventModal from '@/components/CreateEventModal'
import CalendarView from '@/components/CalendarView'
import type { ClanEvent, Profile, EventCategory, EventStatus } from '@/lib/types'
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/lib/types'
import type { TimeZoneMode } from '@/components/TimeToggle'

interface CalendarPageProps {
  events: ClanEvent[]
  profile: Profile | null
}

type DisplayMode = 'cards' | 'calendar'

export default function CalendarPage({ events, profile }: CalendarPageProps) {
  const [tzMode,       setTzMode]       = useState<TimeZoneMode>('slt')
  const [displayMode,  setDisplayMode]  = useState<DisplayMode>('cards')
  const [showCreate,   setShowCreate]   = useState(false)
  const [filterCat,    setFilterCat]    = useState<EventCategory | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'All'>('All')
  const [search,       setSearch]       = useState('')

  const filtered = useMemo(() => events.filter((e) => {
    if (filterCat !== 'All' && e.category !== filterCat) return false
    if (filterStatus !== 'All' && e.status !== filterStatus) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [events, filterCat, filterStatus, search])

  const grouped = useMemo(() => ({
    upcoming: filtered.filter((e) => e.status !== 'Completed' && new Date(e.start_time) >= new Date(Date.now() - 3600000)),
    past:     filtered.filter((e) => e.status === 'Completed'  || new Date(e.start_time) <  new Date(Date.now() - 3600000)),
  }), [filtered])

  return (
    <>
      {/* Header manages its own login dropdown now */}
      <Header profile={profile} onLoginClick={() => {}} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Toolbar */}
        <section className="panel p-4 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ border: '1px solid var(--ash-2)' }}>
          <div className="flex-1 w-full">
            <input className="input-dark" placeholder="🔍  Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-dark w-full md:w-40" value={filterCat} onChange={(e) => setFilterCat(e.target.value as EventCategory | 'All')}>
            <option value="All">All Categories</option>
            {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-dark w-full md:w-36" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as EventStatus | 'All')}>
            <option value="All">All Statuses</option>
            {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="shrink-0">
            <TimeToggle mode={tzMode} onChange={setTzMode} />
          </div>
          {profile && (
            <button className="btn-blood shrink-0 whitespace-nowrap" onClick={() => setShowCreate(true)}>
              + New Event
            </button>
          )}
        </section>

        {/* View toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#4a3860', letterSpacing: '0.2em', textTransform: 'uppercase' }}>View:</span>
          <div style={{ display: 'flex', border: '1px solid #2a1e3a', borderRadius: '3px', overflow: 'hidden' }}>
            {(['cards', 'calendar'] as DisplayMode[]).map((mode) => (
              <button key={mode} onClick={() => setDisplayMode(mode)} style={{
                padding: '6px 18px', fontFamily: "'Cinzel', serif", fontSize: '11px',
                letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
                background: displayMode === mode ? '#8b0000' : 'transparent',
                color:      displayMode === mode ? '#ffd0d0'  : '#4a3860',
                boxShadow:  displayMode === mode ? '0 0 12px rgba(139,0,0,0.4)' : 'none',
              }}>
                {mode === 'cards' ? '⊞ Cards' : '▦ Calendar'}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar view */}
        {displayMode === 'calendar' && <CalendarView events={filtered} tzMode={tzMode} />}

        {/* Cards view */}
        {displayMode === 'cards' && (
          <>
            <section>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="font-title text-sm tracking-[0.3em] uppercase text-[var(--pale-dim)]">✦ Upcoming &amp; Active</h2>
                <div className="flex-1 divider-blood opacity-30" />
                <span className="font-mono text-[10px] text-[var(--pale-dim)]">{grouped.upcoming.length} event{grouped.upcoming.length !== 1 ? 's' : ''}</span>
              </div>
              {grouped.upcoming.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p className="font-display text-2xl text-[var(--ash-2)] mb-2">⸸</p>
                  <p className="font-mono text-xs text-[var(--pale-dim)] tracking-widest">No events stir in the darkness…</p>
                  {profile && <button className="btn-blood mt-4 text-[10px]" onClick={() => setShowCreate(true)}>Summon the First</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped.upcoming.map((e, i) => <EventCard key={e.id} event={e} profile={profile} tzMode={tzMode} index={i} />)}
                </div>
              )}
            </section>

            {grouped.past.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-title text-sm tracking-[0.3em] uppercase text-[var(--pale-dim)] opacity-60">✦ Past &amp; Completed</h2>
                  <div className="flex-1 divider-blood opacity-20" />
                  <span className="font-mono text-[10px] text-[var(--pale-dim)] opacity-60">{grouped.past.length} event{grouped.past.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {grouped.past.map((e, i) => <EventCard key={e.id} event={e} profile={profile} tzMode={tzMode} index={i} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[var(--ash-2)] mt-16 py-6 text-center">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--pale-dim)] opacity-40">
          Renaissance Van Withelmind &nbsp;✦&nbsp; Progeny &nbsp;✦&nbsp; The Night is Eternal
        </p>
      </footer>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
