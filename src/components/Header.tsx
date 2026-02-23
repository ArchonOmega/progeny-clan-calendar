'use client'

import { useState } from 'react'
import { signOut, signInWithEmail } from '@/lib/actions'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile | null
  onLoginClick: () => void  // kept for compatibility but not used
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

  return (
    <header className="relative z-20 border-b border-[var(--ash-2)]">

      {/* ── Ticker ─────────────────────────────────────────── */}
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

      {/* ── Main bar ───────────────────────────────────────── */}
      <div className="panel grid py-5"
        style={{ borderRadius: 0, border: 'none', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
      >
        {/* Left — user info */}
        <div style={{ paddingLeft: '0.75rem' }}>
          {profile && (
            <div>
              <p className="font-title text-sm text-[var(--pale)] tracking-wide">
                {CLAN_ROLES[profile.role] ?? '◈'}&nbsp;{profile.username}
              </p>
              <p className="font-mono text-[11px] tracking-widest uppercase"
                style={{ color: 'var(--gold)', textShadow: '0 0 8px rgba(201,168,76,0.5)' }}>
                {profile.role}{profile.is_admin ? ' · Admin' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Center — clan name */}
        <div className="text-center">
          <h1 className="font-display text-2xl md:text-4xl uppercase select-none"
            style={{ color: 'var(--pale)', textShadow: 'var(--glow-blood)', letterSpacing: '0.12em' }}>
            Renaissance Van Withelmind
          </h1>
          <p className="font-title text-xs md:text-sm tracking-[0.45em] uppercase mt-1 font-bold"
            style={{ color: 'var(--gold)', textShadow: '0 0 10px rgba(201,168,76,0.6)' }}>
            Progeny &nbsp;✦&nbsp; Clan Calendar
          </p>
        </div>

        {/* Right — auth (dropdown anchored here) */}
        <div style={{ paddingRight: '0.75rem', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          {profile ? (
            <form action={signOut}>
              <button type="submit" className="btn-ghost text-[11px] py-1.5 px-4">Sign Out</button>
            </form>
          ) : (
            <>
              <button
                className="btn-blood"
                onClick={() => { setShowLogin(v => !v); setErr('') }}
              >
                Staff Login
              </button>

              {/* Dropdown panel — anchored to button */}
              {showLogin && (
                <>
                  {/* Click-outside overlay */}
                  <div
                    onClick={() => setShowLogin(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    zIndex: 99,
                    width: '300px',
                    background: 'linear-gradient(135deg, #140d1e, #1e1528)',
                    border: '1px solid #c9a84c',
                    borderRadius: '4px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(201,168,76,0.1)',
                    overflow: 'hidden',
                  }}>
                    {/* Arrow pointer */}
                    <div style={{
                      position: 'absolute', top: '-6px', right: '24px',
                      width: '10px', height: '10px',
                      background: '#c9a84c',
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    }} />

                    <div style={{ padding: '18px 20px 6px' }}>
                      <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', margin: '0 0 4px' }}>
                        ⸸ Staff Access
                      </h3>
                      <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0', margin: '0 0 16px', letterSpacing: '0.08em' }}>
                        Prove your covenant
                      </p>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b7aa0', display: 'block', marginBottom: '5px' }}>Email</label>
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
                        <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b7aa0', display: 'block', marginBottom: '5px' }}>Password</label>
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
                    </div>

                    <div style={{ padding: '0 20px 18px' }}>
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
          )}
        </div>
      </div>

      <div className="divider-blood" />
    </header>
  )
}
