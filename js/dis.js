/**
 * Display Visitor Location and Greeting Module
 * ES2022 version with modern fetch API
 */

;(() => {
  "use strict"

  const apiBaseUrl = document.currentScript?.dataset.apiBase || "/api/site-info"
  const cacheTtl = 600000
  const baseLocation = {
    lng: 113.89401,
    lat: 22.59043
  }

  /**
   * 计算两点之间的距离（单位：公里）
   */
  const getDistance = (lng1, lat1, lng2, lat2) => {
    const R = 6371 // 地球半径（公里）
    const { sin, cos, asin, PI, hypot } = Math

    const getPoint = (lng, lat) => {
      const lngRad = (lng * PI) / 180
      const latRad = (lat * PI) / 180
      return {
        x: cos(latRad) * cos(lngRad),
        y: cos(latRad) * sin(lngRad),
        z: sin(latRad)
      }
    }

    const pointA = getPoint(lng1, lat1)
    const pointB = getPoint(lng2, lat2)
    const distance = hypot(pointA.x - pointB.x, pointA.y - pointB.y, pointA.z - pointB.z)
    const result = asin(distance / 2) * 2 * R

    return Math.round(result)
  }

  const getLocationDescription = ({ country, region, city }) => {
    const countryNames = {
      AU: "澳大利亚",
      CA: "加拿大",
      CN: "中国",
      DE: "德国",
      FR: "法国",
      GB: "英国",
      JP: "日本",
      RU: "俄罗斯",
      US: "美国"
    }
    const descriptions = {
      AU: "一起去大堡礁吧！",
      CA: "拾起一片枫叶赠予你",
      DE: "Die Zeit verging im Fluge.",
      FR: "C'est La Vie",
      GB: "想同你一起夜乘伦敦眼",
      JP: "よろしく，一起去看樱花吗",
      RU: "干了这瓶伏特加！",
      US: "Welcome!"
    }
    const parts = country === "CN" ? [region, city] : [countryNames[country] || country, city]

    return {
      position: parts.filter(Boolean).join(" "),
      description: descriptions[country] || "很高兴在这里遇见你。"
    }
  }

  /**
   * 获取时间问候语（修复：Bug #3 - 时间判断逻辑错误）
   */
  const getTimeGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 11) {
      return "<span>上午好</span>，一日之计在于晨"
    }
    if (hour >= 11 && hour < 13) {
      // 修复：原来是 >= 1，会导致凌晨显示"中午好"
      return "<span>中午好</span>，该摸鱼吃午饭了"
    }
    if (hour >= 13 && hour < 15) {
      return "<span>下午好</span>，懒懒地睡个午觉吧！"
    }
    if (hour >= 15 && hour < 16) {
      return "<span>三点几啦</span>，饮茶先啦！"
    }
    if (hour >= 16 && hour < 19) {
      return "<span>夕阳无限好！</span>"
    }
    if (hour >= 19 && hour < 24) {
      return "<span>晚上好</span>，夜生活嗨起来！"
    }

    return "夜深了，早点休息，少熬夜"
  }

  /**
   * 显示欢迎信息
   */
  const loadSiteInfo = () => {
    const cacheKey = `site-info:${apiBaseUrl}`
    if (!window.siteInfoPromise) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey))
        if (cached && Date.now() - cached.timestamp < cacheTtl) {
          window.siteInfoPromise = Promise.resolve(cached.data)
        }
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }
    if (!window.siteInfoPromise) {
      window.siteInfoPromise = fetch(apiBaseUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`Site info returned ${response.status}`)
          return response.json()
        })
        .then((data) => {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }))
          } catch {}
          return data
        })
        .catch((error) => {
          window.siteInfoPromise = null
          throw error
        })
    }
    return window.siteInfoPromise
  }

  const escapeHtml = (value) => {
    const element = document.createElement("span")
    element.textContent = value
    return element.innerHTML
  }

  const renderWelcome = (location = null) => {
    const announcementElement = document.querySelector(".announcement_content")
    if (!announcementElement) return

    const timeGreeting = getTimeGreeting()
    const footer =
      '<br><br><a href="https://icp.gov.moe/?keyword=20220146" target="_blank" rel="noopener">萌ICP备20220146号</a>'
    if (!location?.country) {
      announcementElement.innerHTML = `欢迎访问，${timeGreeting}${footer}`
      return
    }

    const { position, description } = getLocationDescription(location)
    const safePosition = escapeHtml(position)
    const safeDescription = escapeHtml(description)
    let distanceText = ""
    if (location.longitude !== null && location.latitude !== null) {
      const distance = getDistance(
        baseLocation.lng,
        baseLocation.lat,
        location.longitude,
        location.latitude
      )
      distanceText = `<br>你距离Q78KG约有<span>${distance}</span>公里，${safeDescription}`
    }

    announcementElement.innerHTML = `欢迎来自<span>${safePosition}</span>的小伙伴，${timeGreeting}${distanceText}${footer}`
  }

  const showWelcome = () => {
    loadSiteInfo()
      .then(({ location }) => renderWelcome(location))
      .catch((error) => {
        console.error("获取访客信息失败:", error)
        renderWelcome()
      })
  }

  /**
   * 切换图表主题色
   */
  const switchPostChart = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
    const color = isDark ? "rgba(255,255,255,0.7)" : "#4C4948"

    // 更新文章图表
    if (
      document.getElementById("posts-chart") &&
      typeof postsOption !== "undefined" &&
      typeof postsChart !== "undefined"
    ) {
      try {
        const postsOptionNew = postsOption
        postsOptionNew.title.textStyle.color = color
        postsOptionNew.xAxis.nameTextStyle.color = color
        postsOptionNew.yAxis.nameTextStyle.color = color
        postsOptionNew.xAxis.axisLabel.color = color
        postsOptionNew.yAxis.axisLabel.color = color
        postsOptionNew.xAxis.axisLine.lineStyle.color = color
        postsOptionNew.yAxis.axisLine.lineStyle.color = color
        postsOptionNew.series[0].markLine.data[0].label.color = color
        postsChart.setOption(postsOptionNew)
      } catch (error) {
        console.error("更新文章图表主题失败:", error)
      }
    }

    // 更新标签图表
    if (
      document.getElementById("tags-chart") &&
      typeof tagsOption !== "undefined" &&
      typeof tagsChart !== "undefined"
    ) {
      try {
        const tagsOptionNew = tagsOption
        tagsOptionNew.title.textStyle.color = color
        tagsOptionNew.xAxis.nameTextStyle.color = color
        tagsOptionNew.yAxis.nameTextStyle.color = color
        tagsOptionNew.xAxis.axisLabel.color = color
        tagsOptionNew.yAxis.axisLabel.color = color
        tagsOptionNew.xAxis.axisLine.lineStyle.color = color
        tagsOptionNew.yAxis.axisLine.lineStyle.color = color
        tagsOptionNew.series[0].markLine.data[0].label.color = color
        tagsChart.setOption(tagsOptionNew)
      } catch (error) {
        console.error("更新标签图表主题失败:", error)
      }
    }

    // 更新分类图表
    if (
      document.getElementById("categories-chart") &&
      typeof categoriesOption !== "undefined" &&
      typeof categoriesChart !== "undefined"
    ) {
      try {
        const categoriesOptionNew = categoriesOption
        categoriesOptionNew.title.textStyle.color = color
        categoriesOptionNew.legend.textStyle.color = color

        if (typeof categoryParentFlag !== "undefined" && !categoryParentFlag) {
          categoriesOptionNew.series[0].label.color = color
        }

        categoriesChart.setOption(categoriesOptionNew)
      } catch (error) {
        console.error("更新分类图表主题失败:", error)
      }
    }
  }

  /**
   * 初始化
   */
  const init = () => {
    // 显示欢迎信息
    showWelcome()

    // 绑定主题切换事件（延迟执行以确保主题切换完成）
    const moonButton = document.querySelector(".rightMenu-item:has(.fa-moon)")
    if (moonButton) {
      moonButton.addEventListener("click", () => {
        setTimeout(switchPostChart, 100)
      })
    }

    const modeButton = document.getElementById("con-mode")
    if (modeButton) {
      modeButton.addEventListener("click", () => {
        setTimeout(switchPostChart, 100)
      })
    }
  }

  lifecycle.onReady(init)
})()
