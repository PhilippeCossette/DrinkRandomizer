// Small random helpers.

// Random decimal number between min and max
export const rand = (min: number, max: number) =>
  min + Math.random() * (max - min)

// Random item from a list
export const pick = <T,>(list: T[]) =>
  list[Math.floor(Math.random() * list.length)]
