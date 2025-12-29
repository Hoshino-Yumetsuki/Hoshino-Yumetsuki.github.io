/**
 * Display Visitor Location and Greeting Module
 * ES2022 version with modern fetch API
 */

;(() => {
  'use strict'

  // 配置
  const config = {
    apiUrl: 'https://apis.map.qq.com/ws/location/v1/ip',
    apiKey: 'T3EBZ-TJ7LI-YRBG2-5ZLUR-KD3OS-U6BJO',
    baseLocation: {
      lng: 113.89401,
      lat: 22.59043
    }
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
    const distance = hypot(
      pointA.x - pointB.x,
      pointA.y - pointB.y,
      pointA.z - pointB.z
    )
    const result = asin(distance / 2) * 2 * R

    return Math.round(result)
  }

  /**
   * 根据国家/地区获取欢迎语
   */
  const getLocationDescription = (ipLocation) => {
    const { nation, province, city } = ipLocation.result.ad_info

    let position = nation
    let description = ''

    // 国际位置描述
    const nationDescriptions = {
      日本: 'よろしく，一起去看樱花吗',
      美国: 'Make America Great Again!',
      英国: '想同你一起夜乘伦敦眼',
      俄罗斯: '干了这瓶伏特加！',
      法国: "C'est La Vie",
      德国: 'Die Zeit verging im Fluge.',
      澳大利亚: '一起去大堡礁吧！',
      加拿大: '拾起一片枫叶赠予你'
    }

    if (nation !== '中国') {
      description = nationDescriptions[nation] || '带我去你的国家逛逛吧。'
      return { position, description }
    }

    // 中国省份描述
    position = `${province} ${city}`

    const provinceDescriptions = {
      北京市: '北——京——欢迎你~~~',
      天津市: '讲段相声吧。',
      重庆市: '老乡！！！',
      河北省: '山势巍巍成壁垒，天下雄关。铁马金戈由此向，无限江山。',
      山西省: '展开坐具长三尺，已占山河五百余。',
      内蒙古自治区: '天苍苍，野茫茫，风吹草低见牛羊。',
      辽宁省: '我想吃烤鸡架！',
      吉林省: '状元阁就是东北烧烤之王。',
      黑龙江省: '很喜欢哈尔滨大剧院。',
      上海市: '众所周知，中国只有两个城市。',
      浙江省: '东风渐绿西湖柳，雁已还人未南归。',
      安徽省: '蚌埠住了，芜湖起飞。',
      福建省: '井邑白云间，岩城远带山。',
      江西省: '落霞与孤鹜齐飞，秋水共长天一色。',
      山东省: '遥望齐州九点烟，一泓海水杯中泻。',
      湖北省: '来碗热干面！',
      湖南省: '74751，长沙斯塔克。',
      广东省: '老板来两斤福建人。',
      广西壮族自治区: '桂林山水甲天下。',
      海南省: '朝观日出逐白浪，夕看云起收霞光。',
      四川省: '康康川妹子。',
      贵州省: '茅台，学生，再塞200。',
      云南省: '玉龙飞舞云缠绕，万仞冰川直耸天。',
      西藏自治区: '躺在茫茫草原上，仰望蓝天。',
      陕西省: '来份臊子面加馍。',
      甘肃省: '羌笛何须怨杨柳，春风不度玉门关。',
      青海省: '牛肉干和老酸奶都好好吃。',
      宁夏回族自治区: '大漠孤烟直，长河落日圆。',
      新疆维吾尔自治区: '驼铃古道丝绸路，胡马犹闻唐汉风。',
      台湾省: '我在这头，大陆在那头。',
      香港特别行政区: '永定贼有残留地鬼嚎，迎击光非岁玉。',
      澳门特别行政区: '性感荷官，在线发牌。'
    }

    // 江苏省特殊处理
    if (province === '江苏省') {
      const cityDescriptions = {
        南京市: '欢迎来自安徽省南京市的小伙伴。',
        苏州市: '上有天堂，下有苏杭。'
      }
      description = cityDescriptions[city] || '散装是必须要散装的。'
    } else {
      description = provinceDescriptions[province] || '社会主义大法好。'
    }

    return { position, description }
  }

  /**
   * 获取时间问候语（修复：Bug #3 - 时间判断逻辑错误）
   */
  const getTimeGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 11) {
      return '<span>上午好</span>，一日之计在于晨'
    }
    if (hour >= 11 && hour < 13) {
      // 修复：原来是 >= 1，会导致凌晨显示"中午好"
      return '<span>中午好</span>，该摸鱼吃午饭了'
    }
    if (hour >= 13 && hour < 15) {
      return '<span>下午好</span>，懒懒地睡个午觉吧！'
    }
    if (hour >= 15 && hour < 16) {
      return '<span>三点几啦</span>，饮茶先啦！'
    }
    if (hour >= 16 && hour < 19) {
      return '<span>夕阳无限好！</span>'
    }
    if (hour >= 19 && hour < 24) {
      return '<span>晚上好</span>，夜生活嗨起来！'
    }

    return '夜深了，早点休息，少熬夜'
  }

  /**
   * 显示欢迎信息
   */
  const showWelcome = async () => {
    try {
      // 构建 JSONP 请求 URL
      const callbackName = `ipCallback_${Date.now()}`
      const url = `${config.apiUrl}?key=${config.apiKey}&output=jsonp&callback=${callbackName}`

      // 创建 JSONP 请求
      const response = await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        const timeout = setTimeout(() => {
          cleanup()
          reject(new Error('Request timeout'))
        }, 10000)

        window[callbackName] = (data) => {
          clearTimeout(timeout)
          cleanup()
          resolve(data)
        }

        const cleanup = () => {
          delete window[callbackName]
          document.body.removeChild(script)
        }

        script.onerror = () => {
          clearTimeout(timeout)
          cleanup()
          reject(new Error('Script load failed'))
        }

        script.src = url
        document.body.appendChild(script)
      })

      // 验证响应数据
      if (!response?.result?.location || !response?.result?.ad_info) {
        throw new Error('Invalid response data')
      }

      // 计算距离
      const { lng, lat } = response.result.location
      const distance = getDistance(
        config.baseLocation.lng,
        config.baseLocation.lat,
        lng,
        lat
      )

      // 获取位置描述
      const { position, description } = getLocationDescription(response)

      // 获取时间问候语
      const timeGreeting = getTimeGreeting()

      // 更新页面内容
      const announcementElement = document.querySelector(
        '.announcement_content'
      )
      if (announcementElement) {
        // 注意：这里使用 innerHTML 是因为内容包含格式化的 HTML
        // 数据来源是可信的 API，但在生产环境中仍建议对用户输入进行清理
        announcementElement.innerHTML = `
                    欢迎来自<span>${position}</span>的小伙伴，${timeGreeting}<br>
                    你距离Q78KG约有<span>${distance}</span>公里，${description}
                    <br>
                    <br>
                    <a href="https://icp.gov.moe/?keyword=20220146" target="_blank">萌ICP备20220146号</a>
                `
      }
    } catch (error) {
      console.error('获取位置信息失败:', error)

      // 显示默认欢迎信息
      const announcementElement = document.querySelector(
        '.announcement_content'
      )
      if (announcementElement) {
        const timeGreeting = getTimeGreeting()
        announcementElement.innerHTML = `
                    欢迎访问，${timeGreeting}<br>
                    <br>
                    <a href="https://icp.gov.moe/?keyword=20220146" target="_blank">萌ICP备20220146号</a>
                `
      }
    }
  }

  /**
   * 切换图表主题色
   */
  const switchPostChart = () => {
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark'
    const color = isDark ? 'rgba(255,255,255,0.7)' : '#4C4948'

    // 更新文章图表
    if (
      document.getElementById('posts-chart') &&
      typeof postsOption !== 'undefined' &&
      typeof postsChart !== 'undefined'
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
        console.error('更新文章图表主题失败:', error)
      }
    }

    // 更新标签图表
    if (
      document.getElementById('tags-chart') &&
      typeof tagsOption !== 'undefined' &&
      typeof tagsChart !== 'undefined'
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
        console.error('更新标签图表主题失败:', error)
      }
    }

    // 更新分类图表
    if (
      document.getElementById('categories-chart') &&
      typeof categoriesOption !== 'undefined' &&
      typeof categoriesChart !== 'undefined'
    ) {
      try {
        const categoriesOptionNew = categoriesOption
        categoriesOptionNew.title.textStyle.color = color
        categoriesOptionNew.legend.textStyle.color = color

        if (typeof categoryParentFlag !== 'undefined' && !categoryParentFlag) {
          categoriesOptionNew.series[0].label.color = color
        }

        categoriesChart.setOption(categoriesOptionNew)
      } catch (error) {
        console.error('更新分类图表主题失败:', error)
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
    const moonButton = document.querySelector('.rightMenu-item:has(.fa-moon)')
    if (moonButton) {
      moonButton.addEventListener('click', () => {
        setTimeout(switchPostChart, 100)
      })
    }

    const modeButton = document.getElementById('con-mode')
    if (modeButton) {
      modeButton.addEventListener('click', () => {
        setTimeout(switchPostChart, 100)
      })
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
})()
