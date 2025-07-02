var evt = new CustomEvent("pjax:complete", {
    bubbles: false,
    cancelable: false
});
window.dispatchEvent(evt);
document.addEventListener('pjax:complete', (e) => {
    const settingButtons = document.querySelector("#setting-buttons");
    if (settingButtons) {
        $(settingButtons).show();
    }
});