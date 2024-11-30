document.addEventListener("pjax:complete",startbarrage),document.addEventListener("DOMContentLoaded",startbarrage);function startbarrage(){try{clearInterval(timer),document.querySelector(".comment-barrage").innerHTML="",sw=null}catch{}const r={lightColors:[["#ffffffaa!important","var(--lyx-black)"]],darkColors:[["#000a!important","var(--lyx-white)"]],maxBarrage:1,barrageTime:3e3,twikooUrl:"https://twikoo.yumetsuki.moe",accessToken:"f0fac9b52af34219af509d087ea72c4a",pageUrl:window.location.pathname,barrageTimer:[],barrageList:[],barrageIndex:0,noAvatarType:"retro",dom:document.querySelector(".comment-barrage"),displayBarrage:!0,avatarCDN:"cravatar.cn"};function i(e){var a=e,t=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/,n=new RegExp(t);return n.test(a)==!0}function s(e){const a=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight,t=e.offsetTop,n=document.documentElement.scrollTop;return t-n<=a}(location.href.indexOf("posts")!=-1||location.href.indexOf("posts")!=-1)&&(document.onscroll=function(){r.displayBarrage&&(s(document.getElementById("post-comment"))?(document.getElementsByClassName("barrageswiper")[0].style.transform="translateX(514px)",document.getElementsByClassName("barrageswiper")[0].style.opacity="0"):(document.getElementsByClassName("barrageswiper")[0].style.transform="",document.getElementsByClassName("barrageswiper")[0].style.opacity="1"))});function c(){var e=JSON.stringify({event:"COMMENT_GET","commentBarrageConfig.accessToken":r.accessToken,url:r.pageUrl}),a=new XMLHttpRequest;a.withCredentials=!0,a.addEventListener("readystatechange",function(){if(this.readyState===4){for(r.barrageList=g(JSON.parse(this.responseText).data),r.dom.innerHTML="",r.barrageIndex=0;r.barrageIndex<r.barrageList.length;r.barrageIndex++)m(r.barrageList[r.barrageIndex]);kkksc03=new Swiper(".barrageswiper",{direction:"vertical",loop:!0,mousewheel:!0,autoplay:{delay:3e3,stopOnLastSlide:!1,disableOnInteraction:!1}}),kkksc03.el.onmouseover=function(){kkksc03.autoplay.stop()},kkksc03.el.onmouseout=function(){kkksc03.autoplay.start()}}}),a.open("POST",r.twikooUrl),a.setRequestHeader("Content-Type","application/json"),a.send(e)}function g(e){e.sort((t,n)=>t.created-n.created);let a=[];return e.forEach(t=>{a.push(...l(t))}),a}function l(e){if(e.replies){let a=[e];return e.replies.forEach(t=>{a.push(...l(t))}),a}else return[]}function m(e){let a=document.createElement("div"),t=r.dom.clientWidth,n=r.dom.clientHeight;a.className="comment-barrage-item";let o=Math.floor(Math.random()*r.lightColors.length);document.getElementById("barragesColor").innerHTML=`[data-theme='light'] .comment-barrage-item { background-color:${r.lightColors[o][0]};color:${r.lightColors[o][1]}}[data-theme='dark'] .comment-barrage-item{ background-color:${r.darkColors[o][0]};color:${r.darkColors[o][1]}}`,e.avatar!=null?e.link!=null?(i(e.link)||(e.link="http://"+e.link),a.innerHTML=`
			<div class="barrageHead">
				<img class="barrageAvatar" src="${e.avatar}"/>
				<a href="${e.link}" class="barrageNick" target="_blank">${e.nick}</a>
				<a href="javascript:switchCommentBarrage()" style="font-size:20px">\xD7</a>
			</div>
			`):a.innerHTML=`
			<div class="barrageHead">
				<img class="barrageAvatar" src="${e.avatar}"/>
				<div class="barrageNick">${e.nick}</div>
				<a href="javascript:switchCommentBarrage()" style="font-size:20px">\xD7</a>
			</div>
			`:e.link!=null?(i(e.link)||(e.link="http://"+e.link),a.innerHTML=`
			<div class="barrageHead">
				<img class="barrageAvatar" src="https://${r.avatarCDN}/avatar/${e.mailMd5}?d=${r.noAvatarType}"/>
				<a href="${e.link}" class="barrageNick" target="_blank">${e.nick}</a>
				<a href="javascript:switchCommentBarrage()" style="font-size:20px">\xD7</a>
			</div>
			`):a.innerHTML=`
			<div class="barrageHead">
				<img class="barrageAvatar" src="https://${r.avatarCDN}/avatar/${e.mailMd5}?d=${r.noAvatarType}"/>
				<div class="barrageNick">${e.nick}</div>
				<a href="javascript:switchCommentBarrage()" style="font-size:20px">\xD7</a>
			</div>
			`,barrageContent=document.createElement("a"),barrageContent.className="barrageContent",barrageContent.href="#"+e.id,barrageContent.innerHTML=e.comment,a.appendChild(barrageContent),aswiper=document.createElement("div"),aswiper.className="swiper-slide",aswiper.setAttribute("style","height: 150px;"),aswiper.append(a),r.dom.append(aswiper)}switchCommentBarrage=function(){if(localStorage.setItem("isBarrageToggle",+!Number(localStorage.getItem("isBarrageToggle"))),!s(document.getElementById("post-comment"))){r.displayBarrage=!r.displayBarrage;let e=document.querySelector(".comment-barrage");e&&$(e).fadeToggle()}},localStorage.getItem("isBarrageToggle")==null?localStorage.setItem("isBarrageToggle","0"):localStorage.getItem("isBarrageToggle")=="1"&&(localStorage.setItem("isBarrageToggle","0"),switchCommentBarrage()),c()}
