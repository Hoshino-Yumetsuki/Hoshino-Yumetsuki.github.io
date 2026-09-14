/**
 * Comment Barrage Module
 * ES2022 version with proper error handling and cleanup
 */

;(() => {
  "use strict"

  const state = {
    swiper: null,
    scrollHandler: null,
    abortController: null,
    generation: 0,
    hoverElement: null,
    mouseoverHandler: null,
    mouseoutHandler: null,
    timers: []
  }

  const config = {
    lightColors: [["#ffffffaa!important", "var(--lyx-black)"]],
    darkColors: [["#000a!important", "var(--lyx-white)"]],
    noAvatarType: "retro",
    avatarCDN: "cravatar.cn",
    displayBarrage: true
  }

  const parseHttpUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null

    try {
      const url = new URL(value)
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
    } catch {
      return null
    }
  }

  const isInViewPort = (element) => {
    if (!element) return false
    return element.getBoundingClientRect().top <= window.innerHeight
  }

  const flattenComment = (comment, flattened) => {
    flattened.push(comment)
    if (Array.isArray(comment.replies)) {
      comment.replies.forEach((reply) => flattenComment(reply, flattened))
    }
  }

  const filterComments = (data) => {
    if (!Array.isArray(data)) return []

    const flattened = []
    data
      .slice()
      .sort((a, b) => a.created - b.created)
      .forEach((comment) => {
        flattenComment(comment, flattened)
      })
    return flattened
  }

  const createBarrageElement = (data) => {
    const barrage = document.createElement("div")
    barrage.className = "comment-barrage-item"

    const colorIndex = Math.floor(Math.random() * config.lightColors.length)
    const lightColor = config.lightColors[colorIndex]
    const darkColor = config.darkColors[colorIndex]
    const styleElement = document.getElementById("barragesColor")
    if (styleElement) {
      styleElement.textContent = `
        [data-theme='light'] .comment-barrage-item {
          background-color: ${lightColor[0]};
          color: ${lightColor[1]};
        }
        [data-theme='dark'] .comment-barrage-item {
          background-color: ${darkColor[0]};
          color: ${darkColor[1]};
        }
      `
    }

    const nick = String(data.nick ?? "")
    const fallbackAvatar = `https://${config.avatarCDN}/avatar/${encodeURIComponent(String(data.mailMd5 ?? ""))}?d=${encodeURIComponent(config.noAvatarType)}`
    const avatarUrl = parseHttpUrl(data.avatar) || fallbackAvatar
    const link = parseHttpUrl(data.link)

    const head = document.createElement("div")
    head.className = "barrageHead"

    const avatar = document.createElement("img")
    avatar.className = "barrageAvatar"
    avatar.src = avatarUrl
    avatar.alt = nick
    head.appendChild(avatar)

    const nickElement = document.createElement(link ? "a" : "div")
    nickElement.className = "barrageNick"
    nickElement.textContent = nick
    if (link) {
      nickElement.href = link
      nickElement.target = "_blank"
      nickElement.rel = "noopener noreferrer"
    }
    head.appendChild(nickElement)

    const close = document.createElement("a")
    close.className = "barrage-close"
    close.href = "#"
    close.style.fontSize = "20px"
    close.textContent = "×"
    close.addEventListener(
      "click",
      (event) => {
        event.preventDefault()
        barrage.classList.add("out")
      },
      { once: true }
    )
    head.appendChild(close)
    barrage.appendChild(head)

    const content = document.createElement("a")
    content.className = "barrageContent"
    content.href = `#${encodeURIComponent(String(data.id ?? ""))}`
    content.textContent = String(data.comment ?? "")
    barrage.appendChild(content)

    const slide = document.createElement("div")
    slide.className = "swiper-slide"
    slide.style.height = "150px"
    slide.appendChild(barrage)
    return slide
  }

  const initSwiper = (swiperElement) => {
    if (typeof Swiper === "undefined") return null

    const swiper = new Swiper(swiperElement, {
      direction: "vertical",
      loop: true,
      mousewheel: true,
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: false
      }
    })

    state.hoverElement = swiper.el
    state.mouseoverHandler = () => swiper.autoplay.stop()
    state.mouseoutHandler = () => swiper.autoplay.start()
    state.hoverElement.addEventListener("mouseover", state.mouseoverHandler)
    state.hoverElement.addEventListener("mouseout", state.mouseoutHandler)
    return swiper
  }

  const fetchComments = async (endpoint, signal, pathname) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event: "COMMENT_GET",
          url: pathname
        }),
        signal
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      return filterComments(result.data || [])
    } catch (error) {
      if (error.name !== "AbortError") console.error("获取评论弹幕失败:", error)
      return []
    }
  }

  const renderBarrages = (comments, barrageContainer, swiperElement) => {
    barrageContainer.replaceChildren(...comments.map(createBarrageElement))
    if (comments.length) state.swiper = initSwiper(swiperElement)
  }

  const setBarrageVisibility = (barrageContainer, visible, animate = false) => {
    config.displayBarrage = visible
    if (!barrageContainer) return

    if (visible) {
      barrageContainer.style.display = ""
      barrageContainer.style.opacity = animate ? "0" : "1"
      if (animate) {
        barrageContainer.style.transition = "opacity 0.4s"
        state.timers.push(
          setTimeout(() => {
            barrageContainer.style.opacity = "1"
          }, 10)
        )
      }
    } else if (animate) {
      barrageContainer.style.opacity = "0"
      state.timers.push(
        setTimeout(() => {
          barrageContainer.style.display = "none"
        }, 400)
      )
    } else {
      barrageContainer.style.display = "none"
      barrageContainer.style.opacity = "0"
    }
  }

  const toggleBarrage = () => {
    const visible = localStorage.getItem("isBarrageToggle") === "1"
    localStorage.setItem("isBarrageToggle", visible ? "0" : "1")
    setBarrageVisibility(
      document.querySelector(".comment-barrage"),
      visible,
      !isInViewPort(document.getElementById("post-comment"))
    )
  }

  const setupScrollHandler = (commentElement, swiperElement) => {
    state.scrollHandler = () => {
      if (!config.displayBarrage) return

      if (isInViewPort(commentElement)) {
        swiperElement.style.transform = "translateX(514px)"
        swiperElement.style.opacity = "0"
      } else {
        swiperElement.style.transform = ""
        swiperElement.style.opacity = "1"
      }
    }
    lifecycle.onScroll(state.scrollHandler)
    state.scrollHandler()
  }

  const cleanup = () => {
    state.generation += 1
    state.abortController?.abort()
    state.abortController = null

    if (state.hoverElement) {
      state.hoverElement.removeEventListener("mouseover", state.mouseoverHandler)
      state.hoverElement.removeEventListener("mouseout", state.mouseoutHandler)
      state.hoverElement = null
      state.mouseoverHandler = null
      state.mouseoutHandler = null
    }

    if (state.swiper?.destroy) state.swiper.destroy(true, true)
    state.swiper = null

    if (state.scrollHandler) {
      lifecycle.offScroll(state.scrollHandler)
      state.scrollHandler = null
    }

    state.timers.forEach(clearTimeout)
    state.timers = []
    document.querySelector(".comment-barrage")?.replaceChildren()
  }

  const init = async () => {
    cleanup()

    const commentElement = document.getElementById("post-comment")
    const swiperElement = document.querySelector(".barrageswiper")
    const barrageContainer = swiperElement?.querySelector(".comment-barrage")
    const endpoint = parseHttpUrl(swiperElement?.dataset.endpoint)
    if (!commentElement || !swiperElement || !barrageContainer || !endpoint) return

    const barrageVisible = localStorage.getItem("isBarrageToggle") !== "1"
    if (localStorage.getItem("isBarrageToggle") === null)
      localStorage.setItem("isBarrageToggle", "0")
    setBarrageVisibility(barrageContainer, barrageVisible)

    const generation = state.generation
    const pathname = window.location.pathname
    state.abortController = new AbortController()
    const comments = await fetchComments(endpoint, state.abortController.signal, pathname)
    if (generation !== state.generation || pathname !== window.location.pathname) return

    state.abortController = null
    renderBarrages(comments, barrageContainer, swiperElement)
    setupScrollHandler(commentElement, swiperElement)
  }

  window.switchCommentBarrage = toggleBarrage
  lifecycle.onReady(init)
  lifecycle.onCleanup(cleanup)
})()
