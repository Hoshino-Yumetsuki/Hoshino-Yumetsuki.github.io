if(window.location.href.indexOf("posts")!==-1){
    $(document).ready(function(){
        // 选择所有需要添加黑幕效果的元素
        var elements = document.querySelectorAll("s>em,del");

        elements.forEach(function(element) {
            try {
                // 检查元素是否已经有 heimu 类
                if(element.classList.contains('heimu')) {
                    // 只给有 heimu 类的元素添加提示
                    element.title = "你知道的太多了";
                    element.setAttribute("data-toggle", "tooltip");
                }
            } catch(e) {
                console.log("处理元素时发生错误:", e);
            }
        });
    });
}