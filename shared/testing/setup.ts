import { afterEach } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear()
  }
})
