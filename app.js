//app.js

App({
  data: {   
  },
  /**
  * 生命周期函数--监听小程序初始化
  */
  onLaunch: function (options) {
    var that = this;
    if (options.query.appid == undefined) {
      // wx.showModal({
      //   title: '提示',
      //   content: '页面跳转错误，请勿进行操作！',
      //   showCancel: false,
      //   confirmText: "知道了",
      //   confirmColor: "#ffbe00",
      // })
      // TODO 如果没有接收到appid参数提示错误  测试先绑定一个
      options.query.appid = 'wx3326999f88e7077a';
    }
    //this.globalData.shopid = 'c3a1f69158e04e0b8d072e5bc1f47b31';
    this.globalData.shopid = '6e7c30e587904c24915c561836b3092e';
    this.globalData.appid = options.query.appid;
    that.wxLogin();
    wx.setStorageSync("Address", "not");
  },
  //声明连接socket方法
  connectWebsocket: function () {
    var task = wx.connectSocket({
      url: 'ws://m.ddera.com/dcxt/json/webSocket.json',
      data: {
        userid:"123455"
      },
      header: {
        'content-type': 'application/json'
      },
      method: "POST"
    })
    wx.onSocketOpen(function (res) {
      wx.sendSocketMessage({
        data: "微信小程序 web socket"
      })
      console.log('WebSocket连接已打开！')
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
    wx.onSocketMessage(function (res) {
      var page = getCurrentPages()[0];
      console.info("page值");
      console.info(page);
      var currentRoute = "";
      if(page !=undefined){
          currentRoute = page.route;
      }
      console.info("当前路由:"+currentRoute);
      console.log('收到服务器内容：' + res.data);
      //处理订单数据更新
      if(res.data == "101"){
        console.info("有新的订单");
        if (currentRoute == "pages/indent/indent"){
            page.loadOrderData();
            page.loadOrderNumber();
        }
      }
    })
    wx.onSocketClose(function (res) {
      console.log('关闭socket')
    })
  },
  onShow:function(){
    var that = this;
  },
  onHide:function(){
   
  },
  globalData: {
    userInfo: null,
    appid:null,
    loginUrl: 'http://m.ddera.com/dcxt/json/toSmallProgram.json',
    shopid:null,
    basePath:'http://m.ddera.com/dcxt/',
    tabBar: {
      "color": "#5C5A58",
      "selectedColor": "#DA251D",
      "borderStyle": "#000",
      "backgroundColor": "#EF9BA0",
      "list": [{
        "pagePath": "../founding/founding",
        "iconPath": "../../images/icon/caidan.png",
        "selectedIconPath": "../../images/icon/caidan.png",
        "text": "开台"
      },
      {
        "pagePath": "../indent/indent",
        "iconPath": "../../images/icon/dindan.png",
        "selectedIconPath": "../../images/icon/dindan.png",
        "text": "订单"

      },
      {
        "pagePath": "../statement/statement",
        "iconPath": "../../images/icon/bb-icon.png",
        "selectedIconPath": "../../images/icon/bb-icon.png",
        "text": "报表"
      },
      {
        "pagePath": "../takeOut/takeOut",
        "iconPath": "../../images/icon/wm-icon.png",
        "selectedIconPath": "../../images/icon/wm-icon.png",
        "text": "外卖"
      },
      {
        "pagePath": "../cashier/cashier",
        "iconPath": "../../images/icon/shouyin.png",
        "selectedIconPath": "../../images/icon/shouyin.png",
        "text": "收银"
      },
      {
        "pagePath": "../menu/menu",
        "iconPath": "../../images/icon/caidan.png",
        "selectedIconPath": "../../images/icon/caidan.png",
        "text": "首页"
      }]
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
        that.pushSession();
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
      }
    })
  },

//shopid,userid放入session
pushSession:function(){
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
      that.connectWebsocket(); 
      console.info(res.data.data);
    },
    fail: function (error) {
      console.log(error);
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
        appid: this.globalData.appid
      },
      header:{
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8' 
      },
      success: function (res) {
        if (res.data.code != '0000') {
          // 提示登录失败
          wx.showToast({
            title: '登录失败',
          })
        }
        wx.setStorageSync("openid", res.data.data.OPENID);
        wx.setStorageSync("unionId", res.data.data.USER_UNIONID);
        //授权成功
      },
      fail: function (error) {
        console.log(error)
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
        onerpx = res.screenWidth/750;
      },
    })
    var appObj = { mob_width: contentWidth, mob_height: contentHeight, mob_name: modelName, mob_onerpx: onerpx};
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
  GBshowModalTip: function (titles,showCancel, tiptext, successFun) {
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
  showToast: function (title, img,time) {
    wx.showToast({
      image: img,
      title: title,
      duration: time
    })
  },
  hintBox:function(title,type){
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
        title: title,
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
            console.log(tempFiles)
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
  animtaed:function(px){
    console.log(px)
    var that = this;
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    this.animation = animation;
    animation.bottom(px).step();
    setTimeout(function(){
      that.data.animtedata = animation.export();
    },10)
  },
  /**
   * 更换title
   */
  updateTitle:function(title){
    wx.setNavigationBarTitle({
      title:title
    })
  },
  /**
   * 封装request
   */
  sendRequest:function(data){
    wx.request({
      url: this.globalData.basePath + 'json/' + data.url + '.json',
      method: data.method,
      data: data.data,
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        data.success(res)
      },
      fail: function (error) {
        data.fail(error)
      }
    })
  },
  /**
   * 弹框提示
   */
  toast:function(message){
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
  modal:function(message){
    let showCancel = message.showCancel;
    let cancelText = message.cancelText;
    let confirmText = message.confirmText;
    let confirmColor = message.confirmColor;

    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel == undefined ? true : false,
      cancelText: cancelText == undefined ? '取消' : cancelText,
      confirmText: confirmText == undefined ? '确定' : confirmText,
      confirmColor: confirmColor == undefined ? "#EF9BA0" : confirmColor,
      success(res){
        if (message.success != undefined){
          message.success(res)
        }
      },
      fail(res){
        if (message.fail != undefined) {
          message.fail(res)
        }
      }, 
      complete(res){
        if (message.complete != undefined) {
          message.complete(res)
        }
      }
    })
  },
  setStorage:function(key,data){
    wx.setStorage({
      key: key,
      data: data
    })
  }

})
