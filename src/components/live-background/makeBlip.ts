import { pick, rand } from '#/lib/random'
import type { Drink } from '#/schema/drinks'
import { DOWN_CHANCE } from './constants'

// A random alert on the left or right side (never the middle)
export function makeBlip(drinks: Drink[]) {
  const left = Math.random() > 0.5
  return {
    up: Math.random() > DOWN_CHANCE,
    name: pick(drinks).name,
    change: rand(0.8, 9),
    x: left ? rand(4, 22) : rand(72, 88), // % of screen width
    y: rand(10, 80), // % of screen height
  }
}
