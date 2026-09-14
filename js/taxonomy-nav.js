"use strict"
;(() => {
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
  }

  window.lifecycle.onReady(initTaxonomyNavigation)
})()
