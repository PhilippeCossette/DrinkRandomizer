import { SOUNDS, SOUNDS_ENABLED, SOUND_VOLUME } from './config'

// All the app's sounds, made with the Web Audio API (no audio files needed).
//
// - Turn them on/off for good in lib/config.ts (SOUNDS_ENABLED, SOUNDS, SOUND_VOLUME).
// - The mute button in the menu turns everything off/on at runtime (remembered
//   in the browser, so it stays muted after a refresh).
//
// Browsers block sound until someone has clicked or pressed a key on the page.
// unlockSounds() waits for that first click, so on the bar screen:
// load the page, click anywhere once, and the sounds will play from then on.

type AlertKind = 'drink' | 'shot'

const MUTE_KEY = 'soundMuted' // localStorage key for the mute button

let ctx: AudioContext | null = null // the page's audio context, created on first use
let bus: GainNode | null = null // every live sound goes through here (mute = gain 0)
let muted = readMuted()

// ---------------------------------------------------------------------------
// Mute

function readMuted() {
  try {
    return (
      typeof window !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1'
    )
  } catch {
    return false // storage blocked (private mode...): start unmuted
  }
}

export function isMuted() {
  return muted
}

// Mutes/unmutes right away, including a sound that is already playing
export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // storage blocked: the mute still works until the page reloads
  }
  if (ctx && bus) bus.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02)
}

// ---------------------------------------------------------------------------
// Audio context

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    ctx = new AudioContext()
    bus = ctx.createGain()
    bus.gain.value = muted ? 0 : 1
    bus.connect(ctx.destination)
  }
  return ctx
}

// Live context, only if this sound is allowed right now
function liveContext(sound: keyof typeof SOUNDS) {
  if (!SOUNDS_ENABLED || !SOUNDS[sound] || muted) return null
  const ac = getContext()
  return ac && ac.state === 'running' ? ac : null
}

// Call once when the page loads (returns a cleanup function)
export function unlockSounds() {
  if (typeof window === 'undefined') return () => {}
  const unlock = () => {
    void getContext()?.resume()
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
  return () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
}

// ---------------------------------------------------------------------------
// Building blocks

// Volume node for one sound, plugged into the mute bus (or the speakers directly
// when rendering offline)
function output(ac: BaseAudioContext, volume: number) {
  const master = ac.createGain()
  master.gain.value = volume
  master.connect(ac === ctx && bus ? bus : ac.destination)
  return master
}

// One note with a bell-like fade (quick attack, then decays)
function note(
  ac: BaseAudioContext,
  out: AudioNode,
  start: number,
  hz: number,
  length: number,
  type: OscillatorType = 'sine',
  level = 1,
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = hz
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(out)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

// Low explosion: a falling sub tone + a burst of filtered noise
function boom(ac: BaseAudioContext, out: AudioNode, t: number) {
  // sub drop 110 Hz -> 35 Hz
  const sub = ac.createOscillator()
  const subGain = ac.createGain()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(110, t)
  sub.frequency.exponentialRampToValueAtTime(35, t + 1.2)
  subGain.gain.setValueAtTime(0.0001, t)
  subGain.gain.exponentialRampToValueAtTime(1, t + 0.02)
  subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
  sub.connect(subGain).connect(out)
  sub.start(t)
  sub.stop(t + 1.5)

  // rumble: white noise through a closing low-pass filter
  const length = 1.6
  const buffer = ac.createBuffer(
    1,
    Math.floor(ac.sampleRate * length),
    ac.sampleRate,
  )
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(900, t)
  filter.frequency.exponentialRampToValueAtTime(80, t + length)
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.0001, t)
  noiseGain.gain.exponentialRampToValueAtTime(0.9, t + 0.03)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  noise.connect(filter).connect(noiseGain).connect(out)
  noise.start(t)
  noise.stop(t + length)
}

// Air-raid siren: two slightly detuned saws gliding 220 Hz -> 880 Hz and back
function siren(ac: BaseAudioContext, out: AudioNode, t: number, wails: number) {
  const up = 1.1 // seconds to rise
  const down = 1.3 // seconds to fall
  const end = t + wails * (up + down)

  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2600 // takes the harsh edge off the saw waves
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.25)
  gain.gain.setValueAtTime(0.5, end - 0.5)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  filter.connect(gain).connect(out)

  for (const detune of [-8, 8]) {
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.detune.value = detune
    osc.frequency.setValueAtTime(220, t)
    for (let i = 0; i < wails; i++) {
      const s = t + i * (up + down)
      osc.frequency.linearRampToValueAtTime(880, s + up)
      osc.frequency.linearRampToValueAtTime(220, s + up + down)
    }
    // slight wobble, like a real mechanical siren
    const lfo = ac.createOscillator()
    const lfoGain = ac.createGain()
    lfo.frequency.value = 6
    lfoGain.gain.value = 12 // cents
    lfo.connect(lfoGain).connect(osc.detune)
    lfo.start(t)
    lfo.stop(end)

    osc.connect(filter)
    osc.start(t)
    osc.stop(end + 0.05)
  }
}

