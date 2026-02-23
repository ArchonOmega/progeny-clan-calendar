'use client'

import { useState } from 'react'
import { createEvent } from '@/lib/actions'
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/lib/types'
import type { EventCategory, EventStatus } from '@/lib/types'

interface CreateEventModalProps {
  onClose: () => void
}

export default function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    title:       '',
    description: '',
    start_time:  '',
    category:    'Ceremony' as EventCategory,
    status:      'Scheduled' as EventStatus,
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.title || !form.start_time) {
      setErr('Title and start time are required.')
      return
    }
    setLoading(true)
    setErr('')

    // Convert local datetime-local value to UTC ISO
    const utcIso = new Date(form.start_time).toISOString()

    const res = await createEvent({ ...form, start_time: utcIso })
    if (res?.error) {
      setErr(res.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,2,10,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel corner-ornament w-full max-w-lg"
        style={{ border: '1px solid var(--blood)' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[var(--ash-2)] flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm tracking-widest uppercase text-[var(--pale)]">
              ✦ New Event
            </h2>
            <p className="font-mono text-[10px] text-[var(--pale-dim)] mt-0.5 tracking-wider">
              Summon a gathering of the clan
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[var(--pale-dim)] hover:text-[var(--pale)] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
              Event Title *
            </label>
            <input
              className="input-dark"
              placeholder="e.g. Blood Moon Ceremony"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
              Description
            </label>
            <textarea
              className="input-dark resize-none"
              rows={3}
              placeholder="Details, location, attire..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
                Category *
              </label>
              <select
                className="input-dark"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
                Status
              </label>
              <select
                className="input-dark"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
              Start Time (your local time) *
            </label>
            <input
              type="datetime-local"
              className="input-dark"
              value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)}
            />
            <p className="font-mono text-[10px] text-[var(--pale-dim)] mt-1 opacity-60">
              Stored as UTC · displayed in SLT or local time on the calendar
            </p>
          </div>

          {err && (
            <p className="font-mono text-xs text-red-400 bg-red-900/20 border border-red-900 px-3 py-2 rounded-sm">
              {err}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              className="btn-blood flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Summoning…' : '🩸 Create Event'}
            </button>
            <button className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
