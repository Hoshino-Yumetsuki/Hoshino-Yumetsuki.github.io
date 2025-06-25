const btf = {
  debounce: (func, wait = 300, immediate = false) => {
    let timeout
    return (...args) => {
      const later = () => {
        timeout = null
        if (!immediate) func.apply(this, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(this, args)
    }
  },

  throttle: (func, wait = 300, options = {}) => {
    let timeout, context, args
    let previous = 0

    const later = () => {
      previous = options.leading === false ? 0 : Date.now()
      timeout = null
      func.apply(context, args)
      context = args = null
    }

    return function throttled(...params) {
      const now = Date.now()
      if (!previous && options.leading === false) previous = now
      const remaining = wait - (now - previous)
      context = this
      args = params

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        func.apply(context, args)
        context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
    }
  },

  sidebarPaddingR: () => {
    const innerWidth = window.innerWidth
    const clientWidth = document.body.clientWidth
    const paddingRight = innerWidth - clientWidth
    if (innerWidth !== clientWidth) {
      document.body.style.paddingRight = paddingRight + 'px'
    }
  },

  snackbarShow: (text, showAction = false, duration = 2000) => {
    const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar
    const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
    Snackbar.show({
      text: text,
      backgroundColor: bg,
      showAction: showAction,
      duration: duration,
      pos: position,
      customClass: 'snackbar-css'
    })
  },

  diffDate: (d, more = false) => {
    try {
      const dateNow = new Date()
      const datePost = new Date(d)
      const dateDiff = dateNow - datePost

      if (!more) return Math.floor(dateDiff / (1000 * 60 * 60 * 24))

      const times = {
        month: 1000 * 60 * 60 * 24 * 30,
        day: 1000 * 60 * 60 * 24,
        hour: 1000 * 60 * 60,
        minute: 1000 * 60
      }

      if (dateDiff / times.month > 12) {
        return datePost.toLocaleDateString().replace(/\//g, '-')
      }

      for (const [unit, ms] of Object.entries(times)) {
        const count = Math.floor(dateDiff / ms)
        if (count >= 1) {
          return `${count} ${GLOBAL_CONFIG.date_suffix[unit]}`
        }
      }

      return GLOBAL_CONFIG.date_suffix.just
    } catch (e) {
      console.error('Date calculation error:', e)
      return ''
    }
  },

  loadComment: (dom, callback) => {
    if ('IntersectionObserver' in window) {
      const observerItem = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback()
          observerItem.disconnect()
        }
      }, { threshold: [0] })
      observerItem.observe(dom)
    } else {
      callback()
    }
  },

  scrollToDest: (pos, time = 500) => {
    try {
      const currentPos = window.pageYOffset
      pos = currentPos > pos ? pos - 70 : pos

      if ('scrollBehavior' in document.documentElement.style) {
        return window.scrollTo({ top: pos, behavior: 'smooth' })
      }

      const scrollStep = (currentTime) => {
        const progress = currentTime - start
        const percentage = Math.min(progress / time, 1)

        window.scrollTo(0, currentPos + (pos - currentPos) * percentage)

        if (progress < time) {
          requestAnimationFrame(scrollStep)
        }
      }

      const start = performance.now()
      requestAnimationFrame(scrollStep)
    } catch (e) {
      console.error('Scroll error:', e)
    }
  },

  animateIn: (ele, text) => {
    ele.style.display = 'block'
    ele.style.animation = text
  },

  animateOut: (ele, text) => {
    ele.addEventListener('animationend', function f() {
      ele.style.display = ''
      ele.style.animation = ''
      ele.removeEventListener('animationend', f)
    })
    ele.style.animation = text
  },

  getParents: (elem, selector) => {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem
    }
    return null
  },

  siblings: (ele, selector) => {
    return [...ele.parentNode.children].filter((child) => {
      if (selector) {
        return child !== ele && child.matches(selector)
      }
      return child !== ele
    })
  },

  /**
   * @param {*} selector
   * @param {*} eleType the type of create element
   * @param {*} options object key: value
   */
  wrap: (selector, eleType, options) => {
    const creatEle = document.createElement(eleType)
    for (const [key, value] of Object.entries(options)) {
      creatEle.setAttribute(key, value)
    }
    selector.parentNode.insertBefore(creatEle, selector)
    creatEle.appendChild(selector)
  },

  unwrap: el => {
    const elParentNode = el.parentNode
    if (elParentNode !== document.body) {
      elParentNode.parentNode.insertBefore(el, elParentNode)
      elParentNode.parentNode.removeChild(elParentNode)
    }
  },

  isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,

  getEleTop: ele => {
    let actualTop = ele.offsetTop
    let current = ele.offsetParent

    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }

    return actualTop
  },

  loadLightbox: ele => {
    const service = GLOBAL_CONFIG.lightbox

    if (service === 'mediumZoom') {
      const zoom = mediumZoom(ele)
      zoom.on('open', e => {
        const photoBg = document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#fff'
        zoom.update({
          background: photoBg
        })
      })
    }

    if (service === 'fancybox') {
      ele.forEach(i => {
        if (i.parentNode.tagName !== 'A') {
          const dataSrc = i.dataset.lazySrc || i.src
          const dataCaption = i.title || i.alt || ''
          btf.wrap(i, 'a', { href: dataSrc, 'data-fancybox': 'gallery', 'data-caption': dataCaption, 'data-thumb': dataSrc })
        }
      })

      if (!window.fancyboxRun) {
        Fancybox.bind('[data-fancybox]', {
          Hash: false,
          Thumbs: {
            autoStart: false
          }
        })
        window.fancyboxRun = true
      }
    }
  },

  initJustifiedGallery: function (selector) {
    selector.forEach(function (i) {
      if (!btf.isHidden(i)) {
        fjGallery(i, {
          itemSelector: '.fj-gallery-item',
          rowHeight: 220,
          gutter: 4,
          onJustify: function () {
            this.$container.style.opacity = '1'
          }
        })
      }
    })
  },

  updateAnchor: (anchor) => {
    if (anchor !== window.location.hash) {
      if (!anchor) anchor = location.pathname
      const title = GLOBAL_CONFIG_SITE.title
      window.history.replaceState({
        url: location.href,
        title: title
      }, title, anchor)
    }
  }
}
