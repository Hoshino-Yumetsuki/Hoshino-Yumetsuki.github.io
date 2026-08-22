"use strict"
;(() => {
  const wheelBound = new WeakSet()

  const normalizePath = (pathname) => decodeURI(pathname).replace(/\/+$/, "")

  const isCurrent = (link) => {
    const currentPath = normalizePath(window.location.pathname)
    const linkPath = normalizePath(link.pathname)
    if (currentPath === linkPath) return true

    const currentName = currentPath.slice(currentPath.lastIndexOf("/") + 1)
    return currentName === link.textContent.trim()
  }

  const initTaxonomyNavigation = () => {
    document.querySelectorAll(".category-list .category-list-item").forEach((item) => {
      const link = item.querySelector("a")
      item.classList.toggle("checked", Boolean(link && isCurrent(link)))
    })

    document.querySelectorAll("#tag .lists a").forEach((link) => {
      link.classList.toggle("checked", isCurrent(link))
    })

    const taxonomy = document.querySelector("#category, #tag")
    if (taxonomy) {
      const checkedItem = taxonomy.querySelector(".checked")
      if (checkedItem) checkedItem.scrollIntoView()
      taxonomy.scrollIntoView()
    }

    document.querySelectorAll(".category-list-bar .lists, .tag-list-bar .lists").forEach((list) => {
      if (wheelBound.has(list)) return
      list.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault()
          list.scrollLeft += event.deltaY > 0 ? 20 : -20
        },
        { passive: false }
      )
      wheelBound.add(list)
    })
  }

  window.lifecycle.onReady(initTaxonomyNavigation)
})()
