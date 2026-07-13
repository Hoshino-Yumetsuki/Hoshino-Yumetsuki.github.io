;(() => {
  'use strict'

  const startDate = new Date(Date.UTC(2022, 6, 4, 12, 0, 0))
  let intervalId = null

  function updateTime() {
    const now = new Date()
    const diff = now - startDate

    const SECOND = 1000
    const MINUTE = SECOND * 60
    const HOUR = MINUTE * 60
    const DAY = HOUR * 24
    const YEAR = DAY * 365

    const years = Math.floor(diff / YEAR)
    const days = Math.floor((diff % YEAR) / DAY)
    const hours = Math.floor((diff % DAY) / HOUR)
    const minutes = Math.floor((diff % HOUR) / MINUTE)
    const seconds = Math.floor((diff % MINUTE) / SECOND)

    const element = document.getElementById('footer_custom_text')
    if (element) {
      element.textContent = `这个小破站已运行 ${years} 年 ${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`
    }
  }

  function start() {
    stop()
    updateTime()
    intervalId = setInterval(updateTime, 1000)
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  lifecycle.onReady(start)
  lifecycle.onCleanup(stop)
})()
