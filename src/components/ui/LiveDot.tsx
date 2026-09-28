import { motion, useReducedMotion } from 'motion/react'

// Small status dot; with `pulse` it pings like a live indicator
export default function LiveDot({ className, pulse }: { className: string; pulse?: boolean }) {
  const reduceMotion = useReducedMotion() ?? false
  return (
    <span className="relative flex h-[0.5em] w-[0.5em] shrink-0">
      {pulse && !reduceMotion && (
        <motion.span
          className={`absolute inset-0 rounded-full ${className}`}
          animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity }}
        />
      )}
      <span className={`relative h-full w-full rounded-full ${className}`} />
    </span>
  )
}
