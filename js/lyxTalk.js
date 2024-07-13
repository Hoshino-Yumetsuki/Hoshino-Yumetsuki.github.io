let lyxTalk={};lyxTalk.init=function(e,n,t,o){AV.init({appId:e,appKey:n,serverURL:t}),new AV.Query("content").find().then(i=>{console.log(i)})};
