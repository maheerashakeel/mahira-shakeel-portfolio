import type { Mood } from '../data/content'

// Any component can make the guide speak and react:
//   buddySay('That email looks off.', 'confused')
export function buddySay(text: string, mood: Mood, ms?: number) {
  window.dispatchEvent(new CustomEvent('buddy:say', { detail: { text, mood, ms } }))
}
