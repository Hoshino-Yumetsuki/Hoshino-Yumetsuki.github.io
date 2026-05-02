'use strict'

window.AcrypleMainRuntime = (() => {
  const createRuntimeController = () => {
    const scrollFn = () => {
      const rightside = document.getElementById('rightside')
      if (!rightside) return

      const innerHeight = window.innerHeight + 56
      if (document.body.scrollHeight <= innerHeight) {
        rightside.style.cssText = 'opacity: 1; transform: translateX(-58px)'
        return
      }

      let initTop = 0
      let isChatShow = true
      const header = document.getElementById('page-header')
      if (!header) return

      const isChatBtnHide = typeof chatBtnHide === 'function'
      const isChatBtnShow = typeof chatBtnShow === 'function'

      const scrollDirection = (currentTop) => {
        const result = currentTop > initTop
        initTop = currentTop
        return result
      }

      header.classList.add('nav-fixed', 'nav-visible')

      window.scrollCollect = () => {
        return btf.throttle(() => {
          const currentTop = window.scrollY || document.documentElement.scrollTop
          const isDown = scrollDirection(currentTop)

          header.classList.add('nav-fixed', 'nav-visible')

          if (currentTop > 0) {
            if (isDown) {
              header.classList.add('nav-visible')
              if (isChatBtnShow && isChatShow === true) {
                chatBtnHide()
                isChatShow = false
              }
            } else {
              header.classList.add('nav-visible')
              if (isChatBtnHide && isChatShow === false) {
                chatBtnShow()
                isChatShow = true
              }
            }

            if (
              window.getComputedStyle(rightside).getPropertyValue('opacity') === '0'
            ) {
              rightside.style.cssText = 'opacity: 1;  transform: translateX(-58px)'
            }
          } else {
            header.classList.remove('nav-fixed', 'nav-visible')
            rightside.style.cssText = "opacity: ''; transform: ''"
          }

          if (document.body.scrollHeight <= innerHeight) {
            rightside.style.cssText = 'opacity: 1; transform: translateX(-58px)'
          }
        }, 200)()
      }

      window.addEventListener('scroll', scrollCollect)
    }

    const setupTocAndAnchor = () => {
      try {
        const isToc = GLOBAL_CONFIG_SITE.isToc
        const isAnchor = GLOBAL_CONFIG.isAnchor
        const article = document.getElementById('article-container')

        if (!(article && (isToc || isAnchor))) return

        let tocLink
        let cardToc
        let scrollPercent
        let autoScrollToc
        let isExpand

        if (isToc) {
          const cardTocLayout = document.getElementById('card-toc')
          if (!cardTocLayout) return

          cardToc = cardTocLayout.getElementsByClassName('toc-content')[0]
          tocLink = cardToc.querySelectorAll('.toc-link')
          const tocPercentage = cardTocLayout.querySelector('.toc-percentage')
          isExpand = cardToc.classList.contains('is-expand')

          scrollPercent = (currentTop) => {
            const docHeight = article.clientHeight
            const winHeight = document.documentElement.clientHeight
            const headerHeight = article.offsetTop
            const contentMath =
              docHeight > winHeight
                ? docHeight - winHeight
                : document.documentElement.scrollHeight - winHeight
            const percent = Math.round(((currentTop - headerHeight) / contentMath) * 100)
            const percentage = percent > 100 ? 100 : percent <= 0 ? 0 : percent
            tocPercentage.textContent = percentage
          }

          window.mobileToc = {
            open: () => {
              cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
            },
            close: () => {
              cardTocLayout.style.animation = 'toc-close .2s'
              setTimeout(() => {
                cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
              }, 100)
            },
          }

          cardToc.addEventListener('click', (e) => {
            e.preventDefault()
            const target = e.target.classList
            if (target.contains('toc-content')) return

            const currentTarget = target.contains('toc-link')
              ? e.target
              : e.target.parentElement

            btf.scrollToDest(
              btf.getEleTop(
                document.getElementById(
                  decodeURI(currentTarget.getAttribute('href')).replace('#', '')
                )
              ),
              300
            )

            if (window.innerWidth < 900) {
              window.mobileToc.close()
            }
          })

          autoScrollToc = (item) => {
            const activePosition = item.getBoundingClientRect().top
            const sidebarScrollTop = cardToc.scrollTop
            if (activePosition > document.documentElement.clientHeight - 100) {
              cardToc.scrollTop = sidebarScrollTop + 150
            }
            if (activePosition < 100) {
              cardToc.scrollTop = sidebarScrollTop - 150
            }
          }
        }

        const list = article.querySelectorAll('h1,h2,h3,h4,h5,h6')
        let detectItem = ''

        const findHeadPosition = (top) => {
          if (top === 0) return false

          let currentId = ''
          let currentIndex = ''

          list.forEach((ele, index) => {
            if (top > btf.getEleTop(ele) - 80) {
              const id = ele.id
              currentId = id ? '#' + encodeURI(id) : ''
              currentIndex = index
            }
          })

          if (detectItem === currentIndex) return
          if (isAnchor) btf.updateAnchor(currentId)
          detectItem = currentIndex

          if (isToc) {
            cardToc.querySelectorAll('.active').forEach((item) => {
              item.classList.remove('active')
            })

            if (currentId === '') return

            const currentActive = tocLink[currentIndex]
            currentActive.classList.add('active')

            setTimeout(() => {
              autoScrollToc(currentActive)
            }, 0)

            if (isExpand) return
            let parent = currentActive.parentNode
            for (; !parent.matches('.toc'); parent = parent.parentNode) {
              if (parent.matches('li')) parent.classList.add('active')
            }
          }
        }

        window.tocScrollFn = () => {
          return btf.throttle(() => {
            const currentTop = window.scrollY || document.documentElement.scrollTop
            isToc && scrollPercent(currentTop)
            findHeadPosition(currentTop)
          }, 100)()
        }

        window.addEventListener('scroll', tocScrollFn)
      } catch (err) {
        console.error('TOC scroll setup error:', err)
      }
    }

    const rightSide = {
      switchReadMode: () => {
        const body = document.body
        body.classList.add('read-mode')
        const newEle = document.createElement('button')
        newEle.type = 'button'
        newEle.className = 'fas fa-sign-out-alt exit-readmode'
        body.appendChild(newEle)

        const clickFn = () => {
          body.classList.remove('read-mode')
          newEle.remove()
          newEle.removeEventListener('click', clickFn)
        }

        newEle.addEventListener('click', clickFn)
      },
      switchDarkMode: () => {
        const nowMode =
          document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'dark'
            : 'light'

        if (nowMode === 'light') {
          activateDarkMode()
          saveToLocal.set('theme', 'dark', 2)
          GLOBAL_CONFIG.Snackbar !== undefined &&
            btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        } else {
          activateLightMode()
          saveToLocal.set('theme', 'light', 2)
          GLOBAL_CONFIG.Snackbar !== undefined &&
            btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        }

        typeof utterancesTheme === 'function' && utterancesTheme()
        typeof changeGiscusTheme === 'function' && changeGiscusTheme()
        typeof FB === 'object' && window.loadFBComment()
        window.DISQUS &&
          document.getElementById('disqus_thread').children.length &&
          setTimeout(() => window.disqusReset(), 200)
        typeof runMermaid === 'function' && window.runMermaid()
      },
      showOrHideBtn: (element) => {
        const rightsideHideClassList = document.getElementById('rightside-config-hide').classList
        rightsideHideClassList.toggle('show')
        if (element.classList.contains('show')) {
          rightsideHideClassList.add('status')
          setTimeout(() => {
            rightsideHideClassList.remove('status')
          }, 300)
        }
        element.classList.toggle('show')
      },
      scrollToTop: () => {
        btf.scrollToDest(0, 500)
      },
      hideAsideBtn: () => {
        const htmlDom = document.documentElement.classList
        htmlDom.contains('hide-aside')
          ? saveToLocal.set('aside-status', 'show', 2)
          : saveToLocal.set('aside-status', 'hide', 2)
        htmlDom.toggle('hide-aside')
      },
      runMobileToc: () => {
        if (
          window
            .getComputedStyle(document.getElementById('card-toc'))
            .getPropertyValue('opacity') === '0'
        ) {
          window.mobileToc.open()
        } else {
          window.mobileToc.close()
        }
      },
    }

    const bindRightSideEvents = () => {
      const rightside = document.getElementById('rightside')
      if (!rightside) return

      rightside.addEventListener('click', (e) => {
        const target = e.target.id ? e.target : e.target.parentNode
        switch (target.id) {
          case 'go-up':
            rightSide.scrollToTop()
            break
          case 'rightside_config':
            rightSide.showOrHideBtn(target)
            break
          case 'mobile-toc-button':
            rightSide.runMobileToc()
            break
          case 'readmode':
            rightSide.switchReadMode()
            break
          case 'darkmode':
            rightSide.switchDarkMode()
            break
          case 'hide-aside-btn':
            rightSide.hideAsideBtn()
            break
          default:
            break
        }
      })
    }

    return {
      scrollFn,
      setupTocAndAnchor,
      bindRightSideEvents,
    }
  }

  return {
    createRuntimeController,
  }
})()
