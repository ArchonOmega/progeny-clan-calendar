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
  const [loading, setLoading]     = useState(false)
  const [err, setErr]             = useState('')
  const [showEdit, setShowEdit]   = useState(false)

  const catStyle    = CATEGORY_STYLES[event.category]
  const statusStyle = STATUS_STYLES[event.status]

  // Only the creator can edit; admins can delete
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
        <div className="p-4 space-y-3">

          {/* Top row: category badge + status */}
          <div className="flex items-start justify-between gap-2">
            <span className={`font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm ${catStyle.badge}`}>
              {CATEGORY_ICONS[event.category]} {event.category}
            </span>
            <span className={`font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm ${statusStyle}`}>
              {event.status}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-title text-base text-[var(--pale)] leading-tight tracking-wide group-hover:text-white transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="font-mono text-xs text-[var(--pale-dim)] leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}

          {/* Time */}
          <div className="font-mono text-[11px] text-[var(--gold)] tracking-wide">
            🕐 {formatEventTime(event.start_time, tzMode)} ({formatTimeLabel(tzMode)})
          </div>

          <div className="divider-blood opacity-40" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-mono text-[10px] text-[var(--pale-dim)] tracking-wide">
              {event.author_username ?? '—'}
              {event.author_role && <span className="ml-1 opacity-60">· {event.author_role}</span>}
            </p>

            <div className="flex items-center gap-2">
              {/* Status dropdown — creator or admin */}
              {(isCreator || isAdmin) && (
                <select
                  className="input-dark text-[10px] py-0.5 px-2 w-auto"
                  value={event.status}
                  disabled={loading}
                  onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                >
                  {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Edit button — creator only */}
              {isCreator && (
                <button
                  className="font-mono text-[10px] text-[var(--gold)] hover:text-yellow-300 transition-colors border border-[var(--gold-dim)] px-2 py-0.5 rounded-sm"
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
                  className="font-mono text-[10px] text-red-700 hover:text-red-400 transition-colors"
                  onClick={handleDelete}
                  disabled={loading}
                  title="Delete event"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {err && <p className="font-mono text-[10px] text-red-400">{err}</p>}
        </div>
      </article>

      {showEdit && (
        <EditEventModal event={event} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
