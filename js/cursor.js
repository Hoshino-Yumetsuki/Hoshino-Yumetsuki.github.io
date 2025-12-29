/**
 * Custom Cursor Module
 * ES2022 version with performance optimizations
 */

;(() => {
  'use strict'

  /**
   * 线性插值函数
   */
  const lerp = (a, b, n) => (1 - n) * a + n * b

  /**
   * 获取元素计算样式
   */
  const getComputedStyleValue = (element, property) => {
    try {
      return window.getComputedStyle(element)[property] || ''
    } catch (error) {
      return ''
    }
  }

  /**
   * 检查元素是否应该显示 hover 效果
   */
  const shouldShowHover = (element) => {
    if (!element || element === document) {
      return false
    }

    // 检查元素或其父元素是否有 pointer cursor
    let current = element
    while (current && current !== document.body) {
      const cursor = getComputedStyleValue(current, 'cursor')
      if (cursor === 'pointer') {
        return true
      }
      current = current.parentElement
    }

    return false
  }

  /**
   * 自定义光标类
   */
  class CustomCursor {
    constructor() {
      this.pos = { curr: null, prev: null }
      this.cursor = null
      this.styleElement = null
      this.animationFrameId = null
      this.handlers = {}

      this.create()
      this.bindEvents()
      this.startRender()
    }

    /**
     * 移动光标到指定位置
     */
    move(left, top) {
      if (!this.cursor) return

      this.cursor.style.left = `${left}px`
      this.cursor.style.top = `${top}px`
    }

    /**
     * 创建光标元素和样式
     */
    create() {
      // 创建光标元素
      if (!this.cursor) {
        this.cursor = document.createElement('div')
        this.cursor.id = 'cursor'
        this.cursor.classList.add('hidden')
        document.body.appendChild(this.cursor)
      }

      // 创建自定义光标样式
      if (!this.styleElement) {
        this.styleElement = document.createElement('style')
        this.styleElement.innerHTML = `
                    * {
                        cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><style>circle {fill: white;}</style><circle cx='4' cy='4' r='4' opacity='.5'/></svg>") 4 4, auto !important;
                    }
                `
        document.body.appendChild(this.styleElement)
      }
    }

    /**
     * 绑定事件监听器（修复：Bug #6 - 性能优化，使用事件委托）
     */
    bindEvents() {
      // 修复：不再遍历所有DOM元素，而是使用事件委托动态检查
      this.handlers.mouseover = (event) => {
        if (shouldShowHover(event.target)) {
          this.cursor?.classList.add('hover')
        }
      }

      this.handlers.mouseout = (event) => {
        if (shouldShowHover(event.target)) {
          this.cursor?.classList.remove('hover')
        }
      }

      this.handlers.mousemove = (event) => {
        const x = event.clientX - 8
        const y = event.clientY - 8

        // 初始位置
        if (this.pos.curr === null) {
          this.move(x, y)
        }

        this.pos.curr = { x, y }
        this.cursor?.classList.remove('hidden')
      }

      this.handlers.mouseenter = () => {
        this.cursor?.classList.remove('hidden')
      }

      this.handlers.mouseleave = () => {
        this.cursor?.classList.add('hidden')
      }

      this.handlers.mousedown = () => {
        this.cursor?.classList.add('active')
      }

      this.handlers.mouseup = () => {
        this.cursor?.classList.remove('active')
      }

      // 使用 addEventListener 代替 on* 属性
      document.addEventListener('mouseover', this.handlers.mouseover, {
        passive: true
      })
      document.addEventListener('mouseout', this.handlers.mouseout, {
        passive: true
      })
      document.addEventListener('mousemove', this.handlers.mousemove, {
        passive: true
      })
      document.addEventListener('mouseenter', this.handlers.mouseenter, {
        passive: true
      })
      document.addEventListener('mouseleave', this.handlers.mouseleave, {
        passive: true
      })
      document.addEventListener('mousedown', this.handlers.mousedown, {
        passive: true
      })
      document.addEventListener('mouseup', this.handlers.mouseup, {
        passive: true
      })
    }

    /**
     * 移除事件监听器
     */
    unbindEvents() {
      if (this.handlers.mouseover) {
        document.removeEventListener('mouseover', this.handlers.mouseover)
        document.removeEventListener('mouseout', this.handlers.mouseout)
        document.removeEventListener('mousemove', this.handlers.mousemove)
        document.removeEventListener('mouseenter', this.handlers.mouseenter)
        document.removeEventListener('mouseleave', this.handlers.mouseleave)
        document.removeEventListener('mousedown', this.handlers.mousedown)
        document.removeEventListener('mouseup', this.handlers.mouseup)
      }
      this.handlers = {}
    }

    /**
     * 开始渲染循环
     */
    startRender() {
      const render = () => {
        if (this.pos.curr && this.pos.prev) {
          // 平滑移动
          this.pos.prev.x = lerp(this.pos.prev.x, this.pos.curr.x, 0.15)
          this.pos.prev.y = lerp(this.pos.prev.y, this.pos.curr.y, 0.15)
          this.move(this.pos.prev.x, this.pos.prev.y)
        } else if (this.pos.curr) {
          this.pos.prev = { ...this.pos.curr }
        }

        this.animationFrameId = requestAnimationFrame(render)
      }

      render()
    }

    /**
     * 停止渲染循环
     */
    stopRender() {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    }

    /**
     * 刷新光标
     */
    refresh() {
      // 不需要重新遍历DOM，事件委托会自动处理新元素
      this.cursor?.classList.remove('hover', 'active')
      this.pos = { curr: null, prev: null }
    }

    /**
     * 销毁光标
     */
    destroy() {
      this.stopRender()
      this.unbindEvents()

      if (this.styleElement?.parentNode) {
        this.styleElement.remove()
        this.styleElement = null
      }

      if (this.cursor?.parentNode) {
        this.cursor.remove()
        this.cursor = null
      }

      this.pos = { curr: null, prev: null }
    }
  }

  // 初始化自定义光标
  let cursorInstance = null

  const init = () => {
    // 清理旧实例
    if (cursorInstance) {
      cursorInstance.destroy()
    }

    // 创建新实例
    cursorInstance = new CustomCursor()

    // 导出到全局（保持向后兼容）
    window.CURSOR = cursorInstance
  }

  const cleanup = () => {
    if (cursorInstance) {
      cursorInstance.destroy()
      cursorInstance = null
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // PJAX 页面切换后刷新
  document.addEventListener('pjax:complete', () => {
    cursorInstance?.refresh()
  })

  // PJAX 页面卸载前清理
  document.addEventListener('pjax:send', cleanup)
})()
