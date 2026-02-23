'use client'

import { useState } from 'react'
import { updateEvent } from '@/lib/actions'
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/lib/types'
import type { ClanEvent, EventCategory, EventStatus } from '@/lib/types'

interface EditEventModalProps {
  event: ClanEvent
  onClose: () => void
}

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // Convert UTC ISO to local datetime-local string for the input
  const toLocalInput = (iso: string) => {
    const d = new Date(iso)
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - offset).toISOString().slice(0, 16)
  }

  const [form, setForm] = useState({
    title:       event.title,
    description: event.description ?? '',
    start_time:  toLocalInput(event.start_time),
    category:    event.category,
    status:      event.status,
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
    const utcIso = new Date(form.start_time).toISOString()
    const res = await updateEvent(event.id, { ...form, start_time: utcIso })
    if (res?.error) {
      setErr(res.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#8b7aa0',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(5,2,10,0.88)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #140d1e 0%, #1e1528 100%)',
          border: '1px solid #c9a84c',
          borderRadius: '4px',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #2a1e3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#d4c5e8',
              margin: 0,
            }}>
              ✏️ Edit Event
            </h2>
            <p style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '10px',
              color: '#8b7aa0',
              marginTop: '4px',
              letterSpacing: '0.1em',
            }}>
              Modify the details of this gathering
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b7aa0', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Event Title *</label>
            <input className="input-dark" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea className="input-dark" rows={3} style={{ resize: 'none' }}
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select className="input-dark" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select className="input-dark" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Start Time (your local time) *</label>
            <input type="datetime-local" className="input-dark" value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)} />
          </div>

          {err && (
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#f87171', background: 'rgba(139,0,0,0.15)', border: '1px solid #7f1d1d', padding: '8px 12px', borderRadius: '2px' }}>
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #2a1e3a',
          display: 'flex',
          gap: '12px',
          flexShrink: 0,
        }}>
          <button
            className="btn-blood"
            style={{ flex: 1, fontSize: '13px', padding: '10px' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving…' : '✏️ Save Changes'}
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: '13px', padding: '10px 20px' }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
