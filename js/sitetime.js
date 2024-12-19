function siteTime() {
    const startDate = new Date(Date.UTC(2022, 6, 4, 12, 0, 0));

    function updateTime() {
        try {
            const now = new Date();
            const diff = now - startDate;

            // 时间计算常量
            const SECOND = 1000;
            const MINUTE = SECOND * 60;
            const HOUR = MINUTE * 60;
            const DAY = HOUR * 24;
            const YEAR = DAY * 365;

            // 计算时间差
            const years = Math.floor(diff / YEAR);
            const days = Math.floor((diff % YEAR) / DAY);
            const hours = Math.floor((diff % DAY) / HOUR);
            const minutes = Math.floor((diff % HOUR) / MINUTE);
            const seconds = Math.floor((diff % MINUTE) / SECOND);

            // 更新DOM
            const element = document.getElementById("footer_custom_text");
            if (element) {
                element.textContent = `这个小破站已运行 ${years} 年 ${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
            }
        } catch (error) {
            console.error('运行时间计算出错:', error);
        }
    }

    // 初始更新
    updateTime();
    // 每500毫秒更新一次
    setInterval(updateTime, 500);
}

// 页面加载完成后启动计时器
document.addEventListener('DOMContentLoaded', siteTime);