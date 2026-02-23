'use client'

import { signOut } from '@/lib/actions'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile | null
  onLoginClick: () => void
}

const CLAN_ROLES: Record<string, string> = {
  Sovereign:    '♛',
  Priest:       '✝',
  Trainer:      '⚔',
  Member:       '◈',
  'Queens Hand': '♚',
  Liaison:      '⚜',
}

export default function Header({ profile, onLoginClick }: HeaderProps) {
  return (
    <header className="relative z-20 border-b border-[var(--ash-2)]">

      {/* ── Top ticker ─────────────────────────────────── */}
      <div className="overflow-hidden bg-[var(--blood)] py-2 border-b border-[var(--blood-light)]">
        <p
          className="font-title text-sm text-red-100 tracking-[0.25em] font-bold"
          style={{ textShadow: '0 0 8px rgba(255,150,150,0.5)' }}
        >
          <span className="marquee-text">
            ✦&nbsp;&nbsp;RENAISSANCE VAN WITHELMIND &nbsp;•&nbsp; PROGENY &nbsp;•&nbsp;
            CRIMSON UPLINK ACTIVE &nbsp;•&nbsp; ALL INITIATES REPORT TO YOUR SIRE &nbsp;•&nbsp;
            THE NIGHT IS ETERNAL &nbsp;•&nbsp; ✦&nbsp;&nbsp;RENAISSANCE VAN WITHELMIND &nbsp;•&nbsp;
            PROGENY &nbsp;•&nbsp; CRIMSON UPLINK ACTIVE &nbsp;•&nbsp;
            ALL INITIATES REPORT TO YOUR SIRE &nbsp;•&nbsp; THE NIGHT IS ETERNAL &nbsp;•&nbsp;
          </span>
        </p>
      </div>

      {/* ── Main header bar ────────────────────────────── */}
      <div
        className="panel grid px-6 py-5"
        style={{
          borderRadius: 0,
          border: 'none',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        {/* Col 1 — logged-in user info (left side) */}
        <div className="flex items-center gap-2">
          {profile && (
            <div>
              <p className="font-title text-sm text-[var(--pale)] tracking-wide">
                {CLAN_ROLES[profile.role] ?? '◈'}&nbsp;{profile.username}
              </p>
              <p className="font-mono text-[10px] text-[var(--gold)] tracking-widest uppercase"
                style={{ textShadow: '0 0 8px rgba(201,168,76,0.5)' }}>
                {profile.role}{profile.is_admin ? ' · Admin' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Col 2 — clan name, always centered */}
        <div className="text-center">
          <h1
            className="font-display text-2xl md:text-4xl uppercase select-none"
            style={{
              color: 'var(--pale)',
              textShadow: 'var(--glow-blood)',
              letterSpacing: '0.12em',
            }}
          >
            Renaissance Van Withelmind
          </h1>
          <p
            className="font-title text-xs md:text-sm tracking-[0.45em] uppercase mt-1 font-bold"
            style={{
              color: 'var(--gold)',
              textShadow: '0 0 10px rgba(201,168,76,0.6)',
            }}
          >
            Progeny &nbsp;✦&nbsp; Clan Calendar
          </p>
        </div>

        {/* Col 3 — login/logout (right side) */}
        <div className="flex items-center justify-end gap-3">
          {profile ? (
            <form action={signOut}>
              <button type="submit" className="btn-ghost text-[10px] py-1 px-3">
                Sign Out
              </button>
            </form>
          ) : (
            <button onClick={onLoginClick} className="btn-blood">
              Staff Login
            </button>
          )}
        </div>
      </div>

      <div className="divider-blood" />
    </header>
  )
}
