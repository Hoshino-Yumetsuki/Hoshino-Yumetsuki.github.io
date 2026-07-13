// 使用立即执行函数避免全局变量污染
;(function () {
  'use strict'

  const showSettingButtons = () => {
    const settingButtons = document.querySelector('#setting-buttons')
    if (settingButtons) {
      settingButtons.style.display = ''
    }
  }

  if (typeof lifecycle !== 'undefined' && lifecycle.onReady) {
    lifecycle.onReady(showSettingButtons)
  } else {
    document.addEventListener('DOMContentLoaded', showSettingButtons)
  }
  window.addEventListener('load', showSettingButtons)
})()