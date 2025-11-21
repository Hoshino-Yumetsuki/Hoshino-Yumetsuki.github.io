/**
 * Copy Event Handler Module
 * ES2022 version
 */

;(() => {
  'use strict'

  /**
   * 复制事件处理
   */
  const handleCopy = () => {
    window.Snackbar?.show({
      text: '复制成功,如转载请注明出处！',
      pos: 'top-right',
      onActionClick: () => {
        window.open('/license', '_blank')
      },
      actionText: '查看博客声明'
    })
  }

  /**
   * F12 键盘事件处理
   */
  const handleF12 = (event) => {
    if (event.code === 'F12') {
      window.Snackbar?.show({
        text: '已打开开发者模式，扒源请谨记MIT协议！',
        pos: 'top-right',
        onActionClick: () => {
          window.open('/license', '_blank')
        },
        actionText: '查看博客声明'
      })
    }
  }

  /**
   * 初始化
   */
  const init = () => {
    // 添加事件监听器
    document.addEventListener('copy', handleCopy)
    document.addEventListener('keydown', handleF12)
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
