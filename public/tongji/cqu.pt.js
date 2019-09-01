// CNZZ统计
var CNZZ_ID = 1257517721;
(function CNZZ() {
    var box = document.createElement('div'),
        cnzz = document.createElement('script');
    box.style.display = 'none';
    cnzz.src = '//s1.cnzz.com/z_stat.php?id=' + CNZZ_ID;
    box.appendChild(cnzz);
    document.body.appendChild(box);
})();

// consoleMe
(function consoleMe() {
    if (/webkit/.test(navigator.userAgent.toLowerCase())) {
        console.log('%c ', 'background-image:url("https://congm.in/static/congmin-black.png");background-repeat:no-repeat;background-size:auto 150px;line-height:150px;padding:75px 265px;');
        console.log('%c @ Cong Min - 闵聪      https://congm.in', 'font-family:"Helvetica Neue",Helvetica,Arial,"Microsoft YaHei",sans-serif;color:#666;font-size:14px;line-height:32px;padding-left:32px;');
        console.log('%c 温馨提示：为了保证内网的安全，以及方便大家能够长期的使用内网外入，请文明和谐的使用。QQ群：312784909', 'color:#333;font-size:16px;')
    }
})();
