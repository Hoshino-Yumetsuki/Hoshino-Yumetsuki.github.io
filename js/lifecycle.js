"use strict"

/**
 * Acryple Lifecycle Manager
 *
 * Centralized event system replacing scattered DOMContentLoaded/pjax:complete listeners.
 *
 * Usage:
 *   window.lifecycle.once(fn)       - Run once on DOMContentLoaded only (persistent setup)
 *   window.lifecycle.onReady(fn)    - Run on DOMContentLoaded AND every pjax:complete (page-level init)
 *   window.lifecycle.onCleanup(fn)  - Run on pjax:send before page transition (teardown)
 *   window.lifecycle.onScroll(fn)   - Register with shared scroll listener; returns an unsubscribe function
 */
window.lifecycle = (() => {
  const onceHandlers = []
  const readyHandlers = []
  const cleanupHandlers = []
  const scrollHandlers = new Set()

  let initialized = false
  let scrollListener = null

  /**
   * Register a handler that runs ONCE on initial page load only.
   * Use for: persistent event listeners, one-time DOM setup, global state init.
   */
  const once = (fn) => {
    if (initialized) {
      // Already past DOMContentLoaded, run immediately
      try {
        fn()
      } catch (e) {
        console.error("[lifecycle:once]", e)
      }
    } else {
      onceHandlers.push(fn)
    }
  }

  /**
   * Register a handler that runs on EVERY page load (initial + pjax navigation).
   * Use for: page-specific DOM queries, re-binding per-page elements, re-fetching data.
   */
  const onReady = (fn) => {
    readyHandlers.push(fn)
    if (initialized) {
      // Already past DOMContentLoaded, run immediately for late registrations
      try {
        fn()
      } catch (e) {
        console.error("[lifecycle:onReady]", e)
      }
    }
  }

  /**
   * Register a cleanup handler that runs BEFORE pjax page transition.
   * Use for: canceling animations, clearing intervals, removing temporary DOM.
   */
  const onCleanup = (fn) => {
    cleanupHandlers.push(fn)
  }

  /**
   * Register a scroll handler through the single persistent window listener.
   * Returns a function that unregisters the handler.
   */
  const onScroll = (fn) => {
    scrollHandlers.add(fn)
    ensureScrollListener()
    return () => offScroll(fn)
  }

  /**
   * Remove a previously registered scroll handler.
   */
  const offScroll = (fn) => {
    scrollHandlers.delete(fn)
  }

  // --- Internal ---

  const runHandlers = (handlers, label) => {
    handlers.forEach((fn) => {
      try {
        fn()
      } catch (e) {
        console.error(`[lifecycle:${label}]`, e)
      }
    })
  }

  const ensureScrollListener = () => {
    if (scrollListener) return
    scrollListener = btf.throttle(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      scrollHandlers.forEach((fn) => {
        try {
          fn(scrollTop)
        } catch (e) {
          console.error("[lifecycle:scroll]", e)
        }
      })
    }, 100)
    window.addEventListener("scroll", scrollListener, { passive: true })
  }

  const handleDOMReady = () => {
    initialized = true
    runHandlers(onceHandlers, "once")
    runHandlers(readyHandlers, "ready")
  }

  const handlePjaxComplete = () => {
    runHandlers(readyHandlers, "ready")
  }

  const handlePjaxSend = () => {
    runHandlers(cleanupHandlers, "cleanup")
  }

  // Bootstrap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleDOMReady)
  } else {
    handleDOMReady()
  }

  document.addEventListener("pjax:complete", handlePjaxComplete)
  document.addEventListener("pjax:send", handlePjaxSend)

  return {
    once,
    onReady,
    onCleanup,
    onScroll,
    offScroll
  }
})()
