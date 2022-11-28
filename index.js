const fs = require('fs');
const path = require('path');
const cryptoJS = require('crypto-js');

module.exports = {
    /**
     * aes-128-cbc 加密
     * @param {string} data 原文
     * @retrun {string} 密文
     */
    encrypt(data, key, iv) {
        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);
        const srcs = cryptoJS.enc.Utf8.parse(data)
        const encrypted = cryptoJS.AES.encrypt(srcs, key, {
            iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        })
        return encrypted.toString();
    },

    /**
     * aes-128-cbc 解密
     * @param {string} data 密文
     * @return {string} 原文
     */
    decrypt(data, key, iv) {
        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);
        const decrypt = cryptoJS.AES.decrypt(data, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        return decrypt.toString(cryptoJS.enc.Utf8);
    },

    /**
     * 创建目录
     * @param {string} data 路径
     * @return {Boolen} 路径是否存在/建立
     */
    async mkdirSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
        return false
    },

    /**
     * 随机生成范围内不重复的数字
     * @param {number} number 数量
     * @param {number} range 范围
     * @return {Array} 随机数组
     */
    rangeRandomNum(number, range) {
        let result = [];
        while (result.length < number) {
            const n = Math.floor(Math.random() * range);
            if (result.length === 0) {
                result.push(n);
            } else {
                for (let i = 0; i < result.length; i++) {
                    if (result.join(',').indexOf(n) < 0) {
                        result.push(n);
                    }
                }
            }
        }

        return result;
    },

    /**
     * 随机获取数组中不重复的n个元素
     * @param {Array} array 数组
     * @param {number} number 数量
     * @retrun {Array} 去重后的数组
     */
    randomByArray(array, number) {
        let result = [];
        for (let i = 0; i < number; i++) {
            let ran = Math.floor(Math.random() * array.length);
            result.push(array.splice(ran, 1)[0]);
        }
        return result
    },

    /**
     * 数组去重
     * @param {Array} array 数组
     * @retrun {Array} 去重后的数组
     */
    unique(array) {
        return [...new Set(array)];
    },

    /**
     * 签名中对象转字符串
     * @param {Object} object 需要转换的对象
     * @retrun {string} 转换后的字符串
     */
    toQueryString(object) {
        object.debug && delete object.debug;
        object.sign && delete object.sign;
        return Object.keys(object)
            .filter(key => object[key] !== void 0 && object[key] !== '' && object[key] !== null)
            .sort()
            .map(key => key + '=' + encodeURIComponent(object[key]))
            .join('&')
    },

    /**
     * 接口参数签名
     * @param {Object} query query
     * @retrun {string} 签名
     */
    sign(query, apiSecret) {
        const str = this.toQueryString(query) + '&key=' + apiSecret;
        return cryptoJS.MD5(str).toString().toUpperCase();
    },

    /**
     * base64转对象
     * @param {string} str query
     * @retrun {Object} 转换后的对象
     */
    base64ToObject(str) {
        const res = decodeURI(Buffer.from(str, 'base64').toString());
        return JSON.parse(res);
    },

    /**
     * 数组排序
     * @param {number} a n
     * @param {number} b n
     * @retrun {Array} 数组
     */
    randomSort(a, b) {
        return Math.random() > 0.5 ? -1 : 1;
    },

    /**
     * 随机字符
     * @param {number} n 数量
     * @retrun {string} 随机字符
     */
    randomString(n = 6) {
        let result = '';
        const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        for (let i = 0; i < n; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 同步等待
     * @param {number} timeout 等待时间（毫秒）
     * @retrun {Promise}
     */
    sleep(timeout = 1000) {
        return new Promise(resolve => {
            let timer = setTimeout(() => {
                timer = null;
                return resolve();
            }, timeout)
        });
    },

    /**
     * 数字补0
     * @param {number} n 数字
     * @retrun {number}
     */
    zero(n) {
        return n === 0 ? 1 : n;
    },

    /**
     * 判断是否为中文
     * @param {string} str 待检测的字符
     * @retrun {Boolen}
     */
    isChinese(str) {
        const reg = /[^\u4E00-\u9FA5]/;
        return !reg.test(str);
    },

    /**
     * 日期格式化
     * @param {Date} date 日期
     * @param {string} format 返回的日期格式
     * @retrun {string} 日期
     */
    dateFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const config = {
            YYYY: date.getFullYear(),
            MM: date.getMonth() + 1,
            DD: date.getDate(),
            HH: date.getHours(),
            mm: date.getMinutes(),
            ss: date.getSeconds(),
        }
        for (const key in config) {
            let value = config[key];
            if (value < 10) {
                value = '0' + value;
            }
            format = format.replace(key, value)
        }
        return format
    },

    /**
     * 读取文件内容并转为对象
     * @param {string} date 文件路径
     * @retrun {Object} 对象
     */
    async readFileSync(filePath, type = 'object') {
        try {
            let rawData = await fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
            if (rawData && type === 'object') {
                rawData = JSON.parse(rawData);
            }
            return rawData;
        } catch (e) {
            console.log('error', e);
            return {};
        }
    },

    /**
     * 写入文件
     * @param {string} filePath 文件路径
     * @param {string||object} data 文件路径
     * @retrun {Object} 对象
     */
    async writeFileSync(filePath, data) {
        try {
            if (typeof data !== 'string') {
                data = JSON.stringify(data);
            }
            return await fs.writeFileSync(path.resolve(process.cwd(), filePath), data);
        } catch (e) {
            return null;
        }
    },

    /**
     * 数组去重
     * @param {Array} array 数值
     * @retrun {Array} 数值
     */
    arrayShuffle(array) {
        let i = array.length, t, j;
        while (i) {
            j = Math.floor(Math.random() * i--);
            t = array[i];
            array[i] = array[j];
            array[j] = t;
        }
        return array;
    },

    /**
     * 获取平台值
     * @param {string} platform 平台标识
     * @retrun {number} 平台值
     */
    getPlatformValue(platform) {
        const map = {
            'wx': 1,
            'baidu': 2,
            'alipay': 3,
            'toutiao': 4,
            'qq': 5,
            'kuai': 6,
            'app': 7,
            'ios': 8,
            'android': 9
        };
        return map[platform] || null;
    }
}
