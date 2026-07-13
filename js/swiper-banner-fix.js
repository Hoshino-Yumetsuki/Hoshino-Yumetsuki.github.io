'use strict'

;(() => {
  const syncBannerSwiper = () => {
    const swiper = window.swiper
    const container = document.querySelector('#swiper_container')

    if (!swiper || !container || !swiper.el || !swiper.slides || !swiper.slides.length) return

    const containerWidth = container.clientWidth
    if (!containerWidth) return

    // Swiper 5.x caches width internally. Force it to pick up new container size.
    const slides = swiper.slides
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.width = containerWidth + 'px'
    }

    swiper.width = containerWidth
    swiper.updateSize()
    swiper.updateSlides()
    swiper.updateProgress()
    swiper.updateSlidesClasses()
    swiper.slideTo(swiper.activeIndex || 0, 0, false)
  }

  let resizeTimer = null
  let resizeTimer2 = null

  const handleResize = () => {
    // First sync after layout settles
    clearTimeout(resizeTimer)
    clearTimeout(resizeTimer2)
    resizeTimer = setTimeout(syncBannerSwiper, 200)
    // Second sync to catch devtools animation completion
    resizeTimer2 = setTimeout(syncBannerSwiper, 600)
  }

  window.addEventListener('load', () => setTimeout(syncBannerSwiper, 100))
  window.addEventListener('resize', handleResize)
  lifecycle.onReady(() => setTimeout(syncBannerSwiper, 100))
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(syncBannerSwiper, 100)
  })
})()
