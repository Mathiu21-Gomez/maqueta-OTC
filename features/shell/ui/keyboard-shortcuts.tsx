'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { navigationItems } from '@/features/shell/ui/shell-navigation'

const CHORD_TIMEOUT_MS = 1200

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const shortcutMap = new Map<string, string>()
    for (const item of navigationItems) {
      const key = item.shortcut.toLowerCase().replace(/\s+/g, '')
      shortcutMap.set(key, item.url)
    }

    let pendingChord = ''
    let chordTimer: ReturnType<typeof setTimeout> | null = null

    const resetChord = () => {
      pendingChord = ''
      if (chordTimer) {
        clearTimeout(chordTimer)
        chordTimer = null
      }
    }

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      const key = event.key.toLowerCase()
      if (key.length !== 1) return

      const candidate = pendingChord + key
      if (shortcutMap.has(candidate)) {
        event.preventDefault()
        router.push(shortcutMap.get(candidate)!)
        resetChord()
        return
      }

      const hasPrefix = [...shortcutMap.keys()].some((entry) => entry.startsWith(candidate))
      if (hasPrefix) {
        pendingChord = candidate
        if (chordTimer) clearTimeout(chordTimer)
        chordTimer = setTimeout(resetChord, CHORD_TIMEOUT_MS)
        return
      }

      resetChord()
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (chordTimer) clearTimeout(chordTimer)
    }
  }, [router])

  return null
}
