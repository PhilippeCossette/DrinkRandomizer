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

export function imageUrl(path: string) {
  const key = '/' + path.replace(/^\.?\//, '') // "src/assets/..." -> "/src/assets/..."
  return files[key] ?? path // unknown path: use it as is
}

// Picture shown in the empty shooter card
export const SHOT_PLACEHOLDER = imageUrl('src/assets/images/shot_placeholder.svg')
