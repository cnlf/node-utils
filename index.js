import cryptoJS from 'crypto-js';
export default {
    /**
     * 节流原理：在一定时间内，只能触发一次
     * @param {Function} func 要执行的回调函数
     * @param {Number} wait 延时的时间
     * @param {Boolean} immediate 是否立即执行
     * @return null
     */
    throttle(func, wait = 500, immediate = true) {
        if (immediate) {
            if (!this.flag) {
                this.flag = true;
                // 如果是立即执行，则在wait毫秒内开始时执行
                typeof func === 'function' && func();
                this.timer = setTimeout(() => {
                    this.flag = false;
                }, wait);
            }
        } else {
            if (!this.flag) {
                this.flag = true
                // 如果是非立即执行，则在wait毫秒内的结束处执行
                this.timer = setTimeout(() => {
                    this.flag = false
                    typeof func === 'function' && func();
                }, wait);
            }

        }
    },

    /**
     * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
     * @param {Function} func 要执行的回调函数
     * @param {Number} wait 延时的时间
     * @param {Boolean} immediate 是否立即执行
     * @return null
     */
    debounce(func, wait = 500, immediate = false) {
        // 清除定时器
        if (this.timeout !== null) clearTimeout(this.timeout);
        // 立即执行，此类情况一般用不到
        if (immediate) {
            var callNow = !this.timeout;
            this.timeout = setTimeout(function () {
                this.timeout = null;
            }, wait);
            if (callNow) typeof func === 'function' && func();
        } else {
            // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
            this.timeout = setTimeout(function () {
                typeof func === 'function' && func();
            }, wait);
        }
    },

    /**
     * 获取平台名称
     * @return {string} 平台名称
     */
    getPlatform() {
        let platform;
        switch (process.env.VUE_APP_PLATFORM) {
            case 'app-plus':
                let n = uni.getSystemInfoSync().platform.toLowerCase();
                if (n === 'ios') {
                    platform = 'ios';
                } else if (n === 'android') {
                    platform = 'android';
                } else {
                    platform = 'app';
                }
                break;
            case 'mp-weixin':
                platform = 'wx';
                break;
            case 'mp-alipay':
                platform = 'alipay';
                break;
            case 'mp-baidu':
                platform = 'baidu';
                break;
            case 'mp-qq':
                platform = 'qq';
                break;
            case 'mp-toutiao':
                platform = 'toutiao';
                break;
            case 'quickapp-webview':
                platform = 'kuai';
                break;
        }

        return platform;
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
     * 获取code
     * @retrun {Promise} code
     */
    getCode() {
        return new Promise((resolve, reject) => {
            // #ifdef MP
            uni.getProvider({
                service: 'oauth',
                success: res => {
                    const platform = res.provider[0];
                    // 抖音-toutiao
                    uni.login({
                        provider: platform,
                        success: res => {
                            return resolve(res.code);
                        },
                        fail: e => {
                            return reject('');
                        }
                    })
                }
            });
            // #endif

            // #ifdef APP-PLUS
            // app用户登录标志
            let appOpenId = uni.getStorageSync('appOpenId');
            if (appOpenId) {
                return resolve(appOpenId);
            } else {
                const localUser = uni.getStorageSync('localUser');
                if (localUser) {
                    return reject(localUser);
                } else {
                    return reject(`CUS${this.randomString(30)}`);
                }
            }
            // #endif
        });
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
     * md5加密
     * @param {string} str 带加密字符
     * @retrun {string} 加密字符
     */
    md5(str) {
        return cryptoJS.MD5(str).toString().toUpperCase();
    },

    /**
     * 同步等待
     * @param {number} timeout 等待时间（毫秒）
     * @retrun {Promise}
     */
    sleep(timeout= 1000) {
        return new Promise(resolve => {
            let timer = setTimeout(() => {
                timer = null;
                return resolve();
            }, timeout)
        });
    },

    /**
     * 加密
     * @param {string} data 密文
     * @param {string} key key
     * @param {string} iv iv
     */
    encrypt(data, key, iv) {
        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);
        const srcs = cryptoJS.enc.Utf8.parse(data);
        const encrypted = cryptoJS.AES.encrypt(srcs, key, {
            iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        })
        return encrypted.toString();
    },

    /**
     * 解密
     * @param {string} data 密文
     * @param {string} key key
     * @param {string} data iv
     */
    decrypt(data, key, iv) {
        key = cryptoJS.enc.Utf8.parse(key);
        iv = cryptoJS.enc.Utf8.parse(iv);
        let result = cryptoJS.AES.decrypt(data, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        result = result.toString(cryptoJS.enc.Utf8);
        return typeof result === 'string' && (result[0] === '{' || result[0] === '[') ? JSON.parse(result) : result;
    },

    /**
     * 生成参数
     * @param {Object} data 数据
     * @param {Boolean} auth 是否需求认证
     * @param {Object} config 参数配置
     * @return {Promise}
     */
    generateParameters(data = {}, auth = true, config) {
        return new Promise(async resolve => {
            // 需要Token验证的
            if (auth) {
                await this.getToken();
                return resolve(this.mergeParameters(data, config));
            } else {
                // 不需要Token验证的
                return resolve(this.mergeParameters(data, config));
            }
        })
    },

    /**
     * 递归获取token
     * @return {Promise}
     */
    async getToken() {
        let token = getApp({allowDefault: true}).globalData.token;

        if (token) {
            return token;
        } else {
            await this.sleep(100);
            return await this.getToken();
        }
    },

    /**
     * 合并参数
     * @return {Object} 参数
     */
    mergeParameters(data = {}, config) {
        const params = Object.assign({
            apikey: config.apikey,
            version: config.version || '1.0',
            timestamp: +new Date(),
            platform: this.getPlatform(),
            nonce: this.randomString(),
        }, data);
        params.sign = this.sign(params, config.apiSecret);
        return params;
    },

    /**
     * 签名中对象转字符串
     * @param {Object} object 需要转换的对象
     * @retrun {string} 转换后的字符串
     */
    toQueryString(object) {
        object.sign && delete object.sign;
        return Object.keys(object)
            .filter(key => object[key] !== void 0 && object[key] !== "" && object[key] !== null && object[key] !== "undefined")
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
        // console.log('签名' + str);
        return cryptoJS.MD5(str).toString().toUpperCase();
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
            MM: date.getMonth()+1,
            DD: date.getDate(),
            HH: date.getHours(),
            mm: date.getMinutes(),
            ss: date.getSeconds(),
        }
        for(const key in config){
            let value = config[key];
            if (value < 10) {
                value = '0' + value;
            }
            format = format.replace(key, value)
        }
        return format
    },

    /**
     * base64转文件
     * @param {string} base64data base64
     * @param {Function} cb 回调
     */
    base64ToSrc(base64data, cb) {
        const FILE_BASE_NAME = 'tmp_base64src';
        const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
        if (!format) {
            return (new Error('格式错误'));
        }

        // #ifdef MP-WEIXIN
        let filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
        // #endif
        // #ifdef MP-QQ
        let filePath = `${qq.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
        // #endif

        const buffer = uni.base64ToArrayBuffer(bodyData);
        uni.getFileSystemManager().writeFile({
            filePath,
            data: buffer,
            encoding: 'binary',
            success() {
                cb && cb(filePath);
            }
        });
    },

    /**
     * base64解码
     * @param {string} str str
     * @param {string}
     */
    encodeBase64(str) {
        return new Buffer.from(str).toString('base64');
    },

    /**
     * base64解码
     * @param {string} str str
     * @param {string}
     */
    decodeBase64(str) {
        const commonContent = str.replace(/\s/g, '+');
        return new Buffer.from(commonContent, 'base64').toString();
    },

    /**
     * 创建广告
     * @param {string} adId 广告id
     * @param {Promise}
     */
    async createVideoAd(adId) {
        // todo
        // #ifdef APP-PLUS
        // return new Promise(((resolve, reject) => {
        //     return resolve()
        // }));
        // #endif

        // #ifdef MP-QQ
        return new Promise((resolve, reject) => {
            let videoAd = qq.createRewardedVideoAd({adUnitId: adId})
            videoAd.onError(async err => {
                uni.showToast({
                    icon: 'none',
                    title: `视频播放失败,${JSON.stringify(err)}`
                });
                reject({adFailed: true});
            })
            videoAd.onLoad(async res => {
            })
            videoAd.onClose(async res => {
                if (res && res.isEnded && videoAd) {
                    videoAd = null;
                    resolve(res);
                } else {
                    reject({adFailed: true});
                }
            })
            videoAd.load().then(() => {
                videoAd.show().then(() => {

                }).catch(err => {
                    uni.showToast({
                        icon: 'none',
                        title: `激励视频加载失败`
                    });
                    reject({adFailed: true});
                })
            }).catch(err => {
                uni.showToast({
                    icon: 'none',
                    title: `激励视频加载失败`
                });
                reject({adFailed: true});
            })
        })
        // #endif

        // #ifdef MP-WEIXIN
        return new Promise((resolve, reject) => {
            wx.reportEvent("build_ad");
            let videoAd = null

            // 在页面onLoad回调事件中创建激励视频广告实例
            if (wx.createRewardedVideoAd) {
                videoAd = wx.createRewardedVideoAd({
                    adUnitId: adId
                })
                videoAd.onLoad(() => {})
                videoAd.onError((err) => {
                    uni.showToast({
                        icon: 'error',
                        title: `激励视频加载失败`
                    });
                    return reject({adFailed: true});
                })

                videoAd.onClose((res) => {
                    if (res && res.isEnded || res === undefined) {
                        videoAd.offClose()
                        // console.log('播放完成');
                        wx.reportEvent('build_ad_success');
                        return resolve(true);
                    } else {
                        videoAd.offClose();
                        wx.reportEvent("cancel_ad");
                        // console.log('播放未完成');
                        return reject({adFailed: true});
                    }
                })
            }

            // 用户触发广告后，显示激励视频广告
            if (videoAd) {
                videoAd.show().catch(() => {
                    // 失败重试
                    videoAd.load()
                        .then(() => videoAd.show())
                        .catch(err => {
                            uni.showToast({
                                icon: 'error',
                                title: `激励视频加载失败`
                            });
                            return reject({adFailed: true});
                        })
                })
            }
        })
        // #endif

        // #ifdef APP-PLUS
        return new Promise((resolve, reject) => {
            AD.show({
                adpid: adId,
                adType: "RewardedVideo"
            }, res => {
                console.error(`error： ${res.code}, msg: ${res.errMsg}`, res)
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    return resolve(res);
                } else {
                    return reject(res);
                }
            }, err => {
                console.error('error', err)
                uni.showToast({
                    icon: "error",
                    title: '加载失败请重试'
                })
                return reject(err);
            })
        })
        // #endif
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
     * 获取今天日期
     * @retrun {string} 日期
     */
    getToday() {
        return this.dateFormat(new Date(), 'YYYYMMDD');
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
     * 获取自定义配置
     * @param {string} key key
     * @retrun {string|number} 自定义配置
     */
    getCustomConfigByKey(key) {
        let today = this.getToday();
        let value = uni.getStorageSync(`${key}_${today}`);

        if (value === 0) {
            return 0;
        } else {
            return value || 0;
        }
    },

    /**
     * 设置自定义配置
     * @param {string} key key
     * @param {string} value value
     */
    setCustomConfigByKey(key, value) {
        let todayKey = `${key}_${this.getToday()}`;
        uni.setStorageSync(`${todayKey}`, value);
        // app.globalData.customConfig[key] = value;
    },

    /**
     * 增加统计次数
     * @param {string} key key
     * @retrun {string|number} 统计次数
     */
    increaseByKey(key) {
        let count = this.getCustomConfigByKey(key);
        this.setCustomConfigByKey(key, ++count);
        return count;
    },

    /**
     * 播放声音
     * @param {string} src 声音文件地址
     * @param {Boolean} loop 是否循环
     */
    playSound(src, loop = false) {
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.loop = loop;
        innerAudioContext.src = src;
        innerAudioContext.onPlay(() => {});
        innerAudioContext.onError((res) => {});
    },

    /**
     * 生成订单ID
     * @param {string} prefix 订单前缀
     * @param {string} 订单ID
     */
    createOrderId(prefix = 'WX') {
        return `${prefix}${this.randomString(10).toUpperCase()}${+new Date()}`;
    },

    /**
     * 下载图片
     * @param {string} url 图片地址
     */
    download(url) {
        uni.showLoading({
            title: '正在保存图片...'
        });

        const saveImg = () => {
            uni.getImageInfo({
                src: url,
                success(image) {
                    uni.saveImageToPhotosAlbum({
                        filePath: image.path,
                        success(e) {
                            return uni.showToast({
                                title: "保存成功！",
                            });
                        },
                        complete: (res) => {
                            uni.hideLoading();
                        },
                    });
                }
            });
        }

        let album = 'scope.writePhotosAlbum';
        // #ifdef MP-TOUTIAO
        album = 'scope.album';
        // #endif

        uni.getSetting({
            success: res => {
                // 如果没有相册权限
                if (res.authSetting[album]) {
                    saveImg();
                } else {
                    //向用户发起授权请求
                    uni.authorize({
                        scope: album,
                        success: () => {
                            // 授权成功保存图片到系统相册
                            saveImg();
                        },
                        //授权失败
                        fail: () => {
                            uni.showModal({
                                title: "您已拒绝获取相册权限",
                                content: "是否进入权限管理，调整授权？",
                                success: res => {
                                    if (res.confirm) {
                                        // 调起客户端小程序设置界面，返回用户设置的操作结果。（重新让用户授权）
                                        uni.openSetting();
                                    } else if (res.cancel) {
                                        return uni.showToast({
                                            title: "已取消！",
                                        });
                                    }
                                },
                            });
                        },
                    });
                }
            },
            complete() {
                uni.hideLoading();
            }
        });
    },

    /**
     * 页面调整
     * @param {Object} page 订单前缀
     * @param {Function} cb 回调地址
     */
    jumpPage(page, cb) {
        let query;
        let url = `/pages/${page.url}`;

        if (page.query) {
            query = utils.toQueryString(page.query);
            url += `?${query}`;
        }

        switch (page.target) {
            case 'redirectTo':
                uni.redirectTo({
                    url, complete() {cb && cb()}
                });
                break;
            case 'reLaunch':
                uni.reLaunch({
                    url, complete() {cb && cb()}
                });
                break;
            case 'switchTab':
                uni.switchTab({
                    url, complete() {cb && cb()}
                });
                break;
            default:
                uni.navigateTo({
                    url, complete() {cb && cb()}
                });
                break;
        }
    },

    // 返回上一页
    /**
     * 返回上一页
     * @param {Function} cb 回调地址
     */
    back(cb) {
        uni.navigateBack({
            delta: 1,
            success(){
                if (cb) {
                    cb();
                }
            },
            fail() {
                uni.redirectTo({
                    url:'/pages/index/index',
                    fail() {
                        uni.switchTab({
                            url:'/pages/index/index'
                        })
                    }
                })
            }
        })
    },

    //
    /**
     * 图片转base64
     * @param {string} src 图片地址
     * @param {strubng} base64
     */
    imageToBase64(src) {
        return new Promise((resolve, reject) => {
            uni.getImageInfo({
                src,
                success: image => {
                    console.log(image);
                    uni.getFileSystemManager().readFile({
                        filePath: image.path,
                        encoding: 'base64',
                        success: e => {
                            return resolve(`data:image/jpeg;base64,${e.data}`);
                        },
                        fail: e => {
                            return reject(null);
                        }
                    })
                }
            });
        })
    }
}
