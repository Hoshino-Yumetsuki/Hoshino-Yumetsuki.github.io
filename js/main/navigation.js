'use strict'

window.AcrypleMainNavigation = (() => {
  const createNavigationRuntime = () => {
    let blogNameWidth
    let menusWidth
    let searchWidth
    let navElement
    let mobileSidebarOpen = false

    const adjustMenu = (init) => {
      if (init) {
        const siteNameEle = document.getElementById('site-name')
        if (!siteNameEle) return

        blogNameWidth = siteNameEle.offsetWidth
        const menusEle = document.querySelectorAll('#menus .menus_item')
        menusWidth = 0
        menusEle.forEach((item) => {
          menusWidth += item.offsetWidth
        })

        const searchEle = document.querySelector('#search-button')
        searchWidth = searchEle ? searchEle.offsetWidth : 0
        navElement = document.getElementById('nav')
        if (!navElement) return
      }

      if (!navElement) return

      let hideMenuIndex = false
      if (window.innerWidth < 768) {
        hideMenuIndex = true
      } else {
        hideMenuIndex =
          blogNameWidth + menusWidth + searchWidth > navElement.offsetWidth - 120
      }

      navElement.classList.toggle('hide-menu', hideMenuIndex)
    }

    const initAdjust = () => {
      try {
        adjustMenu(true)
        if (navElement) {
          navElement.classList.add('show')
        }
      } catch (err) {
        console.error('Header initialization error:', err)
      }
    }

    const sidebar = {
      open: () => {
        btf.sidebarPaddingR()
        document.body.style.overflow = 'hidden'
        const menuMask = document.getElementById('menu-mask')
        const sidebarMenus = document.getElementById('sidebar-menus')
        if (menuMask) btf.animateIn(menuMask, 'to_show 0.5s')
        if (sidebarMenus) sidebarMenus.classList.add('open')
        mobileSidebarOpen = true
      },
      close: () => {
        const body = document.body
        body.style.overflow = ''
        body.style.paddingRight = ''
        const menuMask = document.getElementById('menu-mask')
        const sidebarMenus = document.getElementById('sidebar-menus')
        if (menuMask) btf.animateOut(menuMask, 'to_hide 0.5s')
        if (sidebarMenus) sidebarMenus.classList.remove('open')
        mobileSidebarOpen = false
      },
      isOpen: () => mobileSidebarOpen,
    }

    const scrollDownInIndex = () => {
      try {
        const scrollDownEle = document.getElementById('scroll-down')
        const contentInner = document.getElementById('content-inner')
        if (scrollDownEle && contentInner) {
          scrollDownEle.addEventListener('click', () => {
            btf.scrollToDest(contentInner.offsetTop, 300)
          })
        }
      } catch (err) {
        console.error('Scroll down setup error:', err)
      }
    }

    const bindSubMenu = () => {
      document
        .querySelectorAll('#sidebar-menus .site-page.group')
        .forEach((item) => {
          item.addEventListener('click', function () {
            this.classList.toggle('hide')
          })
        })
    }

    const bindPersistentEvents = () => {
      window.addEventListener('resize', () => {
        adjustMenu(false)
        const toggleMenu = document.getElementById('toggle-menu')
        if (toggleMenu && btf.isHidden(toggleMenu) && mobileSidebarOpen) {
          sidebar.close()
        }
      })

      const menuMask = document.getElementById('menu-mask')
      if (menuMask) {
        menuMask.addEventListener('click', () => {
          sidebar.close()
        })
      }

      bindSubMenu()
    }

    const bindRefreshEvents = () => {
      const toggleMenu = document.getElementById('toggle-menu')
      if (toggleMenu) {
        toggleMenu.addEventListener('click', () => {
          sidebar.open()
        })
      }
    }

    return {
      adjustMenu,
      initAdjust,
      sidebar,
      scrollDownInIndex,
      bindPersistentEvents,
      bindRefreshEvents,
    }
  }

  return {
    createNavigationRuntime,
  }
})()
