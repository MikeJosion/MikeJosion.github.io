(() => {
  'use strict'

  if (window.__novaHomeBootstrap) {
    window.__novaHomeBootstrap.init()
    return
  }

  let reveal = null
  const timers = new Set()

  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)
    timers.add(timer)
    return timer
  }

  const destroy = () => {
    reveal?.disconnect()
    reveal = null
    timers.forEach(timer => window.clearTimeout(timer))
    timers.clear()
  }

  const init = () => {
  const root = document.querySelector('[data-nova-home]')
  if (!root || root.dataset.ready) return
  destroy()
  root.dataset.ready = 'true'

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const searchInput = document.querySelector('#nova-archive-search')

  const englishSubtitle = root.querySelector('.nova-en-subtitle[data-typewriter-text]')
  const fullEnglishSubtitle = englishSubtitle?.dataset.typewriterText?.trim() || ''
  if (englishSubtitle && fullEnglishSubtitle) {
    englishSubtitle.setAttribute('aria-label', fullEnglishSubtitle)
    if (reduceMotion) {
      englishSubtitle.textContent = fullEnglishSubtitle
      englishSubtitle.classList.add('is-complete')
    } else {
      const characters = Array.from(fullEnglishSubtitle)
      let characterIndex = 0
      englishSubtitle.textContent = ''
      englishSubtitle.classList.add('is-typing')

      const typeNextCharacter = () => {
        characterIndex += 1
        englishSubtitle.textContent = characters.slice(0, characterIndex).join('')
        if (characterIndex < characters.length) {
          const current = characters[characterIndex - 1]
          const pause = current === ',' ? 145 : (current === '.' ? 220 : 48 + Math.random() * 42)
          later(typeNextCharacter, pause)
          return
        }
        englishSubtitle.classList.remove('is-typing')
        englishSubtitle.classList.add('is-complete')
      }

      later(typeNextCharacter, 1050)
    }
  }

  reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'))
  }, { threshold: .12 })
  root.querySelectorAll('.nova-reveal').forEach(node => reveal.observe(node))

  root.querySelectorAll('.nova-note-card[data-href]').forEach(card => {
    const navigate = () => { location.href = card.dataset.href }
    card.addEventListener('click', event => {
      if (!event.target.closest('a')) navigate()
    })
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        navigate()
      }
    })
  })

  const openSearch = value => {
    document.querySelector('#search-button .search')?.click()
    later(() => {
      const target = document.querySelector('#local-search input')
      if (target) {
        target.value = value
        target.dispatchEvent(new Event('input', { bubbles: true }))
        target.focus()
      }
    }, 180)
  }

  searchInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return
    const value = searchInput.value.trim()
    openSearch(value)
  })

  const bloom = event => {
    if (reduceMotion) return
    const x = event.clientX || innerWidth * .38
    const y = event.clientY || innerHeight * .35
    for (let i = 0; i < 14; i++) {
      const petal = document.createElement('i')
      petal.className = 'nova-petal'
      petal.style.left = `${x}px`
      petal.style.top = `${y}px`
      petal.style.setProperty('--x', `${(Math.random() - .5) * 180}px`)
      petal.style.setProperty('--y', `${40 + Math.random() * 150}px`)
      petal.style.setProperty('--r', `${Math.random() * 540 - 270}deg`)
      document.body.appendChild(petal)
      later(() => petal.remove(), 1550)
    }
    const message = root.querySelector('.nova-bloom-message')
    message.classList.add('show')
    later(() => message.classList.remove('show'), 2200)
  }
  root.querySelector('.nova-bloom-trigger')?.addEventListener('click', bloom)
  root.querySelector('.nova-letter-o')?.addEventListener('click', bloom)

  const subtitle = root.querySelector('.nova-cn-subtitle')
  const hour = new Date().getHours()
  if (subtitle && hour < 5) subtitle.textContent = '还没有睡的人，也许都在构建些什么。'
  }

  window.__novaHomeBootstrap = { init, destroy }
  document.addEventListener('pjax:send', destroy)
  document.addEventListener('pjax:complete', init)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
