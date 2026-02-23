'use client'

import { useState } from 'react'
import { signInWithEmail } from '@/lib/actions'

interface LoginModalProps {
  onClose: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin() {
    if (!email || !password) { setErr('Enter your credentials.'); return }
    setLoading(true)
    setErr('')
    const res = await signInWithEmail(email, password)
    if (res?.error) {
      setErr(res.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,2,10,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel corner-ornament w-full max-w-sm"
        style={{ border: '1px solid var(--gold-dim)' }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-[var(--ash-2)] flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm tracking-widest uppercase text-[var(--gold)]">
              ⸸ Staff Access
            </h2>
            <p className="font-mono text-[10px] text-[var(--pale-dim)] mt-0.5 tracking-wider">
              Prove your covenant
            </p>
          </div>
          <button onClick={onClose} className="font-mono text-[var(--pale-dim)] hover:text-[var(--pale)] text-lg">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="input-dark"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-widest uppercase text-[var(--pale-dim)] block mb-1.5">
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
            <p className="font-mono text-xs text-red-400 bg-red-900/20 border border-red-900 px-3 py-2 rounded-sm">
              {err}
            </p>
          )}

          <button
            className="btn-blood w-full mt-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Entering the darkness…' : '🩸 Enter'}
          </button>
        </div>
      </div>
    </div>
  )
}
