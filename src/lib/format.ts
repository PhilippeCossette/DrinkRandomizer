// $9.50
export const formatPrice = (value: number) => `$${value.toFixed(2)}`

// −12.4% (real minus sign for negative values)
export const formatPercent = (value: number, digits = 2) =>
  `${value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}%`

// 5 -> "05"
export const pad = (n: number) => String(n).padStart(2, '0')
