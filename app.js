//app.js
var constant = require('utils/constant.js');
var socket = require('utils/socket.js');

// 开发配置
let local = false;

var util = require('utils/util.js');
var basePath = local ? 'http://m.ddera.com/dcxt/' : 'https://m.ddera.com/';
var initSuccess = false;
var appVersion = '1.0.0';
var webSocketUrl = (local ? 'ws://m.ddera.com/dcxt/' : 'wss://m.ddera.com/') + 'json/webSocket.json';

App({
    data: {
    },
    /** 
    * 生命周期函数--监听小程序初始化
    */
    onLaunch: function (options) {
        var that = this;
        that.showLoading();
        // if (options.query.appid == undefined) {
        //     // wx.showModal({
        //     //   title: '提示',
        //     //   content: '页面跳转错误，请勿进行操作！',
        //     //   showCancel: false,
        //     //   confi   rmText: "知道了",
        //     //   confirmColor: "#ffbe00",
        //     // })
        //     // TODO 如果没有接收到appid参数提示错误  测试先绑定一个
        //     options.query.appid = 'wx3326999f88e7077a';
        // }


        // this.globalData.shopid = options.query.shopid
        // if (that.globalData.shopid == undefined){
        //     that.globalData.shopid = wx.getStorageSync('shopid');
        // }else{
        //     wx.setStorageSync("shopid", this.globalData.shopid);
        // }

        // // that.globalData.shopid = wx.getStorageSync("shopid");
        // //  that.globalData.shopid = 'f11099f4816f4a6c99e511c4a7aa82d0'
        // // that.globalData.shopid = '6e7c30e587904c24915c561836b3092e'
        
        // if (that.globalData.shopid == undefined){
        //     return;
        // }

        // this.globalData.shopid = '6e7c30e587904c24915c561836b3092e';
        // this.globalData.shopid = 'f11099f4816f4a6c99e511c4a7aa82d0';
        // this.globalData.shopid = 'f11099f4816f4a6c99e511c4a7aa82d0';
        that.globalData.appid = 'wx76adf64995670e71';
        // that.wxLogin();
        wx.setStorageSync("Address", "not");

        let userInfo = that.getLocalUserInfo();
       
        if (userInfo) {
            that.getSetting();
            socket.getSocket(userInfo["openid"], userInfo["unionId"], webSocketUrl, wx.getStorageInfoSync('shopid'));
        } else {
            that.wxLogin();
        }

        //socket给我传什么东西,,传过来商铺id，商铺设置，看看本地的对不对，不对，先修改，再直接刷新

    },
    
    onShow: function () {
        var that = this;
    },
    onHide: function () {

    },
    // 获取本地存储的用户信息 (openid, unionId, shopId)
    getLocalUserInfo: function () {
        let that = this;
        let openid = wx.getStorageSync('openid');
        let unionId = wx.getStorageSync('unionId');
        let shopId = wx.getStorageSync('shopId');

        if (openid && unionId && shopId) {
            that.globalData.openid = openid;
            that.globalData.shopid = shopId
            return {
                "openid": openid,
                "unionId": unionId,
                "shopId": shopId
            }
        }

        return null;
    },
    // 获取本地设置
    getLocalSetting: function () {
        let that = this;
        let setting = wx.getStorageSync('setting');
        if (!setting || setting === {}) {
            return null;
        }

        return setting;
    },
    globalData: {
        userInfo: null,
        appid: null,
        shopid: null,
        basePath: basePath,
        webSocketUrl,
        loginUrl: basePath + 'json/toSmallProgram.json',
        tabBar: constant.get.tabBar,

        appSetting: {

        }
    },
    /**
     * 登录
     */
    wxLogin: function () {
        
        var that = this;
        wx.login({
            success: function (res) {
                that.getUserAuth(res.code);
                // that.pushSession();
                //开始获取自己的店铺
                // that.getShopId();
            },
            fail: function (res) {
                if (wx.hideLoading) {
                    wx.hideLoading();
                }
                wx.showModal({
                    title: '提示',
                    content: '登陆失败',
                    showCancel: false,
                    confirmText: "知道了",
                    confirmColor: "#ffbe00",
                })
                console.info(res)
            }
        })
    },
   

    //shopid,userid放入session
    pushSession: function () {
        var that = this;
        wx.request({
            url: this.globalData.basePath + "json/Shop_pushSession_pushOpenIDAndShopIDSession.json",
            method: "post",
            data: {
                openId: wx.getStorageSync('openid'),
                shopId: this.globalData.shopid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success: function (res) {
                //连接websocket
                // that.connectWebsocket();
                socket.getSocket(userInfo["openid"], userInfo["unionId"], webSocketUrl, wx.getStorageInfoSync('shopid'));
            },
            fail: function (error) {
                wx.showToast({
                    title: 'pushSession失败',
                })
            }
        })
    },
    /**
       * 调用后台接口，传递code参数
       */
    sendAppCodeFunction: function (code) {
        var that = this;
        wx.request({
            url: this.globalData.loginUrl,
            method: "post",
            data: {
                code: code,
                appid: that.globalData.appid,
                vision: appVersion
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success: function (res) {
                wx.hideLoading()
                if (res.data.code != '0000') {
                    // 提示登录失败
                    that.hintBox(res.data.data, 'none')
                    return;
                }
                wx.setStorageSync("openid", res.data.data.OPENID);
                wx.setStorageSync("unionId", res.data.data.USER_UNIONID);
                wx.setStorageSync("shopId", res.data.data.FK_SHOP);
                //连接websocket
                // that.connectWebsocket();
                socket.getSocket(res.data.data.OPENID, res.data.data.USER_UNIONID, webSocketUrl, res.data.data.FK_SHOP);


                that.globalData.shopid = res.data.data.FK_SHOP;
                wx.setStorageSync("shopid", that.globalData.shopid);
                //获取全局设置
                that.getSetting();

                //获取商铺ID
                // that.getShopId();
                //授权成功

                
            },
            fail: function (error) {
                wx.showToast({
                    title: '登录失败',
                })
            }
        })
    },
    /**
     * 弹框提示授权用户信息
     */
    getUserInfo: function (cb) {
        var that = this;
        
        if (wx.authorize) {
            wx.authorize({
                scope: 'scope.userInfo',
                success: function (res) {
                    debugger
                    if (wx.showLoading) {
                        wx.showLoading({
                            title: '加载中',
                            mask: true,
                        })
                    }
                    that.getUserAuth(cd);
                },
                fail: function (res) {
                    if (wx.openSetting) {
                        wx.openSetting({
                            success: function () {
                                wx.authorize({
                                    scope: 'scope.userInfo',
                                    success: function () {
                                        if (wx.showLoading) {
                                            wx.showLoading({
                                                title: '加载中',
                                                mask: true,
                                            })
                                        }
                                        that.getUserAuth(cd);
                                    }
                                })
                            }
                        })
                    }
                    else {
                        that.getPhoneSysInfo();
                    }
                }
            })
        }
        else {
            that.getPhoneSysInfo();
        }
    },
    //获取用户所在商铺ID
    getShopId:function(){
        var that = this;
        // this.globalData.shopid = options.query.shopid
        // if (that.globalData.shopid == undefined || that.globalData.shopid == "") {
            //获取店铺ID
            that.sendRequest({
                url:'getGZHShopIdByXCX',
                data:{
                    openid: wx.getStorageSync('openid'),
                    unionid: wx.getStorageSync('unionId')
                },
                success: function (res) {
                    if(res.data.code == '0000'){
                        that.globalData.shopid = res.data.data;
                        wx.setStorageSync("shopid", that.globalData.shopid);
                        //获取全局设置
                        that.getSetting();
                    }else{
                        that.globalData.shopid = wx.getStorageSync('shopid');
                        if (that.globalData.shopid == undefined || that.globalData.shopid == ""){
                            that.hintBox(res.data.data, 'none')
                        }else{
                            that.getSetting();
                        }
                       
                    }
                }
            })
        // }

        // that.globalData.shopid = wx.getStorageSync("shopid");
        //  that.globalData.shopid = 'f11099f4816f4a6c99e511c4a7aa82d0'
        // that.globalData.shopid = '6e7c30e587904c24915c561836b3092e'

        // if (that.globalData.shopid != undefined) {
            //获取全局设置
            // that.getAppSetting();
        // }
    },
    /**
       * 得到授权获取用户信息
       * params : code-临时code, appid-对应appid
       */
    getUserAuth: function (cd) {
        var that = this;
        that.sendAppCodeFunction(cd);
    },

    /**
     * 获取设备信息 
     */
    getSystemInfo: function () {
        var that = this;
        var contentWidth = "";
        var contentHeight = "";
        var modelName = "";
        var onerpx = "";
        wx.getSystemInfo({
            success: function (res) {
                modelName = res.model;
                contentHeight = res.windowHeight;
                contentWidth = res.windowWidth;
                onerpx = res.screenWidth / 750;
            },
        })
        var appObj = { mob_width: contentWidth, mob_height: contentHeight, mob_name: modelName, mob_onerpx: onerpx };
        return appObj;
    },

    /**
      * 获取系统信息
      @wx_version:微信版本号
      @iPhone_vs:手机版本
      */
    getPhoneSysInfo: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                var v1 = res.version.split(".");
                var v2 = v1[0] + v1[1] + v1[2];
                var spsys = res.system.split(' ');
                if (spsys[0] === 'Android') {
                    //安卓版本下于6.5.8，提示不支持
                    if (v1[0] <= 6 && v1[1] <= 5 && v1[2] <= 8) {
                        that.data.wx_version = v2;
                        that.data.iPhone_vs = spsys[0];
                        that.data.str_version = res.version;
                        that.userAuthorizeJianRong();
                    }
                }
                else {
                    //ios版本小于 6.5.10，提示不支持
                    if (v1[0] <= 6 && v1[1] <= 5 && v1[2] <= 10) {
                        that.data.wx_version = v2;
                        that.data.iPhone_vs = spsys[0];
                        that.data.str_version = res.version;
                        that.userAuthorizeJianRong();
                    }
                }
            },
        })
    },

    /**
       * 用户授权兼容性 处理方法
       * @str_version:微信版本号
       */
    userAuthorizeJianRong: function () {
        wx.showModal({
            title: '提示',
            showCancel: false,
            confirmText: "知道了",
            confirmColor: "#555",
            content: '您当前的微信版本(' + this.data.str_version + ')过低，可能会出现不兼容问题，请升级到最新版本微信，谢谢。'
        })
    },


    /**
     * 全局模态框 提示方法
     * @titles:模态框标题
     * @tiptext:模态框提示内容
     */
    GBshowModalTip: function (titles, showCancel, tiptext, successFun) {
        wx.showModal({
            title: titles,
            showCancel: showCancel,
            confirmText: '确定',
            confirmColor: "#555",
            success: successFun
        })
    },

    /**
     * 全局提示 showToast
     * @title:提示内容
     * @icon:提示框icon
     */
    showToast: function (title, img, time) {
        wx.showToast({
            image: img,
            title: title,
            duration: time
        })
    },
    hintBox: function (title, type) {
        wx.showToast({
            title: title,
            icon: type
        })
    },

    /**
     * 全局加载提示 showToast
     * @title:提示内容
     */
    showLoading: function (title) {
        if (wx.showLoading) {
            wx.showLoading({
                title: title == undefined ? '正在加载' : title,
                mask: true,
            })
        }
    },

    /**
     * 隐藏加载提示
     */
    hideLoading: function () {
        if (wx.hideLoading) {
            wx.hideLoading();
        }
    },

    /**
     *  选择本地图片，添加头像 
     */
    chooseImage: function (res) {
        var that = this;
        if (wx.chooseImage) {
            wx.chooseImage({
                success: function (res) {
                    var tempFiles = res.tempFiles;
                    if (!tempFiles) {
                        app.getPhoneSysInfo();
                    }
                    else {
                        //单张图片 1M以内  （1M=1024KB  1Kb=1024B）
                        var sizeRule = 1024 * 1024;
                        var imgSize = tempFiles[0].size;
                        if (imgSize > sizeRule) {
                            wx.showModal({
                                title: '提示',
                                content: '请添加1M以内的图片',
                                showCancel: false,
                                confirmText: "知道了",
                                confirmColor: "#ffbe00",
                            })
                        }
                        else {
                            that.setData({
                                userimg: tempFiles[0].path
                            })
                        }
                    }
                },
                fail: function () {

                }
            })
        }
        else {
            app.getPhoneSysInfo();
        }
    },
    // 页面跳转
    pageTurns: function (url) {
        // wx.switchTab({
        //    url: url,
        // })
        wx.navigateTo({
            url: url,
        })
    },
    /**
     * 动画
     */
    animtaed: function (px) {
        var that = this;
        var animation = wx.createAnimation({
            duration: 800,
            timingFunction: 'ease',
        });
        this.animation = animation;
        animation.bottom(px).step();
        setTimeout(function () {
            that.data.animtedata = animation.export();
        }, 10)
    },
    /**
     * 更换title
     */
    updateTitle: function (title) {
        wx.setNavigationBarTitle({
            title: title
        })
    },
    /**
     * 封装request
     */
    sendRequest: function (data) {
        wx.request({
            url: this.globalData.basePath + 'json/' + data.url + '.json',
            method: data.method == undefined ? 'POST' : data.method,
            data: data.data,
            header: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success: function (res) {
                if (data.success != undefined) {
                    data.success(res)
                }
            },
            fail: function (error) {
                if (data.fail != undefined) {
                    data.fail(error)
                } else {
                    that.hintBox('网络错误，请检查网络设置')
                }
            }
        })
    },
    /**
     * 弹框提示
     */
    toast: function (message) {
        wx.showToast({
            title: message,
        })
    },
    /**
     * 模态对话框
     * title:提示的标题
     * content：提示的内容
     * showCancel：是否显示取消按钮，默认为显示
     * cancelText：取消按钮的文字：最多四个字，默认为取消
     * confirmText：确认按钮的文字，最多四个字吗，默认为确认
     * confirmColor：确认按钮的颜色，默认为#EF9BA0
     */
    modal: function (message) {
        wx.showModal({
            title: message.title == undefined ? '提示' : message.title,
            content: message.content,
            showCancel: message.showCancel == undefined ? true : message.showCancel,
            cancelText: message.cancelText == undefined ? '取消' : message.cancelText,
            confirmText: message.confirmText == undefined ? '确定' : message.confirmText,
            confirmColor: message.confirmColor == undefined ? "#EF9BA0" : message.confirmColor,
            success(res) {
                if (message.success != undefined) {
                    message.success(res)
                }
            },
            fail(res) {
                if (message.fail != undefined) {
                    message.fail(res)
                }
            },
            complete(res) {
                if (message.complete != undefined) {
                    message.complete(res)
                }
            }
        })
    },
    setStorage: function (key, data) {
        wx.setStorage({
            key: key,
            data: data
        })
    },

    reLaunch: function (url) {
        wx.reLaunch({
            url: url
        })
    },
    redirectTo: function (url) {
        wx.redirectTo({
            url: url
        })
    },
    /**
     * 获取小程序设置
     */
    getServerSetting: function (shopId) {
        var that = this
        //   var appSetting = wx.getStorageSync('appSetting'+that.globalData.shopid);
        //   if (appSetting != undefined && appSetting != ""){
        //       initSuccess = true;
        //       that.globalData.appSetting = appSetting
        //       that.showIndexPage()
        //     //   that.reLaunch('../index/index')
        //   }
        that.sendRequest({
            url: 'FunctionSwitch_select_XCXloadFuncSwitchList',
            data: {
                FK_SHOP: shopId
            },
            success: function (res) {
                if (res.data.code == '0000') {
                    let setting = wx.getStorageSync('setting');
                    if (JSON.stringify(setting) != JSON.stringify(res.data.data)) {
                        wx.setStorageSync("setting", res.data.data)
                        that.globalData.appSetting = res.data.data
                        if (that.globalData.appSetting.CHECK_DYSYT == 'false') {
                            that.globalData.tabBar.list[4].show = false;
                        }
                       
                        if (that.globalData.appSetting.CHECK_WMDC == 'false') {
                            that.globalData.tabBar.list[3].show = false;
                        }
                        that.showIndexPage()
                        initSuccess = true;
                    }
                } else {
                    that.hintBox(res.data.data, 'none');
                }
            }
        })
        that.hideLoading();
    },
    /**
     * 
     */
    getSetting: function() {
        var that = this;
        let setting = wx.getStorageSync('setting');
        if (setting) {
            that.globalData.appSetting = setting;     
            that.showIndexPage();
            that.hideLoading();
        } else {
            let shopId = wx.getStorageSync('shopId');
            that.getServerSetting(shopId);
        }
    },
    /**
     * 刷新其他页面参数
     */
    flushOtherPage: function (params) {
        var pages = getCurrentPages()
        for (var key in params) {
            for (var i = 2; i <= pages.length; i++) {
                var currentPage = pages[pages.length - i]
                if (currentPage.route == 'pages/index/index') {
                    currentPage.flushComponentData(currentPage.__data__.currentPage, params)
                } else {
                    currentPage.setData(params)
                }
            }
        }
    },

    /**
     * 清空购物车
     */
    // clearCart:function(message){
    //   var that = this;
    //   this.sendRequest({
    //     url: 'ShoppingCart_update_removeAllCart',
    //     data: {
    //       shopid: that.globalData.shopid,
    //       openid: wx.getStorageSync('openid')
    //     },
    //     success: function (res) {
    //       if (message != undefined && message.success != undefined){
    //         message.success(res)
    //       }
    //     },
    //     fail: function (error) {
    //       if (message != undefined &&message.fail != undefined) {
    //         message.fail(error)
    //       }else{
    //         that.hintBox('系统错误')
    //       }
    //     }
    //   })
    // },
    /**
     * 添加商品到购物车（本地版）
     */
    addShoppingCart: function (good) {  
        var that = this
        //从购物车获取数据
        var shoppingCart = wx.getStorageSync('shopping_cart')
        var shopShoppingCart = shoppingCart[that.globalData.shopid];
        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            // shopShoppingCart[shopShoppingCart.currentTableId] = {}
            var tableShoppingCart = shopShoppingCart[shopShoppingCart.currentTableId];
            if (tableShoppingCart) {
                var isSameGoods = false;
                var currentTableShoppingCart = tableShoppingCart.goods
                currentTableShoppingCart.forEach(function (cart, index) {
                    if (cart.GOODS_PK == good.GOODS_PK && cart.GOODS_FORMAT == good.GOODS_FORMAT &&
                        cart.GOODS_MAKING == good.GOODS_MAKING && cart.GOODS_TASTE == good.GOODS_TASTE) {
                        //判断为同一商品
                        if (good.GOODS_TRUE_PRICE != undefined && good.GOODS_TRUE_PRICE != '') {
                            tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) + Number(good.GOODS_TRUE_PRICE)
                        } else {
                            tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) + Number(good.GOODS_PRICE)
                        }
                        tableShoppingCart.totalNumber += 1
                        cart.GOODS_NUMBER++;
                        isSameGoods = true
                        wx.setStorageSync('shopping_cart', shoppingCart)
                    }
                })

                if (!isSameGoods) {
                    //不是相同的商品
                    if (good.GOODS_TRUE_PRICE != undefined && good.GOODS_TRUE_PRICE != '') {
                        tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) + Number(good.GOODS_TRUE_PRICE)
                    } else {
                        tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) + Number(good.GOODS_PRICE)
                    }
                    tableShoppingCart.totalNumber += 1
                    tableShoppingCart.goods.push({
                        GOODS_PK: good.GOODS_PK,//商品主键
                        GOODS_NAME: good.GOODS_NAME,//商品名字
                        GOODS_NUMBER: 1,//商品的数量
                        GOODS_PRICE: good.GOODS_PRICE,//商品单价
                        // GOODS_TRUE_PRICE: good.GOODS_TRUE_PRICE,//商品特价，为空则不为特价商品
                        GOODS_FORMAT: good.GOODS_FORMAT,//规格
                        GOODS_MAKING: good.GOODS_MAKING,//做法
                        GOODS_TASTE: good.GOODS_TASTE,//口味
                        GOODS_DW: good.GOODS_DW,
                        GOODS_TYPE: good.GOODS_TYPE,
                        GTYPE_NAME: good.GTYPE_NAME,
                        GTYPE_FK: good.GTYPE_FK,
                        GOODS_PRINT_LABEL: good.GOODS_PRINT_LABEL
                    })
                    wx.setStorageSync('shopping_cart', shoppingCart)
                }
            } else {
                // console.info("没有购物车")
                // var shoppingCart = {}
                // shoppingCart[that.globalData.shopid] = {}
                // //每个商铺的桌位对应一个购物车

                // shoppingCart[that.globalData.shopid][t] = tableShoppingCart
                // var tableShoppingCart = {
                //   totalMoney: good.GOODS_TRUE_PRICE == undefined || good.GOODS_TRUE_PRICE == '' ? good.GOODS_PRICE : good.GOODS_TRUE_PRICE,
                //   totalNumber: 1,
                //   goods: [
                //     {
                //       GOODS_PK: good.GOODS_PK,//商品主键
                //       GOODS_NAME: good.GOODS_NAME,//商品名字
                //       GOODS_NUMBER: 1,//商品的数量
                //       GOODS_PRICE: good.GOODS_PRICE,//商品单价
                //       // GOODS_TRUE_PRICE: good.GOODS_TRUE_PRICE,//商品特价，为空则不为特价商品
                //       GOODS_FORMAT: good.GOODS_FORMAT,//规格
                //       GOODS_MAKING: good.GOODS_MAKING,//做法
                //       GOODS_TASTE: good.GOODS_TASTE,//口味
                //       GOODS_DW: good.GOODS_DW,
                //       GOODS_TYPE: good.GOODS_TYPE,
                //       GTYPE_NAME: good.GTYPE_NAME,
                //       GTYPE_FK: good.GTYPE_FK
                //     }
                //   ]
                // }

                // if (table != undefined) {
                //   tableShoppingCart.table = table
                // }

                // wx.setStorageSync('shopping_cart', shoppingCart)

                //购物车数据结构
                // shopping_cart:{
                //   shopid:{
                //     totalMoney:'800',
                //     totalNumber:'10',
                //     goods:[
                //       {
                //         GOODS_PK: GOODS_PK,//商品主键
                //         GOODS_NAME: GOODS_NAME,//商品名字
                //         GOODS_NUMBER: GOODS_NUMBER,//商品的数量
                //         GOODS_PRICE: GOODS_PRICE,//商品单价
                //         GOODS_TRUE_PRICE: GOODS_TRUE_PRICE,//商品特价，为空则不为特价商品
                //         GOODS_FORMAT: GOODS_FORMAT,//规格
                //         GOODS_MAKING: GOODS_MAKING,//做法
                //         GOODS_TASTE: GOODS_TASTE,//口味
                //         GOODS_DW: GOODS_DW
                //       },
                //       {

                //       },
                //       {

                //       }
                //     ]

                //   }
                // }
            }
        } else {
            if (shopShoppingCart != undefined && shopShoppingCart.totalNumber != undefined) {
                var isSameGoods = false;
                var currentShopShoppingCart = shopShoppingCart.goods
                currentShopShoppingCart.forEach(function (cart, index) {
                    if (cart.GOODS_PK == good.GOODS_PK && cart.GOODS_FORMAT == good.GOODS_FORMAT &&
                        cart.GOODS_MAKING == good.GOODS_MAKING && cart.GOODS_TASTE == good.GOODS_TASTE) {
                        //判断为同一商品
                        if (good.GOODS_TRUE_PRICE != undefined && good.GOODS_TRUE_PRICE != '') {
                            shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) + Number(good.GOODS_TRUE_PRICE)
                        } else {
                            shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) + Number(good.GOODS_PRICE)
                        }
                        shopShoppingCart.totalNumber += 1
                        cart.GOODS_NUMBER++;
                        isSameGoods = true
                        wx.setStorageSync('shopping_cart', shoppingCart)
                    }
                })

                if (!isSameGoods) {
                    //不是相同的商品
                    if (good.GOODS_TRUE_PRICE != undefined && good.GOODS_TRUE_PRICE != '') {
                        shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) + Number(good.GOODS_TRUE_PRICE)
                    } else {
                        shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) + Number(good.GOODS_PRICE)
                    }
                    shopShoppingCart.totalNumber += 1
                    currentShopShoppingCart.push({
                        GOODS_PK: good.GOODS_PK,//商品主键
                        GOODS_NAME: good.GOODS_NAME,//商品名字
                        GOODS_NUMBER: 1,//商品的数量
                        GOODS_PRICE: good.GOODS_PRICE,//商品单价
                        // GOODS_TRUE_PRICE: good.GOODS_TRUE_PRICE,//商品特价，为空则不为特价商品
                        GOODS_FORMAT: good.GOODS_FORMAT,//规格
                        GOODS_MAKING: good.GOODS_MAKING,//做法
                        GOODS_TASTE: good.GOODS_TASTE,//口味
                        GOODS_DW: good.GOODS_DW,
                        GOODS_TYPE: good.GOODS_TYPE,
                        GTYPE_NAME: good.GTYPE_NAME,
                        GTYPE_FK: good.GTYPE_FK,
                        GOODS_PRINT_LABEL: good.GOODS_PRINT_LABEL
                    })
                    wx.setStorageSync('shopping_cart', shoppingCart)
                }
            } else {
                var currentShopShoppingCart = {}
                currentShopShoppingCart[that.globalData.shopid] = {
                    totalMoney: good.GOODS_TRUE_PRICE == undefined || good.GOODS_TRUE_PRICE == '' ? good.GOODS_PRICE : good.GOODS_TRUE_PRICE,
                    totalNumber: 1,
                    goods: [
                        {
                            GOODS_PK: good.GOODS_PK,//商品主键
                            GOODS_NAME: good.GOODS_NAME,//商品名字
                            GOODS_NUMBER: 1,//商品的数量
                            GOODS_PRICE: good.GOODS_PRICE,//商品单价
                            // GOODS_TRUE_PRICE: good.GOODS_TRUE_PRICE,//商品特价，为空则不为特价商品
                            GOODS_FORMAT: good.GOODS_FORMAT,//规格
                            GOODS_MAKING: good.GOODS_MAKING,//做法
                            GOODS_TASTE: good.GOODS_TASTE,//口味
                            GOODS_DW: good.GOODS_DW,
                            GOODS_TYPE: good.GOODS_TYPE,
                            GTYPE_NAME: good.GTYPE_NAME,
                            GTYPE_FK: good.GTYPE_FK,
                            GOODS_PRINT_LABEL: good.GOODS_PRINT_LABEL
                        }
                    ]
                }
                wx.setStorageSync('shopping_cart', currentShopShoppingCart)
            }
        }

    },
    /**
    * 从购物车减少商品数量（本地版）
    */
    subShoppingCart: function (good) {
        var that = this;
        //从购物车获取数据
        var shoppingCart = wx.getStorageSync('shopping_cart')
        if (shoppingCart == undefined) return
        var shopShoppingCart = shoppingCart[that.globalData.shopid];
        if (shopShoppingCart == undefined) return


        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            var tableShoppingCart = shopShoppingCart[shopShoppingCart.currentTableId];
            if (tableShoppingCart == undefined) return
            //先判断允许减少商品的数量吗
            if (tableShoppingCart.totalNumber < 1) {
                return;
            }

            var goods = tableShoppingCart.goods;

            goods.forEach(function (cart, index) {

                //判断是同一件商品吗
                if (cart.GOODS_PK == good.GOODS_PK && cart.GOODS_FORMAT == good.GOODS_FORMAT &&
                    cart.GOODS_MAKING == good.GOODS_MAKING && cart.GOODS_TASTE == good.GOODS_TASTE) {

                    if (cart.GOODS_TRUE_PRICE != undefined && cart.GOODS_TRUE_PRICE != '') {
                        tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) - Number(cart.GOODS_TRUE_PRICE)
                    } else {
                        tableShoppingCart.totalMoney = Number(tableShoppingCart.totalMoney) - Number(cart.GOODS_PRICE)
                    }
                    tableShoppingCart.totalNumber = Number(tableShoppingCart.totalNumber) - 1

                    if (cart.GOODS_NUMBER > 1) {
                        cart.GOODS_NUMBER--;
                    } else {
                        goods.splice(index, 1)
                    }

                    wx.setStorageSync('shopping_cart', shoppingCart)
                }
            })
            return tableShoppingCart
        } else {
            //先判断允许减少商品的数量吗
            if (shoppingCart == undefined || shoppingCart[that.globalData.shopid] == undefined || shoppingCart[that.globalData.shopid].totalNumber < 1) {
                return;
            }

            var goods = shopShoppingCart.goods;

            goods.forEach(function (cart, index) {

                //判断是同一件商品吗
                if (cart.GOODS_PK == good.GOODS_PK && cart.GOODS_FORMAT == good.GOODS_FORMAT &&
                    cart.GOODS_MAKING == good.GOODS_MAKING && cart.GOODS_TASTE == good.GOODS_TASTE) {

                    if (cart.GOODS_TRUE_PRICE != undefined && cart.GOODS_TRUE_PRICE != '') {
                        shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) - Number(cart.GOODS_TRUE_PRICE)
                    } else {
                        shopShoppingCart.totalMoney = Number(shopShoppingCart.totalMoney) - Number(cart.GOODS_PRICE)
                    }
                    shopShoppingCart.totalNumber = Number(shopShoppingCart.totalNumber) - 1

                    if (cart.GOODS_NUMBER > 1) {
                        cart.GOODS_NUMBER--;
                    } else {
                        goods.splice(index, 1)
                    }

                    wx.setStorageSync('shopping_cart', shoppingCart)
                }
            })
            return shopShoppingCart
        }
    },
    /**
     * 删除购物车里边的商品
     */
    removeShoppingCartGoods: function (index) {
        var that = this;
        //从购物车获取数据
        var shoppingCart = wx.getStorageSync('shopping_cart')
        if (shoppingCart == undefined) return
        var shopShoppingCart = shoppingCart[that.globalData.shopid];
        if (shopShoppingCart == undefined) return


        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            var tableShoppingCart = shopShoppingCart[shopShoppingCart.currentTableId];
            if (tableShoppingCart == undefined) return
            //先判断允许减少商品的数量吗

            var goods = tableShoppingCart.goods.splice(index, 1)
            tableShoppingCart.totalNumber -= goods[0].GOODS_NUMBER
            tableShoppingCart.totalMoney -= goods[0].GOODS_NUMBER * goods[0].GOODS_PRICE
            wx.setStorageSync('shopping_cart', shoppingCart)
            return
        } else {
            var goods = shopShoppingCart.goods.splice(index, 1)
            shopShoppingCart.totalNumber -= goods[0].GOODS_NUMBER
            shopShoppingCart.totalMoney -= goods[0].GOODS_NUMBER * goods[0].GOODS_PRICE
            wx.setStorageSync('shopping_cart', shoppingCart)
            return
        }
    },
    /**
     * 根据桌位和人数创建一个空的购物车
     */
    createShoppingCart: function (table, personNum) {
        var that = this
        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            var currentShopShoppingCart = wx.getStorageSync('shopping_cart')
            if (currentShopShoppingCart == undefined || currentShopShoppingCart == '') {
                currentShopShoppingCart = {}
            }
            var shopShoppingCart = currentShopShoppingCart[that.globalData.shopid];
            if (shopShoppingCart == undefined || shopShoppingCart == '') {
                shopShoppingCart = {}
                currentShopShoppingCart[that.globalData.shopid] = shopShoppingCart
            }

            shopShoppingCart.currentTableId = table.TABLES_PK
            if (shopShoppingCart[table.TABLES_PK] == undefined || shopShoppingCart[table.TABLES_PK] == '') {
                var tableShoppingCart = {
                    table: table,
                    personNum: personNum,
                    totalMoney: 0,
                    totalNumber: 0,
                    goods: []
                }
                shopShoppingCart[table.TABLES_PK] = tableShoppingCart
            }
            wx.setStorageSync('shopping_cart', currentShopShoppingCart)
            return tableShoppingCart
        } else {
            var currentShopShoppingCart = {}
            currentShopShoppingCart[this.globalData.shopid] = {
                table: table,
                personNum: personNum,
                totalMoney: 0,
                totalNumber: 0,
                goods: []
            }
            wx.setStorageSync('shopping_cart', currentShopShoppingCart)
            return currentShopShoppingCart[this.globalData.shopid]
        }

    },
    /**
     * 挂单恢复购物车，直接传过来
     */
    recoverShoppingCart: function (shoppingCart) {
        var currentShopShoppingCart = {}
        currentShopShoppingCart[this.globalData.shopid] = shoppingCart;
        wx.setStorageSync('shopping_cart', currentShopShoppingCart)
        return currentShopShoppingCart[this.globalData.shopid]
    },
    /**
     * 清除购物车(只清除商品)
     */
    clearShoppingCart: function () {
        //从购物车获取数据
        var shoppingCart = wx.getStorageSync('shopping_cart')
        var shopShoppingCart = shoppingCart[this.globalData.shopid]

        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            var tableShoppingCart = shopShoppingCart[shoppingCart.currentTableId];
            tableShoppingCart.totalMoney = 0;
            tableShoppingCart.totalNumber = 0;
            tableShoppingCart.goods = [];
        } else {
            shopShoppingCart.totalMoney = 0;
            shopShoppingCart.totalNumber = 0;
            shopShoppingCart.goods = [];
        }

        wx.setStorageSync('shopping_cart', shoppingCart)
    },
    /**
     * 移除购物车(移除购物车)
     */
    removeShoppingCart: function () {
        var that = this
        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            var shoppingCart = wx.getStorageSync('shopping_cart')
            var shopShoppingCart = shoppingCart[that.globalData.shopid]
            var tableShoppingCart = shopShoppingCart[shopShoppingCart.currentTableId];
            delete shopShoppingCart[shopShoppingCart.currentTableId]
            shopShoppingCart.currentTableId = ''
            wx.setStorageSync('shopping_cart', shoppingCart)
        } else {
            wx.removeStorageSync('shopping_cart')
        }

        return {}
    },
    /**
     * 获取购物车
     */
    getShoppingCart: function (table) {
        var that = this
        var shoppingCart = wx.getStorageSync('shopping_cart')

        if (shoppingCart == undefined || shoppingCart == "") {
            return {}
        }
        var shopShoppingCart = shoppingCart[that.globalData.shopid]
        if (shopShoppingCart == undefined) {
            return {}
        }

        if (that.globalData.appSetting.CHECK_TDKT == "true" && table == undefined) {
            if (shopShoppingCart[shopShoppingCart.currentTableId] != undefined) {
                return shopShoppingCart[shopShoppingCart.currentTableId]
            } else {
                return {}
            }
        }

        return shopShoppingCart

    },
    /**
     * 购物车添加当前桌位或者人数信息
     */
    addTableInCart: function (table, personNum) {
        var shoppingCart = wx.getStorageSync('shopping_cart')
        if (shoppingCart == undefined) {
            shoppingCart = {}
        }
        var shopShoppingCart = shoppingCart[this.globalData.shopid]

        if (this.globalData.appSetting.CHECK_TDKT == "true") {
            var currentTableId = table.TABLES_PK
            if (table != undefined && table != '') {
                shopShoppingCart[currentTableId].table = table
            }
            if (personNum != undefined && personNum != '') {
                shopShoppingCart[currentTableId].personNum = personNum
            }
        } else {
            if (table != undefined && table != '') {
                shopShoppingCart.table = table
            }
            if (personNum != undefined && personNum != '') {
                shopShoppingCart.personNum = personNum
            }
        }


        wx.setStorageSync('shopping_cart', shoppingCart)
        return shopShoppingCart;
    },
    /**
     * 获取挂单数据
     */
    getStorageOrder: function () {
        var storageOrder = wx.getStorageSync('storage_order')
        if (storageOrder) {
            var shopStorageOrder = storageOrder[this.globalData.shopid]
            return shopStorageOrder
        }

        return []
    },
    /**
     * 挂单
     */
    setStorageOrder: function (shoppingCart) {
        var storageOrder = wx.getStorageSync('storage_order')
        if (storageOrder == undefined || storageOrder == "") {
            storageOrder = {};
            storageOrder[this.globalData.shopid] = []
        }

        shoppingCart.saveOrderDate = util.nowTime();//添加一个挂单日期
        storageOrder[this.globalData.shopid].unshift(shoppingCart)
        wx.setStorageSync('storage_order', storageOrder)
        wx.removeStorageSync('shopping_cart')
    },
    /**
     * 删除挂单
     */
    removeStorageOrder: function (index) {
        var storageOrder = wx.getStorageSync('storage_order')
        if (storageOrder) {
            var shopStorageOrder = storageOrder[this.globalData.shopid]
            var deleteShoppingCart = shopStorageOrder.splice(index, 1)
        }
        if (shopStorageOrder.length < 1) {
            wx.removeStorageSync('storage_order')
            return deleteShoppingCart[0]
        }
        wx.setStorageSync('storage_order', storageOrder)

        return deleteShoppingCart[0]
    },
    /**
     * 跳转到菜单
     */
    jumpMenu: function (param) {
        var that = this;
        var pages = getCurrentPages()    //获取加载的页面
        var prePage = pages[pages.length - 2];
        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            if (prePage.route == 'pages/menu/menupage') {
                wx.navigateBack({
                    delta: 1
                })
                if (param != undefined) {
                    var map = {}
                    map[param] = true;
                    prePage.setData(map)
                }
            } else {
                that.redirectTo('/pages/menu/menupage?' + param)
            }
        } else {
            if (prePage.route == 'pages/index/index' && prePage.__data__.currentPage == '../menu/menu') {
                if (param != undefined) {
                    var map = {}
                    map[param] = true;
                    prePage.setMenuData(map);
                }
                wx.navigateBack({
                    delta: 1
                })
            } else {
                that.reLaunch('/pages/index/index?page=../menu/menu&' + param)
            }
        }
    },
    //     getFoundingSwitch:function(){
    //         debugger
    //         var that = this;
    //             that.sendRequest({
    //                 url: 'FunctionSwitch_select_XCXloadFuncSwitchList',
    //                 data: {
    //                     FK_SHOP: that.globalData.shopid
    //                 },
    //                 success: function (res) {
    //                     if (res.data.code == '0000') {
    //                         that.globalData.appSetting = res.data.data
    //                         initSuccess = true;
    //                         that.hideLoading();

    //                     } else {
    //                         that.hintBox(res.data.data, 'none');
    //                     }
    //                 }
    //             })


    //         return that.globalData.appSetting.CHECK_TDKT

    //   }
    /**
     * 获取全局配置
     */
    //   getAppSetting(){

    //   }
    showIndexPage: function () {

        var pages = getCurrentPages();
        var currentPage = pages[pages.length - 1]
        if (currentPage == undefined) {
            return
        }
        if (currentPage.route == 'pages/index/index') {
            currentPage.setShow();
        }
    },
    /**
     * 无变化的回到主页，第一个参数，跳到哪，第二个参数，刷新页面吗
     */
    noFlushBackIndexPage: function (flush,param,page){
        var that = this;
        var pages = getCurrentPages()    //获取加载的页面
        var prePage = pages[0];
 
        if(page == undefined){
            if (that.globalData.appSetting.CHECK_TDKT == "true") {
                page = '../founding/founding'
            } else {
                page = '../menu/menu'
            }   
        }
        prePage.switchPage({ detail: { page: page}})
        if (prePage.route == 'pages/index/index') {
            if (flush != undefined) {
                var map = {}
                map[param] = true;
                prePage.flushComponentData(page, map)
            }
        }
        
        wx.navigateBack({
            delta: pages.length - 1
        })
       
    },
    /**
     * 刷新主页数据，不跳转
     */
    flushIndexData:function(){
        var that = this;
        var pages = getCurrentPages()    //获取加载的页面
        var prePage = pages[0];
        var page=''

        if (that.globalData.appSetting.CHECK_TDKT == "true") {
            page = '../founding/founding'
        } else {
            page = '../menu/menu'
        }
        
        prePage.switchPage({ detail: { page: page } })
        if (prePage.route == 'pages/index/index') {
                prePage.flushComponentData(page, {})
        }

    },

   

    /**
     * 判断是否是主页的某个页面
     */
    isIndexWhichPage(page){
        var currentPage = getCurrentPages()[0];
        if (currentPage.route == 'pages/index/index'){
            if (currentPage.data.currentPage == page) {
                return true;
            }
        }
        return false;
    }
})
