'use strict'

window.AcrypleMainHelpers = (() => {
  const setupImageFallbackHandling = () => {
    const handleImageError = () => {
      document.querySelectorAll('img[data-fallback]').forEach((img) => {
        if (!img.dataset.errorHandled) {
          img.addEventListener(
            'error',
            function () {
              if (!this.dataset.errorHandled) {
                this.src = this.dataset.fallback
                this.dataset.errorHandled = 'true'
              }
            },
            { once: true }
          )
        }
      })
    }

    handleImageError()

    if (window.MutationObserver) {
      const observer = new MutationObserver(() => {
        handleImageError()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  }

  const waitForImages = () => {
    return new Promise((resolve) => {
      const images = document.querySelectorAll('img')
      if (images.length === 0) {
        resolve()
        return
      }

      let loadedImages = 0
      const checkAllImagesLoaded = () => {
        loadedImages++
        if (loadedImages >= images.length) {
          resolve()
        }
      }

      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded()
        } else {
          img.addEventListener('load', checkAllImagesLoaded)
          img.addEventListener('error', checkAllImagesLoaded)
        }
      })

      setTimeout(() => resolve(), 3000)
    })
  }

  const addPhotoFigcaption = () => {
    document.querySelectorAll('#article-container img').forEach((item) => {
      const parentEle = item.parentNode
      const altValue = item.title || item.alt
      if (
        altValue &&
        !parentEle.parentNode.classList.contains('justified-gallery')
      ) {
        const ele = document.createElement('div')
        ele.className = 'img-alt is-center'
        ele.textContent = altValue
        parentEle.insertBefore(ele, item.nextSibling)
      }
    })
  }

  const runLightbox = () => {
    btf.loadLightbox(
      document.querySelectorAll('#article-container img:not(.no-lightbox)')
    )
  }

  const runJustifiedGallery = (ele) => {
    ele.forEach((item) => {
      const $imgList = item.querySelectorAll('img')

      $imgList.forEach((i) => {
        const dataLazySrc = i.getAttribute('data-lazy-src')
        if (dataLazySrc) i.src = dataLazySrc
        btf.wrap(i, 'div', { class: 'fj-gallery-item' })
      })
    })

    if (window.fjGallery) {
      setTimeout(() => {
        btf.initJustifiedGallery(ele)
      }, 100)
      return
    }

    const newEle = document.createElement('link')
    newEle.rel = 'stylesheet'
    newEle.href = GLOBAL_CONFIG.source.justifiedGallery.css
    document.body.appendChild(newEle)
    getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(() => {
      btf.initJustifiedGallery(ele)
    })
  }

  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.innerText =
        btf.diffDate(publishDate) + ' ' + GLOBAL_CONFIG.runtime
    }
  }

  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.innerText = btf.diffDate(lastPushDate, true)
    }
  }

  const relativeDate = (selector) => {
    selector.forEach((item) => {
      const timeVal = item.getAttribute('datetime')
      item.innerText = btf.diffDate(timeVal, true)
      item.style.display = 'inline'
    })
  }

  return {
    setupImageFallbackHandling,
    waitForImages,
    addPhotoFigcaption,
    runLightbox,
    runJustifiedGallery,
    addRuntime,
    addLastPushDate,
    relativeDate,
  }
})()
