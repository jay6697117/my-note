// 阻止事件冒泡
// event.cancelBubble = true;
// event.stopPropagation(); //  阻止事件向上传播
// event.preventDefault();  //  取消事件的默认动作。submit类型标签有效
// addEventListener中的第三个参 数是useCapture,一个bool类型。
// 当为false时为冒泡获取(由里向外)，true为capture方式(由外向里)
// 等价于jQuery的 $(document).ready()
// window.addEventListener('DOMContentLoaded', functionName) // mouseover, mouseout:hover()

// 永久储存
// localStorage.setItem("key","value"); 以“key”为名称存储一个值“value”
// localStorage.getItem("key"); 获取名称为“key”的值
// 周期储存（浏览器关闭之前）
// sessionStorage.setItem('','')
// sessionStorage.getItem('')

// token：06fabc49b94c435ce95e150c2578a3c274950e13
// id：299fa81eeef43388e730918dc894126e

/** 列表容器 */
let wrap = utils.find('#wrap');
/** p标签 */
let label = utils.find('#wrap p');

label.addEventListener('click', () => {
    utils.toggleClass(wrap, 'tra');
    let now = utils.timeFormat();
    console.log(now);
});

// console.log('日期列表', utils.dayJson());

/** 点击测试 */
function clickTest() {
    /** 总数 */
    const total = 5;
    /** 菜单列表容器 */
    let list = utils.find('.menu');

    // // 1、传统写法 添加function完成闭包 用 let 定义的变量可以不用闭包 
    // for (var i = 0; i < total; i++) {
    //     var item = document.createElement('li');
    //     item.textContent = '测试li-' + i;

    //     (function (index) {
    //         item.addEventListener('click', function () {
    //             console.log('第' + index + '个li');
    //         });
    //     })(i);

    //     list.appendChild(item);
    // }

    // 2、使用事假代理 添加点击事件 (事件委托就是利用事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件)
    for (var i = 0; i < total; i++) {
        var item = document.createElement('li');
        item.textContent = '测试li-' + i;
        item.dataset.index = i;
        list.appendChild(item);
    }
    // 在最外层容器做事件添加
    list.addEventListener('click', function () {
        // console.log(this);
        console.log(`第 ${event.target.dataset.index} 个li`);
    });

    // 事件代理高级：
    // // 方法二、全局查找节点
    // var ul = utils.find('#app ul');
    // ul.addEventListener('click', function (e) {
    //     var target = e.target;
    //     while(target !== ul ){
    //        if(target.tagName.toLowerCase() == 'li'){
    //            // console.log(target.dataset.id);
    //            break;
    //        }
    //        target = target.parentNode;
    //     }
    // });

    // // 方法一、指定某个节点
    // ul.addEventListener('click', function (e) {
    // 	if (e.target.nodeName.toLowerCase() == 'h5') {
    // 		console.log(e.target.dataset.id);
    // 	}
    // });
}
clickTest();


/**
 * 工厂模式下不需要 new 因为他本身就是创建一个新的对象
 * @param {string | HTMLElement} name class | id | label <div> <p>
 */
