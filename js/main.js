'use strict'

document.addEventListener('DOMContentLoaded', function () {
  const {
    setupImageFallbackHandling,
    waitForImages,
    addPhotoFigcaption,
    runLightbox,
    runJustifiedGallery,
    addRuntime,
    addLastPushDate,
    relativeDate,
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
    addCopyright,
  } = window.AcrypleMainPost || {}
  const { createRuntimeController } = window.AcrypleMainRuntime || {}

  setupImageFallbackHandling && setupImageFallbackHandling()
  const navigation = createNavigationRuntime ? createNavigationRuntime() : null
  const runtime = createRuntimeController ? createRuntimeController() : null


  const unRefreshFn = function () {
    navigation && navigation.bindPersistentEvents()
    GLOBAL_CONFIG.islazyload && lazyloadImg && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright && addCopyright()
  }

  window.refreshFn = function () {
    // 等待图片加载完成后再初始化
    waitForImages().then(() => {
      navigation && navigation.initAdjust()

      if (GLOBAL_CONFIG_SITE.isPost) {
        GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice && addPostOutdateNotice()
        GLOBAL_CONFIG.relativeDate.post &&
          relativeDate(document.querySelectorAll('#post-meta time'))
      } else {
        GLOBAL_CONFIG.relativeDate.homepage &&
          relativeDate(document.querySelectorAll('#recent-posts time'))
        GLOBAL_CONFIG.runtime && addRuntime()
        addLastPushDate()
        toggleCardCategory && toggleCardCategory()
      }

      runtime && runtime.setupTocAndAnchor()
      GLOBAL_CONFIG_SITE.isHome && navigation && navigation.scrollDownInIndex()
      addHighlightTool && addHighlightTool()
      GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption && addPhotoFigcaption()
      runtime && runtime.scrollFn()

      const $jgEle = document.querySelectorAll('#article-container .fj-gallery')
      $jgEle.length && runJustifiedGallery && runJustifiedGallery($jgEle)

      runLightbox && runLightbox()
      addTableWrap && addTableWrap()
      clickFnOfTagHide && clickFnOfTagHide()
      tabs && tabs.clickFnOfTabs()
      tabs && tabs.backToTop()
      switchComments && switchComments()
      navigation && navigation.bindRefreshEvents()
      runtime && runtime.bindRightSideEvents()
    })
  }

  refreshFn()
  unRefreshFn()
})