// White noise buffer (for rumbles and impacts)
function noiseBuffer(ac: BaseAudioContext, seconds: number) {
  const buffer = ac.createBuffer(
    1,
    Math.floor(ac.sampleRate * seconds),
    ac.sampleRate,
  )
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

// Rising rumble: filtered noise that opens up and gets louder (tension build-up)
function rumble(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, length)
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(80, t)
  filter.frequency.exponentialRampToValueAtTime(900, t + length)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.7, t + length)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.08)
  noise.connect(filter).connect(gain).connect(out)
  noise.start(t)
  noise.stop(t + length + 0.1)
}

// Short cinematic impact: punchy sub drop + a burst of noise
function hit(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  strength: number,
) {
  const sub = ac.createOscillator()
  const subGain = ac.createGain()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(95, t)
  sub.frequency.exponentialRampToValueAtTime(38, t + 0.5)
  subGain.gain.setValueAtTime(0.0001, t)
  subGain.gain.exponentialRampToValueAtTime(strength, t + 0.01)
  subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
  sub.connect(subGain).connect(out)
  sub.start(t)
  sub.stop(t + 0.75)

  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.45)
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2200, t)
  filter.frequency.exponentialRampToValueAtTime(120, t + 0.4)
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.0001, t)
  noiseGain.gain.exponentialRampToValueAtTime(strength * 0.6, t + 0.005)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
  noise.connect(filter).connect(noiseGain).connect(out)
  noise.start(t)
  noise.stop(t + 0.45)
}

// Low, dark drone under the whole scene, sinking in pitch
function drone(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.6)
  gain.gain.setValueAtTime(0.35, t + length - 1)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  filter.connect(gain).connect(out)
  for (const [hz, detune] of [
    [55, -6],
    [55, 6],
    [82.5, 0],
  ]) {
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.detune.value = detune
    osc.frequency.setValueAtTime(hz, t)
    osc.frequency.exponentialRampToValueAtTime(hz * 0.75, t + length)
    osc.connect(filter)
    osc.start(t)
    osc.stop(t + length + 0.05)
  }
}

// One long falling wail, like a bomb dropping / the market in free fall
function fallingWail(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2400
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.32, t + 0.3)
  gain.gain.setValueAtTime(0.32, t + length * 0.7)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  filter.connect(gain).connect(out)
  for (const detune of [-10, 10]) {
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.detune.value = detune
    osc.frequency.setValueAtTime(950, t)
    osc.frequency.exponentialRampToValueAtTime(110, t + length)
    // wobble, like a real siren
    const lfo = ac.createOscillator()
    const lfoGain = ac.createGain()
    lfo.frequency.value = 5.5
    lfoGain.gain.value = 14 // cents
    lfo.connect(lfoGain).connect(osc.detune)
    lfo.start(t)
    lfo.stop(t + length)
    osc.connect(filter)
    osc.start(t)
    osc.stop(t + length + 0.05)
  }
}

// Stock exchange closing bell: a bright metallic strike that rings out
function bell(ac: BaseAudioContext, out: AudioNode, t: number) {
  const base = 740
  // bell partials (not whole multiples, that's what makes it sound like metal)
  const partials: [number, number, number][] = [
    [1, 0.5, 2.2],
    [2.02, 0.28, 1.6],
    [2.76, 0.2, 1.2],
    [5.4, 0.1, 0.7],
    [8.93, 0.05, 0.4],
  ]
  for (const [ratio, level, length] of partials) {
    note(ac, out, t, base * ratio, length, 'sine', level)
  }
}

// Rising whoosh: filtered noise sweeping up (the opposite of the rumble)
function whooshUp(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, length)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(200, t)
  filter.frequency.exponentialRampToValueAtTime(3200, t + length)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.5, t + length * 0.9)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.1)
  noise.connect(filter).connect(gain).connect(out)
  noise.start(t)
  noise.stop(t + length + 0.15)
}

// Warm major chord that opens up (filter sweep), holds, then fades
function chordSwell(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(350, t)
  filter.frequency.exponentialRampToValueAtTime(3200, t + 1.6)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.28, t + 0.8)
  gain.gain.setValueAtTime(0.28, t + length - 1.2)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  filter.connect(gain).connect(out)
  // C major, spread wide: C3 G3 C4 E4 G4
  for (const hz of [130.8, 196, 261.6, 329.6, 392]) {
    for (const detune of [-5, 5]) {
      const osc = ac.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = hz
      osc.detune.value = detune
      osc.connect(filter)
      osc.start(t)
      osc.stop(t + length + 0.05)
    }
  }
}

// Tone gliding up (the opposite of the falling siren), soft
function risingTone(
  ac: BaseAudioContext,
  out: AudioNode,
  t: number,
  length: number,
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(220, t)
  osc.frequency.exponentialRampToValueAtTime(880, t + length)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.2)
  gain.gain.setValueAtTime(0.22, t + length * 0.8)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(gain).connect(out)
  osc.start(t)
  osc.stop(t + length + 0.05)
}

