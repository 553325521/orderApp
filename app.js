//app.js

App({
  data: {  
  },
  /**
  * 生命周期函数--监听小程序初始化
  */
  onLaunch: function () {
    var that = this;
    that.wxLogin();
    wx.setStorageSync("Address", "not");  
  },
  globalData: {
    userInfo: null,
    tabBar: {
      "color": "#5C5A58",
      "selectedColor": "#DA251D",
      "borderStyle": "#000",
      "backgroundColor": "#EF9BA0",
      "list": [
        {
          "selectedIconPath": "images/icon/caidan.png",
          "iconPath": "images/icon/caidan.png",
          "pagePath": "pages/menu/menu",
          "text": "首页",
          active: true
        },
        {
          "selectedIconPath": "images/icon/dindan.png",
          "iconPath": "images/icon/dindan.png",
          "pagePath": "pages/indent/indent",
          "text": "订单",
          active: false
        },
        {
          "selectedIconPath": "images/icon/bb-icon.png",
          "iconPath": "images/icon/bb-icon.png",
          "pagePath": "pages/statement/statement",
          "text": "报表",
          active: false
        },
        {
          "selectedIconPath": "images/icon/wm-icon.png",
          "iconPath": "images/icon/wm-icon.png",
          "pagePath": "pages/takeOut/takeOut",
          "text": "外卖",
          active: false
        },
        {
          "selectedIconPath": "images/icon/shouyin.png",
          "iconPath": "images/icon/shouyin.png",
          "pagePath": "pages/cashier/cashier",
          "text": "收银",
          active: false
        }
      ],
      "position": "bottom"
    }
  },
  /**
   * 登录
   */
  wxLogin: function () {
    var that = this;
    wx.login({
      success: function (res) {
        console.log(res)
        that.getUserAuth(res.code);
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

  /**
     * 调用后台接口，传递code参数
     */
  sendAppCodeFunction: function (code) {
    var that = this;
    wx.request({
      url: loginUrl,
      method: "post",
      data: {
        code : code
      },
      success: function (res) {
        console.log(res)
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
     */
  getUserAuth: function (cd) {
    console.log(cd)
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
    wx.getSystemInfo({
      success: function (res) {
        modelName = res.model;
        contentHeight = res.windowHeight;
        contentWidth = res.windowWidth;
      },
    })
    var appObj = { mob_width: contentWidth, mob_height: contentHeight, mob_name: modelName };
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
  }
})
