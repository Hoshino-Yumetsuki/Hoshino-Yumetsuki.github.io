/**
 * FPS Display Module
 * ES2022 version with proper cleanup
 */

;(() => {
  'use strict'

  let animationFrameId = null

  /**
   * FPS 显示功能
   */
  const initFPS = () => {
    // 检查是否启用 FPS 显示
    const fpsEnabled = window.localStorage?.getItem('fpson') === '1'
    const fpsElement = document.getElementById('fps')

    if (!fpsElement) {
      return
    }

    if (!fpsEnabled) {
      fpsElement.style.display = 'none'
      return
    }

    // 显示 FPS 元素
    fpsElement.style.display = ''

    // FPS 计算状态
    let frame = 0
    let allFrameCount = 0
    let lastTime = Date.now()
    let lastFrameTime = Date.now()

    /**
     * 获取 FPS 状态描述
     */
    const getFPSStatus = (fps) => {
      if (fps <= 6) {
        return '<span style="color:#bd0000">卡成ppt</span>'
      }
      if (fps <= 10) {
        return '<span style="color:red">电竞级帧率</span>'
      }
      if (fps <= 14) {
        return '<span style="color:yellow">难受</span>'
      }
      if (fps < 24) {
        return '<span style="color:orange">卡</span>'
      }
      if (fps <= 40) {
        return '<span style="color:green">...</span>'
      }
      return '<span style="color:#425aef">正常</span>'
    }

    /**
     * 帧循环
     */
    const loop = () => {
      const now = Date.now()
      lastFrameTime = now
      allFrameCount++
      frame++

      // 每秒更新一次显示
      if (now > 1000 + lastTime) {
        const currentFPS = Math.round((frame * 1000) / (now - lastTime))
        const status = getFPSStatus(currentFPS)

        // 更新显示（添加 null 检查）
        const fpsElement = document.getElementById('fps')
        if (fpsElement) {
          fpsElement.innerHTML = `FPS:${currentFPS} ${status}`
        }

        frame = 0
        lastTime = now
      }

      // 继续下一帧
      animationFrameId = requestAnimationFrame(loop)
    }

    // 启动循环
    loop()
  }

  /**
   * 清理函数
   */
  const cleanup = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  /**
   * 初始化
   */
  const init = () => {
    // 清理之前的动画帧
    cleanup()

    // 初始化 FPS 显示
    initFPS()
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // PJAX 页面切换后重新初始化
  document.addEventListener('pjax:complete', init)

  // PJAX 页面卸载前清理
  document.addEventListener('pjax:send', cleanup)
})()