// ---------------------------------------------------------------------------
// The sounds (work with any audio context: live, or offline to export a file)

// Alert: nuke / air-raid style. A deep boom, then a siren that wails up and down
// (2 wails for a drink, 1 for a shot).
function scheduleAlert(
  ac: BaseAudioContext,
  kind: AlertKind,
  volume = SOUND_VOLUME,
) {
  const out = output(ac, volume * 0.85)
  const t = ac.currentTime + 0.02
  boom(ac, out, t)
  siren(ac, out, t + 0.35, kind === 'drink' ? 2 : 1)
}

// Spin: one short "tick" each time a card passes the marker
function scheduleTick(ac: BaseAudioContext, volume = SOUND_VOLUME) {
  const out = output(ac, volume * 0.35)
  note(ac, out, ac.currentTime, 2200, 0.035, 'triangle')
  note(ac, out, ac.currentTime, 900, 0.03, 'square', 0.25) // body of the click
}

// Select: bright rising "win" arpeggio when the reel stops
function scheduleSelect(ac: BaseAudioContext, volume = SOUND_VOLUME) {
  const out = output(ac, volume * 0.4)
  const t = ac.currentTime + 0.02
  const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
  notes.forEach((hz, i) => note(ac, out, t + i * 0.08, hz, 0.25, 'triangle'))
  note(ac, out, t + 0.32, 1047, 0.9, 'sine') // held last note
  note(ac, out, t + 0.32, 1568, 0.7, 'sine', 0.3) // G6 shimmer
}

// La Grande Dépression, timed to its intro animation:
// rumble while the panels rise, a huge boom when they close, one impact per
// title word, a falling siren over a dark drone while the market collapses,
// and the stock exchange closing bell to finish.
function scheduleDepression(
  ac: BaseAudioContext,
  coverSeconds = 0.9, // how long the panels take to cover the screen
  volume = SOUND_VOLUME,
) {
  const out = output(ac, volume * 0.8)
  const t = ac.currentTime + 0.02
  const reveal = t + coverSeconds // the panels have closed, the title sequence starts

  rumble(ac, out, t, coverSeconds)
  boom(ac, out, reveal)
  drone(ac, out, reveal, 5.2)
  hit(ac, out, reveal + 0.55, 0.9) // "LA GRANDE"
  hit(ac, out, reveal + 1.05, 1) // "DÉPRESSION"
  fallingWail(ac, out, reveal + 1.3, 2.6)
  bell(ac, out, reveal + 3.5)
  bell(ac, out, reveal + 4.0)
  bell(ac, out, reveal + 4.5)
}

// End of La Grande Dépression, timed to its outro animation: the market
// recovers. A whoosh up while the panels rise, a soft hit, a major chord that
// opens up, a rising tone and a bright arpeggio, then one bell.
function scheduleRecovery(
  ac: BaseAudioContext,
  coverSeconds = 0.9, // how long the panels take to cover the screen
  volume = SOUND_VOLUME,
) {
  const out = output(ac, volume * 0.72)
  const t = ac.currentTime + 0.02
  const reveal = t + coverSeconds // the panels have closed, the outro starts

  whooshUp(ac, out, t, coverSeconds)
  hit(ac, out, reveal, 0.45)
  chordSwell(ac, out, reveal + 0.2, 3.8)
  note(ac, out, reveal + 0.35, 523, 0.5, 'triangle', 0.5) // "LE MARCHÉ"
  note(ac, out, reveal + 0.85, 659, 0.6, 'triangle', 0.5) // "SE RELÈVE"
  risingTone(ac, out, reveal + 1.3, 1.6)
  const arpeggio = [523, 659, 784, 1047, 1319] // C5 E5 G5 C6 E6
  arpeggio.forEach((hz, i) =>
    note(ac, out, reveal + 2.9 + i * 0.07, hz, 0.4, 'triangle', 0.35),
  )
  bell(ac, out, reveal + 3.3)
}

// ---------------------------------------------------------------------------
// Play now (silently does nothing if sound is off, muted, or the page wasn't clicked yet)

export function playAlert(kind: AlertKind) {
  const ac = liveContext('alert')
  if (ac) scheduleAlert(ac, kind)
}

let lastTick = 0
export function playTick() {
  const ac = liveContext('spin')
  if (!ac) return
  // at full speed several cards pass per frame: keep ticks at least 35ms apart
  if (ac.currentTime - lastTick < 0.035) return
  lastTick = ac.currentTime
  scheduleTick(ac)
}

export function playSelect() {
  const ac = liveContext('select')
  if (ac) scheduleSelect(ac)
}

// coverSeconds: how long the intro panels take to cover the screen
export function playDepression(coverSeconds: number) {
  const ac = liveContext('depression')
  if (ac) scheduleDepression(ac, coverSeconds)
}

// coverSeconds: how long the outro panels take to cover the screen
export function playRecovery(coverSeconds: number) {
  const ac = liveContext('depression')
  if (ac) scheduleRecovery(ac, coverSeconds)
}
