// Tiny gate so the hero and Strobi wait for the intro loader to finish.
let done = false
const listeners = new Set<() => void>()

export function markIntroDone() {
  if (done) return
  done = true
  listeners.forEach(cb => cb())
  listeners.clear()
}

export function onIntroDone(cb: () => void) {
  if (done) {
    cb()
    return () => {}
  }
  listeners.add(cb)
  return () => listeners.delete(cb)
}
