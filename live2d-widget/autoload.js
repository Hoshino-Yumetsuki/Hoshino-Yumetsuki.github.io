(function(n,i){typeof module=="object"&&typeof module.exports=="object"?i():typeof define=="function"&&define.amd?define([],i):(n=typeof globalThis<"u"?globalThis:n||self)&&i()})(this,function(){var n="/live2d-widget/";function i(t,o){return new Promise(function(s,f){var e;o==="css"?(e=document.createElement("link"),e.rel="stylesheet",e.href=t):o==="js"&&(e=document.createElement("script"),e.src=t),e&&(e.onload=function(){return s(t)},e.onerror=function(){return f(t)},document.head.appendChild(e))})}screen.width>=768&&Promise.all([i(n+"waifu.css","css"),i(n+"live2d.min.js","js"),i(n+"waifu-tips.js","js")]).then(function(){initWidget({waifuPath:n+"waifu-tips.json",cdnPath:"https://npm.elemecdn.com/akilar-live2dapi@latest/",tools:["hitokoto","asteroids","switch-model","switch-texture","photo","info","quit"]})}),console.log(`
  \u304F__,.\u30D8\u30FD.        /  ,\u30FC\uFF64 \u3009
           \uFF3C ', !-\u2500\u2010-i  /  /\xB4
           \uFF0F\uFF40\uFF70'       L/\uFF0F\uFF40\u30FD\uFF64
         /   \uFF0F,   /|   ,   ,       ',
       \uFF72   / /-\u2010/  \uFF49  L_ \uFF8A \u30FD!   i
        \uFF9A \uFF8D 7\uFF72\uFF40\uFF84   \uFF9A'\uFF67-\uFF84\uFF64!\u30CF|   |
          !,/7 '0'     \xB40i\u30BD|    |
          |.\u4ECE"    _     ,,,, / |./    |
          \uFF9A'| i\uFF1E.\uFF64,,__  _,.\u30A4 /   .i   |
            \uFF9A'| | / k_\uFF17_/\uFF9A'\u30FD,  \uFF8A.  |
              | |/i \u3008|/   i  ,.\uFF8D |  i  |
             .|/ /  \uFF49\uFF1A    \uFF8D!    \uFF3C  |
              k\u30FD>\uFF64\uFF8A    _,.\uFF8D\uFF64    /\uFF64!
              !'\u3008//\uFF40\uFF34\xB4', \uFF3C \uFF40'7'\uFF70r'
              \uFF9A'\u30FDL__|___i,___,\u30F3\uFF9A|\u30CE
                  \uFF84-,/  |___./
                  '\uFF70'    !_,.:
`)});
