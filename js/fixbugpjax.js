(() => {
  const showSettingButtons = () => {
    const settingButtons = document.querySelector('#setting-buttons')
    if (settingButtons) {
      settingButtons.style.display = ''
    }
  }

  document.addEventListener('pjax:complete', showSettingButtons)
  window.addEventListener('load', showSettingButtons)
})()
