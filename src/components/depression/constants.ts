// La Grande Dépression scenes: panel colors, slide timing, and each scene's
// timeline. Timeline values are seconds from the start of the reveal, i.e.
// once the panels have covered the screen. Tweak the timing here.
//
// ---------------------------------------------------------------------------
// Intro: the crash. Panels slide up, title slams in, the % falls, every drink
// and shot drops in, then everything slides away to the event page.

// Panels slide up one after the other, spaced out so each color band is seen
export const COVER_DURATION = 1.1 // seconds for one panel
export const COVER_STAGGER = 0.2 // delay between two panels
// time until the screen is fully covered (the sounds use it to line up with the reveal)
export const COVER_TOTAL = COVER_DURATION + COVER_STAGGER * 2

// Panels, bottom to top. Same slide-up as the normal alert, in darker reds;
// the last one carries the content and matches the event's page color.
export const LAYERS = ['bg-red-700', 'bg-red-950', 'bg-[#0e0304]']

// Title words slam in one after the other (the sound's impacts use the same times)
export const WORD_1 = 0.35 // "La Grande"
export const WORD_2 = 0.85 // "Dépression"
export const SLAM = 0.3 // how long a word takes to land

export const LINE_START = 0.1 // giant crash line across the screen
export const LINE_DURATION = 2.4

export const INDEX_START = 1.3 // the % counter starts falling
export const INDEX_DURATION = 2.0
export const INDEX_FIGURE = -89.2 // the real US stock market fall (Dow Jones), 1929 to 1932

export const SUB_START = 1.8 // "Tout le menu est en crash"
export const ITEMS_START = 2.2 // every drink and shot falls in

export const SLIDE_START = 5.4 // time to read, then everything slides away
export const SLIDE_DURATION = 1.1 // same as COVER_DURATION: the slide-down mirrors the slide-up
// time for all the panels to be gone (they leave one after the other)
export const SLIDE_TOTAL = SLIDE_DURATION + COVER_STAGGER * 2
export const REDUCED_SLIDE_START = 3 // calm version (reduced motion): shorter hold

// The event page is mounted BOARD_LEAD seconds before the panels slide away:
// early enough that its first paint happens behind the panels (smooth slide),
// late enough not to slow down the title animation.
export const BOARD_LEAD = 2.2
// ...and its cards cascade in right as the last panel leaves
export const BOARD_ENTER_DELAY = BOARD_LEAD + SLIDE_TOTAL - 0.3

// Giant crash line (viewBox 0 0 1000 600, stretched to the screen)
export const LINE_POINTS =
  '-20,120 80,100 160,140 240,110 320,150 380,135 450,260 520,230 600,380 660,350 760,520 840,500 1020,640'

// ---------------------------------------------------------------------------
// Outro: the event is over, the market recovers. Same panels, same kind of
// timeline, everything going up and turning green.

// Panels, bottom to top: the event's red, then green, then the normal page color
export const OUTRO_LAYERS = ['bg-red-950', 'bg-emerald-700', 'bg-[#0c0d0f]']

export const OUTRO_WORD_1 = 0.35 // "Le marché"
export const OUTRO_WORD_2 = 0.85 // "se relève"
export const RISE = 0.5 // how long a word takes to rise into place

export const OUTRO_INDEX_START = 1.3 // the % counter climbs back
export const OUTRO_INDEX_DURATION = 1.8
export const OUTRO_INDEX_FIGURE = 12.4 // where the counter ends (%)

export const OUTRO_SUB_START = 1.9 // "Retour aux prix normaux"
export const OUTRO_SLIDE_START = 4.4 // shorter than the intro: people know the drill

// Recovery line, bottom-left to top-right (viewBox 0 0 1000 600)
export const RISE_POINTS =
  '-20,560 90,540 170,555 260,470 330,490 420,380 500,400 590,280 660,300 760,170 840,190 1020,40'
