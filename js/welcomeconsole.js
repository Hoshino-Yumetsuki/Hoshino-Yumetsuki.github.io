// 使用立即执行函数避免全局变量污染和重复声明
;(function () {
  'use strict'

  const categoryList = document.querySelector('.home .category-list')
  if (categoryList) {
    categoryList.addEventListener('wheel', function (e) {
      e.preventDefault()
      if (e.deltaY >= 0) {
        this.scrollLeft += 20
      } else {
        this.scrollLeft -= 20
      }
    })
  }
})()
