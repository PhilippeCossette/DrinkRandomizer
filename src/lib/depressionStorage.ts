// Saves/loads "La Grande Dépression" in localStorage, so a refresh during
// the event keeps it going (and a refresh after it ended cleans it up).

const STORAGE_KEY = 'depressionMode' // localStorage key

type SavedDepression = {
  endsAt: number // ms, when the event ends (if running)
  pausedRemainingMs: number | null // ms left when paused, null when running
}

// What was found in storage
export type LoadedDepression =
  | { status: 'none' } // no event
  | { status: 'ended' } // an event was running but its time is up (page was closed)
  | ({ status: 'active' } & SavedDepression)

export function saveDepression(state: SavedDepression) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save depression state:', error)
  }
}

export function clearDepression() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear depression state:', error)
  }
}

export function loadDepression(): LoadedDepression {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { status: 'none' }

    const saved = JSON.parse(raw) as SavedDepression
    const pausedRemainingMs = saved.pausedRemainingMs ?? null
    if (pausedRemainingMs === null && saved.endsAt <= Date.now()) {
      return { status: 'ended' }
    }
    return { status: 'active', endsAt: saved.endsAt, pausedRemainingMs }
  } catch (error) {
    console.error('Failed to load depression state:', error)
    return { status: 'none' }
  }
}
