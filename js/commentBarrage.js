/**
 * Comment Barrage Module
 * ES2022 version with proper error handling and cleanup
 */

;(() => {
  'use strict'

  // 状态管理
  const state = {
    swiper: null,
    scrollHandler: null
  }

  // 默认配置
  const defaultConfig = {
    // 浅色模式和深色模式颜色
    lightColors: [['#ffffffaa!important', 'var(--lyx-black)']],
    darkColors: [['#000a!important', 'var(--lyx-white)']],
    maxBarrage: 1,
    barrageTime: 3000,
    twikooUrl: 'https://twikoo.yumetsuki.moe',
    accessToken: 'f0fac9b52af34219af509d087ea72c4a',
    noAvatarType: 'retro',
    avatarCDN: 'cravatar.cn',
    displayBarrage: true,
    barrageList: [],
    barrageIndex: 0
  }

  /**
   * 检查 URL 格式
   */
  const checkURL = (url) => {
    const urlPattern = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/
    return urlPattern.test(url)
  }

  /**
   * 检查元素是否在视口内
   */
  const isInViewPort = (element) => {
    if (!element) return false

    const viewPortHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    const offsetTop = element.offsetTop
    const scrollTop = document.documentElement.scrollTop
    const top = offsetTop - scrollTop

    return top <= viewPortHeight
  }

  /**
   * 递归获取评论及其回复
   */
  const getCommentReplies = (item) => {
    if (!item.replies || item.replies.length === 0) {
      return []
    }

    const replies = [item]
    item.replies.forEach((reply) => {
      replies.push(...getCommentReplies(reply))
    })

    return replies
  }

  /**
   * 过滤和排序评论数据
   */
  const filterComments = (data) => {
    if (!Array.isArray(data)) {
      return []
    }

    // 按创建时间排序
    data.sort((a, b) => a.created - b.created)

    // 展开所有回复
    const flattenedComments = []
    data.forEach((item) => {
      flattenedComments.push(...getCommentReplies(item))
    })

    return flattenedComments
  }

  /**
   * 创建弹幕元素
   */
  const createBarrageElement = (data, config) => {
    const barrage = document.createElement('div')
    barrage.className = 'comment-barrage-item'

    // 随机选择颜色
    const colorIndex = Math.floor(Math.random() * config.lightColors.length)
    const lightColor = config.lightColors[colorIndex]
    const darkColor = config.darkColors[colorIndex]

    // 更新颜色样式
    const styleElement = document.getElementById('barragesColor')
    if (styleElement) {
      styleElement.innerHTML = `
                [data-theme='light'] .comment-barrage-item {
                    background-color: ${lightColor[0]};
                    color: ${lightColor[1]};
                }
                [data-theme='dark'] .comment-barrage-item {
                    background-color: ${darkColor[0]};
                    color: ${darkColor[1]};
                }
            `
    }

    // 获取头像URL
    const avatarUrl =
      data.avatar ||
      `https://${config.avatarCDN}/avatar/${data.mailMd5}?d=${config.noAvatarType}`

    // 处理链接
    let link = data.link
    if (link && !checkURL(link)) {
      link = `http://${link}`
    }

    // 构建头部HTML
    const nickElement = link
      ? `<a href="${link}" class="barrageNick" target="_blank">${data.nick}</a>`
      : `<div class="barrageNick">${data.nick}</div>`

    barrage.innerHTML = `
            <div class="barrageHead">
                <img class="barrageAvatar" src="${avatarUrl}" alt="${data.nick}"/>
                ${nickElement}
                <a href="javascript:void(0)" class="barrage-close" style="font-size:20px">×</a>
            </div>
        `

    // 添加评论内容
    const content = document.createElement('a')
    content.className = 'barrageContent'
    content.href = `#${data.id}`
    content.innerHTML = data.comment
    barrage.appendChild(content)

    // 创建 Swiper slide 容器
    const slide = document.createElement('div')
    slide.className = 'swiper-slide'
    slide.style.height = '150px'
    slide.appendChild(barrage)

    return slide
  }

  /**
   * 初始化 Swiper
   */
  const initSwiper = () => {
    const swiperElement = document.querySelector('.barrageswiper')
    if (!swiperElement || typeof Swiper === 'undefined') {
      return null
    }

    const swiper = new Swiper('.barrageswiper', {
      direction: 'vertical',
      loop: true,
      mousewheel: true,
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: false
      }
    })

    // 鼠标悬停时暂停
    swiper.el.addEventListener('mouseover', () => {
      swiper.autoplay.stop()
    })

    swiper.el.addEventListener('mouseout', () => {
      swiper.autoplay.start()
    })

    return swiper
  }

  /**
   * 获取评论数据
   */
  const fetchComments = async (config) => {
    try {
      const response = await fetch(config.twikooUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'COMMENT_GET',
          'commentBarrageConfig.accessToken': config.accessToken,
          url: window.location.pathname
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return filterComments(result.data || [])
    } catch (error) {
      console.error('获取评论弹幕失败:', error)
      return []
    }
  }

  /**
   * 渲染弹幕
   */
  const renderBarrages = (comments, config) => {
    const barrageContainer = document.querySelector('.comment-barrage')
    if (!barrageContainer) {
      return
    }

    // 清空容器
    barrageContainer.innerHTML = ''

    // 创建弹幕元素
    comments.forEach((comment) => {
      const slide = createBarrageElement(comment, config)
      barrageContainer.appendChild(slide)
    })

    // 初始化 Swiper
    state.swiper = initSwiper()
  }

  /**
   * 切换弹幕显示
   */
  const toggleBarrage = () => {
    const currentState = localStorage.getItem('isBarrageToggle') === '1'
    localStorage.setItem('isBarrageToggle', currentState ? '0' : '1')

    const commentElement = document.getElementById('post-comment')
    if (isInViewPort(commentElement)) {
      return
    }

    defaultConfig.displayBarrage = !defaultConfig.displayBarrage

    const barrageContainer = document.querySelector('.comment-barrage')
    if (barrageContainer) {
      // 使用原生方法替代 jQuery fadeToggle
      if (barrageContainer.style.display === 'none') {
        barrageContainer.style.display = ''
        barrageContainer.style.opacity = '0'
        barrageContainer.style.transition = 'opacity 0.4s'
        setTimeout(() => {
          barrageContainer.style.opacity = '1'
        }, 10)
      } else {
        barrageContainer.style.opacity = '0'
        setTimeout(() => {
          barrageContainer.style.display = 'none'
        }, 400)
      }
    }
  }

  /**
   * 设置滚动监听
   */
  const setupScrollHandler = () => {
    // 修复：Bug #13 - 重复的条件判断
    const isPostPage = window.location.href.includes('posts')
    if (!isPostPage) {
      return
    }

    // 移除旧的滚动监听器
    if (state.scrollHandler) {
      document.removeEventListener('scroll', state.scrollHandler)
    }

    // 创建新的滚动监听器
    state.scrollHandler = () => {
      if (!defaultConfig.displayBarrage) {
        return
      }

      const commentElement = document.getElementById('post-comment')
      const swiperElements = document.querySelectorAll('.barrageswiper')

      if (swiperElements.length === 0) {
        return
      }

      const swiperElement = swiperElements[0]

      if (commentElement && isInViewPort(commentElement)) {
        swiperElement.style.transform = 'translateX(514px)'
        swiperElement.style.opacity = '0'
      } else {
        swiperElement.style.transform = ''
        swiperElement.style.opacity = '1'
      }
    }

    document.addEventListener('scroll', state.scrollHandler, { passive: true })
  }

  /**
   * 清理函数
   */
  const cleanup = () => {
    // 销毁 Swiper
    if (state.swiper?.destroy) {
      state.swiper.destroy(true, true)
      state.swiper = null
    }

    // 移除滚动监听器
    if (state.scrollHandler) {
      document.removeEventListener('scroll', state.scrollHandler)
      state.scrollHandler = null
    }

    // 清空弹幕容器
    const barrageContainer = document.querySelector('.comment-barrage')
    if (barrageContainer) {
      barrageContainer.innerHTML = ''
    }
  }

  /**
   * 初始化评论弹幕
   */
  const init = async () => {
    try {
      // 清理之前的实例
      cleanup()

      // 初始化本地存储
      if (localStorage.getItem('isBarrageToggle') === null) {
        localStorage.setItem('isBarrageToggle', '0')
      }

      // 获取评论数据
      const comments = await fetchComments(defaultConfig)

      // 渲染弹幕
      renderBarrages(comments, defaultConfig)

      // 设置滚动监听
      setupScrollHandler()

      // 绑定切换按钮
      window.switchCommentBarrage = toggleBarrage

      // 检查是否需要自动隐藏
      if (localStorage.getItem('isBarrageToggle') === '1') {
        localStorage.setItem('isBarrageToggle', '0')
        toggleBarrage()
      }
    } catch (error) {
      console.error('初始化评论弹幕失败:', error)
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // PJAX 页面切换后重新初始化
  document.addEventListener('pjax:complete', init)

  // PJAX 页面卸载前清理
  document.addEventListener('pjax:send', cleanup)
})()
