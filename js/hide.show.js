;(() => {
  'use strict'

  let footer = null
  let aplayerBody = null
  let fpsElement = null
  let lastHidden = null

  const checkVisibility = () => {
    if (!footer) footer = document.querySelector('footer')
    if (!footer) return

    const hidden = footer.getBoundingClientRect().top <= window.innerHeight
    if (hidden === lastHidden) return
    lastHidden = hidden

    if (!aplayerBody) aplayerBody = document.querySelector('.aplayer .aplayer-body')
    if (!fpsElement) fpsElement = document.getElementById('fps')

    if (aplayerBody) aplayerBody.style.display = hidden ? 'none' : ''
    if (fpsElement) fpsElement.style.display = hidden ? 'none' : ''
  }

  const throttledCheck = btf.throttle(checkVisibility, 200)

  lifecycle.onReady(() => {
    footer = null
    aplayerBody = null
    fpsElement = null
    lastHidden = null
    checkVisibility()
  })

  window.addEventListener('scroll', throttledCheck, { passive: true })
})()
