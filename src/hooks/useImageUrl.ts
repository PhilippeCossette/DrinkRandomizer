// The URL to show for a drink or shot image, fixed for as long as the image is
// on screen. lib/images.ts swaps in lighter copies once they're ready; reading
// the URL once per image means a card never switches picture mid-display
// (which could flicker on a slow TV). A new card picks up the light copy.

import { useMemo } from 'react'
import { imageUrl } from '#/lib/images'

export function useImageUrl(path: string) {
  return useMemo(() => imageUrl(path), [path])
}
