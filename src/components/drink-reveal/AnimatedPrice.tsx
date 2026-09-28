// Price that counts from the regular price down to the sale price.

import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { easeInOut } from '#/lib/easing'
import { formatPrice } from '#/lib/format'
import { COUNT_DURATION, PRICE_DELAY } from './constants'

type Props = {
  from: number
  to: number
  delay?: number
  duration?: number
}

// Counts from one price to another
export default function AnimatedPrice({
  from,
  to,
  delay = PRICE_DELAY,
  duration = COUNT_DURATION,
}: Props) {
  const value = useMotionValue(from)
  const display = useTransform(value, formatPrice)

  useEffect(() => {
    const controls = animate(value, to, { duration, ease: easeInOut, delay })
    return () => controls.stop()
  }, [to, value, delay, duration])

  return <motion.span>{display}</motion.span>
}
