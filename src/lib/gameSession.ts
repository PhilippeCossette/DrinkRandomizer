// The "session" (one night of Crash boursier) as saved in localStorage.
// The home screen reads it to offer "Reprendre la session", and clears it for
// "Nouvelle session". Each part of the game keeps its own key:
//   gameSession     when the opening countdown ends (startsAt)
//   drinkTimer      the current drink round   (lib/rotationStorage.ts)
//   shotTimer       the current shooter round (lib/shotStorage.ts)
//   depressionMode  La Grande Dépression      (lib/depressionStorage.ts)
// The mute setting (soundMuted) is a preference, not part of a session: it's kept.

const SESSION_KEY = 'gameSession'
const GAME_KEYS = ['drinkTimer', 'shotTimer', 'depressionMode']

type SavedSession = {
  startsAt: number // ms, when the opening countdown reaches zero
}

// What the home screen shows about the saved session
export type SessionInfo =
  | { status: 'none' } // nothing saved: only "Nouvelle session"
  | { status: 'countdown'; startsAt: number } // the opening countdown is still running
  | {
      status: 'playing'
      drinkName: string | null // current drink on sale (null: not drawn yet)
      drinkEndsAt: number | null // ms, end of the drink round (null: paused or not drawn)
      drinkPausedMs: number | null // ms left when the round is paused
      depression: boolean // La Grande Dépression is on
    }

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null // storage blocked or broken value: act as if nothing is saved
  }
}

// Reads what's saved. A session exists if a countdown was started, or if a game
// is saved (older saves from before the home screen had no gameSession key).
export function loadSession(): SessionInfo {
  const session = read<SavedSession>(SESSION_KEY)
  const drink = read<{
    drinkName: string
    expiresAt: number
    pausedRemainingMs: number | null
  }>('drinkTimer')

  if (!session && !drink) return { status: 'none' }
  if (session && session.startsAt > Date.now()) {
    return { status: 'countdown', startsAt: session.startsAt }
  }

  const depression = read<{ endsAt: number; pausedRemainingMs: number | null }>(
    'depressionMode',
  )
  const depressionOn =
    !!depression &&
    (depression.pausedRemainingMs !== null || depression.endsAt > Date.now())

  return {
    status: 'playing',
    drinkName: drink?.drinkName ?? null,
    drinkEndsAt:
      drink && drink.pausedRemainingMs === null ? drink.expiresAt : null,
    drinkPausedMs: drink?.pausedRemainingMs ?? null,
    depression: depressionOn,
  }
}

// True when a game is saved (the first drink was already drawn)
export function hasSavedGame() {
  return read('drinkTimer') !== null
}

// "Nouvelle session": forget the saved game and start the opening countdown
export function startNewSession(countdownSec: number) {
  try {
    for (const key of GAME_KEYS) localStorage.removeItem(key)
    const session: SavedSession = { startsAt: Date.now() + countdownSec * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session.startsAt
  } catch (error) {
    console.error('Failed to start a new session:', error)
    return Date.now() + countdownSec * 1000
  }
}

// Ends the countdown right away (staff "Lancer maintenant")
export function skipCountdown() {
  try {
    const session: SavedSession = { startsAt: Date.now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to skip the countdown:', error)
  }
}
