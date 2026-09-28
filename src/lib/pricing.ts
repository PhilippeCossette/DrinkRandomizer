import type { Drink } from '#/schema/drinks'

// How much cheaper the sale price is, in % of the regular price.
// $9 -> $4 gives 56 (rounded to a whole number).
export function getDiscountPercent(regularPrice: number, salePrice: number) {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100)
}

// True when the drink is actually cheaper than usual
export const isOnSale = (drink: Drink) => drink.salePrice < drink.regularPrice
