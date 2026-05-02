(() => {
  const isInViewport = (element) => {
    if (!element) return false

    const viewPortHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    const top = element.getBoundingClientRect().top
    return top <= viewPortHeight
  }

  const toggleVisibility = (selector, hidden) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.style.display = hidden ? 'none' : ''
    })
  }

  const handleFooterVisibility = () => {
    const footer = document.querySelector('footer')
    const hidden = isInViewport(footer)
    toggleVisibility('.aplayer .aplayer-body', hidden)
    toggleVisibility('#fps', hidden)
  }

  window.addEventListener('scroll', handleFooterVisibility, { passive: true })
  window.addEventListener('load', handleFooterVisibility)
  document.addEventListener('pjax:complete', handleFooterVisibility)
})()
