// 欢迎提示处理
const showWelcomeMessage = () => {
    if (localStorage.getItem("popWelcomeWindow") === "0") return;

    const trustedDomains = ['yumetsuki.moe'];
    const referrerDomain = document.referrer ? new URL(document.referrer).hostname : '';

    const message = trustedDomains.some(domain => referrerDomain.includes(domain)) || !referrerDomain
        ? '欢迎访问本站！'
        : `欢迎来自${referrerDomain}的童鞋访问本站！`;

    Snackbar.show({
        pos: "top-right",
        showAction: false,
        text: message
    });

    if (!trustedDomains.some(domain => referrerDomain.includes(domain))) {
        localStorage.setItem("popWelcomeWindow", "0");
    }
};

// 浏览器版本检测优化
const BROWSER_VERSION_LIMITS = {
    Edge: 90,
    Firefox: 90,
    OPR: 80,
    Chrome: 90,
    Safari: null // Safari 暂不处理
};

const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    for (const [browser, version] of Object.entries(BROWSER_VERSION_LIMITS)) {
        if (ua.includes(browser)) {
            const match = ua.match(new RegExp(`${browser}\\/([\\d]+)`));
            return { browser, version: match ? parseInt(match[1]) : 0 };
        }
    }
    return null;
};

const browserVersion = () => {
    const browserInfo = getBrowserInfo();
    if (!browserInfo) return;

    const minVersion = BROWSER_VERSION_LIMITS[browserInfo.browser];
    if (minVersion && browserInfo.version < minVersion) {
        Snackbar.show({
            text: '浏览器版本较低，网站样式可能错乱',
            actionText: '关闭',
            duration: '6000',
            pos: 'bottom-right'
        });
    }
};

// Cookie 相关函数优化
const setCookies = (obj, limitTime) => {
    const expires = new Date(Date.now() + limitTime * 24 * 60 * 60 * 1000).toGMTString();
    Object.entries(obj).forEach(([key, value]) => {
        document.cookie = `${key}=${value};expires=${expires}`;
    });
};

const getCookie = name => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
    return match ? decodeURIComponent(match[2]) : null;
};

if (sessionStorage.getItem("popCookieWindow") != "0") {
    setTimeout(function () {
        Snackbar.show({
            text: '本站使用Cookie和本地/会话存储保证浏览体验和网站统计',
            pos: 'bottom-right',
            actionText: "查看博客声明",
            onActionClick: function (element) {
                window.open("/license")
            },
        })
    }, 3000)
}
sessionStorage.setItem("popCookieWindow", "0");

if (getCookie('browsertc') != 1) {
    setCookies({
        browsertc: 1,
    }, 1);
    browserVersion();
}