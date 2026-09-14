"use strict"
;(() => {
  const createBannerSwiperController = () => {
    let swiper = null
    let resizeTimer = null
    let resizeTimer2 = null

    const getContainer = () => document.querySelector("#swiper_container")

    const syncSize = () => {
      const container = getContainer()
      if (
        !swiper ||
        swiper.destroyed ||
        !container ||
        swiper.el !== container ||
        !swiper.slides ||
        !swiper.slides.length
      )
        return

      const containerWidth = container.clientWidth
      if (!containerWidth) return

      // Swiper 5.x caches width internally. Force it to pick up new container size.
      const slides = swiper.slides
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.width = containerWidth + "px"
      }

      swiper.width = containerWidth
      swiper.updateSize()
      swiper.updateSlides()
      swiper.updateProgress()
      swiper.updateSlidesClasses()
      swiper.slideTo(swiper.activeIndex || 0, 0, false)
    }

    const destroy = () => {
      clearTimeout(resizeTimer)
      clearTimeout(resizeTimer2)
      const previousSwiper = swiper
      swiper = null
      if (
        previousSwiper &&
        !previousSwiper.destroyed &&
        typeof previousSwiper.destroy === "function"
      ) {
        previousSwiper.el.onmouseenter = null
        previousSwiper.el.onmouseleave = null
        previousSwiper.destroy(true, true)
      }
      if (window.swiper === previousSwiper) window.swiper = null
    }

    const init = () => {
      const container = getContainer()
      if (!container || typeof window.Swiper !== "function") return

      if (swiper && swiper.el === container && !swiper.destroyed) {
        syncSize()
        return
      }

      destroy()
      swiper = new window.Swiper("#swiper_container", {
        passiveListeners: true,
        spaceBetween: 30,
        effect: "fade",
        loop: true,
        autoplay: {
          disableOnInteraction: false,
          delay: 3000
        },
        // Unlike the plugin default, the banner must not capture vertical wheel input.
        mousewheel: false,
        pagination: {
          el: ".blog-slider__pagination",
          clickable: true
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }
      })

      window.swiper = swiper
      swiper.el.onmouseenter = () => {
        if (swiper.autoplay) swiper.autoplay.stop()
      }
      swiper.el.onmouseleave = () => {
        if (swiper.autoplay) swiper.autoplay.start()
      }
      syncSize()
    }

    const handleResize = () => {
      clearTimeout(resizeTimer)
      clearTimeout(resizeTimer2)
      resizeTimer = setTimeout(syncSize, 200)
      resizeTimer2 = setTimeout(syncSize, 600)
    }

    window.lifecycle.onReady(init)
    window.lifecycle.onCleanup(destroy)
    window.addEventListener("load", syncSize)
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncSize()
    })

    return { init }
  }

  const controller = window.__acrypleSwiperBanner || createBannerSwiperController()
  window.__acrypleSwiperBanner = controller
  controller.init()
})()
