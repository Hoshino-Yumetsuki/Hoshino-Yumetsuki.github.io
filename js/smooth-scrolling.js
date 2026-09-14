"use strict"
;(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const responseTime = 85
  let frame = 0
  let target = 0
  let position = 0
  let lastScroll = 0
  let lastTime = 0
  let navigating = false
  let animatedRoot = null
  let previousBehavior = ""
  let previousPriority = ""

  const syncState = () => {
    const current = window.scrollY
    position = current
    target = current
    lastScroll = current
  }

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
    if (animatedRoot) {
      if (previousBehavior) {
        animatedRoot.style.setProperty("scroll-behavior", previousBehavior, previousPriority)
      } else {
        animatedRoot.style.removeProperty("scroll-behavior")
      }
      animatedRoot = null
    }
    syncState()
  }

  const step = (time) => {
    // Yield to anchors, history restoration and scrollbar dragging.
    if (Math.abs(window.scrollY - lastScroll) > 1) {
      stop()
      return
    }

    const root = document.scrollingElement
    const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight)
    target = Math.min(target, maxScroll)
    const elapsed = Math.max(0, time - lastTime)
    lastTime = time
    position += (target - position) * (1 - Math.exp(-elapsed / responseTime))
    const finished = Math.abs(target - position) < 0.5
    if (finished) position = target

    // scrollTop also obeys CSS scroll-behavior, so this loop owns an explicit
    // auto override until it finishes or yields to another input source.
    root.scrollTop = position
    lastScroll = window.scrollY
    if (finished) stop()
    else frame = requestAnimationFrame(step)
  }

  const needsNativeScroll = (event) => {
    for (const element of event.composedPath()) {
      if (!(element instanceof Element)) continue
      if (element === document.body || element === document.documentElement) break
      if (element.matches("input, textarea, select") || element.isContentEditable) return true
      if (element.scrollHeight <= element.clientHeight) continue
      const style = getComputedStyle(element)
      if (style.overflowY === "auto" || style.overflowY === "scroll") return true
    }
    return false
  }

  const onWheel = (event) => {
    // WheelEvent has no device type: leave fine-grained pixel input native to avoid
    // adding inertia to touchpad gestures that already supply their own momentum.
    const fineInput =
      event.deltaMode === 0 && (Math.abs(event.deltaY) < 50 || !Number.isInteger(event.deltaY))
    if (
      navigating ||
      reducedMotion.matches ||
      event.defaultPrevented ||
      !event.cancelable ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.deltaX !== 0 ||
      !event.deltaY ||
      fineInput ||
      document.body.style.overflow === "hidden" ||
      needsNativeScroll(event)
    ) {
      stop()
      return
    }

    const root = document.scrollingElement
    const rootOverflow = getComputedStyle(root).overflowY
    if (rootOverflow === "hidden" || rootOverflow === "clip") {
      stop()
      return
    }

    const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight)
    const current = window.scrollY
    const delta =
      event.deltaY * (event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1)
    if (
      !frame ||
      Math.abs(current - lastScroll) > 1 ||
      Math.sign(delta) !== Math.sign(target - position)
    ) {
      position = current
      target = current
      lastScroll = current
    }
    target = Math.max(0, Math.min(target + delta, maxScroll))
    if (target === current) {
      stop()
      return
    }

    event.preventDefault()
    if (!frame) {
      animatedRoot = root
      previousBehavior = root.style.getPropertyValue("scroll-behavior")
      previousPriority = root.style.getPropertyPriority("scroll-behavior")
      root.style.setProperty("scroll-behavior", "auto", "important")
      // Cancel any in-flight native animation before scheduling the first frame.
      root.scrollTop = current
      lastTime = performance.now()
      frame = requestAnimationFrame(step)
    }
  }

  lifecycle.once(() => {
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("pointerdown", stop, { passive: true })
    window.addEventListener("keydown", stop)
    window.addEventListener("blur", stop)
    document.addEventListener("visibilitychange", stop)
    reducedMotion.addEventListener("change", stop)
  })
  lifecycle.onCleanup(() => {
    navigating = true
    stop()
  })
  lifecycle.onReady(() => {
    stop()
    navigating = false
  })
})()
