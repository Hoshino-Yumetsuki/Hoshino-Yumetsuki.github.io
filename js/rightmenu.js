/**
 * Right Click Menu Module
 * ES2022 version with modern APIs
 */

console.log('Codes uses GPL Licence')

// 使用 IIFE 避免全局变量污染
;(() => {
  'use strict'

  // 状态管理
  const state = {
    mask: null,
    currentElement: null
  }

  /**
   * 创建或获取遮罩层
   */
  const setMask = () => {
    const existingMask = document.querySelector('.rmMask')
    if (existingMask) {
      return existingMask
    }

    const mask = document.createElement('div')
    mask.className = 'rmMask'
    Object.assign(mask.style, {
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      background: '#fff',
      opacity: '0',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '998'
    })

    document.body.appendChild(mask)

    const rightMenu = document.getElementById('rightMenu')
    if (rightMenu) {
      rightMenu.style.zIndex = '19198'
    }

    return mask
  }

  /**
   * 在光标位置插入文本
   * 使用现代方法，移除 IE 支持
   */
  const insertAtCursor = (field, value) => {
    if (!field) return

    const startPos = field.selectionStart ?? 0
    const endPos = field.selectionEnd ?? field.value.length
    const restoreTop = field.scrollTop

    field.value =
      field.value.substring(0, startPos) + value + field.value.substring(endPos)

    if (restoreTop > 0) {
      field.scrollTop = restoreTop
    }

    field.focus()
    const newPos = startPos + value.length
    field.selectionStart = newPos
    field.selectionEnd = newPos
  }

  /**
   * 右键菜单功能对象
   */
  const RightMenu = {
    /**
     * 显示/隐藏右键菜单
     */
    showRightMenu(isShow, x = 0, y = 0) {
      const rightMenu = document.getElementById('rightMenu')
      if (!rightMenu) return

      rightMenu.style.top = `${x}px`
      rightMenu.style.left = `${y}px`
      rightMenu.style.display = isShow ? 'block' : 'none'
    },

    /**
     * 切换深色模式
     */
    switchDarkMode() {
      const currentTheme = document.documentElement.getAttribute('data-theme')
      const isDark = currentTheme === 'dark'

      if (isDark) {
        window.activateLightMode?.()
        window.saveToLocal?.set('theme', 'light', 2)
        window.GLOBAL_CONFIG?.Snackbar &&
          window.btf?.snackbarShow(window.GLOBAL_CONFIG.Snackbar.night_to_day)
      } else {
        window.activateDarkMode?.()
        window.saveToLocal?.set('theme', 'dark', 2)
        window.GLOBAL_CONFIG?.Snackbar &&
          window.btf?.snackbarShow(window.GLOBAL_CONFIG.Snackbar.day_to_night)
      }

      // 处理第三方组件
      if (typeof window.utterancesTheme === 'function') {
        window.utterancesTheme()
      }
      if (typeof window.FB === 'object') {
        window.loadFBComment?.()
      }
      if (window.DISQUS) {
        const disqusThread = document.getElementById('disqus_thread')
        if (disqusThread?.children.length) {
          setTimeout(() => window.disqusReset?.(), 200)
        }
      }
    },

    /**
     * 引用选中文本
     */
    yinyong() {
      const textarea = document.querySelector('.el-textarea__inner')
      if (!textarea) return

      const selectedText = window.getSelection().toString()
      const quotedText = `> ${selectedText}\n\n`

      textarea.value = quotedText
      textarea.dispatchEvent(new Event('input', { bubbles: true }))

      window.Snackbar?.show({
        text: '为保证最佳评论阅读体验，建议不要删除空行',
        pos: 'top-center',
        showAction: false
      })
    },

    /**
     * 复制当前页面链接 - 使用现代 Clipboard API
     */
    async copyWordsLink() {
      const url = window.location.href

      try {
        await navigator.clipboard.writeText(url)
        window.Snackbar?.show({
          text: '链接复制成功！快去分享吧！',
          pos: 'top-right',
          showAction: false
        })
      } catch (err) {
        console.error('复制失败:', err)
        // 降级方案
        this.copyTextFallback(url)
      }
    },

    /**
     * 复制文本降级方案
     */
    copyTextFallback(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()

      try {
        document.execCommand('copy')
        window.Snackbar?.show({
          text: '链接复制成功！',
          pos: 'top-right',
          showAction: false
        })
      } catch (err) {
        console.error('降级复制也失败:', err)
      } finally {
        document.body.removeChild(textarea)
      }
    },

    /**
     * 切换阅读模式
     */
    switchReadMode() {
      const body = document.body
      body.classList.add('read-mode')

      const exitButton = document.createElement('button')
      exitButton.type = 'button'
      exitButton.className = 'fas fa-sign-out-alt exit-readmode'
      body.appendChild(exitButton)

      const clickHandler = () => {
        body.classList.remove('read-mode')
        exitButton.remove()
      }

      exitButton.addEventListener('click', clickHandler, { once: true })
    },

    /**
     * 复制选中文字 - 使用现代 Clipboard API
     */
    async copySelect() {
      const selectedText = window.getSelection().toString()
      if (!selectedText) return

      try {
        await navigator.clipboard.writeText(selectedText)
      } catch (err) {
        console.error('复制选中文字失败:', err)
      }
    },

    /**
     * 回到顶部
     */
    scrollToTop() {
      const menuItems = document.querySelectorAll('.menus_items')
      const nameContainer = document.getElementById('name-container')

      if (menuItems[1]) {
        menuItems[1].removeAttribute('style')
      }
      if (nameContainer) {
        nameContainer.style.display = 'none'
      }

      window.btf?.scrollToDest(0, 500)
    },

    /**
     * 翻译
     */
    translate() {
      document.getElementById('translateLink')?.click()
    },

    /**
     * 在本页搜索
     */
    searchInThisPage() {
      const searchInput = document.querySelector('.local-search-box--input')
      const searchButton = document.querySelector('.search')

      if (!searchInput || !searchButton) return

      searchInput.value = window.getSelection().toString()
      searchButton.click()
      searchInput.dispatchEvent(new Event('input', { bubbles: false }))
    },

    /**
     * 下载图片
     */
    async downloadImage(imgSrc, name = 'photo') {
      window.btf?.snackbarShow('正在下载中，请稍后', false, 10000)

      try {
        await new Promise((resolve, reject) => {
          const image = new Image()
          image.crossOrigin = 'anonymous'

          image.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = image.width
              canvas.height = image.height

              const context = canvas.getContext('2d')
              context.drawImage(image, 0, 0, image.width, image.height)

              const dataUrl = canvas.toDataURL('image/png')
              const link = document.createElement('a')
              link.download = name
              link.href = dataUrl
              link.click()

              resolve()
            } catch (err) {
              reject(err)
            }
          }

          image.onerror = reject
          image.src = imgSrc
        })

        window.btf?.snackbarShow('图片已添加盲水印，请遵守版权协议')
      } catch (err) {
        console.error('下载图片失败:', err)
        window.btf?.snackbarShow('图片下载失败', false, 3000)
      }
    },

    /**
     * 打开链接
     */
    open(href) {
      if (!href) return

      const isExternal = href.includes('http://') || href.includes('https://')
      const isCurrentSite = href.includes(window.location.hostname)

      if (!isExternal || isCurrentSite) {
        window.pjax?.loadUrl(href)
      } else {
        window.location.href = href
      }
    },

    /**
     * 在新标签页打开
     */
    openWithNewTab(url) {
      window.open(url, '_blank')
    },

    /**
     * 复制链接
     */
    async copyLink(url) {
      try {
        await navigator.clipboard.writeText(url)
      } catch (err) {
        console.error('复制链接失败:', err)
        this.copyTextFallback(url)
      }
    },

    /**
     * 点击元素
     */
    click(element) {
      element?.click()
    },

    /**
     * 另存为
     */
    saveAs(src) {
      const parts = src.split('/')
      const filename = parts[parts.length - 1] || 'image' // 修复：使用正确的方式获取最后一个元素
      this.downloadImage(src, filename)
    },

    /**
     * 粘贴文本
     */
    async paste(element) {
      try {
        const permission = await navigator.permissions.query({
          name: 'clipboard-read'
        })

        if (permission.state === 'granted' || permission.state === 'prompt') {
          const text = await navigator.clipboard.readText()
          insertAtCursor(element, text)
        } else {
          window.Snackbar?.show({
            text: '请允许读取剪贴板！',
            pos: 'top-center',
            showAction: false
          })
        }
      } catch (err) {
        console.error('粘贴失败:', err)
      }
    }
  }

  /**
   * 移除遮罩
   */
  const removeMask = () => {
    if (state.mask?.parentNode === document.body) {
      document.body.removeChild(state.mask)
      state.mask = null
    }
  }

  /**
   * 设置右键菜单
   */
  const setupContextMenu = () => {
    const URL_REGEX =
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'*+,;=.]+$/

    window.addEventListener('contextmenu', (event) => {
      if (event.ctrlKey) return true

      // 隐藏所有菜单组
      document.querySelectorAll('.rightMenu-group.hide').forEach((el) => {
        el.style.display = 'none'
      })

      // 如果有选中文本，显示文本菜单
      if (window.getSelection().toString()) {
        document
          .getElementById('menu-text')
          ?.style.setProperty('display', 'block')
      }

      // 如果在文章页，显示文章菜单
      if (document.getElementById('post') || document.getElementById('page')) {
        document
          .getElementById('menu-post')
          ?.style.setProperty('display', 'block')
      }

      const element = event.target
      state.currentElement = element

      // 检查是否是 URL
      const selectedText = window.getSelection().toString()
      if (URL_REGEX.test(selectedText) && element.tagName !== 'A') {
        document
          .getElementById('menu-too')
          ?.style.setProperty('display', 'block')
      }

      // 处理链接
      if (element.tagName === 'A') {
        document
          .getElementById('menu-to')
          ?.style.setProperty('display', 'block')
        RightMenu.open = () => RightMenu.open(element.href)
        RightMenu.openWithNewTab = () => RightMenu.openWithNewTab(element.href)
        RightMenu.copyLink = () => RightMenu.copyLink(element.href)
      }

      // 处理图片
      if (element.tagName === 'IMG') {
        document
          .getElementById('menu-img')
          ?.style.setProperty('display', 'block')
        RightMenu.openWithNewTab = () => RightMenu.openWithNewTab(element.src)
        RightMenu.click = () => RightMenu.click(element)
        RightMenu.copyLink = () => RightMenu.copyLink(element.src)
        RightMenu.saveAs = () => RightMenu.saveAs(element.src)
      }

      // 处理输入框
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        document
          .getElementById('menu-paste')
          ?.style.setProperty('display', 'block')
        RightMenu.paste = () => RightMenu.paste(element)
      }

      // 计算菜单位置
      const rightMenu = document.getElementById('rightMenu')
      if (!rightMenu) return

      let pageX = event.clientX + 10
      let pageY = event.clientY
      const rect = rightMenu.getBoundingClientRect()

      if (pageX + rect.width > window.innerWidth) {
        pageX -= rect.width + 10
      }
      if (pageY + rect.height > window.innerHeight) {
        pageY = window.innerHeight - rect.height
      }

      // 设置遮罩
      state.mask = setMask()

      // 滚动时隐藏菜单
      const scrollHandler = () => {
        RightMenu.showRightMenu(false)
        removeMask()
        window.removeEventListener('scroll', scrollHandler)
      }
      window.addEventListener('scroll', scrollHandler, { once: true })

      // 点击菜单项时移除遮罩
      document.querySelectorAll('.rightMenu-item').forEach((item) => {
        item.addEventListener('click', removeMask, { once: true })
      })

      // 窗口大小改变时隐藏菜单
      const resizeHandler = () => {
        RightMenu.showRightMenu(false)
        removeMask()
      }
      window.addEventListener('resize', resizeHandler, { once: true })

      // 点击遮罩时移除
      if (state.mask) {
        state.mask.addEventListener('click', removeMask, { once: true })
      }

      RightMenu.showRightMenu(true, pageY, pageX)
      return false
    })

    // 点击其他地方时隐藏菜单
    window.addEventListener('click', () => {
      RightMenu.showRightMenu(false)
    })
  }

  /**
   * 添加长按监听器（移动端）
   */
  const addLongPressListener = (target, callback) => {
    let timer = null

    const touchStart = () => {
      timer = setTimeout(() => {
        callback()
        timer = null
      }, 380)
    }

    const touchMove = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    const touchEnd = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    target.addEventListener('touchstart', touchStart, { passive: true })
    target.addEventListener('touchmove', touchMove, { passive: true })
    target.addEventListener('touchend', touchEnd, { passive: true })
  }

  /**
   * 检测是否是移动设备
   */
  const isMobileDevice = () => {
    return /phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone/i.test(
      navigator.userAgent
    )
  }

  /**
   * 初始化
   */
  const init = () => {
    // 导出到全局（保持向后兼容）
    window.rmf = RightMenu

    // 桌面端使用右键菜单
    if (!isMobileDevice()) {
      setupContextMenu()
    }

    // 移动端使用长按
    addLongPressListener(document.documentElement, setupContextMenu)

    // 禁用 touchmove 的默认行为（如果需要）
    document.body.addEventListener(
      'touchmove',
      (e) => {
        // 可以在这里添加逻辑
      },
      { passive: false }
    )
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
