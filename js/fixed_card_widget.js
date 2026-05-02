(() => {
  const removeFixedCardWidget = () => {
    document.querySelectorAll('.fixed-card-widget').forEach((item) => {
      item.classList.remove('fixed-card-widget')
    })

    const quitBox = document.getElementById('quit-box')
    quitBox && quitBox.remove()
  }

  const createQuitBox = () => {
    if (document.getElementById('quit-box')) return

    const asideContent = document.getElementById('aside-content')
    if (!asideContent) return

    const quitBox = document.createElement('div')
    quitBox.id = 'quit-box'
    quitBox.addEventListener('click', removeFixedCardWidget)
    asideContent.insertAdjacentElement('beforebegin', quitBox)
  }

  const fixedCardWidget = (type, name, index) => {
    const tempcard =
      type === 'id'
        ? document.getElementById(name)
        : document.getElementsByClassName(name)[Number(index)]

    if (!tempcard) return

    if (tempcard.classList.contains('fixed-card-widget')) {
      removeFixedCardWidget()
      return
    }

    removeFixedCardWidget()
    createQuitBox()
    tempcard.classList.add('fixed-card-widget')
  }

  window.FixedCardWidget = fixedCardWidget
  window.RemoveFixedCardWidget = removeFixedCardWidget

  removeFixedCardWidget()
})()