function $(name) {
    /**
     * 选中dom
     * @type {HTMLElement | Array<HTMLElement>}
     */
    var node = name;

    /**
     * 元素类型
     * @type {'single' | 'array'}
     */
    var type = 'single';

    if (typeof name == 'string') {
        node = [].slice.call(document.querySelectorAll(name));
        type = 'array';
    }

    /**
     * 列遍节点
     * @param {Array<HTMLElement>} array 
     * @param {function(HTMLElement, number)} callback 
     */
    function forEach(array, callback) {
        for (var i = 0; i < array.length; i++) {
            array[i]['index'] = i;
            if (typeof callback === 'function') callback(array[i], i);
        }
    }

    /**
     * 解绑事件
     * @param {HTMLElement} obj 
     * @param {string} method
     */
    function offEvent(obj, method) {
        /**
         * @type {Array<{fn: Function, type: string}>}
         */
        var list = obj['the_eventList'];
        for (var i = list.length - 1; i >= 0; i--) {
            var info = list[i];
            if (method) {
                if (method == info['type']) {
                    obj.removeEventListener(method, info['fn']);
                    list.splice(i, 1);
                }
            } else {
                obj.removeEventListener(info['type'], info['fn']);
                list.splice(i, 1);
            }
        }
    }

    /** 工厂对象 */
    var factory = {
        /** 当前dom */
        el: node,

        /**
         * 修改 html
         * @param {string} content 
         */
        html: function (content) {
            if (type == 'array') {
                forEach(this.el, function (item, index) {
                    item.innerHTML = content;
                });
            } else {
                this.el.innerHTML = content;
            }
            return factory;
        },

        /**
         * 添加事件
         * @param {string} method 事件
         * @param {Function} callback 
         */
        on: function (method, callback) {
            if (type == 'array') {
                forEach(this.el, function (item, index) {
                    item.addEventListener(method, callback);
                    // 添加事件到自定义数组中，解绑用
                    if (!item['the_eventList']) {
                        item['the_eventList'] = [];
                    }
                    item['the_eventList'].push({
                        type: method,
                        fn: callback
                    });
                });
            } else {
                this.el.addEventListener(method, callback);
            }
            return factory;
        },

        /**
         * 解绑事件
         * @param {string} method 要解绑的事件（可选）
         */
        off: function (method) {
            if (type == 'array') {
                forEach(this.el, function (item, index) {
                    offEvent(item, method);
                });
            } else {
                offEvent(this.el, method);
            }
            return factory;
        }
    };

    return factory;
}
// jQuery 的链式实现
// $('.menu li').html('工厂模式更改').on('click', function () {
//     $(this).html(`li-${this.index+1}`);
//     console.log('索引', this.index);
//     setTimeout(function() {
//         $('.menu li').off('click').html('取消点击事件');
//     }, 500);
// });

/** 字符串类型 */
function stringModule() {
    let string = 'www.https/#/hjihsaih/#/sad.com';
    let code = 'CEde_128,1214534';
    let value = 456;
    // 将任意值转换成字符串
    String(value);
    // 关键字以外转字符串 toString(num) 可带参数转进制，限定 number.toString(num);
    value.toString();
    // 对字符串进行编码(数字和英文不变)
    encodeURIComponent();
    // 对应的解码     
    decodeURIComponent();
    // 过滤数字
    let filterNum = string.replace(/\d+/g, '');
    // 过滤英文
    let filterEnglish = string.replace(/[a-zA-Z]/g, '');
    /**
     * 检测字符串是否存在指定字符串
     * ES6 && ES5
     * array 同样适用
     */
    string.includes('name');    // return false true              
    string.search('name');      // return -1 or index
    // 正则替换：i不区分大小写，g是全局 
    let regular = string.replace(/#/i, '?#');
    // 下面这种替换性能会更好点，但是不够灵活，只能是全局替换
    let replace = string.split('#').join('?#');
    // 截取从","之后的字符串
    let _code = code.slice(code.indexOf(',') + 1);

    /** 
     * ES5 
     * Objeco.keys(obj)
     * ES6
     * Objeco.values(obj);
     * Objeco.entries(obj);
    */
}

/** 数组类型 */
function arrayModule() {
    // 数组处理
    array.join('&');
    array.split(',');   // 把字符串分割成数组
    array.slice(index, num); // 索引截取数组 从 index 开始往往后截取 num 不填则 index 之后的都截取掉
    array.shift();      // 移除第一项 并返回第一项
    array.unshift();    // 在第一项添加
    array.pop();        // 移除最后一项 并返回最后一项
    array.push();       // 在第一项添加
    array.reverse();    // 反转数组
    Math.ceil(25.9);    // 向上取舍
    Math.round(25.9);   // 四舍五入
    Math.floor(25.9);   // 向下取舍
    // 1~100 随机一个数
    Math.floor(100 * Math.random()) + 1;
    // 把数字，小数点 格式化为指定的长度
    number.toPrecision(3);
    // 保留小数位
    number.toFixed(2);
    // 历遍数组结果 所有成立才返回 true
    var everyResult = array.every(function (item, index, array) {
        return (item > 2);
    });
    // 历遍数组结果 有一个成立返回 true
    var someResult = array.some(function (item, index, array) {
        return (item > 2);
    });
    // 过滤一个数组
    var filterResult = array.filter(function (item, index, array) {
        return (item > 2);
    });
    // 在原有数组中运行传入函数
    var mapResult = array.map(function (item, index, array) {
        return item * 2;
    });
    // 数组累加 values.reduceRight() 反向执行
    var sum = values.reduce(function (prev, cur, index, array) {
        return prev + cur;
    });

    // 数组排序从小到大
    let stob = (a, b) => a - b;
    array.sort(stob);

    /**
     * 数组对象排序从小到大
     * @param {string} key 对象key值
     */
    function compare(key) {
        return function (obj1, obj2) {
            let val1 = obj1[key],
                val2 = obj2[key];
            if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1);
                val2 = Number(val2);
            }
            return val1 - val2;
        }
    }
    array.sort(compare('key'));

    /** 多个key值排列判断 */
    function demo(a, b) {
        if (Number(a.level) === Number(b.level)) {
            return Number(a.levelscore) - Number(b.levelscore);
        } else {
            return Number(a.level) - Number(b.level);
        }
    }
}

