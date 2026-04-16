'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../supabase'

export default function Friends() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'notify' | 'buddy_check' | 'present'>('notify')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
    }
    load()
  }, [])

  async function handleSend() {
    if (!email) { setError('Please enter an email address.'); return }
    setLoading(true); setError('')
    const supabase = createClient()

    const { data: friend } = await supabase
      .from('profiles').select('id').eq('email', email).single()

    if (!friend) {
      setError("We couldn't find that person. Are they on the app?")
      setLoading(false); return
    }

    const messages = {
      notify: 'Someone is thinking of you. Check in when you can.',
      buddy_check: 'Someone is requesting a buddy check. Are you okay?',
      present: 'Present and accounted — your person is okay.'
    }

    await supabase.from('notifications').insert({
      user_id: friend.id,
      from_user_id: user.id,
      type,
      message: messages[type],
      read: false
    })

    setSent(true); setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Georgia, serif',
      background: 'linear-gradient(160deg, #F2F0ED 0%, #E0DBD4 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,253,0.88)', borderRadius: '16px',
        border: '1px solid rgba(192,168,105,0.32)',
        boxShadow: '0 8px 48px rgba(100,88,55,0.14)',
        padding: '3rem', width: '100%', maxWidth: '420px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.9rem', color: '#3B2A1A', fontWeight: 'normal', marginBottom: '0.2rem' }}>
          Check on Friends
        </h1>
        <p style={{ color: '#B08A10', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
          Dignity Foundation
        </p>

        {sent ? (
          <div>
            <p style={{ fontSize: '1.2rem', color: '#3B2A1A', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Sent. Someone knows you're thinking of them.
            </p>
            <button onClick={() => { setSent(false); setEmail(''); setMessage('') }} style={{
              background: 'none', border: 'none', color: '#B08A10',
              fontFamily: 'Georgia, serif', fontSize: '0.8rem',
              letterSpacing: '0.06em', cursor: 'pointer'
            }}>
              send another
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              {(['notify', 'buddy_check', 'present'] as const).map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  display: 'block', width: '100%', padding: '0.9rem',
                  marginBottom: '0.75rem', fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem', letterSpacing: '0.04em',
                  cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s',
                  background: type === t
                    ? 'linear-gradient(180deg, #4A3520 0%, #3B2A1A 100%)'
                    : 'rgba(255,255,255,0.6)',
                  color: type === t ? '#E8C84A' : '#8A7862',
                  border: type === t
                    ? '1px solid rgba(192,168,105,0.4)'
                    : '1px solid rgba(192,168,105,0.25)',
                }}>
                  {t === 'notify' && 'Notify a friend'}
                  {t === 'buddy_check' && 'Request a buddy check'}
                  {t === 'present' && 'Present and accounted'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#8A7862', marginBottom: '0.4rem'
              }}>
                Their email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="friend@example.com"
                style={{
                  width: '100%', padding: '0.8rem',
                  border: '1px solid rgba(192,168,105,0.4)',
                  borderRadius: '6px', fontFamily: 'Georgia, serif',
                  fontSize: '0.9rem', background: 'rgba(255,255,255,0.7)',
                  outline: 'none', color: '#3B2A1A'
                }}
              />
            </div>

            {error && <p style={{ color: '#A08880', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}

            <button onClick={handleSend} disabled={loading} style={{
              width: '100%', padding: '1rem',
              background: 'linear-gradient(180deg, #4A3520 0%, #3B2A1A 100%)',
              border: 'none', borderRadius: '8px', color: '#E8C84A',
              fontFamily: 'Georgia, serif', fontSize: '0.85rem',
              letterSpacing: '0.06em', cursor: 'pointer', marginBottom: '1rem'
            }}>
              {loading ? 'sending...' : 'send'}
            </button>
          </>
        )}

        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(192,168,105,0.35), transparent)',
          margin: '1rem 0'
        }} />

        <button onClick={() => window.location.href = '/dashboard'} style={{
          background: 'none', border: 'none', color: '#A09078',
          fontFamily: 'Georgia, serif', fontSize: '0.8rem',
          letterSpacing: '0.06em', cursor: 'pointer'
        }}>
          ← back
        </button>
      </div>
    </div>
  )
}