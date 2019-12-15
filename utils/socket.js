// websocket连接
var app = getApp()
var constant = require('./constant.js');

var websocket_connected_fail_count = 0;
function connectWebsocket(openid, unionId, webSocketUrl, shopId, appThat) {
    if (appThat) {
        app = appThat;
    }
    var that = this;
    var userMsg = {
        msgType: 0,
        msgContent: {
            openid: wx.getStorageSync('openid'),
            shopid: shopId,
            openid: openid,
            unionId: unionId
        }
    };
    
    var task = wx.connectSocket({
        url: webSocketUrl,
        data: {
            userid: "123455"
        },
        header: {
            'content-type': 'application/json'
        },
        method: "POST"
    })

    // 连接成功建立的回调方法
    wx.onSocketOpen(function (res) {
        heartCheck.reset().start();   // 成功建立连接后，重置心跳检测
        wx.sendSocketMessage({
            data: JSON.stringify(userMsg)
        })
        console.log('WebSocket连接已打开！')
    })

    // 连接发生错误，连接错误时会继续尝试发起连接
    wx.onSocketError(function (res) {
        console.log('WebSocket连接失败，请检查！')
        errorReConn()
    })
  
    // 接受到消息的回调方法
    wx.onSocketMessage(function (res) {
        console.log("接受到消息了")
        heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测

        if (!res.data) {
            return;
        }
        //执行接收到消息的操作
        handleMess(res);
        
    })

    // 接受到服务端关闭连接时的回调方法
    wx.onSocketClose(function (res) {
        console.log('关闭socket')
        playCue("2")
        errorReConn();
    })

    //失败重试
    function errorReConn(){
        setTimeout(function () {
            console.log("连接失败，正在重试");
            connectWebsocket(openid, unionId, webSocketUrl, shopId);
        }, 5000) 
    }

    // 心跳检测, 每隔一段时间检测连接状态，如果处于连接中，就向server端主动发送消息，来重置server端与客户端的最大连接时间，如果已经断开了，发起重连。
    var heartCheck = {
        timeout: 55000,        // 9分钟发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
        serverTimeoutObj: null,
        reset: function () {
            clearInterval(this.serverTimeoutObj);
            return this;
        },
        start: function () {
            var self = this; 
            this.serverTimeoutObj = setInterval(function () {
                console.log("连接状态，发送消息保持连接");
                    wx.sendSocketMessage({
                        data: JSON.stringify({
                            msgType: 9,
                            msgContent: {
                                openid: wx.getStorageSync('openid'),
                                shopid: shopId,
                                openid: openid,
                            }
                        })
                })
                heartCheck.reset().start();  
            }, this.timeout)
        }
    }
}

/**
    * 播放提示音
    */
function playCue (i) {
    const innerAudioContext = wx.createInnerAudioContext();//新建一个createInnerAudioContext();
    innerAudioContext.autoplay = true;//音频自动播放设置
    if (i === "1") {
        innerAudioContext.src = '/media/audio/提示音.wav';//链接到音频的地址
    } else if (i === "2") {
        innerAudioContext.src = '/media/audio/ao.wav';//链接到音频的地址
    } else {
        return;
    }
    innerAudioContext.onPlay(() => { });//播放音效
}

function handleMess(res){
    var page = getCurrentPages()[0];
    var that = this;
    var currentRoute = "";
    if (page != undefined) {
        currentRoute = page.route;
    }

    //处理订单数据更新
    let data = JSON.parse(res.data);
    if (data.code == "101") {
        console.info("语音通知：有新的订单");
        if (currentRoute == "pages/indent/indent") {
            page.loadOrderData();
            page.loadOrderNumber();
        }
    }
    else if (data.code == "202") { // 美团自动接单
        console.log("语音通知：智慧云为你自动接到美团新订单")
        debugger
        if (currentRoute == "pages/takeOut/takeOut") {
            // page.
        }
    }
    else if (data.code == "203") { // 美团自动接单
        console.log("语音通知：你有新的美团订单")

        let flag = app.isIndexWhichPage("../takeOut/takeOut");
        if (flag) {
            console.info("是当前页")
            page.flushComponentData("../takeOut/takeOut", null)
        }

    }
    else if (data.code === constant.get.socketCode.update.setting.code) { //更新了开关设置
        let setting = data.data;
        let localSetting = wx.getStorageSync('setting');
        if (JSON.stringify(setting) !== JSON.stringify(localSetting)) {
            wx.setStorageSync('setting', setting);
            app.globalData.appSetting = setting;
            let update = false;
            // 判断堂点开台更新没
            if (setting.CHECK_TDKT !== localSetting.CHECK_TDKT) {
                if (setting.CHECK_TDKT == 'false') {
                    app.globalData.tabBar.list[0].pagePath = "../menu/menu";
                    app.globalData.tabBar.list[0].text = "菜单";
                } else {
                    app.globalData.tabBar.list[0].pagePath = "../founding/founding";
                    app.globalData.tabBar.list[0].text = "开台";
                }
                update = true;
            }
            if (setting.CHECK_WMDC !== localSetting.CHECK_WMDC) {
                if (localSetting.CHECK_WMDC === "true") {
                    app.globalData.tabBar.list[3].show = false;
                } else {
                    app.globalData.tabBar.list[3].show = true;
                }
                update = true;
            }
            if (setting.CHECK_DYSYT !== localSetting.CHECK_DYSYT) {
                if (localSetting.CHECK_DYSYT === "true") {
                    app.globalData.tabBar.list[4].show = false;
                } else {
                    app.globalData.tabBar.list[4].show = true;
                }
                update = true;
            }
            if (setting.CHECK_TDYTMB !== localSetting.CHECK_TDYTMB ||
                setting.CHECK_WMSP !== localSetting.CHECK_WMSP) {
                update = true;
            }
            if (update) {
                playCue("1")
                app.reLaunch('/pages/index/index?page=' + app.globalData.tabBar.list[0].pagePath);
            }

        }
    } else if (data.code === constant.get.socketCode.shopInfo.code) {
        let localShopId = wx.getStorageSync('shopId');
        let shopId = data.data.shopId;
        let setting = data.data.shopSetting; //TODO 后台别忘了加
        let localSetting = wx.getStorageSync('setting');

        if (localShopId !== shopId) {
            console.info(data)
            wx.setStorageSync('shopId', shopId);
            wx.setStorageSync('setting', setting);
            app.globalData.shopId = shopId;
            app.globalData.shopid = shopId;
            app.globalData.appSetting = setting;

            if (!setting) {
                app.hintBox('请在公众号设置功能开关', 'none')
                return;
            }
            if (setting.CHECK_TDKT !== localSetting.CHECK_TDKT) {
                if (setting.CHECK_TDKT == 'false') {
                    app.globalData.tabBar.list[0].pagePath = "../menu/menu";
                    app.globalData.tabBar.list[0].text = "菜单";
                } else {
                    app.globalData.tabBar.list[0].pagePath = "../founding/founding";
                    app.globalData.tabBar.list[0].text = "开台";
                }
                app.reLaunch('/pages/index/index?page=' + app.globalData.tabBar.list[0].pagePath);
            }
        }
    } else {
        app.hintBox(data && data.data && data.data.data, 'none')
        console.info(data && data.data && data.data.data)
        console.info(data)
    }
}

//转化成小程序模板语言 这一步非常重要 不然无法正确调用
module.exports = {
    getSocket: connectWebsocket
}