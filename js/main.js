"use strict"
;(() => {
  const {
    setupImageFallbackHandling,
    waitForImages,
    addPhotoFigcaption,
    runLightbox,
    runJustifiedGallery,
    addRuntime,
    addLastPushDate,
    relativeDate
  } = window.AcrypleMainHelpers || {}
  const { createNavigationRuntime } = window.AcrypleMainNavigation || {}
  const {
    addHighlightTool,
    addTableWrap,
    clickFnOfTagHide,
    tabs,
    toggleCardCategory,
    switchComments,
    addPostOutdateNotice,
    lazyloadImg,
    addCopyright
  } = window.AcrypleMainPost || {}
  const { createRuntimeController } = window.AcrypleMainRuntime || {}

  const navigation = createNavigationRuntime ? createNavigationRuntime() : null
  const runtime = createRuntimeController ? createRuntimeController() : null

  const setupPersistentBehavior = () => {
    setupImageFallbackHandling && setupImageFallbackHandling()
    navigation && navigation.bindPersistentEvents()
    GLOBAL_CONFIG.islazyload && lazyloadImg && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright && addCopyright()
  }

  let refreshGeneration = 0
  const refresh = () => {
    const generation = ++refreshGeneration
    navigation && navigation.initAdjust()
    runtime && runtime.scrollFn()
    // 文章内容初始化等待图片，导航和滚动监听不依赖图片加载。
    waitForImages().then(() => {
      if (generation !== refreshGeneration) return

      if (GLOBAL_CONFIG_SITE.isPost) {
        GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice && addPostOutdateNotice()
        GLOBAL_CONFIG.relativeDate.post &&
          relativeDate(document.querySelectorAll("#post-meta time"))
      } else {
        GLOBAL_CONFIG.relativeDate.homepage &&
          relativeDate(document.querySelectorAll("#recent-posts time"))
        GLOBAL_CONFIG.runtime && addRuntime()
        addLastPushDate()
        toggleCardCategory && toggleCardCategory()
      }

      runtime && runtime.setupTocAndAnchor()
      runtime && runtime.setupHeroParallax()
      GLOBAL_CONFIG_SITE.isHome && navigation && navigation.scrollDownInIndex()
      addHighlightTool && addHighlightTool()
      GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption && addPhotoFigcaption()

      const $jgEle = document.querySelectorAll("#article-container .fj-gallery")
      $jgEle.length && runJustifiedGallery && runJustifiedGallery($jgEle)

      runLightbox && runLightbox()
      addTableWrap && addTableWrap()
      clickFnOfTagHide && clickFnOfTagHide()
      tabs && tabs.clickFnOfTabs()
      tabs && tabs.backToTop()
      switchComments && switchComments()
      runtime && runtime.bindRightSideEvents()
    })
  }

  lifecycle.once(setupPersistentBehavior)
  lifecycle.onReady(refresh)
  lifecycle.onCleanup(() => {
    refreshGeneration++
    if (navigation && navigation.sidebar.isOpen()) navigation.sidebar.close()
    runtime && runtime.cleanup()
  })
})()
