'use strict'

;(() => {
  const syncBannerSwiper = () => {
    const swiper = window.swiper
    const container = document.querySelector('#swiper_container')

    if (!swiper || !container || !swiper.el || !swiper.slides || !swiper.slides.length) return

    const containerWidth = container.clientWidth
    if (!containerWidth) return

    swiper.updateSize()
    swiper.updateSlides()
    swiper.updateProgress()
    swiper.updateSlidesClasses()
    swiper.slideTo(swiper.activeIndex || 0, 0, false)
    swiper.update()
  }

  const debouncedSync = btf?.debounce
    ? btf.debounce(syncBannerSwiper, 100)
    : (() => {
        let timer = null
        return () => {
          clearTimeout(timer)
          timer = setTimeout(syncBannerSwiper, 100)
        }
      })()

  window.addEventListener('load', debouncedSync)
  window.addEventListener('resize', debouncedSync)
  document.addEventListener('pjax:complete', debouncedSync)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) debouncedSync()
  })
})()
