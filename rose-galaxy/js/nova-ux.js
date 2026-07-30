(() => {
  'use strict'

  if (window.__novaUxReady) return
  window.__novaUxReady = true

  const SHOW_DELAY = 280
  const EXIT_DURATION = 180
  let showTimer = 0
  let hideTimer = 0
  let navigationId = 0

  function getLoader() {
    let loader = document.querySelector('[data-nova-loading]')
    if (loader) return loader

    loader = document.createElement('div')
    loader.className = 'nova-page-loading'
    loader.dataset.novaLoading = ''
    loader.setAttribute('aria-hidden', 'true')
    loader.innerHTML = `
      <div class="nova-page-loading__inner">
        <span class="nova-page-loading__mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <strong>NOVA FLIEX</strong>
        <small>正在整理这一页的光影…</small>
      </div>`
    document.body.appendChild(loader)
    return loader
  }

  function enhanceSearch() {
    const dialog = document.querySelector('#local-search .search-dialog')
    const input = dialog?.querySelector('.local-search-input input')
    const results = dialog?.querySelector('#local-search-results')
    if (!dialog || !input || !results || dialog.dataset.novaSearchReady === 'true') return
    dialog.dataset.novaSearchReady = 'true'

    const state = document.createElement('div')
    state.className = 'nova-search-state'
    state.innerHTML = `
      <span class="nova-search-state__eyebrow">QUICK PASSAGE</span>
      <strong>从这里进入夜航档案</strong>
      <p>输入关键词，或先浏览常用页面。</p>
      <nav aria-label="搜索快速入口">
        <a href="/archives/">归档</a>
        <a href="/categories/">分类</a>
        <a href="/Gallery/">光影</a>
        <a href="/music/">音乐</a>
      </nav>`
    results.before(state)

    const renderState = () => {
      const query = input.value.trim()
      const hasResults = Boolean(results.querySelector('.local-search-hit-item'))
      state.hidden = Boolean(query && hasResults)
      state.classList.toggle('is-empty-result', Boolean(query && !hasResults))
      if (query && !hasResults) {
        state.querySelector('.nova-search-state__eyebrow').textContent = 'NO SIGNAL'
        state.querySelector('strong').textContent = '没有找到相关记录'
        state.querySelector('p').textContent = '换一个更短的关键词，或从快速入口继续浏览。'
      } else {
        state.querySelector('.nova-search-state__eyebrow').textContent = 'QUICK PASSAGE'
        state.querySelector('strong').textContent = '从这里进入夜航档案'
        state.querySelector('p').textContent = '输入关键词，或先浏览常用页面。'
      }
    }

    input.addEventListener('input', () => window.setTimeout(renderState, 0))
    new MutationObserver(renderState).observe(results, { childList: true, subtree: true })
    renderState()
  }

  function beginNavigation() {
    const currentId = ++navigationId
    window.clearTimeout(showTimer)
    window.clearTimeout(hideTimer)

    const loader = getLoader()
    loader.classList.remove('is-visible', 'is-leaving')
    loader.style.pointerEvents = 'none'

    showTimer = window.setTimeout(() => {
      if (currentId !== navigationId) return
      loader.classList.add('is-visible')
      loader.style.pointerEvents = 'auto'
    }, SHOW_DELAY)
  }

  function finishNavigation() {
    navigationId += 1
    window.clearTimeout(showTimer)
    const loader = document.querySelector('[data-nova-loading]')
    if (!loader) return

    loader.classList.add('is-leaving')
    loader.classList.remove('is-visible')
    loader.style.pointerEvents = 'none'
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => {
      loader.classList.remove('is-leaving')
    }, EXIT_DURATION)
  }

  function normalizePath(value) {
    const path = `/${value || ''}`.replace(/\/+/g, '/')
    return path.length > 1 ? path.replace(/\/$/, '') : path
  }

  function isHomePage() {
    if (
      document.body.classList.contains('nova-home-active') ||
      document.body.classList.contains('page-type-index') ||
      document.body.classList.contains('home')
    ) {
      return true
    }

    return normalizePath(location.pathname) === normalizePath(window.GLOBAL_CONFIG?.root || '/')
  }

  function syncHomeThemeToggle() {
    const button = document.getElementById('home-theme-toggle')
    if (!button) return

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const label = isDark ? '切换到浅色模式' : '切换到深色模式'
    button.setAttribute('aria-label', label)
    button.setAttribute('title', label)
  }

  function createHomeThemeToggle() {
    const button = document.createElement('button')
    button.id = 'home-theme-toggle'
    button.className = 'fliex-rightside-button'
    button.type = 'button'
    button.innerHTML = `
      <span class="home-theme-toggle__icons" aria-hidden="true">
        <svg class="home-theme-toggle__icon home-theme-toggle__icon--moon" viewBox="0 0 24 24" focusable="false">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path>
        </svg>
        <svg class="home-theme-toggle__icon home-theme-toggle__icon--sun" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
      </span>`

    button.addEventListener('click', event => {
      event.preventDefault()
      event.stopPropagation()
      document.getElementById('darkmode')?.click()
    })
    button.dataset.bound = 'true'
    return button
  }

  function initRightsideEnhancement() {
    const rightside = document.getElementById('rightside')
    const goUpButton = document.getElementById('go-up')
    if (!rightside || !goUpButton) return

    rightside
      .querySelectorAll('button[id], a[id]')
      .forEach(button => button.classList.add('fliex-rightside-button'))

    let homeThemeToggle = document.getElementById('home-theme-toggle')
    if (!homeThemeToggle) homeThemeToggle = createHomeThemeToggle()

    const visibleControls = goUpButton.parentElement
    if (homeThemeToggle.parentElement !== visibleControls || homeThemeToggle.nextElementSibling !== goUpButton) {
      visibleControls.insertBefore(homeThemeToggle, goUpButton)
    }

    rightside.classList.toggle('is-home-minimal', isHomePage())
    syncHomeThemeToggle()

    if (!window.__fliexRightsideThemeObserver) {
      window.__homeThemeToggleObserver?.disconnect()
      window.__homeThemeToggleObserver = null
      window.__fliexRightsideThemeObserver = new MutationObserver(syncHomeThemeToggle)
      window.__fliexRightsideThemeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      })
    }
  }

  document.addEventListener('pjax:send', beginNavigation)
  document.addEventListener('pjax:complete', finishNavigation)
  document.addEventListener('pjax:error', finishNavigation)
  document.addEventListener('DOMContentLoaded', enhanceSearch, { once: true })
  document.addEventListener('DOMContentLoaded', initRightsideEnhancement, { once: true })
  document.addEventListener('pjax:complete', enhanceSearch)
  document.addEventListener('pjax:complete', initRightsideEnhancement)
  window.addEventListener('pageshow', finishNavigation)
  if (document.readyState !== 'loading') {
    enhanceSearch()
    initRightsideEnhancement()
  }
})()
