document.addEventListener('pjax:complete', tonav);
document.addEventListener('DOMContentLoaded', tonav);
function tonav() {
  // 获取需要操作的元素
  const nameContainer = document.getElementById("name-container");
  const menuItems = document.getElementsByClassName("menus_items")[1];
  const pageName = document.getElementById("page-name");

  // 检查元素是否存在
  if (!nameContainer || !menuItems || !pageName) {
    console.warn('Some required elements are missing');
    return;
  }

  nameContainer.setAttribute("style", "display:none");

  var position = $(window).scrollTop();

  $(window).scroll(function () {
    var scroll = $(window).scrollTop();

    if (scroll > position) {
      nameContainer.setAttribute("style", "");
      menuItems.setAttribute("style", "display:none!important");
    } else {
      menuItems.setAttribute("style", "");
      nameContainer.setAttribute("style", "display:none");
    }

    position = scroll;
  });

  // 添加错误处理
  try {
    pageName.innerText = document.title.split(" | 梦溯·镜影")[0];
  } catch (error) {
    console.warn('Error setting page name:', error);
  }
}