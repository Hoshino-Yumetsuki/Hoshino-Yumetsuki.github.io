'use strict'

window.AcrypleMainPost = (() => {
  const addHighlightTool = () => {
    if (typeof GLOBAL_CONFIG === 'undefined') return

    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const isHighlightCopy = highLight.highlightCopy
    const isHighlightLang = highLight.highlightLang
    const isHighlightShrink =
      typeof GLOBAL_CONFIG_SITE !== 'undefined'
        ? GLOBAL_CONFIG_SITE.isHighlightShrink
        : undefined
    const highlightHeightLimit = highLight.highlightHeightLimit
    const isShowTool =
      isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
    const figureHighlight =
      highLight.plugin === 'highlighjs'
        ? document.querySelectorAll('figure.highlight')
        : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && figureHighlight.length)) return

    const isPrismjs = highLight.plugin === 'prismjs'

    let highlightShrinkEle = ''
    let highlightCopyEle = ''
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

    if (isHighlightShrink !== undefined) {
      highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
    }

    if (isHighlightCopy) {
      highlightCopyEle =
        '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
    }

    const copy = async (text, ctx) => {
      try {
        await navigator.clipboard.writeText(text)
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.success)
        } else {
          const prevEle = ctx.previousElementSibling
          prevEle.innerText = GLOBAL_CONFIG.copy.success
          prevEle.style.opacity = 1
          setTimeout(() => {
            prevEle.style.opacity = 0
          }, 700)
        }
      } catch (err) {
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
        } else {
          ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport
        }
      }
    }

    const highlightCopyFn = (ele) => {
      const buttonParent = ele.parentNode
      buttonParent.classList.add('copy-true')
      const selection = window.getSelection()
      const range = document.createRange()
      if (isPrismjs) {
        range.selectNodeContents(buttonParent.querySelectorAll('pre code')[0])
      } else {
        range.selectNodeContents(buttonParent.querySelectorAll('table .code pre')[0])
      }
      selection.removeAllRanges()
      selection.addRange(range)
      const text = selection.toString()
      copy(text, ele.lastChild)
      selection.removeAllRanges()
      buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = (ele) => {
      const nextElements = [...ele.parentNode.children].slice(1)
      ele.firstChild.classList.toggle('closed')
      const shouldShow = btf.isHidden(nextElements[nextElements.length - 1])
      nextElements.forEach((element) => {
        element.style.display = shouldShow ? 'block' : 'none'
      })
    }

    const highlightToolsFn = function (e) {
      const target = e.target.classList
      if (target.contains('expand')) highlightShrinkFn(this)
      else if (target.contains('copy-button')) highlightCopyFn(this)
    }

    const expandCode = function () {
      this.classList.toggle('expand-done')
    }

    const createEle = (lang, item, service) => {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        hlTools.addEventListener('click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        ele.addEventListener('click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }

    if (isHighlightLang) {
      if (isPrismjs) {
        figureHighlight.forEach((item) => {
          const langName = item.getAttribute('data-language') || 'Code'
          createEle(`<div class="code-lang">${langName}</div>`, item)
          btf.wrap(item, 'figure', { class: 'highlight' })
        })
      } else {
        figureHighlight.forEach((item) => {
          let langName = item.getAttribute('class').split(' ')[1]
          if (langName === 'plain' || langName === undefined) langName = 'Code'
          createEle(`<div class="code-lang">${langName}</div>`, item, 'hl')
        })
      }
    } else if (isPrismjs) {
      figureHighlight.forEach((item) => {
        btf.wrap(item, 'figure', { class: 'highlight' })
        createEle('', item)
      })
    } else {
      figureHighlight.forEach((item) => {
        createEle('', item, 'hl')
      })
    }
  }

  const addTableWrap = () => {
    const tables = document.querySelectorAll(
      '#article-container :not(.highlight) > table, #article-container > table'
    )
    tables.forEach((item) => {
      btf.wrap(item, 'div', { class: 'table-wrap' })
    })
  }

  const clickFnOfTagHide = () => {
    const hideInline = document.querySelectorAll('#article-container .hide-button')
    hideInline.forEach((item) => {
      item.addEventListener('click', function () {
        this.classList.add('open')
        const galleries = this.nextElementSibling.querySelectorAll('.fj-gallery')
        if (galleries.length) btf.initJustifiedGallery(galleries)
      })
    })
  }

  const tabs = {
    clickFnOfTabs: () => {
      document.querySelectorAll('#article-container .tab > button').forEach((item) => {
        item.addEventListener('click', function () {
          const tabItem = this.parentNode
          if (tabItem.classList.contains('active')) return

          const tabContent = tabItem.parentNode.nextElementSibling
          const sibling = btf.siblings(tabItem, '.active')[0]
          sibling && sibling.classList.remove('active')
          tabItem.classList.add('active')

          const tabId = this.getAttribute('data-href').replace('#', '')
          ;[...tabContent.children].forEach((child) => {
            child.classList.toggle('active', child.id === tabId)
          })

          const tabGallery = tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
          if (tabGallery.length > 0) {
            btf.initJustifiedGallery(tabGallery)
          }
        })
      })
    },
    backToTop: () => {
      document
        .querySelectorAll('#article-container .tabs .tab-to-top')
        .forEach((item) => {
          item.addEventListener('click', function () {
            btf.scrollToDest(btf.getEleTop(btf.getParents(this, '.tabs')), 300)
          })
        })
    },
  }

  const toggleCardCategory = () => {
    const cardCategory = document.querySelectorAll(
      '#aside-cat-list .card-category-list-item.parent i'
    )
    cardCategory.forEach((item) => {
      item.addEventListener('click', function (e) {
        e.preventDefault()
        this.classList.toggle('expand')
        const parentElement = this.parentNode.nextElementSibling
        if (btf.isHidden(parentElement)) {
          parentElement.style.display = 'block'
        } else {
          parentElement.style.display = 'none'
        }
      })
    })
  }

  const switchComments = () => {
    let switchDone = false
    const switchBtn = document.querySelector('#comment-switch > .switch-btn')
    if (!switchBtn) return

    switchBtn.addEventListener('click', function () {
      this.classList.toggle('move')
      document
        .querySelectorAll('#post-comment > .comment-wrap > div')
        .forEach((item) => {
          if (btf.isHidden(item)) {
            item.style.cssText = 'display: block;animation: tabshow .5s'
          } else {
            item.style.cssText = "display: none;animation: ''"
          }
        })

      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    })
  }

  const addPostOutdateNotice = () => {
    const data = GLOBAL_CONFIG.noticeOutdate
    const diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay < data.limitDay) return

    const ele = document.createElement('div')
    ele.className = 'post-outdate-notice'
    ele.textContent = `${data.messagePrev} ${diffDay} ${data.messageNext}`
    const targetEle = document.getElementById('article-container')
    if (data.position === 'top') {
      targetEle.insertBefore(ele, targetEle.firstChild)
    } else {
      targetEle.appendChild(ele)
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src',
    })
  }

  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright
    document.body.oncopy = (e) => {
      e.preventDefault()
      const copyFont = window.getSelection(0).toString()
      let textFont = copyFont
      if (copyFont.length > copyright.limitCount) {
        textFont =
          copyFont +
          '\n\n\n' +
          copyright.languages.author +
          '\n' +
          copyright.languages.link +
          window.location.href +
          '\n' +
          copyright.languages.source +
          '\n' +
          copyright.languages.info
      }

      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      }
      return window.clipboardData.setData('text', textFont)
    }
  }

  return {
    addHighlightTool,
    addTableWrap,
    clickFnOfTagHide,
    tabs,
    toggleCardCategory,
    switchComments,
    addPostOutdateNotice,
    lazyloadImg,
    addCopyright,
  }
})()
