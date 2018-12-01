// pages/orderDetail/orderDetail.js
var util = require('../../utils/util.js');  
var app =getApp()
var allMoney=0.0;//订单总金额
var queryBean;
var ordersList;
var currentTime;
var currentEatPersonNum = 0;

Page({
  data: {
    loadingHidden: true
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      loadingHidden: false
    })
    queryBean = JSON.parse(options.queryBean);
    ordersList = JSON.parse(options.ordersList);
    currentTime = util.nowTime().split(' ');
    allMoney = parseFloat(options.allMoney)
    currentEatPersonNum = options.currentEatPersonNum;

    that.setData({
      queryBean: queryBean,
      currentDay: currentTime[0],
      currentTimes: currentTime[1],
      allMoney: allMoney.toFixed(2),
      ordersList: ordersList,
      loadingHidden: true,
      currentEatPersonNum: currentEatPersonNum
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
    that.setData({
      loadingHidden: false
    })
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var i = e.currentTarget.dataset.i;
    var j = e.currentTarget.dataset.j;
    var _url = '';
    var tpnum = 0;
    if (type == "+") {
      tpnum = parseFloat(ordersList[index].qity) + 1;
      ordersList[index].qity++;
      allMoney = parseFloat(allMoney) + parseFloat(ordersList[index].GOODS_PRICE) / 100;
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    } else {
      tpnum = ordersList[index].qity - 1;
      ordersList[index].qity--
      allMoney = parseFloat(allMoney) - parseFloat(ordersList[index].GOODS_PRICE) / 100;
      if (tpnum <= 0) {
        ordersList.splice(index, 1)
      }
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    }

    wx.request({
      url: _url,
      method: "post",
      data: {
        CART_PK: ordersList[index].CART_PK,
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
            ordersList: ordersList,
            allMoney: allMoney.toFixed(2),
            loadingHidden: true
          })
          // 购物车里面空的时候隐藏购物车列表
          if (ordersList.length == 0) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '添加失败',
        })
      }
    })
  },
  settleAccounts: function(e) {
    var that = this;
    var _type = e.currentTarget.dataset.type;
    that.setData({
      loadingHidden: false
    })
    var _open = 'on';
    
    wx.request({
      url: app.globalData.basePath + 'json/Order_insert_createOrder.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        ORDER_POSITION: queryBean.TABLES_PK,
        ORDER_STATE: _type,
        ORDER_RS: currentEatPersonNum,
        ORDER_XDZD: 2 //设备终端：2为店员端
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          if (_type == 3) {
            // 验证是否开启堂点带出收银
            if (_open == 'on') {
              app.pageTurns(`../checkOut/checkOut?shouldMoney=`+allMoney)
            } else {
              app.pageTurns(`../index/index?page=../menu/menu`);
            }
          } else {
            app.pageTurns(`../index/index?page=../menu/menu`);
          }
          that.setData({
            loadingHidden: true
          })
          wx.showToast({
            title: '创建成功',
          })
        } else {
          wx.showToast({
            title: '创建失败',
          })
        }
      },
      fail: function (error) {
        that.setData({
          loadingHidden: true
        })
        wx.showToast({
          title: '创建失败',
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