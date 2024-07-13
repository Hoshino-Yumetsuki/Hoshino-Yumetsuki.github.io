var evt=document.createEvent("HTMLEvents");evt.initEvent("pjax:complete",!1,!1),window.dispatchEvent(evt),document.addEventListener("pjax:complete",e=>{$("#setting-buttons").show()});
