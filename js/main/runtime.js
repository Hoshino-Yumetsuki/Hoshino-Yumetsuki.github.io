"use strict"

window.AcrypleMainRuntime = (() => {
  const createRuntimeController = () => {
    let removeScrollHandler
    let removeTocScrollHandler
    let rightsideElement
    let rightsideClickHandler
    let tocElement
    let tocClickHandler
    let mobileTocCloseTimer
    let autoScrollTocTimer
    let rightsideStatusTimer
    let heroParallax
    let heroMotionQuery
    let heroSetupGeneration = 0
    let parallaxLoad

    const loadParallax = () => {
      if (typeof Parallax === "function") return Promise.resolve()
      if (parallaxLoad) return parallaxLoad

      parallaxLoad = new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://fastly.jsdelivr.net/npm/parallax-js@3.1.0/dist/parallax.min.js"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      }).catch(() => {
        parallaxLoad = null
      })

      return parallaxLoad
    }

    const cleanupHeroParallax = () => {
      heroSetupGeneration++
      heroParallax && heroParallax.destroy()
      heroParallax = null
      if (heroMotionQuery) heroMotionQuery.removeEventListener("change", setupHeroParallax)
      heroMotionQuery = null
    }

    const setupHeroParallax = () => {
      cleanupHeroParallax()

      const scene = document.getElementById("home-landing-scene")
      if (!scene) return

      const generation = heroSetupGeneration
      heroMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      heroMotionQuery.addEventListener("change", setupHeroParallax)
      if (heroMotionQuery.matches) return

      loadParallax().then(() => {
        if (
          generation !== heroSetupGeneration ||
          !scene.isConnected ||
          typeof Parallax !== "function"
        )
          return
        heroParallax = new Parallax(scene, {
          relativeInput: true,
          hoverOnly: true,
          scalarX: 8,
          scalarY: 5,
          frictionX: 0.08,
          frictionY: 0.08
        })
      })
    }

    const updateNavGlass = (currentTop) => {
      const nav = document.getElementById("nav")
      const landing = document.querySelector(".home-landing")
      if (!nav) return

      if (!landing) {
        nav.style.removeProperty("--nav-glass-progress")
        nav.classList.remove("nav-over-landing")
        return
      }

      const end = Math.max(landing.offsetHeight * 0.72, 1)
      const progress = Math.min(Math.max(currentTop / end, 0), 1)
      nav.style.setProperty("--nav-glass-progress", progress.toFixed(3))
      nav.classList.toggle("nav-over-landing", progress < 1)
    }

    const cleanupScroll = () => {
      removeScrollHandler && removeScrollHandler()
      removeScrollHandler = null
      const nav = document.getElementById("nav")
      nav?.style.removeProperty("--nav-glass-progress")
      nav?.classList.remove("nav-over-landing")
    }

    const cleanupToc = () => {
      removeTocScrollHandler && removeTocScrollHandler()
      clearTimeout(mobileTocCloseTimer)
      clearTimeout(autoScrollTocTimer)
      mobileTocCloseTimer = null
      autoScrollTocTimer = null
      removeTocScrollHandler = null
      if (tocElement && tocClickHandler) {
        tocElement.removeEventListener("click", tocClickHandler)
      }
      tocElement = null
      tocClickHandler = null
      window.mobileToc = null
    }

    const cleanupRightSide = () => {
      clearTimeout(rightsideStatusTimer)
      rightsideStatusTimer = null
      if (rightsideElement && rightsideClickHandler) {
        rightsideElement.removeEventListener("click", rightsideClickHandler)
      }
      rightsideElement = null
      rightsideClickHandler = null
    }

    const cleanup = () => {
      cleanupScroll()
      cleanupToc()
      cleanupRightSide()
      cleanupHeroParallax()
    }

    const scrollFn = () => {
      cleanupScroll()
      const rightside = document.getElementById("rightside")
      const header = document.getElementById("page-header")
      if (!header) return

      const updateRightside = (visible) => {
        if (!rightside) return
        rightside.style.opacity = visible ? "1" : ""
        rightside.style.transform = visible ? "translateX(-58px)" : ""
      }

      let previousTop = window.scrollY || document.documentElement.scrollTop
      let rightsideVisible = false
      const isChatBtnHide = typeof chatBtnHide === "function"
      const isChatBtnShow = typeof chatBtnShow === "function"
      let isChatShow = true

      const scrollCollect = (currentTop) => {
        const isDown = currentTop > previousTop
        const moved = Math.abs(currentTop - previousTop) > 2
        previousTop = currentTop
        updateNavGlass(currentTop)

        if (currentTop <= 0) {
          header.classList.remove("nav-fixed", "nav-visible", "nav-hidden")
          updateRightside(false)
          rightsideVisible = false
          return
        }

        header.classList.add("nav-fixed")
        if (moved) {
          header.classList.toggle("nav-hidden", isDown)
          header.classList.toggle("nav-visible", !isDown)
        }

        if (isDown) {
          if (isChatBtnHide && isChatShow) {
            chatBtnHide()
            isChatShow = false
          }
        } else if (isChatBtnShow && !isChatShow) {
          chatBtnShow()
          isChatShow = true
        }

        if (!rightsideVisible) {
          updateRightside(true)
          rightsideVisible = true
        }

        if (document.body.scrollHeight <= window.innerHeight + 56) {
          updateRightside(true)
          rightsideVisible = true
        }
      }

      header.classList.add("nav-fixed", "nav-visible")
      updateNavGlass(previousTop)
      removeScrollHandler = lifecycle.onScroll(scrollCollect)
    }

    const setupTocAndAnchor = () => {
      cleanupToc()
      try {
        const isToc = GLOBAL_CONFIG_SITE.isToc
        const isAnchor = GLOBAL_CONFIG.isAnchor
        const article = document.getElementById("article-container")

        if (!(article && (isToc || isAnchor))) return

        let tocLinksById
        let cardToc
        let scrollPercent
        let autoScrollToc
        let isExpand

        if (isToc) {
          const cardTocLayout = document.getElementById("card-toc")
          if (!cardTocLayout) return

          cardToc = cardTocLayout.getElementsByClassName("toc-content")[0]
          if (!cardToc) return
          tocLinksById = new Map(
            [...cardToc.querySelectorAll(".toc-link")].map((link) => [
              decodeURI(link.getAttribute("href")).replace("#", ""),
              link
            ])
          )
          const tocPercentage = cardTocLayout.querySelector(".toc-percentage")
          isExpand = cardToc.classList.contains("is-expand")

          scrollPercent = () => {
            const docHeight = Math.max(article.scrollHeight, 1)
            const winHeight = Math.max(window.innerHeight, 1)
            const articleTop = btf.getEleTop(article)
            const contentHeight = Math.max(docHeight - winHeight, 1)
            const percent = Math.round(((window.scrollY - articleTop) / contentHeight) * 100)
            tocPercentage.textContent = `${Math.min(Math.max(percent, 0), 100)}%`
          }

          window.mobileToc = {
            open: () => {
              cardTocLayout.style.cssText = "animation: toc-open .3s; opacity: 1; right: 55px"
            },
            close: () => {
              cardTocLayout.style.animation = "toc-close .2s"
              mobileTocCloseTimer = setTimeout(() => {
                cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
              }, 100)
            }
          }

          tocElement = cardToc
          tocClickHandler = (e) => {
            e.preventDefault()
            const target = e.target.classList
            if (target.contains("toc-content")) return

            const currentTarget = target.contains("toc-link") ? e.target : e.target.parentElement

            btf.scrollToDest(
              btf.getEleTop(
                document.getElementById(
                  decodeURI(currentTarget.getAttribute("href")).replace("#", "")
                )
              ),
              300
            )

            if (window.innerWidth < 900) {
              window.mobileToc.close()
            }
          }
          tocElement.addEventListener("click", tocClickHandler)

          autoScrollToc = (item) => {
            const activePosition = item.getBoundingClientRect().top
            const sidebarScrollTop = cardToc.scrollTop
            const tocViewportTop = cardToc.getBoundingClientRect().top
            const tocViewportBottom = cardToc.getBoundingClientRect().bottom
            if (activePosition > tocViewportBottom - 40) {
              cardToc.scrollTop = sidebarScrollTop + 150
            }
            if (activePosition < tocViewportTop + 40) {
              cardToc.scrollTop = Math.max(sidebarScrollTop - 150, 0)
            }
          }
        }

        const list = article.querySelectorAll("h1,h2,h3,h4,h5,h6")
        let detectItem = ""

        const findHeadPosition = (top) => {
          if (top === 0) return false

          let currentId = ""
          let currentHeadingId = ""

          list.forEach((ele, index) => {
            if (top > btf.getEleTop(ele) - 80) {
              currentHeadingId = ele.id
              currentId = currentHeadingId ? "#" + encodeURI(currentHeadingId) : ""
              currentIndex = index
            }
          })

          if (detectItem === currentIndex) return
          if (isAnchor) btf.updateAnchor(currentId)
          detectItem = currentIndex

          if (isToc) {
            cardToc.querySelectorAll(".active").forEach((item) => {
              item.classList.remove("active")
            })

            if (currentId === "") return

            const currentActive = tocLinksById.get(currentHeadingId)
            if (!currentActive) return
            currentActive.classList.add("active")

            autoScrollTocTimer = setTimeout(() => {
              autoScrollToc(currentActive)
            }, 0)

            if (isExpand) return
            let parent = currentActive.parentNode
            for (; !parent.matches(".toc"); parent = parent.parentNode) {
              if (parent.matches("li")) parent.classList.add("active")
            }
          }
        }

        const tocScrollFn = btf.throttle((currentTop) => {
          isToc && scrollPercent(currentTop)
          findHeadPosition(currentTop)
        }, 100)

        removeTocScrollHandler = lifecycle.onScroll(tocScrollFn)
      } catch (err) {
        console.error("TOC scroll setup error:", err)
      }
    }

    const rightSide = {
      switchReadMode: () => {
        const body = document.body
        body.classList.add("read-mode")
        const newEle = document.createElement("button")
        newEle.type = "button"
        newEle.className = "fas fa-sign-out-alt exit-readmode"
        body.appendChild(newEle)

        const clickFn = () => {
          body.classList.remove("read-mode")
          newEle.remove()
          newEle.removeEventListener("click", clickFn)
        }

        newEle.addEventListener("click", clickFn)
      },
      switchDarkMode: () => {
        const nowMode =
          document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"

        if (nowMode === "light") {
          activateDarkMode()
          saveToLocal.set("theme", "dark", 2)
          GLOBAL_CONFIG.Snackbar !== undefined &&
            btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        } else {
          activateLightMode()
          saveToLocal.set("theme", "light", 2)
          GLOBAL_CONFIG.Snackbar !== undefined &&
            btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        }

        typeof utterancesTheme === "function" && utterancesTheme()
        typeof changeGiscusTheme === "function" && changeGiscusTheme()
        typeof FB === "object" && window.loadFBComment()
        window.DISQUS &&
          document.getElementById("disqus_thread").children.length &&
          setTimeout(() => window.disqusReset(), 200)
        typeof runMermaid === "function" && window.runMermaid()
      },
      showOrHideBtn: (element) => {
        const rightsideHideClassList = document.getElementById("rightside-config-hide").classList
        rightsideHideClassList.toggle("show")
        if (element.classList.contains("show")) {
          rightsideHideClassList.add("status")
          rightsideStatusTimer = setTimeout(() => {
            rightsideHideClassList.remove("status")
          }, 300)
        }
        element.classList.toggle("show")
      },
      scrollToTop: () => {
        btf.scrollToDest(0, 500)
      },
      hideAsideBtn: () => {
        const htmlDom = document.documentElement.classList
        htmlDom.contains("hide-aside")
          ? saveToLocal.set("aside-status", "show", 2)
          : saveToLocal.set("aside-status", "hide", 2)
        htmlDom.toggle("hide-aside")
      },
      runMobileToc: () => {
        if (
          window
            .getComputedStyle(document.getElementById("card-toc"))
            .getPropertyValue("opacity") === "0"
        ) {
          window.mobileToc.open()
        } else {
          window.mobileToc.close()
        }
      }
    }

    const bindRightSideEvents = () => {
      cleanupRightSide()
      rightsideElement = document.getElementById("rightside")
      if (!rightsideElement) return

      rightsideClickHandler = (e) => {
        const target = e.target.id ? e.target : e.target.parentNode
        switch (target.id) {
          case "go-up":
            rightSide.scrollToTop()
            break
          case "rightside_config":
            rightSide.showOrHideBtn(target)
            break
          case "mobile-toc-button":
            rightSide.runMobileToc()
            break
          case "readmode":
            rightSide.switchReadMode()
            break
          case "darkmode":
            rightSide.switchDarkMode()
            break
          case "hide-aside-btn":
            rightSide.hideAsideBtn()
            break
          default:
            break
        }
      }
      rightsideElement.addEventListener("click", rightsideClickHandler)
    }

    return {
      scrollFn,
      setupHeroParallax,
      setupTocAndAnchor,
      bindRightSideEvents,
      cleanup
    }
  }

  return {
    createRuntimeController
  }
})()
