;(() => {
  'use strict'

  function owoBig() {
    const postComment = document.getElementById('post-comment')
    if (!postComment) return

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.classList && node.classList.contains('OwO-body')) {
            setupOwoEnlarge(node)
            observer.disconnect()
            return
          }
        }
      }
    })

    observer.observe(postComment, { childList: true, subtree: true })
  }

  function setupOwoEnlarge(owoBody) {
    let div = document.getElementById('owo-big')
    if (!div) {
      div = document.createElement('div')
      div.id = 'owo-big'
      document.body.appendChild(div)
    }

    let hoverTimer = null

    owoBody.addEventListener('contextmenu', (e) => e.preventDefault())

    owoBody.addEventListener('mouseover', (e) => {
      if (e.target.tagName !== 'IMG') return

      const img = e.target
      hoverTimer = setTimeout(() => {
        const m = 4
        const rect = img.getBoundingClientRect()
        const height = rect.height * m
        const width = rect.width * m
        const left = rect.left - (width - rect.width) / 2
        const top = rect.top

        div.style.height = height + 'px'
        div.style.width = width + 'px'
        div.style.left = left + 'px'
        div.style.top = top + 'px'
        div.style.display = 'flex'
        div.innerHTML = `<img src="${img.src}">`
      }, 100)
    })

    owoBody.addEventListener('mouseout', () => {
      div.style.display = 'none'
      if (hoverTimer) {
        clearTimeout(hoverTimer)
        hoverTimer = null
      }
    })
  }

  lifecycle.onReady(owoBig)
})()
