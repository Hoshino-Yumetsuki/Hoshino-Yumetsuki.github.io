// 使用立即执行函数封装，防止全局变量污染，同时将需要暴露的接口挂载到 window 对象上
;(function () {
  "use strict"
  let aplayerTimer

  const setDisplay = (selector, visible, display = "") => {
    document.querySelectorAll(selector).forEach((element) => {
      element.style.display = visible ? display : "none"
    })
  }

  if (typeof lifecycle === "undefined" || !lifecycle.onReady) {
    console.warn("lifecycle.onReady is not defined. settings.js may not initialize correctly.")
    return
  }

  lifecycle.onReady(tosetting)

  function tosetting() {
    clearTimeout(aplayerTimer)
    setDisplay("#settingWindow", false)
    let blur
    if (localStorage.getItem("blur") == "false") {
      blur = 0
    } else {
      blur = 1
    }

    let yjjs
    if (localStorage.getItem("yjjs") == "true") {
      yjjs = 1
    } else {
      yjjs = 0
    }

    if (localStorage.getItem("fpson") == undefined) {
      localStorage.setItem("fpson", "1")
    }

    if (!blur) {
      document.documentElement.classList.add("no-blur")
    } else {
      document.documentElement.classList.remove("no-blur")
    }

    window.setBlur = function () {
      blur = !blur
      localStorage.setItem("blur", blur)
      if (!blur) {
        document.documentElement.classList.add("no-blur")
      } else {
        document.documentElement.classList.remove("no-blur")
      }
    }

    window.yjjs1 = function () {
      yjjs = !yjjs
      localStorage.setItem("yjjs", yjjs)
    }

    if (localStorage.getItem("blogTheme") == "acrylic") {
      const cssEl = document.getElementById("css")
      if (cssEl) cssEl.href = ""
    }

    window.switchTheme = function () {
      const cssEl = document.getElementById("css")
      if (!cssEl) return
      if (
        cssEl.href ==
        window.location.protocol + "//" + window.location.host + "/css/stylessimple.css"
      ) {
        cssEl.href = ""
        localStorage.setItem("blogTheme", "acrylic")
      } else {
        cssEl.href = "/css/stylessimple.css"
        localStorage.setItem("blogTheme", "simple")
      }
    }

    window.setColor = function (c) {
      const themeColorEl = document.getElementById("themeColor")
      if (themeColorEl) {
        themeColorEl.innerText = `:root{--lyx-theme:var(--lyx-${c})!important}`
      }
      localStorage.setItem("themeColor", c)
    }

    window.setFont = function (n) {
      localStorage.setItem("font", n)
      var selector =
        "body,.wv-lt-location>a[data-v-4b9dcab4],.wv-lt-location>span[data-v-4b9dcab4],.wv-n-h-now-tmp>span[data-v-5f4c0628],.wv-n-h-now-txt>span[data-v-5f4c0628],.wv-n-h-now-rain>a[data-v-5f4c0628], .wv-n-h-now-rain>span[data-v-5f4c0628],.wv-f-forecast-date>a[data-v-66693262],.wv-f-a,.wv-lt-location>a[data-v-4b9dcab4],.wv-lt-location>span[data-v-4b9dcab4],.wv-n-h-now-tmp>span[data-v-5f4c0628],.wv-n-h-now-txt>span[data-v-5f4c0628],.wv-n-h-now-rain>a[data-v-5f4c0628], .wv-n-h-now-rain>span[data-v-5f4c0628],.wv-f-forecast-date>a[data-v-66693262],.wv-f-a,.aplayer"
      var s = document.querySelectorAll(selector)
      var fontFamilyStr = ""
      if (n == "main") {
        fontFamilyStr = "-apple-system, IBM Plex Mono ,monospace,'微软雅黑', sans-serif"
      } else if (n == "HYPailou") {
        fontFamilyStr =
          "Fredoka,HYPailou,KyoukashoProL,-apple-system, IBM Plex Mono ,monospace,'微软雅黑', sans-serif"
      } else {
        fontFamilyStr =
          'var(--global-font),KyoukashoProL,-apple-system, IBM Plex Mono ,monosapce,"微软雅黑", sans-serif'
        document.body.style.fontFamily =
          "var(--global-font),KyoukashoProL,-apple-system, IBM Plex Mono ,monosapce,'微软雅黑', sans-serif"
        document.documentElement.style.setProperty("--global-font", n)
      }
      if (fontFamilyStr) {
        for (var i = 0; i < s.length; i++) {
          s[i].style.fontFamily = fontFamilyStr
        }
      }
    }

    if (localStorage.getItem("themeColor") == undefined) {
      localStorage.setItem("themeColor", "pink")
    }

    window.setColor(localStorage.getItem("themeColor"))

    if (localStorage.getItem("hideRightside") == undefined) {
      localStorage.setItem("hideRightside", "0")
    }

    const rightside = document.getElementById("rightside")
    if (rightside && localStorage.getItem("hideRightside") == "1") {
      rightside.style.display = "none"
    }

    window.toggleRightside = function () {
      if (!rightside) return
      const hidden = getComputedStyle(rightside).display === "none"
      rightside.style.display = hidden ? "" : "none"
      localStorage.setItem("hideRightside", hidden ? "0" : "1")
    }

    if (localStorage.getItem("font") == undefined) {
      localStorage.setItem("font", "HYTMR")
    }
    window.setFont(localStorage.getItem("font"))

    // 存数据
    // name：命名 data：数据
    window.saveData = function (name, data) {
      localStorage.setItem(name, JSON.stringify({ time: Date.now(), data: data }))
    }

    // 取数据
    // name：命名 time：过期时长,单位分钟,如传入30,即加载数据时如果超出30分钟返回0,否则返回数据
    window.loadData = function (name, time) {
      let d = JSON.parse(localStorage.getItem(name))
      // 过期或有错误返回 0 否则返回数据
      if (d) {
        let t = Date.now() - d.time
        if (t < time * 60 * 1000 && t > -1) return d.data
      }
      return 0
    }

    // 切换背景函数
    // 此处的flag是为了每次读取时都重新存储一次,导致过期时间不稳定
    // 如果flag为0则存储,即设置背景. 为1则不存储,即每次加载自动读取背景.
    window.changeBg = function (s, flag) {
      let bg = document.getElementById("web_bg")
      if (!bg) return
      // 设置默认背景为none
      if (!s || s === "") {
        bg.style.backgroundColor = ""
        bg.style.backgroundImage = "none"
      }
      // 处理其他背景设置
      else if (s.charAt(0) == "#") {
        bg.style.backgroundColor = s
        bg.style.backgroundImage = "none"
      } else {
        bg.style.backgroundImage = s
      }
      if (!flag) {
        window.saveData("blogbg", s || "")
      }
    }

    // 读取背景
    try {
      let data = window.loadData("blogbg", 1440)
      if (data) window.changeBg(data, 1)
      else localStorage.removeItem("blogbg")
    } catch {
      localStorage.removeItem("blogbg")
    }

    window.fpssw = function () {
      if (localStorage.getItem("fpson") == "1") {
        localStorage.setItem("fpson", "0")
      } else {
        localStorage.setItem("fpson", "1")
      }
    }

    setDisplay(".asetting", false)
    setDisplay("#backer", false)

    const savedColor = localStorage.getItem("themeColor")
    const savedColorEl = savedColor && document.getElementById(savedColor)
    if (savedColorEl) savedColorEl.checked = true

    const blurEl = document.getElementById("blur")
    if (blurEl && localStorage.getItem("blur") == "false") {
      blurEl.checked = true
    }

    const yjjsEl = document.getElementById("yjjs")
    if (yjjsEl && localStorage.getItem("yjjs") == "true") {
      yjjsEl.checked = true
    }

    const fpsonEl = document.getElementById("fpson")
    if (fpsonEl && localStorage.getItem("fpson") == "1") {
      fpsonEl.checked = true
    }

    let isSakura = 0
    const hideSakuraEl = document.getElementById("hideSakura")
    if (localStorage.getItem("sakurahide") == "false") {
      if (hideSakuraEl) hideSakuraEl.checked = true
      isSakura = 1
    } else if (localStorage.getItem("sakurahide") == null) {
      localStorage.setItem("sakurahide", "false")
      if (hideSakuraEl) hideSakuraEl.checked = true
      isSakura = 1
    } else {
      if (typeof stopp === "function") {
        setTimeout(() => stopp(), 1000)
      }
      isSakura = 0
    }

    const hideAplayerEl = document.getElementById("hideAplayer")
    if (localStorage.getItem("aplayerhide") == "false") {
      if (hideAplayerEl) hideAplayerEl.checked = true
    } else if (localStorage.getItem("aplayerhide") == null) {
      localStorage.setItem("aplayerhide", "false")
      if (hideAplayerEl) hideAplayerEl.checked = true
    } else {
      let checkCount = 0
      const hideAplayer = function () {
        if (typeof aplayers !== "undefined" && aplayers.length > 0) {
          setDisplay(".aplayer-fixed", false)
        } else if (checkCount < 100) {
          checkCount++
          aplayerTimer = setTimeout(hideAplayer, 50)
        }
      }
      hideAplayer()
    }

    const reSettingsEl = document.getElementsByClassName("reSettings")[0]
    if (reSettingsEl) {
      reSettingsEl.onclick = function () {
        localStorage.clear()
        window.location.reload()
      }
    }

    window.showSetting = function (id) {
      setDisplay(".asetting", false)
      setDisplay(".settingx", !id)
      setDisplay("#backer", Boolean(id))
      if (id) setDisplay("#" + id, true)
    }

    window.toggleWinbox = function () {
      const win = document.getElementById("settingWindow")
      if (!win) return
      win.style.display = getComputedStyle(win).display === "none" ? "flex" : "none"
    }

    window.fullScreen = function () {
      if (document.fullscreenElement) void document.exitFullscreen()
      else void document.documentElement.requestFullscreen()
    }

    window.toggleAside = function () {
      const $htmlDom = document.documentElement.classList
      if (typeof saveToLocal !== "undefined" && saveToLocal.set) {
        $htmlDom.contains("hide-aside")
          ? saveToLocal.set("aside-status", "show", 2)
          : saveToLocal.set("aside-status", "hide", 2)
      }
      $htmlDom.toggle("hide-aside")
    }

    window.toggleAplayer = function () {
      const hidden = localStorage.getItem("aplayerhide") == "true"
      setDisplay(".aplayer-fixed", hidden)
      localStorage.setItem("aplayerhide", !hidden)
    }

    window.toggleSakuras = function () {
      isSakura = !isSakura
      if (typeof stopp === "function") {
        stopp(isSakura)
      }
      if (localStorage.getItem("sakurahide") == "true") {
        localStorage.setItem("sakurahide", false)
      } else {
        localStorage.setItem("sakurahide", true)
      }
    }

    let left = 1
    window.switchAside = function () {
      const asideContentEl = document.getElementById("aside-content")
      const firstChildEl = document.querySelector(".layout > div:first-child")
      if (left) {
        if (asideContentEl) asideContentEl.classList.add("right")
        if (firstChildEl) firstChildEl.classList.add("left")
        localStorage.setItem("leftAside", "false")
      } else {
        if (asideContentEl) asideContentEl.className = "aside-content"
        if (firstChildEl) firstChildEl.className = ""
        try {
          const recentPostsEl = document.querySelector("#recent-posts")
          if (recentPostsEl) recentPostsEl.className = "recent-posts"
        } catch {}
        localStorage.setItem("leftAside", "true")
      }
      left = !left
    }

    if (localStorage.getItem("leftAside") == "true" || localStorage.getItem("leftAside") == null) {
      // Do nothing
    } else {
      window.switchAside()
    }

    const setModeControlsVisible = (visible) =>
      setDisplay("#con-mode, .rightMenu-item:has(.fa-moon)", visible)
    const applyAutomaticTheme = () => {
      const time = new Date()
      if (time.getHours() <= 7 || time.getHours() >= 19) {
        if (typeof activateDarkMode === "function") activateDarkMode()
      } else if (typeof activateLightMode === "function") {
        activateLightMode()
      }
      localStorage.removeItem("theme")
    }

    if (localStorage.getItem("autoTheme") == "true") {
      const autoThemeEl = document.getElementById("autoTheme")
      if (autoThemeEl) autoThemeEl.checked = true
      setModeControlsVisible(false)
      applyAutomaticTheme()
    }

    window.toggleAutoTheme = () => {
      const enabled = localStorage.getItem("autoTheme") != "true"
      localStorage.setItem("autoTheme", enabled)
      setModeControlsVisible(!enabled)
      if (enabled) applyAutomaticTheme()
    }
  }
})()
