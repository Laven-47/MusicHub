export function formatDuration(milliseconds = 0) {
  if (!milliseconds) return '--:--'
  const totalSeconds = Math.round(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function upscaleArtwork(url = '', size = 300) {
  if (!url) return ''
  return url.replace(/100x100bb\.(jpg|png)/, `${size}x${size}bb.$1`)
}

export function uniqueByTrackId(items = []) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.trackId || seen.has(item.trackId)) return false
    seen.add(item.trackId)
    return true
  })
}
