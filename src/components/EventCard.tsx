'use client'

import { useState } from 'react'
import { CATEGORY_STYLES, STATUS_STYLES, EVENT_STATUSES } from '@/lib/types'
import type { ClanEvent, EventStatus, Profile } from '@/lib/types'
import { updateEventStatus, deleteEvent } from '@/lib/actions'
import { formatEventTime, type TimeZoneMode, formatTimeLabel } from './TimeToggle'
import EditEventModal from './EditEventModal'

interface EventCardProps {
  event: ClanEvent
  profile: Profile | null
  tzMode: TimeZoneMode
  index: number
}

const CATEGORY_ICONS: Record<string, string> = {
  Education: '📖',
  Combat:    '⚔️',
  Ceremony:  '🕯️',
}

export default function EventCard({ event, profile, tzMode, index }: EventCardProps) {
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')
  const [showEdit, setShowEdit] = useState(false)

  const catStyle    = CATEGORY_STYLES[event.category]
  const statusStyle = STATUS_STYLES[event.status]

  const isCreator = profile && profile.id === event.created_by
  const isAdmin   = profile?.is_admin

  async function handleStatusChange(newStatus: EventStatus) {
    setLoading(true)
    setErr('')
    const res = await updateEventStatus(event.id, newStatus)
    if (res?.error) setErr(res.error)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    setLoading(true)
    await deleteEvent(event.id)
    setLoading(false)
  }

  return (
    <>
      <article
        className="event-card panel group hover:border-[var(--mist)] transition-all duration-200"
        style={{ animationDelay: `${index * 40}ms`, borderColor: 'var(--ash-2)' }}
      >
        <div className="p-5 space-y-4">

          {/* Category badge + Status badge */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-title text-xs tracking-widest uppercase border px-3 py-1 rounded-sm font-bold ${catStyle.badge}`}
            >
              {CATEGORY_ICONS[event.category]} {event.category}
            </span>
            <span
              className={`font-title text-xs tracking-widest uppercase border px-3 py-1 rounded-sm font-bold ${statusStyle}`}
            >
              {event.status}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-title text-xl text-[var(--pale)] leading-snug tracking-wide group-hover:text-white transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="font-mono text-sm text-[var(--pale-dim)] leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}

          {/* Time */}
          <div
            className="font-title text-sm font-bold tracking-wide"
            style={{ color: 'var(--gold)', textShadow: '0 0 8px rgba(201,168,76,0.4)' }}
          >
            🕐 {formatEventTime(event.start_time, tzMode)} ({formatTimeLabel(tzMode)})
          </div>

          <div className="divider-blood opacity-40" />

          {/* Footer: creator info + controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-title text-sm text-[var(--pale-dim)] tracking-wide">
              {event.author_username ?? '—'}
              {event.author_role && (
                <span className="ml-2 font-mono text-xs opacity-60">· {event.author_role}</span>
              )}
            </p>

            <div className="flex items-center gap-2">
              {/* Status dropdown — creator or admin */}
              {(isCreator || isAdmin) && (
                <select
                  className="input-dark text-xs py-1 px-2 w-auto"
                  value={event.status}
                  disabled={loading}
                  onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                >
                  {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Edit — creator only */}
              {isCreator && (
                <button
                  className="font-title text-xs border px-2 py-1 rounded-sm transition-colors"
                  style={{ color: 'var(--gold)', borderColor: 'var(--gold-dim)' }}
                  onClick={() => setShowEdit(true)}
                  disabled={loading}
                  title="Edit event"
                >
                  ✏️ Edit
                </button>
              )}

              {/* Delete — admin only */}
              {isAdmin && (
                <button
                  className="font-mono text-sm text-red-700 hover:text-red-400 transition-colors px-1"
                  onClick={handleDelete}
                  disabled={loading}
                  title="Delete event"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {err && (
            <p className="font-mono text-xs text-red-400">{err}</p>
          )}
        </div>
      </article>

      {showEdit && (
        <EditEventModal event={event} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
