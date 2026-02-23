'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AccountModalProps {
  username: string
  onClose: () => void
}

export default function AccountModal({ username, onClose }: AccountModalProps) {
  const [tab, setTab]               = useState<'username' | 'password'>('username')
  const [newUsername, setNewUsername] = useState(username)
  const [currentPw,  setCurrentPw]  = useState('')
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [loading,    setLoading]    = useState(false)
  const [msg,        setMsg]        = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleUsernameChange() {
    if (!newUsername.trim()) { setMsg({ type: 'err', text: 'Username cannot be empty.' }); return }
    setLoading(true); setMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMsg({ type: 'err', text: 'Not authenticated.' }); setLoading(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername.trim() })
      .eq('id', user.id)

    if (error) setMsg({ type: 'err', text: error.message })
    else       setMsg({ type: 'ok',  text: 'Username updated! Refresh to see it in the header.' })
    setLoading(false)
  }

  async function handlePasswordChange() {
    if (!newPw)             { setMsg({ type: 'err', text: 'Enter a new password.' }); return }
    if (newPw !== confirmPw){ setMsg({ type: 'err', text: 'Passwords do not match.' }); return }
    if (newPw.length < 6)  { setMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return }
    setLoading(true); setMsg(null)

    const supabase = createClient()

    // Re-authenticate first so the session is fresh
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setMsg({ type: 'err', text: 'Not authenticated.' }); setLoading(false); return }

    if (currentPw) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email, password: currentPw,
      })
      if (signInErr) { setMsg({ type: 'err', text: 'Current password is incorrect.' }); setLoading(false); return }
    }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setMsg({ type: 'err', text: error.message })
    else {
      setMsg({ type: 'ok', text: 'Password changed successfully.' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
    setLoading(false)
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Share Tech Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b7aa0',
    display: 'block', marginBottom: '6px',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '0.12em',
    textTransform: 'uppercase', transition: 'all 0.15s',
    background: active ? '#8b0000' : 'transparent',
    color:      active ? '#ffd0d0' : '#4a3860',
    borderBottom: active ? '2px solid #c0392b' : '2px solid transparent',
  })

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(5,2,10,0.75)', backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 9999, width: 'min(420px, calc(100vw - 32px))',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, #140d1e 0%, #1e1528 100%)',
        border: '1px solid #c9a84c', borderRadius: '4px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.9)',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #2a1e3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', margin: '0 0 3px' }}>
              ⚙ Account Settings
            </h3>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#8b7aa0', margin: 0 }}>
              Manage your clan identity
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b7aa0', fontSize: '16px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a1e3a' }}>
          <button style={tabStyle(tab === 'username')} onClick={() => { setTab('username'); setMsg(null) }}>
            Username
          </button>
          <button style={tabStyle(tab === 'password')} onClick={() => { setTab('password'); setMsg(null) }}>
            Password
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>

          {tab === 'username' && (
            <div>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#8b7aa0', marginTop: 0, marginBottom: '16px', lineHeight: 1.6 }}>
                This is your Second Life display name shown on events and in the header.
              </p>
              <label style={labelStyle}>New SL Username</label>
              <input
                className="input-dark"
                placeholder="Your.SLName"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUsernameChange()}
                style={{ marginBottom: '16px' }}
              />
              <button
                className="btn-blood"
                style={{ width: '100%', padding: '9px', fontSize: '12px' }}
                onClick={handleUsernameChange}
                disabled={loading}
              >
                {loading ? 'Saving…' : '✦ Update Username'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password" className="input-dark"
                  placeholder="••••••••" value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password" className="input-dark"
                  placeholder="••••••••" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password" className="input-dark"
                  placeholder="••••••••" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                />
              </div>
              <button
                className="btn-blood"
                style={{ width: '100%', padding: '9px', fontSize: '12px' }}
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading ? 'Updating…' : '🔑 Change Password'}
              </button>
            </div>
          )}

          {/* Message */}
          {msg && (
            <p style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', marginTop: '12px',
              padding: '8px 10px', borderRadius: '2px',
              color:       msg.type === 'ok' ? '#6ee7b7' : '#f87171',
              background:  msg.type === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(139,0,0,0.15)',
              border:      `1px solid ${msg.type === 'ok' ? '#065f46' : '#7f1d1d'}`,
            }}>
              {msg.type === 'ok' ? '✓ ' : '✗ '}{msg.text}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
