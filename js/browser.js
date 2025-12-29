/**
 * Browser Compatibility Check Module
 * ES2022 version - simplified for modern browsers
 *
 * Note: IE is no longer supported by Microsoft (ended June 2022).
 * Modern browsers (Chrome, Firefox, Safari, Edge) all support ES2022 features.
 * This file now only provides minimal checks for truly outdated browsers.
 */

;(() => {
  'use strict'

  /**
   * 检查浏览器是否支持必要的现代特性
   */
  const checkBrowserSupport = () => {
    // 检查关键 ES2015+ 特性
    const hasRequiredFeatures =
      typeof Promise !== 'undefined' &&
      typeof fetch !== 'undefined' &&
      typeof Object.assign !== 'undefined' &&
      'classList' in document.documentElement

    if (!hasRequiredFeatures) {
      showCompatibilityWarning()
    }
  }

  /**
   * 显示兼容性警告（使用现代方式，而非 alert）
   */
  const showCompatibilityWarning = () => {
    // 如果有 Snackbar，使用它
    if (window.Snackbar) {
      window.Snackbar.show({
        text: '您的浏览器版本过旧，可能无法正常显示本网站。建议使用 Chrome、Firefox、Safari 或 Edge 的最新版本。',
        pos: 'top-center',
        showAction: false,
        duration: 10000
      })
      return
    }

    // 降级方案：创建简单的横幅提示
    const banner = document.createElement('div')
    Object.assign(banner.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      padding: '12px',
      backgroundColor: '#ff6b6b',
      color: 'white',
      textAlign: 'center',
      fontSize: '14px',
      zIndex: '9999',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    })

    banner.innerHTML = `
            <strong>浏览器兼容性提示：</strong>
            您的浏览器版本过旧，可能无法正常显示本网站。
            建议使用 Chrome、Firefox、Safari 或 Edge 的最新版本。
            <button style="margin-left: 12px; padding: 4px 12px; background: white; color: #ff6b6b; border: none; border-radius: 4px; cursor: pointer;">
                关闭
            </button>
        `

    const closeButton = banner.querySelector('button')
    closeButton?.addEventListener(
      'click',
      () => {
        banner.remove()
      },
      { once: true }
    )

    document.body.prepend(banner)

    // 10秒后自动关闭
    setTimeout(() => {
      banner.remove()
    }, 10000)
  }

  /**
   * 初始化
   */
  const init = () => {
    // 仅在需要时进行检查
    checkBrowserSupport()
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
