'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../supabase'

export default function Withdraw() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (profile) setBalance(profile.balance_cents)
    }
    load()
  }, [])

  async function handleWithdraw() {
    if (balance < 500) {
      setMessage('You need at least $5.00 to withdraw.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balance, routingNumber, accountNumber })
      })
      const data = await res.json()
      if (data.error) setMessage(data.error)
      else setMessage('Payout requested successfully!')
    } catch (e) {
      setMessage('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const dollars = (balance / 100).toFixed(2)
  const canWithdraw = balance >= 500

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
        <h1 style={{ fontSize: '1.9rem', color: '#3B2A1A', fontWeight: 'normal', marginBottom: '0.5rem' }}>
          Withdraw
        </h1>

        <p style={{ color: '#8A7862', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Your balance: <strong style={{ color: '#B08A10' }}>${dollars}</strong>
        </p>

        {!canWithdraw && (
          <p style={{ color: '#A09078', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '2rem' }}>
            You need at least $5.00 to withdraw.
          </p>
        )}

        {canWithdraw && (
          <>
            <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A7862', marginBottom: '0.4rem' }}>
                Routing Number
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={e => setRoutingNumber(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', border: '1px solid rgba(192,168,105,0.4)',
                  borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.7)', outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A7862', marginBottom: '0.4rem' }}>
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', border: '1px solid rgba(192,168,105,0.4)',
                  borderRadius: '6px', fontFamily: 'Georgia, serif', fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.7)', outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                background: 'linear-gradient(180deg, #4A3520 0%, #3B2A1A 100%)',
                border: 'none', borderRadius: '8px', color: '#E8C84A',
                fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                letterSpacing: '0.06em', cursor: 'pointer'
              }}
            >
              {loading ? 'processing...' : `Withdraw $${dollars}`}
            </button>
          </>
        )}

        {message && (
          <p style={{ marginTop: '1.5rem', color: '#8A7862', fontSize: '0.85rem', fontStyle: 'italic' }}>
            {message}
          </p>
        )}

        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            marginTop: '2rem', background: 'none', border: 'none',
            color: '#A09078', fontSize: '0.8rem', cursor: 'pointer',
            fontFamily: 'Georgia, serif', letterSpacing: '0.06em'
          }}
        >
          ← back to dashboard
        </button>
      </div>
    </div>
  )
}