function disc() {
    /** 抽奖概率范围 */
    const range = parseInt(100 * Math.random()) + 1;
    /** 概率列表（加起来必须是100） */
    const list = [1, 5, 54, 20, 10, 10];
    /** 概率索引 */
    let index = 0;
    /** 单个概率 */
    let rate = 0;
    // console.log('随机数', range);
    for (let i = 0; i < list.length; i++) {
        const number = list[i];
        rate += number;
        if (range <= rate) {
            index = i;
            break;
        }
    }
    console.log(`概率 ${list[index]}%，索引 ${index}`);
}

/** 数字类型扩展 */
function numberExtend() {
    Number.MAX_SAFE_DIGITS = Number.MAX_SAFE_INTEGER.toString().length - 2;
    Number.prototype.digits = function () {
        var result = (this.valueOf().toString().split('.')[1] || '').length;
        return result > Number.MAX_SAFE_DIGITS ? Number.MAX_SAFE_DIGITS : result;
    }
    Number.prototype.add = function (val = 0) {
        if (typeof val !== 'number') return console.warn('请输入正确的数字');
        const value = this.valueOf();
        const thisDigits = this.digits();
        const valDigits = val.digits();
        const baseNum = Math.pow(10, Math.max(thisDigits, valDigits));
        const result = (value * baseNum + val * baseNum) / baseNum;
        if (result > 0) {
            return result > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : result;
        } else {
            return result < Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : result;
        }
    }
    Number.prototype.minus = function (val = 0) {
        if (typeof val !== 'number') return console.warn('请输入正确的数字');
        const value = this.valueOf();
        const thisDigits = this.digits();
        const valDigits = val.digits();
        const baseNum = Math.pow(10, Math.max(thisDigits, valDigits));
        const result = (value * baseNum - val * baseNum) / baseNum;
        if (result > 0) {
            return result > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : result;
        } else {
            return result < Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : result;
        }
    }
}

function sort() {
    const key = 3;
    const arr1 = ['A1', 'A2', 'B1', 'B2', 'D1', 'D2', 'C1', 'C2'];
    const arr2 = ['A', 'B', 'C', 'D'].map(item => item + key);
    let result = [].concat(arr1, arr2);
    result.sort();
    result = result.map(item => item.replace(key, ''));
    console.log(result);
}

function checkDebugging() {
    const doc = document;
    // 禁止鼠标事件和键盘事件打开开发者模式
    doc.oncontextmenu = function () {
        return false;
    }
    doc.onkeydown = doc.onkeyup = doc.onkeypress = function (event) {
        const e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 123) {
            e.returnValue = false;
            return false;
        }
    }
    // 监听是否开发者模式
    const handler = setInterval(() => {
        const before = Date.now();
        debugger;
        if (Date.now() - before > 100) {
            // 是开发者模式就跳转百度
            location.replace('https://www.baidu.com');
            clearInterval(handler);
        }
    }, 500);
}

/**
 * 获取图片数据（二进制数据流）
 * @param {string} src 请求图片路径
 * @param {(code: string) => void} callback 回调函数
 */
function getImageData(src, callback) {
    const XHR = new XMLHttpRequest();
    XHR.open('GET', src, true);
    XHR.responseType = 'arraybuffer';
    XHR.overrideMimeType('text/plain; charset=x-user-defined');
    XHR.onreadystatechange = function () {
        if (XHR.readyState === 4 && XHR.status === 200) {
            const file = XHR.response || XHR.responseText;
            const blob = new Blob([file], { type: 'image/jpeg' });
            const fr = new FileReader();
            // console.log('Blob', blob);
            fr.readAsText(blob);
            fr.onload = function (e) {
                /** @type {string} */
                const code = e.target.result;
                // console.log(code);
                if (typeof callback === 'function') callback(code);
            }
        }
    }
    XHR.send();
}
// getImageData('https://resxz.eqh5.com/qngroup001%2Fu12212%2F1%2F0%2Fde6d163bd2f14598b9d89bb58607a8ad.jpeg', (code) => {
//     console.log(code);

