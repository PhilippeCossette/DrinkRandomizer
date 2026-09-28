import type { Drink } from '#/schema/drinks'

// Random drink, never the same one twice in a row
export function pickRandomDrink(drinkList: Drink[], current?: string): Drink {
  const options = drinkList.filter((drink) => drink.name !== current)
  const pool = options.length > 0 ? options : drinkList
  return pool[Math.floor(Math.random() * pool.length)]
}
