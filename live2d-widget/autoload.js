/*! Generated asset: esbuild minified */
/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */const live2d_path="https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.1/dist/";function loadExternalResource(t,i){return new Promise((n,o)=>{let e;i==="css"?(e=document.createElement("link"),e.rel="stylesheet",e.href=t):i==="js"&&(e=document.createElement("script"),e.type="module",e.src=t),e&&(e.onload=()=>n(t),e.onerror=()=>o(t),document.head.appendChild(e))})}(async()=>{if(screen.width<768)return;const t=window.Image;window.Image=function(...n){const o=new t(...n);return o.crossOrigin="anonymous",o},window.Image.prototype=t.prototype,await Promise.all([loadExternalResource(live2d_path+"waifu.css","css"),loadExternalResource(live2d_path+"waifu-tips.js","js")]);const i=document.createElement("style");i.textContent=`
    #waifu {
      z-index: 999 !important;
    }

    #live2d {
    transform: translateY(25px) scale(1.55);
    transform-origin: center top;
    }
  `,document.head.appendChild(i),initWidget({waifuPath:live2d_path+"waifu-tips.json",cdnPath:"https://akilar-live2dapi.yumetsuki.moe/",modelId:12,cubism2Path:live2d_path+"live2d.min.js",cubism5Path:"https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js",tools:["hitokoto","asteroids","switch-model","switch-texture","photo","info","quit"],logLevel:"warn",drag:!1})})(),console.log(`
%cLive2D%cWidget%c
`,"padding: 8px; background: #cd3e45; font-weight: bold; font-size: large; color: white;","padding: 8px; background: #ff5450; font-size: large; color: #eee;","");