// });

/**
 * 将图片画成圆并返回`base64`
 * @param {string} imgUrl 图片路径
 * @param {number} width 设置图片的宽度/高度
 * @param {(res: string) => void} callback base64回调
 */
function circleImage(imgUrl, width, callback) {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const contex = canvas.getContext('2d');
    const circle = {
        x: width / 2,
        y: width / 2,
        r: width / 2
    };
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;
    img.onload = function () {
        canvas.width = width;
        canvas.height = width;
        contex.clearRect(0, 0, width, width);
        contex.save();
        contex.beginPath();
        contex.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, false);
        contex.clip();
        contex.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, width);
        contex.restore();
        callback(canvas.toDataURL('image/png'));
    }
}

function getCanvasData() {
    /**
     * Base64字符串转二进制
     * @param {string} base64 
    */
    function base64ToBlob(base64) {
        let arr = base64.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }

    /**
     * 获取base64数据
     * @param {string} url 图片路径
     * @param {string} ext 图片格式
     * @param {(res: string) => void} callback 结果回调
     */
    function getBase64Info(url, ext, callback) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image;
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = function () {
            console.log(img.height, img.width);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL("image/" + ext);
            const blob = base64ToBlob(base64);
            const fr = new FileReader();
            // console.log(blob);
            fr.readAsText(blob);
            fr.onload = function (e) {
                /** @type {string} */
                const code = e.target.result;
                // console.log(code);
                const index = code.search('data=');
                const res = code.slice(index + 5, code.length);
                if (typeof callback === 'function') callback(res);
            }
        };
        // document.body.innerHTML = null;
        // document.body.appendChild(canvas);
    }

    let path = 'https://resxz.eqh5.com/qngroup001%2Fu12212%2F1%2F0%2Fde6d163bd2f14598b9d89bb58607a8ad.jpeg';

    getBase64Info(path, 'jpeg', res => {
        // console.log('图片数据', res);
        // console.log(atob(res));

    });
}

/**
 * 数字转中文
 * @param {number} number 
 */
function getNumCNSpell(number) {
    if (number < 0) return console.warn('数字必须大于零');
    const numMapSpell = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const posMapUnit = ['', '十', '百', '千'];
    const splitUnit = ['', '万', '亿'];
    const value = number.toString();
    const length = value.length;
    let result = '';
    let count = 0

    for (let i = 0; i < length; i++) {
        const index = length - i - 1;   // 反序索引
        const pos = index % 4;          // 千百十个 -> 3210
        const str = value[i];

        if (str === '0') {
            count++;
        }
        else {
            if (count > 0) {
                result += '零'
                count = 0
            }
        }

        if (pos === 0 && str === '2' && i === 0 && length > 4) {
            // 两万 两亿的情况
            result += '两';
        } else if (pos === 1 && str === '1' && (i - 1 < 0 || value[i - 1] === '0') && (i - 2 < 0 || value[i - 2] === '0')) {
            // 十一，十二 不读一的情况
            result += '';
        } else if (pos >= 2 && str === '2') {
            // 千位，百位读两
            result += '两';
        } else {
            if (str !== '0') {
                result += numMapSpell[value[i]];
            }
        }

        if (str !== '0') {
            result += posMapUnit[pos];
        }

        if (index % 4 === 0 && count < 4) {
            result += splitUnit[Math.floor(index / 4)];
        }
    }
    return result;
}

/**
 * 文档加载完成等同于`jQuery $ready()`
 * @param {Function} fn 
 */
function documentReady(fn) {
    // 严格模式
    // function onReady () {
    //     document.removeEventListener('DOMContentLoaded', onReady);
    //     if (typeof fn === 'function') fn();
    // }
    // document.addEventListener('DOMContentLoaded', onReady);

    // 非严格模式
    document.addEventListener('DOMContentLoaded', function() {
        document.removeEventListener('DOMContentLoaded', arguments.callee);
        if (typeof fn === 'function') fn();
    });
}