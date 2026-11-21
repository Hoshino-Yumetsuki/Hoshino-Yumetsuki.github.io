/*! Generated asset: esbuild minified */
(()=>{"use strict";const t=()=>{typeof Promise<"u"&&typeof fetch<"u"&&typeof Object.assign<"u"&&"classList"in document.documentElement||o()},o=()=>{if(window.Snackbar){window.Snackbar.show({text:"您的浏览器版本过旧，可能无法正常显示本网站。建议使用 Chrome、Firefox、Safari 或 Edge 的最新版本。",pos:"top-center",showAction:!1,duration:1e4});return}const e=document.createElement("div");Object.assign(e.style,{position:"fixed",top:"0",left:"0",right:"0",padding:"12px",backgroundColor:"#ff6b6b",color:"white",textAlign:"center",fontSize:"14px",zIndex:"9999",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}),e.innerHTML=`
            <strong>浏览器兼容性提示：</strong>
            您的浏览器版本过旧，可能无法正常显示本网站。
            建议使用 Chrome、Firefox、Safari 或 Edge 的最新版本。
            <button style="margin-left: 12px; padding: 4px 12px; background: white; color: #ff6b6b; border: none; border-radius: 4px; cursor: pointer;">
                关闭
            </button>
        `,e.querySelector("button")?.addEventListener("click",()=>{e.remove()},{once:!0}),document.body.prepend(e),setTimeout(()=>{e.remove()},1e4)},n=()=>{t()};lifecycle.once(n)})();
