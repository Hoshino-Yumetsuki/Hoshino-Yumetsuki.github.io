;(() => {
  "use strict"

  let pageController
  let dataPromise
  let searchRequest = 0

  const getSearchData = () => {
    if (!dataPromise) dataPromise = fetchData(GLOBAL_CONFIG.localSearch.path)
    return dataPromise
  }

  const isJson = (url) => /\.json(?:[?#].*)?$/.test(url)

  const fetchData = async (path) => {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`Search index request failed: ${response.status}`)

    if (isJson(path)) {
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error("Search index is not an array")
      return data
    }

    const xml = new DOMParser().parseFromString(await response.text(), "text/xml")
    if (xml.querySelector("parsererror")) throw new Error("Search index is malformed")

    return [...xml.querySelectorAll("entry")].map((entry) => ({
      title: entry.querySelector("title")?.textContent || "",
      content: entry.querySelector("content")?.textContent || "",
      url: entry.querySelector("url")?.textContent || ""
    }))
  }

  const setIndexLoaded = () => {
    const loading = document.getElementById("loading-database")
    if (!loading) return
    if (loading.nextElementSibling) loading.nextElementSibling.style.display = "block"
    loading.remove()
  }

  const emptyMessage = (query) =>
    GLOBAL_CONFIG.localSearch.languages.hits_empty.replace(/\$\{query}/, query)

  const renderMessage = (results, message) => {
    results.replaceChildren()
    const list = document.createElement("div")
    list.className = "search-result-list"
    const empty = document.createElement("div")
    empty.id = "local-search__hits-empty"
    empty.textContent = message
    list.append(empty)
    results.append(list)
  }

  const appendHighlighted = (parent, text, keywords) => {
    let offset = 0
    const lowerText = text.toLowerCase()

    while (offset < text.length) {
      let nextIndex = -1
      let nextKeyword = ""
      keywords.forEach((keyword) => {
        const index = lowerText.indexOf(keyword, offset)
        if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
          nextIndex = index
          nextKeyword = keyword
        }
      })

      if (nextIndex === -1) {
        parent.append(document.createTextNode(text.slice(offset)))
        break
      }
      if (nextIndex > offset) parent.append(document.createTextNode(text.slice(offset, nextIndex)))

      const mark = document.createElement("span")
      mark.className = "search-keyword"
      mark.textContent = text.slice(nextIndex, nextIndex + nextKeyword.length)
      parent.append(mark)
      offset = nextIndex + nextKeyword.length
    }
  }

  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null
    const path = value.startsWith("/") ? value : GLOBAL_CONFIG.root + value
    try {
      const url = new URL(path, window.location.href)
      return url.protocol === "http:" || url.protocol === "https:" ? path : null
    } catch {
      return null
    }
  }

  const renderResults = (results, entries, keywords, query) => {
    const list = document.createElement("div")
    list.className = "search-result-list"
    let count = 0

    entries.forEach((entry) => {
      if (!entry || typeof entry !== "object") return
      const title = typeof entry.title === "string" ? entry.title.trim().toLowerCase() : ""
      const content =
        typeof entry.content === "string"
          ? entry.content
              .trim()
              .replace(/<[^>]+>/g, "")
              .toLowerCase()
          : ""
      const url = safeUrl(entry.url)
      if ((!title && !content) || !url) return

      let firstOccur = -1
      const matches = keywords.every((keyword, index) => {
        const titleIndex = title.indexOf(keyword)
        const contentIndex = content.indexOf(keyword)
        if (index === 0) firstOccur = Math.max(contentIndex, 0)
        return titleIndex >= 0 || contentIndex >= 0
      })
      if (!matches) return

      const item = document.createElement("div")
      item.className = "local-search__hit-item"
      const link = document.createElement("a")
      link.className = "search-result-title"
      link.href = url
      appendHighlighted(link, title, keywords)
      item.append(link)

      if (content) {
        const start = Math.max(firstOccur - 30, 0)
        const end = Math.min(start === 0 ? 100 : firstOccur + 100, content.length)
        const excerpt = document.createElement("p")
        excerpt.className = "search-result"
        if (start > 0) excerpt.append("...")
        appendHighlighted(excerpt, content.slice(start, end), keywords)
        if (end < content.length) excerpt.append("...")
        item.append(excerpt)
      }

      list.append(item)
      count += 1
    })

    if (count === 0) {
      const empty = document.createElement("div")
      empty.id = "local-search__hits-empty"
      empty.textContent = emptyMessage(query)
      list.append(empty)
    }
    results.replaceChildren(list)
    window.pjax?.refresh(results)
  }

  const bindPage = () => {
    pageController?.abort()
    pageController = new AbortController()
    const { signal } = pageController
    const mask = document.getElementById("search-mask")
    const dialog = document.querySelector("#local-search .search-dialog")
    const openButton = document.querySelector("#search-button > .search")
    const closeButton = document.querySelector("#local-search .search-close-button")
    const input = document.querySelector("#local-search-input input")
    const results = document.getElementById("local-search-results")
    const loadingStatus = document.getElementById("loading-status")
    if (!mask || !dialog || !openButton || !closeButton || !input || !results || !loadingStatus)
      return

    const closeSearch = () => {
      document.body.style.width = ""
      document.body.style.overflow = ""
      btf.animateOut(dialog, "search_close .5s")
      btf.animateOut(mask, "to_hide 0.5s")
    }

    const openSearch = () => {
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
      btf.animateIn(mask, "to_show 0.5s")
      btf.animateIn(dialog, "titleScale 0.5s")
      setTimeout(() => input.focus(), 100)
      getSearchData()
        .then(setIndexLoaded)
        .catch(() => {
          loadingStatus.textContent = ""
          const loading = document.getElementById("loading-database")
          if (loading) loading.textContent = emptyMessage("")
          renderMessage(results, emptyMessage(input.value.trim()))
        })
    }

    openButton.addEventListener("click", openSearch, { signal })
    closeButton.addEventListener("click", closeSearch, { signal })
    mask.addEventListener("click", closeSearch, { signal })
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.code === "Escape" && !btf.isHidden(mask)) closeSearch()
      },
      { signal }
    )

    input.addEventListener(
      "input",
      async () => {
        const request = ++searchRequest
        const query = input.value.trim()
        const keywords = query.toLowerCase().split(/\s+/).filter(Boolean)
        results.replaceChildren()
        if (!keywords.length) {
          loadingStatus.textContent = ""
          return
        }

        const spinner = document.createElement("i")
        spinner.className = "fas fa-spinner fa-pulse"
        loadingStatus.replaceChildren(spinner)
        try {
          const entries = await getSearchData()
          if (request !== searchRequest) return
          setIndexLoaded()
          renderResults(results, entries, keywords, query)
        } catch {
          if (request !== searchRequest) return
          renderMessage(results, emptyMessage(query))
        } finally {
          if (request === searchRequest) loadingStatus.replaceChildren()
        }
      },
      { signal }
    )

    if (GLOBAL_CONFIG.localSearch.preload) {
      getSearchData()
        .then(setIndexLoaded)
        .catch(() => {
          const loading = document.getElementById("loading-database")
          if (loading) loading.textContent = emptyMessage("")
          renderMessage(results, emptyMessage(""))
        })
    }
  }

  window.addEventListener("load", bindPage, { once: true })
  window.addEventListener("pjax:complete", bindPage)
  window.addEventListener("pjax:send", () => {
    pageController?.abort()
    document.body.style.width = ""
    document.body.style.overflow = ""
  })
})()
