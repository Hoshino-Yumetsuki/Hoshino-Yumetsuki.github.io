/**
 * Random Friend Post Module
 * ES2022 version with proper error handling
 */

;(() => {
  'use strict'

  // 配置
  const defaultConfig = {
    apiurl: 'https://fcircleapi.yumetsuki.moe/',
    defaultFish: 500,
    hungryFish: 500
  }

  // 合并用户配置
  const config =
    typeof window.fdataUser !== 'undefined'
      ? { ...defaultConfig, ...window.fdataUser }
      : defaultConfig

  // 状态管理
  const state = {
    postTimes: 0,
    postClick: 0,
    isWorking: false
  }

  // 钓鱼提示语
  const fishingTips = [
    '钓到了绝世好文！',
    '在河边打了个喷嚏，吓跑了',
    '你和小伙伴抢夺着',
    '你击败了巨龙，在巢穴中发现了',
    '挖掘秦始皇坟时找到了',
    '在路边闲逛的时候随手买了一个',
    '从学校班主任那拿来了孩子上课偷偷看的',
    '你的同桌无情的从你的语文书中撕下了那篇你最喜欢的',
    '考古学家近日发现了',
    '外星人降临地球学习地球文化，落地时被你塞了',
    '从图书馆顶层的隐秘角落里发现了闪着金光的',
    '徒弟修炼走火入魔，为师立刻掏出了',
    '在大山中唱山歌，隔壁的阿妹跑来了，带着',
    '隔壁家的孩子数学考了满分，都是因为看了',
    '隔壁家的孩子英语考了满分，都是因为看了',
    '小米研发了全新一代MIX手机，据说灵感',
    '修炼渡劫成功，还好提前看了',
    '库克坐上了苹果CEO的宝座，因为他面试的时候看了',
    '阿里巴巴大喊芝麻开门，映入眼帘的就是',
    '师傅说练武要先炼心，然后让我好生研读',
    '科考队在南极大陆发现了被冰封的',
    '飞机窗户似乎被一张纸糊上了，仔细一看是',
    '历史上满写的仁义道德四个字，透过字缝里却全是',
    '十几年前的录音机似乎还能够使用，插上电发现正在播的是',
    '新版语文书拟增加一篇熟读并背诵的',
    '经调查，99%的受访者都没有背诵过',
    '今年的高考满分作文是',
    '唐僧揭开了佛祖压在五指山上的',
    '科学家发现能够解决衰老的秘密，就是每日研读',
    '英特尔发布了全新的至强处理器，其芯片的制造原理都是',
    '新的iPhone产能很足，新的进货渠道是',
    '今年亩产突破了八千万斤，多亏了',
    '陆隐一统天上宗，在无数祖境高手的目光下宣读了',
    '黑钻风跟白钻风说道，吃了唐僧肉能长生不老，他知道是因为看了',
    '上卫生间没带纸，直接提裤跑路也不愿意玷污手中',
    '种下一篇文章就会产生很多很多文章，我种下了',
    '三十年河东，三十年河西，莫欺我没有看过',
    '踏破铁血无觅处，得来全靠',
    '今日双色球中了两千万，预测全靠',
    '因为卷子上没写名字，老师罚抄',
    '为了抗议世间的不公，割破手指写下了',
    '在艺术大街上被贴满了相同的纸，走近一看是',
    '这区区迷阵岂能难得住我？其实能走出来多亏了',
    '今日被一篇文章顶上了微博热搜，它是',
    '你送给乞丐一个暴富秘籍，它是',
    'UZI一个走A拿下五杀，在事后采访时说他当时回想起了',
    '科学家解刨了第一个感染丧尸病毒的人，发现丧尸抗体存在于'
  ]

  /**
   * 获取钓鱼等级
   */
  const getFishingLevel = (times) => {
    // 修复：正确的等级判断逻辑
    if (times > 10000) return '愿者上钩'
    if (times > 1000) return '俯览天下'
    if (times > 500) return '超越神了' // 修复：原来重复了 > 1000
    if (times > 100) return '绝世渔夫'
    if (times > 75) return '钓鱼王者'
    if (times > 50) return '钓鱼宗师'
    if (times > 20) return '钓鱼专家'
    if (times > 5) return '钓鱼高手'
    return '钓鱼新手'
  }

  /**
   * 更新 UI 显示
   */
  const updateUI = (message) => {
    const postElement = document.getElementById('random-post')
    if (postElement) {
      postElement.innerHTML = message
    }
  }

  /**
   * 旋转动画
   */
  const rotateAnimation = () => {
    const rotateElement = document.querySelector('.random-post-start')
    if (rotateElement) {
      const rotation = state.postTimes * 360
      rotateElement.style.transform = `rotate(${rotation}deg)`
    }
  }

  /**
   * 获取随机文章
   */
  const fetchRandomPost = async () => {
    // 防止重复请求
    if (state.isWorking) {
      console.log('正在获取文章，请稍候...')
      return
    }

    state.isWorking = true

    try {
      // 旋转动画
      rotateAnimation()

      // 显示钓鱼中
      const level = getFishingLevel(state.postTimes)
      const message =
        state.postTimes >= 5
          ? `钓鱼中... (Lv.${state.postTimes} 当前称号：${level}）`
          : '钓鱼中...'
      updateUI(message)

      // 等待2秒（模拟钓鱼过程）
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 检查是否因饥饿失败
      const hungerThreshold =
        state.postClick * config.hungryFish + config.defaultFish
      if (state.postTimes > hungerThreshold && Math.random() < 0.5) {
        updateUI('因为只钓鱼不吃鱼，过分饥饿导致本次钓鱼失败...')
        return
      }

      // 获取随机文章
      const response = await fetch(`${config.apiurl}randompost`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // 验证数据
      if (!data?.title || !data?.link || !data?.author) {
        throw new Error('Invalid data format')
      }

      // 显示结果
      const tip = fishingTips[Math.floor(Math.random() * fishingTips.length)]
      const resultHTML = `
                ${tip}来自友链 <b>${data.author}</b> 的文章：
                <a class="random-friends-post"
                   onclick="window.randomClickLink?.()"
                   target="_blank"
                   href="${data.link}"
                   rel="external nofollow">
                    ${data.title}
                </a>
            `
      updateUI(resultHTML)

      // 增加次数
      state.postTimes++
    } catch (error) {
      console.error('获取随机文章失败:', error)
      updateUI('获取文章失败，请稍后重试...')
    } finally {
      state.isWorking = false
    }
  }

  /**
   * 记录点击统计
   */
  const randomClickLink = () => {
    state.postClick++
  }

  /**
   * 添加友链表单
   */
  const addFriendLink = () => {
    const textarea = document.querySelector('.el-textarea__inner')
    if (!textarea) {
      console.warn('找不到评论输入框')
      return
    }

    const template = `\`\`\`yaml
- name: #友链名称
  link: #友链地址（建议博客，而不是主页，否则友链朋友圈无法爬取）
  avatar: #友链头像
  descr: #介绍
  theme_color: #友链背景色，因为#号在yaml中识别为注释请加引号
\`\`\``

    textarea.value = template
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  /**
   * 初始化
   */
  const init = () => {
    // 导出函数到全局（保持向后兼容）
    window.fetchRandomPost = fetchRandomPost
    window.randomClickLink = randomClickLink
    window.addflink = addFriendLink

    // 自动执行一次
    fetchRandomPost()
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
