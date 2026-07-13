;(() => {
  'use strict'

  const SAKURA_COUNT = 10
  let canvas = null
  let ctx = null
  let animationId = null
  let sakuras = []

  const img = new Image()
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUgAAAEwCAYAAADVZeifAAAACXBIWXMAAACYAAAAmAGiyIKYAAAHG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBSaWdodHM9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9yaWdodHMvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcFJpZ2h0czpNYXJrZWQ9IkZhbHNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NDFDMjQxQjYyNjIwNjgxMTgwODNEMjE2MDAzOTU1NDQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozNDVjOWViOC04NDc4LTFkNDctOGRjMi0yZDkyOGNhYTYxZWQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YjAzN2ZiMGItNTU5Mi0xYjRkLWJjZGQtOWU4NGExMDJiMGM2IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA1LTA5VDE0OjQ5OjM3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNS0wOVQxNDo1MToyNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0wOVQxNDo1MToyNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyMjVlZWE3LTEyY2QtMTY0NC04ZDAzLWFjOTE2ZTAxZDQ1YyIgc3RSZWY6ZG9jdW1lbnRJRD0idXVpZDoxRDIwNUFGNjZCRDlFNTExOUM5REMwMzg2RjlEQjFGNyIvPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphYmMzNjIzMy1hOWNkLWNiNDQtODViYi0zZTgyMjEwYmIxMjYiIHN0RXZ0Ond'

  function createSakura() {
    const w = window.innerWidth
    const h = window.innerHeight
    const windX = -0.5 + Math.random()
    const speedY = 0.8 + Math.random() * 0.7
    const rotSpeed = Math.random() * 0.03
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random(),
      r: Math.random() * 6,
      windX,
      speedY,
      rotSpeed,
    }
  }

  function update(s) {
    s.x += 0.5 * s.windX - 0.6
    s.y += s.speedY
    s.r += s.rotSpeed
    if (s.x > window.innerWidth || s.x < 0 || s.y > window.innerHeight) {
      if (Math.random() > 0.4) {
        s.x = Math.random() * window.innerWidth
        s.y = 0
      } else {
        s.x = window.innerWidth
        s.y = Math.random() * window.innerHeight
      }
      s.s = Math.random()
      s.r = Math.random() * 6
      s.windX = -0.5 + Math.random()
      s.speedY = 0.8 + Math.random() * 0.7
      s.rotSpeed = Math.random() * 0.03
    }
  }

  function draw(s) {
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.r)
    const size = 35 * s.s
    ctx.drawImage(img, 0, 0, size, size)
    ctx.restore()
  }

  function loop() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < sakuras.length; i++) {
      update(sakuras[i])
      draw(sakuras[i])
    }
    animationId = requestAnimationFrame(loop)
  }

  function handleResize() {
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }

  function start() {
    if (canvas) return
    if (!img.complete || img.naturalWidth === 0) {
      img.onload = start
      return
    }

    canvas = document.createElement('canvas')
    canvas.id = 'canvas_sakura'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:999'
    document.body.appendChild(canvas)
    ctx = canvas.getContext('2d')

    sakuras = []
    for (let i = 0; i < SAKURA_COUNT; i++) {
      sakuras.push(createSakura())
    }

    animationId = requestAnimationFrame(loop)
    window.addEventListener('resize', handleResize, { passive: true })
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    if (canvas) {
      canvas.remove()
      canvas = null
      ctx = null
    }
    sakuras = []
    window.removeEventListener('resize', handleResize)
  }

  // Public API for settings toggle
  window.stopp = (enable) => {
    if (!enable) {
      stop()
    } else if (!canvas) {
      start()
    }
  }

  lifecycle.once(start)
  lifecycle.onCleanup(stop)
})()
