
(function (win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    // 设备像素比
    var devicePixelRatio = win.devicePixelRatio;
    // 我们设置的布局视口与理想视口的像素比
    var dpr = 1; 
    // viewport缩放值
    var scale = 1; 
    // 设置viewport
    function setViewport() {
        // 判断IOS
        var isIPhone = /iphone/gi.test(win.navigator.appVersion);
        // 布局视口与理想视口的值与设备像素比相等
        dpr = devicePixelRatio;
        // window对象上增加一个属性，提供对外的布局视口与理想视口的值
        win.devicePixelRatioValue = dpr;
        // viewport缩放值，布局视口缩放后刚好显示成理想视口的宽度，页面就不会过长或过短了
        scale = 1 / dpr;
        // 获取已有的viewport
        var hasMetaEl = doc.querySelector('meta[name="viewport"]');
        // 如果有，改变之
        if (hasMetaEl) {
            // ios9 不用设置 maximum-scale minimum-scale，否则页面会出现可左右拖动的效果，IOS9的bug或者故意为之？
            if (isIPhone) {
                hasMetaEl.setAttribute('content', 'initial-scale=' + scale + ', user-scalable=no');
            }
            // target-densitydpi 目标设备密度等级，默认值medium-dpi，我们的目标是css中的1px会等于物理像素中的1px，故使用target-densitydpi=device-dpi
            else {
                hasMetaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no,target-densitydpi=device-dpi');
            } 
        }
        // 如果没有，添加之
        else {
            var metaEl = doc.createElement('meta');
            metaEl.setAttribute('name', 'viewport');
            if (isIPhone) { 
                metaEl.setAttribute('content', 'initial-scale=' + scale + ', user-scalable=no');
            }
            else {
                metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no,target-densitydpi=device-dpi');
            }
            
            if (docEl.firstElementChild) {
                docEl.firstElementChild.appendChild(metaEl);
            }
            else {
                var wrap = doc.createElement('div');
                wrap.appendChild(metaEl);
                doc.write(wrap.innerHTML);
            }
        }
    }
    setViewport();
    var newBase = 100;

    function setRem() {
        // 布局视口
        // var layoutView = docEl.documentElement.clientWidth; 也可以 获取布局视口的宽度
        var layoutView = docEl.getBoundingClientRect().width;
        // 为了计算方便，我们规定 1rem === 100px设计图像素，我们切图的时候就能快速转换
        // 有人问，为什么不让1rem === 1px设计像素呢？
        // 设计图一般是640或者750px
        // 布局视口一般是320到1440
        // 计算一个值，使layout的总宽度为 (desinWidth/100) rem
        // 那么有计算公式：layoutView / newBase = desinWidth / 100
        // newBase = 100 * layoutView / desinWidth
        // newBase = 介于50到200之间
        // 如果 1rem === 1px 设计像素，newBase就介于0.5到2之间，由于很多浏览器有最小12px限制，这个时候就不能自适应了
        newBase = 100 * layoutView / lib.desinWidth;
        docEl.style.fontSize = newBase + 'px';
    }
    var tid;
    lib.desinWidth = 640;
    lib.baseFont = 18;
    lib.init = function () {
        win.addEventListener('resize', function () {
            clearTimeout(tid);
            tid = setTimeout(setRem, 300);
        }, false);
        win.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                clearTimeout(tid);
                tid = setTimeout(setRem, 300);
            }
        }, false);
        if (doc.readyState === 'complete') {
            doc.body.style.fontSize = lib.baseFont * dpr + 'px';
        }
        else {
            doc.addEventListener('DOMContentLoaded', function (e) {
                doc.body.style.fontSize = lib.baseFont * dpr + 'px';
            }, false);
        }
        setRem();
        docEl.setAttribute('data-dpr', dpr);
    };
})(window, window['adaptive'] || (window['adaptive'] = {}));
