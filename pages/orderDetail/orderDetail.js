// pages/orderDetail/orderDetail.js
var util = require('../../utils/util.js');  
var app =getApp()
Page({
  data: {
  },
  onLoad: function (options) {
    var that = this
    var queryBean = JSON.parse(options.queryBean);
    var ordersList = JSON.parse(options.ordersList);
    var currentTime = util.nowTime().split(' ');
    that.setData({
      queryBean: queryBean,
      currentDay: currentTime[0],
      currentTimes: currentTime[1],
      allMoney: options.allMoney,
      ordersList: ordersList
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  /**
   * 查看挂单修改数量
   */
  alterCount: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var i = e.currentTarget.dataset.i;
    var j = e.currentTarget.dataset.j;
    var _url = '';
    var tpnum = 0;
    if (type == "+") {
      tpnum = parseFloat(that.data.ordersList[index].qity) + 1;
      that.data.ordersList[index].qity++;
      that.data.allMoney = parseFloat(that.data.allMoney) + parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100;
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    } else {
      tpnum = that.data.ordersList[index].qity - 1;
      that.data.ordersList[index].qity--
      that.data.allMoney = parseFloat(that.data.allMoney) - parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100;
      if (tpnum <= 0) {
        that.data.ordersList.splice(index, 1)
      }
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    }

    wx.request({
      url: _url,
      method: "post",
      data: {
        CART_PK: that.data.ordersList[index].CART_PK,
        GOODS_NUM: tpnum,
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            ordersList: that.data.ordersList,
            allMoney: that.data.allMoney.toFixed(2)
          })
          // 购物车里面空的时候隐藏购物车列表
          if (that.data.ordersList.length == 0) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '添加失败~',
        })
      }
    })
  },
  settleAccounts: function(e) {
    var that = this;
    wx.request({
      url: app.globalData.basePath + 'json/Order_insert_createOrder.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        ORDER_POSITION: that.data.queryBean.TABLES_NAME,
        ORDER_STATE: '2',
        ORDER_RS: '5'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          app.pageTurns(`../menu/menu`);
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '添加失败~',
        })
      }
    })
  },
  /**
   * 加菜
   */
  addDish:function(){
    wx.navigateBack({
      delta:1
    })
  }
})