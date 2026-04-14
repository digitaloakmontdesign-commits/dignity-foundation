'use client'

import { useState } from 'react'
import { createClient } from '../supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes silkDrift {
          0%   { transform: translateX(0px) translateY(0px) rotate(0deg); }
          33%  { transform: translateX(18px) translateY(-12px) rotate(0.4deg); }
          66%  { transform: translateX(-10px) translateY(6px) rotate(-0.2deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.75; }
          100% { opacity: 0.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes inputGlow {
          0%   { box-shadow: 0 0 0 0 rgba(180,172,160,0); }
          100% { box-shadow: 0 0 0 3px rgba(180,172,160,0.18); }
        }

        .page-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Jost', sans-serif;
          position: relative;
          overflow: hidden;
          background: #F2F0ED;
        }

        .bg-base {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 120% 100% at 30% 20%, #EAE6E0 0%, #E0DBD4 35%, #D4CEC7 70%, #C8C2BA 100%);
        }

        .bg-silk {
          position: fixed; inset: 0; z-index: 1;
          pointer-events: none;
          animation: silkDrift 28s ease-in-out infinite;
        }

        .bg-vignette {
          position: fixed; inset: 0; z-index: 2;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(150,142,132,0.22) 100%);
        }

        .card {
          position: relative; z-index: 10;
          width: 100%; max-width: 400px;
          margin: 2rem;
          background: linear-gradient(160deg,
            rgba(255,255,253,0.78) 0%,
            rgba(248,245,240,0.82) 50%,
            rgba(238,234,228,0.76) 100%
          );
          border: 1px solid rgba(210,204,196,0.6);
          border-radius: 3px;
          box-shadow:
            0 2px 4px rgba(100,92,82,0.06),
            0 8px 32px rgba(100,92,82,0.10),
            0 32px 80px rgba(100,92,82,0.10),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(180,172,160,0.12);
          backdrop-filter: blur(28px);
          padding: 3.5rem 3rem;
          animation: fadeUp 1.1s cubic-bezier(0.22,1,0.36,1) both;
        }

        .card::before {
          content: '';
          position: absolute;
          top: -1px; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220,215,205,0.9), transparent);
        }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 300;
          color: #4A4440;
          letter-spacing: 0.04em;
          text-align: center;
          margin-bottom: 0.3rem;
          animation: fadeUp 1.1s 0.1s cubic-bezier(0.22,1,0.36,1) both;
        }

        .subtitle {
          font-size: 0.72rem;
          font-weight: 300;
          color: #9A948C;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 2.8rem;
          animation: fadeUp 1.1s 0.18s cubic-bezier(0.22,1,0.36,1) both;
        }

        .divider {
          width: 40px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(170,162,152,0.6), transparent);
          margin: 0 auto 2.8rem;
          animation: fadeUp 1.1s 0.22s cubic-bezier(0.22,1,0.36,1) both;
        }

        .field {
          margin-bottom: 1.4rem;
          animation: fadeUp 1.1s cubic-bezier(0.22,1,0.36,1) both;
        }
        .field:nth-child(1) { animation-delay: 0.26s; }
        .field:nth-child(2) { animation-delay: 0.32s; }

        .field label {
          display: block;
          font-size: 0.65rem;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8A8480;
          margin-bottom: 0.55rem;
        }

        .field input {
          width: 100%;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(195,188,180,0.7);
          border-radius: 2px;
          padding: 0.85rem 1rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          color: #4A4440;
          outline: none;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .field input::placeholder { color: #BEB8B2; }
        .field input:focus {
          border-color: rgba(170,162,152,0.9);
          background: rgba(255,255,255,0.72);
          box-shadow: 0 0 0 3px rgba(180,172,160,0.12);
        }

        .error {
          font-size: 0.75rem;
          color: #A08880;
          text-align: center;
          margin-bottom: 1rem;
          font-style: italic;
          animation: fadeUp 0.4s ease both;
        }

        .btn {
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(160deg, #6B6560 0%, #524E4A 100%);
          border: none;
          border-radius: 2px;
          color: rgba(240,237,232,0.95);
          font-family: 'Jost', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.3s, transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 2px 12px rgba(80,74,68,0.22);
          margin-top: 0.4rem;
          animation: fadeUp 1.1s 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        .btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(80,74,68,0.28);
        }
        .btn:active { transform: translateY(0); }
        .btn:disabled { opacity: 0.5; cursor: default; transform: none; }

        .toggle {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 300;
          color: #9A948C;
          letter-spacing: 0.06em;
          animation: fadeUp 1.1s 0.44s cubic-bezier(0.22,1,0.36,1) both;
        }
        .toggle button {
          background: none; border: none;
          color: #7A7470;
          font-family: 'Jost', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(140,134,128,0.4);
          transition: color 0.2s;
        }
        .toggle button:hover { color: #4A4440; }
      `}</style>

      <div className="page-wrap">
        <div className="bg-base" />

        {/* Silk threads */}
        <div className="bg-silk">
          <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <linearGradient id="silk1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(220,215,205,0)" />
                <stop offset="20%"  stopColor="rgba(220,215,205,0.28)" />
                <stop offset="50%"  stopColor="rgba(235,230,222,0.55)" />
                <stop offset="80%"  stopColor="rgba(220,215,205,0.28)" />
                <stop offset="100%" stopColor="rgba(220,215,205,0)" />
              </linearGradient>
              <linearGradient id="silver1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(200,198,196,0)" />
                <stop offset="25%"  stopColor="rgba(210,208,205,0.35)" />
                <stop offset="50%"  stopColor="rgba(225,223,220,0.65)" />
                <stop offset="75%"  stopColor="rgba(210,208,205,0.35)" />
                <stop offset="100%" stopColor="rgba(200,198,196,0)" />
              </linearGradient>
              <radialGradient id="pool" cx="68%" cy="38%" r="18%">
                <stop offset="0%"   stopColor="rgba(240,238,234,0.7)" />
                <stop offset="40%"  stopColor="rgba(228,224,218,0.28)" />
                <stop offset="100%" stopColor="rgba(220,216,210,0)" />
              </radialGradient>
            </defs>

            <path d="M-100,380 C280,258 560,488 860,362 C1160,236 1320,408 1550,318 L1550,325 C1320,415 1160,243 860,369 C560,495 280,265 -100,387 Z"
              fill="url(#silk1)" style={{ animation: 'shimmer 11s ease-in-out infinite' }} />

            <path d="M-100,382 C280,260 560,490 860,364 C1160,238 1320,410 1550,320 L1550,322 C1320,412 1160,240 860,366 C560,492 280,262 -100,384 Z"
              fill="url(#silver1)" opacity="0.7" style={{ animation: 'shimmer 11s 1s ease-in-out infinite' }} />

            <path d="M-100,440 C220,322 500,538 800,415 C1100,292 1280,460 1550,372 L1550,378 C1280,466 1100,298 800,421 C500,544 220,328 -100,446 Z"
              fill="url(#silk1)" opacity="0.5" style={{ animation: 'shimmer 14s 2s ease-in-out infinite' }} />

            <path d="M-100,320 C260,208 520,418 820,302 C1120,186 1300,348 1550,268 L1550,273 C1300,353 1120,191 820,307 C520,423 260,213 -100,325 Z"
              fill="url(#silver1)" opacity="0.4" style={{ animation: 'shimmer 16s 0.5s ease-in-out infinite' }} />

            <rect x="0" y="0" width="1440" height="900" fill="url(#pool)"
              style={{ animation: 'shimmer 8s ease-in-out infinite' }} />
          </svg>
        </div>

        <div className="bg-vignette" />

        <div className="card">
          <h1 className="title">Dignity Foundation</h1>
          <div className="divider" />
          <p className="subtitle">{isSignUp ? 'create your account' : 'sign in to continue'}</p>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'one moment...' : isSignUp ? 'create account' : 'sign in'}
          </button>

          <div className="toggle">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
              {isSignUp ? 'sign in' : 'sign up'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}