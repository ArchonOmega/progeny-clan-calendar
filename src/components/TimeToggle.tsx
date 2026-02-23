'use client'

import { useState, useCallback } from 'react'
import { SLT_TIMEZONE } from '@/lib/types'

export type TimeZoneMode = 'slt' | 'local'

interface TimeToggleProps {
  mode: TimeZoneMode
  onChange: (mode: TimeZoneMode) => void
}

export default function TimeToggle({ mode, onChange }: TimeToggleProps) {
  const isSLT = mode === 'slt'

  return (
    <div className="flex items-center gap-3 select-none">
      <span
        className="font-mono text-[11px] tracking-widest uppercase cursor-pointer transition-colors"
        style={{ color: !isSLT ? 'var(--pale)' : 'var(--pale-dim)' }}
        onClick={() => onChange('local')}
      >
        Local
      </span>

      <div
        className={`toggle-track ${isSLT ? 'active' : ''}`}
        onClick={() => onChange(isSLT ? 'local' : 'slt')}
        role="switch"
        aria-checked={isSLT}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange(isSLT ? 'local' : 'slt')}
      >
        <div className="toggle-thumb" />
      </div>

      <span
        className="font-mono text-[11px] tracking-widest uppercase cursor-pointer transition-colors"
        style={{ color: isSLT ? 'var(--pale)' : 'var(--pale-dim)' }}
        onClick={() => onChange('slt')}
      >
        SLT
      </span>
    </div>
  )
}

// ── Helper: format a UTC ISO string based on tz mode ────────
export function formatEventTime(isoUtc: string, mode: TimeZoneMode): string {
  const tz = mode === 'slt' ? SLT_TIMEZONE : Intl.DateTimeFormat().resolvedOptions().timeZone
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      month:   'short',
      day:     'numeric',
      hour:    'numeric',
      minute:  '2-digit',
      hour12:  true,
    }).format(new Date(isoUtc))
  } catch {
    return isoUtc
  }
}

export function formatTimeLabel(mode: TimeZoneMode): string {
  if (mode === 'slt') return 'SLT'
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz.split('/').pop()?.replace('_', ' ') ?? 'Local'
  } catch {
    return 'Local'
  }
}
