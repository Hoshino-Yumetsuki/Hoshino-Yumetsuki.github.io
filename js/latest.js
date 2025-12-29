if (location.pathname == '/') newPost();

function newPost() {
    let ls = document.querySelectorAll('.recent-post-info')
    // 先让时间和索引值都等于第一个的
    let time = new Date(ls[0].querySelector('.post-meta-date-created').getAttribute('datetime')).getTime();
    let index = 0
    // 遍历数组，如果有时间比time大的则替换
    ls.forEach((i, num) => {
        let t = new Date(i.querySelector('.post-meta-date-created').getAttribute('datetime')).getTime()
        if (t > time) {
            time = t;
            index = num
        }
    })
    // 单数在右，双数在左
    // let className = index % 2 == 0 ? 'newPost-right' : 'newPost-left'
    // ls[index].innerHTML += '<span class="' + className + '">最 新</span>';
    // 如果你不想让其一左一右，可以注释上面的启用下面的
    ls[index].innerHTML += '<span class="newPost-left">最新</span>';
}
