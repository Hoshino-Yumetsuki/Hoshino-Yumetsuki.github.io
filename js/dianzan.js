// 使用立即执行函数封装，避免全局变量污染，并将 dianzan 挂载到 window 对象上供 HTML 调用
;(function () {
  'use strict'

  // 检查AV是否已加载（LeanCloud SDK）
  if (typeof AV === 'undefined') {
      console.warn('LeanCloud SDK (AV) is not loaded. Dianzan feature will not work.');
      window.dianzan = function() {
          console.warn('Dianzan features are disabled because LeanCloud SDK is missing.');
      };
      return;
  }

  function GetUrlRelativePath() {
      var url = document.location.toString();
      var arrUrl = url.split("//");
      if (arrUrl.length < 2) return "/";

      var start = arrUrl[1].indexOf("/");
      if (start === -1) return "/";

      var relUrl = arrUrl[1].substring(start);
      if (relUrl.indexOf("?") != -1) {
          relUrl = relUrl.split("?")[0];
      }
      return relUrl;
  }

  // 检查是否已经初始化过 LeanCloud
  var isInitialized = false;
  try {
      // 如果已经有 appId，说明可能已经初始化过了，但 AV.applicationId 在某些 SDK 版本中可用于判断
      if (AV.applicationId || AV.App) {
          isInitialized = true;
      }
  } catch (e) {}

  if (!isInitialized) {
      try {
          // appId and appKey are config credentials. In a real environment, they should be loaded via configuration or environment variables.
          // Since this is client-side JS loaded directly in Hexo, we keep the initialization here but document the config credentials.
          AV.init({
              appId: "IvW3T1NjMoh7OmKEdAz1tM0o-gzGzoHsz",
              appKey: "vG8s9ukVO5bgozEHzR923dew",
              serverURL: "https://ivw3t1nj.lc-cn-n1-shared.com"
          });
      } catch (error) {
          console.error('Failed to initialize LeanCloud:', error);
          window.dianzan = function() {};
          return;
      }
  }

  // 页面加载时自动获取点赞数
  function fetchDianzanCount() {
      var path = GetUrlRelativePath();
      var query = new AV.Query('dianzan');
      query.equalTo('href', path);
      query.first().then(function (result) {
          var count = 0;
          if (result) {
              count = result.get('count') || 0;
          }
          var el = document.getElementsByClassName("dianzan-count")[0];
          if (el) {
              el.innerText = count.toString();
          }
      }).catch(function (error) {
          console.error('Failed to fetch dianzan count:', error);
      });
  }

  // 点击点赞
  function dianzan() {
      var path = GetUrlRelativePath();
      var query = new AV.Query('dianzan');
      query.equalTo('href', path);
      query.first().then(function (result) {
          if (result) {
              var newCount = (result.get('count') || 0) + 1;
              result.set('count', newCount);
              return result.save().then(function () {
                  var el = document.getElementsByClassName("dianzan-count")[0];
                  if (el) {
                      el.innerText = newCount.toString();
                  }
              });
          } else {
              var DianzanObject = AV.Object.extend('dianzan');
              var newDianzan = new DianzanObject();
              newDianzan.set('href', path);
              newDianzan.set('count', 1);
              return newDianzan.save().then(function () {
                  var el = document.getElementsByClassName("dianzan-count")[0];
                  if (el) {
                      el.innerText = "1";
                  }
              });
          }
      }).catch(function (error) {
          console.error('Dianzan action failed, retrying with direct save:', error);
          // 备用方案：如果因为某些原因查询失败，尝试直接创建
          var DianzanObject = AV.Object.extend('dianzan');
          var newDianzan = new DianzanObject();
          newDianzan.set('href', path);
          newDianzan.set('count', 1);
          newDianzan.save().then(function () {
              var el = document.getElementsByClassName("dianzan-count")[0];
              if (el) {
                  el.innerText = "1";
              }
          }).catch(function (err) {
              console.error('Backup dianzan save failed:', err);
          });
      });
  }

  // 导出到全局 window 对象，供 HTML element onclick 调用
  window.dianzan = dianzan;

  // 页面加载就绪时获取一次点赞数
  if (typeof lifecycle !== 'undefined' && lifecycle.onReady) {
      lifecycle.onReady(fetchDianzanCount);
  } else {
      document.addEventListener('DOMContentLoaded', fetchDianzanCount);
  }
})()