"use strict"
;(() => {
  const sizes = [320, 1280]
  const cache = new Map()
  const pending = new Map()
  const queue = []
  let active = 0
  let observer

  const showError = (image) => {
    if (!image.isConnected) return
    image.dataset.errorHandled = "true"
    if (image.dataset.fallback) image.src = image.dataset.fallback
  }

  const display = (image, result, source) => {
    if (!image.isConnected) return
    image.src = result === null ? source : result[image.dataset.coverSize || 1280]
  }

  const createThumbnails = async (source, signal) => {
    const response = await fetch(source, { signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    // Keep animated and vector covers intact rather than silently flattening them.
    const header = new Uint8Array(await blob.slice(0, 21).arrayBuffer())
    if (
      /image\/(gif|svg\+xml)/i.test(blob.type) ||
      (blob.type === "image/webp" && header[12] === 86 && header[15] === 88 && header[20] & 2)
    )
      return null

    // Resize during asynchronous bitmap creation. Neither the original nor a
    // full-resolution bitmap is attached to the DOM or drawn onto the canvas.
    signal.throwIfAborted()
    let bitmap = await createImageBitmap(blob, { resizeWidth: 1280, resizeQuality: "high" })
    const canvas = document.createElement("canvas")
    const result = {}
    try {
      if (bitmap.height > 1280) {
        const smaller = await createImageBitmap(bitmap, {
          resizeHeight: 1280,
          resizeQuality: "high"
        })
        bitmap.close()
        bitmap = smaller
      }
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Canvas 2D is unavailable")
      for (const size of sizes) {
        signal.throwIfAborted()
        const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height))
        canvas.width = Math.max(1, Math.round(bitmap.width * scale))
        canvas.height = Math.max(1, Math.round(bitmap.height * scale))
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        const thumbnail = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error("Canvas encoding failed"))),
            "image/webp",
            0.85
          )
        })
        result[size] = URL.createObjectURL(thumbnail)
      }
      signal.throwIfAborted()
      return result
    } catch (error) {
      Object.values(result).forEach((url) => URL.revokeObjectURL(url))
      throw error
    } finally {
      bitmap.close()
      canvas.width = canvas.height = 0
    }
  }

  const pump = () => {
    // Bound downloads and asynchronous decodes even during a rapid scroll.
    while (active < 2 && queue.length) {
      const job = queue.shift()
      active++
      createThumbnails(job.source, job.controller.signal)
        .then((result) => {
          if (job.controller.signal.aborted) {
            if (result) Object.values(result).forEach((url) => URL.revokeObjectURL(url))
            return
          }
          cache.set(job.source, result)
          job.images.forEach((image) => display(image, result, job.source))
        })
        .catch((error) => {
          if (job.controller.signal.aborted) return
          console.warn("[cover-thumbnail]", job.source, error)
          job.images.forEach(showError)
        })
        .finally(() => {
          if (pending.get(job.source) === job) pending.delete(job.source)
          active--
          pump()
        })
    }
  }

  const enqueue = (image) => {
    if (!image.isConnected) return
    const source = new URL(image.dataset.coverSrc, document.baseURI).href
    if (cache.has(source)) {
      display(image, cache.get(source), source)
      return
    }
    let job = pending.get(source)
    if (!job) {
      job = { source, images: new Set(), controller: new AbortController() }
      pending.set(source, job)
      queue.push(job)
    }
    job.images.add(image)
    pump()
  }

  const cleanup = () => {
    observer?.disconnect()
    observer = null
    pending.forEach((job) => {
      job.images.clear()
      job.controller.abort()
    })
    pending.clear()
    queue.length = 0
  }

  lifecycle.onReady(() => {
    cleanup()
    const images = document.querySelectorAll("img[data-cover-src]")
    if (typeof createImageBitmap !== "function") {
      console.warn("[cover-thumbnail] This browser does not support createImageBitmap")
      images.forEach(showError)
      return
    }
    observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          currentObserver.unobserve(entry.target)
          enqueue(entry.target)
        })
      },
      { rootMargin: "1200px 0px" }
    )
    images.forEach((image) => observer.observe(image))
  })
  lifecycle.onCleanup(cleanup)
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return
    cleanup()
    cache.forEach((result) => {
      if (result) Object.values(result).forEach((url) => URL.revokeObjectURL(url))
    })
    cache.clear()
  })
})()
