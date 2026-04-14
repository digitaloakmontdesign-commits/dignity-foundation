'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../../supabase'

const MESSAGES = [
  "Yes. You are here. And that's what matters most.",
  "You showed up; that's more than most.",
  "Remember, pride is not the opposite of shame, but its source.",
  "Do today what others will not do, so tomorrow you can do what others can't.",
  "Peace begins when you stop fighting with yourself.",
  "Presence is the first act of courage.",
  "Do, or do not. There is no try.",
  "Because you chose to.",
  "100% a week does not mean 100% each day. Spread out your efforts.",
  "Breathe. You are safe.",
  "You don't have to forget, but you do need to let go of what you can't change.",
  "YOLO is the greatest lie. Rather, you live 365 days a year.",
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false)
  const [holding, setHolding] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [whiteOpacity, setWhiteOpacity] = useState(0)
  const [showWhiteScreen, setShowWhiteScreen] = useState(false)
  const [whiteFadingOut, setWhiteFadingOut] = useState(false)
  const [whiteMessage, setWhiteMessage] = useState('')
  const [bulletAngle, setBulletAngle] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdLabel, setHoldLabel] = useState("I'm here.")
  const [showBullet, setShowBullet] = useState(false)
  const [circleWhite, setCircleWhite] = useState(0)

  const animFrame = useRef<any>(null)
  const holdStart = useRef<number>(0)
  const audioCtx = useRef<AudioContext | null>(null)
  const whooshBuffer = useRef<AudioBuffer | null>(null)
  const chachingBuffer = useRef<AudioBuffer | null>(null)
  const lastWhooshTime = useRef<number>(0)
  const audioReady = useRef<boolean>(false)
  const HOLD_DURATION = 10000

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setBalance(profile.balance_cents)
        if (profile.last_checkin_at) {
          const diff = (Date.now() - new Date(profile.last_checkin_at).getTime()) / 36e5
          if (diff < 24) setAlreadyCheckedIn(true)
        }
      }
    }
    load()
  }, [])

  function getAudioCtx() {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtx.current
  }

  async function loadSounds() {
    if (audioReady.current) return
    try {
      const ctx = getAudioCtx()
      const [whooshRes, chachingRes] = await Promise.all([
        fetch('/woosh.mp3'), fetch('/cha-ching.wav'),
      ])
      const [whooshArr, chachingArr] = await Promise.all([
        whooshRes.arrayBuffer(), chachingRes.arrayBuffer(),
      ])
      const [wb, cb] = await Promise.all([
        ctx.decodeAudioData(whooshArr), ctx.decodeAudioData(chachingArr),
      ])
      whooshBuffer.current = wb
      chachingBuffer.current = cb
      audioReady.current = true
    } catch (e) { console.log('Audio load error:', e) }
  }

  function playWhoosh(progress: number) {
    if (!whooshBuffer.current || !audioCtx.current) return
    const interval = 900 - progress * progress * 820
    if (Date.now() - lastWhooshTime.current < interval) return
    lastWhooshTime.current = Date.now()
    const ctx = audioCtx.current
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = whooshBuffer.current
    source.playbackRate.value = 0.6 + progress * progress * 2.4
    gain.gain.value = 0.25 + progress * 0.5
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    setTimeout(() => { try { source.stop() } catch (e) {} },
      Math.max(80, 400 - progress * 320))
  }

  function playChaChingSound() {
    if (!chachingBuffer.current || !audioCtx.current) return
    const ctx = audioCtx.current
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = chachingBuffer.current
    gain.gain.value = 0.8
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  }

  function animate() {
    const elapsed = Date.now() - holdStart.current
    const t = Math.min(elapsed / HOLD_DURATION, 1)
    setHoldProgress(t)
    const speed = 80 + t * t * t * 4000
    setBulletAngle(prev => (prev + speed / 60) % 360)
    const white = t > 0.88 ? (t - 0.88) / 0.12 : 0
    setCircleWhite(white)
    playWhoosh(t)
    if (elapsed < 300) setHoldLabel("I'm here.")
    else if (elapsed < 3000) setHoldLabel("breathe in...")
    else if (t < 0.88) setHoldLabel("breathe out...")
    else setHoldLabel("")
    if (t < 1) { animFrame.current = requestAnimationFrame(animate) }
    else completeCheckin()
  }

  async function startHold() {
    if (alreadyCheckedIn || completing) return
    await loadSounds()
    lastWhooshTime.current = 0
    setHolding(true); setShowBullet(true); setCircleWhite(0)
    setBulletAngle(0); setHoldProgress(0); setHoldLabel("I'm here.")
    holdStart.current = Date.now()
    animFrame.current = requestAnimationFrame(animate)
  }

  function cancelHold() {
    if (completing) return
    cancelAnimationFrame(animFrame.current)
    setHolding(false); setShowBullet(false); setCircleWhite(0)
    setBulletAngle(0); setHoldProgress(0); setHoldLabel("I'm here.")
  }

  async function completeCheckin() {
    setCompleting(true); setHolding(false)
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    const newBalance = (profile?.balance_cents || 0) + 10
    await supabase.from('profiles').upsert({
      id: user.id, balance_cents: newBalance,
      last_checkin_at: new Date().toISOString()
    })
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    setWhiteMessage(msg)
    setShowWhiteScreen(true); setWhiteOpacity(0); setWhiteFadingOut(false)
    await new Promise(r => setTimeout(r, 50))
    setWhiteOpacity(1)
    setTimeout(() => {
      setBalance(newBalance); setShowBullet(false)
      setCircleWhite(0); setHoldProgress(0)
    }, 1500)
    setTimeout(() => { setWhiteFadingOut(true); setWhiteOpacity(0) }, 7000)
    setTimeout(() => {
      setShowWhiteScreen(false); setWhiteFadingOut(false)
      setCompleting(false); setAlreadyCheckedIn(true)
      setBulletAngle(0); playChaChingSound()
    }, 9500)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const dollars = (balance / 100).toFixed(2)
  const R = 70; const cx = 80; const cy = 80
  const angleRad = (bulletAngle - 90) * (Math.PI / 180)
  const bulletX = cx + R * Math.cos(angleRad)
  const bulletY = cy + R * Math.sin(angleRad)
  const trailLength = 40 + holdProgress * holdProgress * 340
  const trailCount = 56
  const trailPoints = Array.from({ length: trailCount }, (_, i) => {
    const trailAngle = (bulletAngle - 90 - (trailLength * (i / trailCount))) * (Math.PI / 180)
    const fade = 1 - i / trailCount
    const opacity = fade * (0.3 + holdProgress * 0.7)
    const r = Math.round(200 + holdProgress * 55)
    const g = Math.round(160 + holdProgress * 95)
    const b = Math.round(40 + holdProgress * 215)
    return {
      x: cx + R * Math.cos(trailAngle),
      y: cy + R * Math.sin(trailAngle),
      opacity, r: Math.max(0.3, 5 - i * 0.07),
      color: `rgba(${r},${g},${b},${opacity})`
    }
  })

  const buttonLabel = completing ? ''
    : alreadyCheckedIn ? 'see you\ntomorrow'
    : holding ? holdLabel : "I'm here."

  const bulletR = Math.round(220 + holdProgress * 35)
  const bulletG = Math.round(180 + holdProgress * 75)
  const bulletB = Math.round(50 + holdProgress * 205)
  const bulletColor = `rgb(${bulletR},${bulletG},${bulletB})`

  return (
    <>
      {showWhiteScreen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, opacity: whiteOpacity,
          transition: whiteFadingOut ? 'opacity 2.5s ease' : 'opacity 1.5s ease',
          padding: '2.5rem', textAlign: 'center',
          pointerEvents: whiteOpacity > 0.5 ? 'all' : 'none'
        }}>
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#3B2A1A',
            lineHeight: '1.9', maxWidth: '340px', fontStyle: 'italic',
            opacity: whiteOpacity > 0.95 ? 1 : 0, transition: 'opacity 1.2s ease'
          }}>{whiteMessage}</p>
        </div>
      )}

      <style>{`
        @keyframes threadDrift {
          0%   { transform: translateX(0px) translateY(0px); }
          33%  { transform: translateX(16px) translateY(-9px); }
          66%  { transform: translateX(-9px) translateY(5px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes rayPulse {
          0%   { opacity: 0.5; }
          50%  { opacity: 0.82; }
          100% { opacity: 0.5; }
        }
        @keyframes galaxyPulse {
          0%   { opacity: 0.72; transform: scale(1); }
          50%  { opacity: 1; transform: scale(1.09); }
          100% { opacity: 0.72; transform: scale(1); }
        }
        @keyframes pulseGold {
          0%   { box-shadow: 0 0 10px rgba(190,165,95,0.4); }
          50%  { box-shadow: 0 0 40px rgba(190,165,95,0.9); }
          100% { box-shadow: 0 0 10px rgba(190,165,95,0.4); }
        }
        @keyframes pulseWhite {
          0%   { box-shadow: 0 0 12px rgba(255,255,255,0.5); }
          50%  { box-shadow: 0 0 45px rgba(255,255,255,1); }
          100% { box-shadow: 0 0 12px rgba(255,255,255,0.5); }
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
        backgroundImage: 'url(/bg-waves.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }} />

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
        animation: 'rayPulse 9s ease-in-out infinite'
      }}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="sunRays" cx="35%" cy="5%" r="70%">
              <stop offset="0%"   stopColor="rgba(255,255,252,0.45)" />
              <stop offset="28%"  stopColor="rgba(252,250,242,0.15)" />
              <stop offset="65%"  stopColor="rgba(245,240,225,0.04)" />
              <stop offset="100%" stopColor="rgba(245,240,225,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1440" height="900" fill="url(#sunRays)" />
          {[
            { d: "M505,0 L148,900 L172,900 Z", o: 0.018 },
            { d: "M505,0 L258,900 L280,900 Z", o: 0.014 },
            { d: "M505,0 L378,900 L398,900 Z", o: 0.012 },
            { d: "M505,0 L498,900 L516,900 Z", o: 0.01 },
            { d: "M505,0 L608,900 L626,900 Z", o: 0.008 },
            { d: "M505,0 L718,900 L734,900 Z", o: 0.006 },
          ].map((ray, i) => (
            <path key={i} d={ray.d} fill={`rgba(255,255,248,${ray.o})`} />
          ))}
        </svg>
      </div>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
        animation: 'threadDrift 24s ease-in-out infinite'
      }}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="gt1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(192,168,100,0)" />
              <stop offset="15%"  stopColor="rgba(192,168,100,0.22)" />
              <stop offset="50%"  stopColor="rgba(205,182,112,0.42)" />
              <stop offset="85%"  stopColor="rgba(192,168,100,0.22)" />
              <stop offset="100%" stopColor="rgba(192,168,100,0)" />
            </linearGradient>
            <linearGradient id="wt1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(255,255,250,0)" />
              <stop offset="20%"  stopColor="rgba(255,255,250,0.28)" />
              <stop offset="50%"  stopColor="rgba(255,255,255,0.7)" />
              <stop offset="80%"  stopColor="rgba(255,255,250,0.28)" />
              <stop offset="100%" stopColor="rgba(255,255,250,0)" />
            </linearGradient>
            <radialGradient id="galaxy" cx="34%" cy="52%" r="12%">
              <stop offset="0%"   stopColor="rgba(255,255,248,1)" />
              <stop offset="18%"  stopColor="rgba(255,252,235,0.8)" />
              <stop offset="45%"  stopColor="rgba(245,235,195,0.32)" />
              <stop offset="75%"  stopColor="rgba(232,218,168,0.1)" />
              <stop offset="100%" stopColor="rgba(232,218,168,0)" />
            </radialGradient>
          </defs>

          <path
            d="M-100,455 C228,328 448,542 748,415 C1048,288 1248,462 1550,365 L1550,370 C1248,467 1048,293 748,420 C448,547 228,333 -100,460 Z"
            fill="url(#gt1)" />
          <path
            d="M-100,456.5 C228,329.5 448,543.5 748,416.5 C1048,289.5 1248,463.5 1550,366.5 L1550,368 C1248,465 1048,291 748,418 C448,545 228,331 -100,458 Z"
            fill="url(#wt1)" opacity="0.72" />
          <path
            d="M-100,415 C208,295 428,498 728,375 C1028,252 1228,422 1550,328 L1550,334 C1228,428 1028,258 728,381 C428,504 208,301 -100,421 Z"
            fill="url(#gt1)" opacity="0.55" />
          <path
            d="M-100,416 C208,296 428,499 728,376 C1028,253 1228,423 1550,329 L1550,331 C1228,425 1028,255 728,378 C428,501 208,298 -100,418 Z"
            fill="url(#wt1)" opacity="0.4" />
          <path
            d="M-100,498 C188,368 408,578 708,452 C1008,326 1208,498 1550,402 L1550,406 C1208,502 1008,330 708,456 C408,582 188,372 -100,502 Z"
            fill="url(#gt1)" opacity="0.38" />
          <path
            d="M-100,499 C188,369 408,579 708,453 C1008,327 1208,499 1550,403 L1550,404.5 C1208,500.5 1008,328.5 708,454.5 C408,580.5 188,370.5 -100,500.5 Z"
            fill="url(#wt1)" opacity="0.25" />

          <rect x="0" y="0" width="1440" height="900" fill="url(#galaxy)"
            style={{ animation: 'galaxyPulse 7s ease-in-out infinite', transformOrigin: '34% 52%' }} />
          <ellipse cx="488" cy="468" rx="28" ry="4"
            fill="rgba(255,254,242,0.68)" transform="rotate(-10,488,468)" />
          <ellipse cx="488" cy="467" rx="9" ry="1.5"
            fill="rgba(255,255,255,0.88)" transform="rotate(-10,488,467)" />
        </svg>
      </div>

      <div style={{
        minHeight: '100vh', fontFamily: 'Georgia, serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 2
      }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,253,0.82) 0%, rgba(250,247,238,0.88) 60%, rgba(242,236,220,0.82) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(192,168,105,0.32)',
          boxShadow: `
            0 8px 48px rgba(100,88,55,0.14),
            0 2px 12px rgba(100,88,55,0.09),
            inset 0 1px 0 rgba(255,255,255,0.96),
            inset 0 -1px 0 rgba(192,168,105,0.09)
          `,
          backdropFilter: 'blur(22px)',
          padding: '3rem', width: '100%', maxWidth: '420px', textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '1.9rem', marginBottom: '0.2rem', color: '#3B2A1A',
            letterSpacing: '0.02em', fontWeight: 'normal'
          }}>Dignity Foundation</h1>

          <p style={{
            color: '#8A7862', fontSize: '0.85rem',
            marginBottom: '2.5rem', letterSpacing: '0.03em'
          }}>{user?.email}</p>

          <div style={{
            background: 'linear-gradient(135deg, rgba(252,249,240,0.88) 0%, rgba(242,234,214,0.88) 100%)',
            borderRadius: '10px', border: '1px solid rgba(192,168,105,0.28)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.7)',
            padding: '1.5rem', marginBottom: '2.5rem'
          }}>
            <p style={{
              color: '#8A7862', fontSize: '0.78rem', marginBottom: '0.4rem',
              letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>Your Balance</p>
            <p style={{
              fontSize: '2.8rem', margin: 0, color: '#B08A10',
              transition: 'all 0.5s ease'
            }}>${dollars}</p>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', marginBottom: '1.5rem'
          }}>
            <div
              onMouseDown={startHold} onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={(e) => { e.preventDefault(); startHold() }}
              onTouchEnd={cancelHold}
              style={{
                position: 'relative', width: '160px', height: '160px',
                cursor: alreadyCheckedIn && !completing ? 'default' : 'pointer',
                userSelect: 'none', WebkitUserSelect: 'none'
              }}
            >
              <svg width="160" height="160" style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="80" cy="80" r="70" fill="none"
                  stroke="rgba(192,168,105,0.22)" strokeWidth="1.5" />
                {circleWhite > 0 && (
                  <circle cx="80" cy="80" r="69"
                    fill={`rgba(255,255,255,${circleWhite})`} />
                )}
                {showBullet && trailPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.color} />
                ))}
                {showBullet && (
                  <>
                    <circle cx={bulletX} cy={bulletY}
                      r={9 + holdProgress * 4}
                      fill={holdProgress > 0.85 ? 'white' : bulletColor}
                      style={{
                        filter: holdProgress > 0.8
                          ? 'drop-shadow(0 0 16px rgba(255,255,255,1)) drop-shadow(0 0 32px rgba(255,255,255,0.9))'
                          : 'drop-shadow(0 0 12px rgba(192,168,105,1)) drop-shadow(0 0 24px rgba(220,195,120,0.8))'
                      }} />
                    <circle cx={bulletX} cy={bulletY} r="4"
                      fill={holdProgress > 0.8 ? 'white' : 'rgba(255,248,200,0.9)'} />
                  </>
                )}
              </svg>

              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                width: '136px', height: '136px', borderRadius: '50%',
                background: completing && circleWhite > 0.5
                  ? `rgba(255,255,255,${circleWhite})`
                  : alreadyCheckedIn && !completing
                  ? 'linear-gradient(180deg, #8A7862 0%, #6E5E4A 100%)'
                  : 'linear-gradient(180deg, #4A3520 0%, #3B2A1A 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: holding && holdProgress > 0.5 && holdProgress < 0.85
                  ? 'pulseGold 0.55s ease-in-out infinite'
                  : holding && holdProgress >= 0.85
                  ? 'pulseWhite 0.3s ease-in-out infinite' : 'none',
                boxShadow: holding
                  ? '0 0 22px rgba(192,168,105,0.38)' : '0 4px 16px rgba(0,0,0,0.18)',
                transition: 'box-shadow 0.3s'
              }}>
                <span style={{
                  color: circleWhite > 0.3 ? 'transparent'
                    : alreadyCheckedIn && !completing ? '#C0A882' : '#E8C84A',
                  fontSize: '0.95rem', letterSpacing: '0.06em',
                  fontFamily: 'Georgia, serif', textAlign: 'center',
                  lineHeight: '1.5', whiteSpace: 'pre-line',
                  fontStyle: holding ? 'italic' : 'normal',
                  transition: 'color 0.4s ease'
                }}>
                  {buttonLabel}
                </span>
              </div>
            </div>

            <p style={{
              color: '#A09078', fontSize: '0.78rem', marginTop: '1.25rem',
              letterSpacing: '0.05em', fontStyle: 'italic', minHeight: '1.2rem'
            }}>
              {alreadyCheckedIn && !completing ? 'You checked in today.' : ''}
            </p>
          </div>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(192,168,105,0.35), transparent)',
            margin: '1rem 0'
          }} />

          <button onClick={() => window.location.href = '/withdraw'} style={{
            background: 'none', border: 'none', color: '#B08A10',
            fontSize: '0.8rem', cursor: 'pointer',
            letterSpacing: '0.06em', fontFamily: 'Georgia, serif',
            marginBottom: '0.5rem', display: 'block', width: '100%'
          }}>
            withdraw
          </button>

          <button onClick={handleSignOut} style={{
            background: 'none', border: 'none', color: '#A09078',
            fontSize: '0.8rem', cursor: 'pointer',
            letterSpacing: '0.06em', fontFamily: 'Georgia, serif'
          }}>
            sign out
          </button>
        </div>
      </div>
    </>
  )
}
