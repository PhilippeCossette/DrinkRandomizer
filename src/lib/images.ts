// Turns an image path from drinks.json / shots.json into a real URL.
//
// The JSON files store paths like "src/assets/images/sol.svg". That only works on
// the dev server; a production build doesn't copy files it doesn't know about.
// import.meta.glob makes Vite bundle every image in the folder, so the paths
// keep working after `npm run build` too.
const files = import.meta.glob<string>('/src/assets/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Lighter copies of the images, made once in the browser (see preloadImages)
const light = new Map<string, string>()

export function imageUrl(path: string) {
  const key = '/' + path.replace(/^\.?\//, '') // "src/assets/..." -> "/src/assets/..."
  const url = files[key] ?? path // unknown path: use it as is
  return light.get(url) ?? url
}

// Picture shown in the empty shooter card
export const SHOT_PLACEHOLDER = imageUrl(
  'src/assets/images/shot_placeholder.svg',
)

// The drink images are very big (2048px pictures inside SVG files, up to 5 MB).
// Drawing several of them for the first time at once freezes animations for a
// moment, so right after the page loads we redraw each one once at LIGHT_SIZE
// and keep that lighter copy in memory. imageUrl() then returns the light copy.
// Works for any new image added later; if anything fails, the original is used.
const LIGHT_SIZE = 1024 // px, still sharp on a 4K TV

export async function preloadImages(paths: string[]) {
  for (const path of paths) {
    const url = imageUrl(path)
    if (light.has(url) || url.startsWith('blob:')) continue
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      const scale = Math.min(
        1,
        LIGHT_SIZE / Math.max(img.naturalWidth, img.naturalHeight),
      )
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.9),
      )
      if (blob) light.set(url, URL.createObjectURL(blob))
    } catch {
      // keep the original for this one
    }
    // give the page a breather between two images
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}
