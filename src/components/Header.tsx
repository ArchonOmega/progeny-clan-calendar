'use client'

import { useState } from 'react'
import { signOut, signInWithEmail } from '@/lib/actions'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile | null
  onLoginClick: () => void
}

const CLAN_ROLES: Record<string, string> = {
  Sovereign:     '♛',
  Priest:        '✝',
  Trainer:       '⚔',
  Member:        '◈',
  'Queens Hand': '♚',
  Liaison:       '⚜',
}

export default function Header({ profile }: HeaderProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [email,    setEmail]      = useState('')
  const [password, setPassword]   = useState('')
  const [loading,  setLoading]    = useState(false)
  const [err,      setErr]        = useState('')

  async function handleLogin() {
    if (!email || !password) { setErr('Enter your credentials.'); return }
    setLoading(true); setErr('')
    const res = await signInWithEmail(email, password)
    if (res?.error) { setErr(res.error); setLoading(false) }
    else { setShowLogin(false); setEmail(''); setPassword('') }
  }

  function openLogin() { setShowLogin(true); setErr('') }
  function closeLogin() { setShowLogin(false); setErr('') }

  return (
    <>
      <header className="relative border-b border-[var(--ash-2)]" style={{ zIndex: 20 }}>

        {/* ── Ticker ─────────────────────────────────────── */}
        <div className="overflow-hidden bg-[var(--blood)] py-2 border-b border-[var(--blood-light)]">
          <p className="font-title text-sm text-red-100 tracking-[0.25em] font-bold"
            style={{ textShadow: '0 0 8px rgba(255,150,150,0.5)' }}>
            <span className="marquee-text">
              ✦&nbsp;&nbsp;RENAISSANCE VAN WITHELMIND &nbsp;•&nbsp; PROGENY &nbsp;•&nbsp;
              CRIMSON UPLINK ACTIVE &nbsp;•&nbsp; ALL INITIATES REPORT TO YOUR SIRE &nbsp;•&nbsp;
              THE NIGHT IS ETERNAL &nbsp;•&nbsp; ✦&nbsp;&nbsp;RENAISSANCE VAN WITHELMIND &nbsp;•&nbsp;
              PROGENY &nbsp;•&nbsp; CRIMSON UPLINK ACTIVE &nbsp;•&nbsp;
              ALL INITIATES REPORT TO YOUR SIRE &nbsp;•&nbsp; THE NIGHT IS ETERNAL &nbsp;•&nbsp;
            </span>
          </p>
        </div>

        {/* ── Main bar — 3-column grid ───────────────────── */}
        <div
          className="panel grid py-5"
          style={{
            borderRadius: 0, border: 'none',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            paddingLeft: '3rem',
            paddingRight: '3rem',
          }}
        >
          {/* Col 1 — user info */}
          <div>
            {profile && (
              <>
                <p className="font-title text-sm text-[var(--pale)] tracking-wide">
                  {CLAN_ROLES[profile.role] ?? '◈'}&nbsp;{profile.username}
                </p>
                <p className="font-mono text-[11px] tracking-widest uppercase"
                  style={{ color: 'var(--gold)', textShadow: '0 0 8px rgba(201,168,76,0.5)' }}>
                  {profile.role}{profile.is_admin ? ' · Admin' : ''}
                </p>
              </>
            )}
          </div>

          {/* Col 2 — clan name, always centered */}
          <div className="text-center px-8">
            <h1
              className="font-display text-2xl md:text-4xl uppercase select-none"
              style={{ color: 'var(--pale)', textShadow: 'var(--glow-blood)', letterSpacing: '0.12em' }}
            >
              Renaissance Van Withelmind
            </h1>
            <p
              className="font-title text-xs md:text-sm tracking-[0.45em] uppercase mt-1 font-bold"
              style={{ color: 'var(--gold)', textShadow: '0 0 10px rgba(201,168,76,0.6)' }}
            >
              Progeny &nbsp;✦&nbsp; Clan Calendar
            </p>
          </div>

          {/* Col 3 — auth button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {profile ? (
              <form action={signOut}>
                <button type="submit" className="btn-ghost text-[11px] py-1.5 px-4">Sign Out</button>
              </form>
            ) : (
              <button className="btn-blood" onClick={openLogin}>Staff Login</button>
            )}
          </div>
        </div>

        <div className="divider-blood" />
      </header>

      {/* ── Login modal — rendered in a portal OUTSIDE header ── */}
      {showLogin && (
        <>
          {/* Full-screen backdrop */}
          <div
            onClick={closeLogin}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(5,2,10,0.7)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Modal — top-right, below the header, not inside it */}
          <div
            style={{
              position: 'fixed',
              top: '120px',      /* sits below the header */
              right: '3rem',     /* aligns with the button column */
              zIndex: 9999,
              width: '300px',
              background: 'linear-gradient(135deg, #140d1e, #1e1528)',
              border: '1px solid #c9a84c',
              borderRadius: '4px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.9), 0 0 20px rgba(201,168,76,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Gold arrow pointing up toward the button */}
            <div style={{
              position: 'absolute', top: '-7px', right: '36px',
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '7px solid #c9a84c',
            }} />

            {/* Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #2a1e3a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', margin: '0 0 3px' }}>
                  ⸸ Staff Access
                </h3>
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0', margin: 0, letterSpacing: '0.08em' }}>
                  Prove your covenant
                </p>
              </div>
              <button onClick={closeLogin} style={{ background: 'none', border: 'none', color: '#8b7aa0', fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1, marginTop: '2px' }}>✕</button>
            </div>

            {/* Form */}
            <div style={{ padding: '16px 20px 20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b7aa0', display: 'block', marginBottom: '5px' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="input-dark"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b7aa0', display: 'block', marginBottom: '5px' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {err && (
                <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#f87171', background: 'rgba(139,0,0,0.15)', border: '1px solid #7f1d1d', padding: '6px 10px', borderRadius: '2px', marginBottom: '12px' }}>
                  {err}
                </p>
              )}

              <button
                className="btn-blood"
                style={{ width: '100%', fontSize: '12px', padding: '9px' }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Entering the darkness…' : '🩸 Enter'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
