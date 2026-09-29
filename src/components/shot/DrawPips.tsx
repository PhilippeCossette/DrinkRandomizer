// Row of little glasses that plays a fake draw in a loop, like a roulette:
// a highlight hops from glass to glass, slows down, lands on one (it pops),
// holds for a moment, then the draw starts again.

import { useEffect, useState } from 'react'
import { IconGlass } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'motion/react'

type Props = {
  count: number // number of glasses (one per chance)
}

// Delay before each hop: fast at first, then slower and slower, like a wheel stopping
const HOPS = [90, 90, 100, 110, 130, 160, 200, 260, 340, 440]
const HOLD = 1600 // ms the picked glass stays popped before the next draw
const PAUSE = 700 // ms with nothing selected between two draws

export default function DrawPips({ count }: Props) {
  const reduceMotion = useReducedMotion() ?? false
  const [active, setActive] = useState(0) // glass currently highlighted (-1 = none)
  const [picked, setPicked] = useState(false) // true once the draw has landed

  useEffect(() => {
    if (reduceMotion || count < 2) return
    let timer: ReturnType<typeof setTimeout>
    let cancelled = false // set on cleanup to stop the loop
    const stopped = () => cancelled // a function, so TS doesn't assume it never changes
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms)
      })

    async function loop() {
      let index = Math.floor(Math.random() * count)
      while (!stopped()) {
        // spin: hop to the next glass, each hop a bit slower than the last
        setPicked(false)
        for (const delay of HOPS) {
          index = (index + 1) % count
          setActive(index)
          await wait(delay)
          if (stopped()) return
        }
        // land: the current glass pops
        setPicked(true)
        await wait(HOLD)
        if (stopped()) return
        // short rest with nothing selected, then draw again
        setActive(-1)
        setPicked(false)
        await wait(PAUSE)
      }
    }

    void loop()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [count, reduceMotion])

  return (
    <div className="flex items-center gap-[min(0.5rem,1.5cqw)]" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active
        const isPicked = isActive && picked
        return (
          <motion.span
            key={i}
            className={`grid h-[min(2.2rem,7.5cqw)] w-[min(2.2rem,7.5cqw)] place-items-center rounded-[0.6rem] transition-colors duration-150 ${
              isActive
                ? 'bg-accent-soft text-accent-strong'
                : 'bg-neutral-soft text-ink-faint'
            }`}
            // hopping glass grows a little; the picked one pops bigger with a bounce
            animate={{ scale: isPicked ? [1, 1.35, 1.2] : isActive ? 1.12 : 1 }}
            transition={
              isPicked
                ? { duration: 0.45, times: [0, 0.5, 1], ease: 'easeOut' }
                : { type: 'spring', stiffness: 500, damping: 26 }
            }
          >
            <IconGlass className="h-[58%] w-[58%]" stroke={2} />
          </motion.span>
        )
      })}
    </div>
  )
}
