(() => {
  const root = document.querySelector('[data-nova-home]')
  if (!root || root.dataset.ready) return
  root.dataset.ready = 'true'

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const themeButton = document.querySelector('#darkmode')
  const searchInput = document.querySelector('#nova-archive-search')
  const terminal = root.querySelector('.nova-terminal')
  const terminalInput = terminal.querySelector('input')
  const terminalOutput = terminal.querySelector('output')
  let themeClicks = 0
  let themeTimer
  let longPress

  const reveal = new IntersectionObserver(entries => {
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
    setTimeout(() => {
      const target = document.querySelector('#local-search input')
      if (target) {
        target.value = value
        target.dispatchEvent(new Event('input', { bubbles: true }))
        target.focus()
      }
    }, 180)
  }

  const openTerminal = () => {
    terminal.hidden = false
    terminalInput.value = ''
    terminalOutput.textContent = 'Type "help" for available commands.'
    terminalInput.focus()
  }

  searchInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return
    const value = searchInput.value.trim()
    value === '/nova' ? openTerminal() : openSearch(value)
  })

  terminal.querySelector('button').addEventListener('click', () => { terminal.hidden = true })
  terminalInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return
    const command = terminalInput.value.trim().toLowerCase()
    const routes = { notes: '#nova-notes', timeline: '/archives/', music: '/music/', about: '/about/' }
    if (routes[command]) location.href = routes[command]
    else if (command === 'clear') terminal.hidden = true
    else terminalOutput.textContent = command === 'help'
      ? 'notes · timeline · music · about · clear'
      : `Unknown command: ${command}`
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
      setTimeout(() => petal.remove(), 1550)
    }
    const message = root.querySelector('.nova-bloom-message')
    message.classList.add('show')
    setTimeout(() => message.classList.remove('show'), 2200)
  }
  root.querySelector('.nova-bloom-trigger').addEventListener('click', bloom)
  root.querySelector('.nova-letter-o').addEventListener('click', bloom)

  const unlockBloodMoon = () => {
    root.classList.add('blood-moon')
    const toast = root.querySelector('.nova-blood-toast')
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 2600)
  }
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      clearTimeout(themeTimer)
      themeClicks += 1
      if (themeClicks >= 5) {
        themeClicks = 0
        unlockBloodMoon()
      }
      themeTimer = setTimeout(() => { themeClicks = 0 }, 1800)
      if (root.classList.contains('blood-moon')) root.classList.remove('blood-moon')
    })
    themeButton.addEventListener('pointerdown', () => { longPress = setTimeout(unlockBloodMoon, 2000) })
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach(type =>
      themeButton.addEventListener(type, () => clearTimeout(longPress))
    )
  }

  const subtitle = root.querySelector('.nova-cn-subtitle')
  const hour = new Date().getHours()
  if (hour < 5) subtitle.textContent = '还没有睡的人，也许都在构建些什么。'
})()
