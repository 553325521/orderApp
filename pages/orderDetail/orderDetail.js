// pages/orderDetail/orderDetail.js
var util = require('../../utils/util.js');  
var app =getApp()
var allMoney=0.0;//订单总金额
var currentTable;//当前桌位的信息
var ordersList;
var currentTime;
var currentEatPersonNum = 0;//当前桌位的人数
var shoppingCart = {};//购物车信息

Page({
  data: {
    loadingHidden: true
  },
  onLoad: function (options) {
    var that = this;
    //取出本地购物车，，先看看里边有没有当前桌位和当前桌位就餐人数信息
    that.flushShoppingCart()
    if (shoppingCart.table == undefined){  
      app.modal({
        content: '请选择餐位',
        showCancel: false,
        success: function () {
          app.reLaunch('../index/index?page=../menu/menu')
          return;
        }
      })
    }
    //TODO
    currentTime = util.nowTime().split(' ');

    that.setData({
      currentDay: currentTime[0],
      currentTimes: currentTime[1]
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    
  },
  /**
   * 刷新购物车信息
   */
  flushShoppingCart: function () {
    var that = this;
    shoppingCart = app.getShoppingCart()
    if (shoppingCart.totalNumber == undefined) {
      shoppingCart.totalNumber = 0
    }
    if (shoppingCart.goods == undefined) {
      shoppingCart.goods = []
    }
    if (shoppingCart.totalMoney == undefined) {
      shoppingCart.totalMoney = 0;
    }
    that.setData({
      shoppingCart
    })
    if (shoppingCart.totalNumber == 0){
      app.modal({
        content:'菜单已空',
        showCancel:false
      })
    }
    
  },
  /**
   * 订单里边修改数量
   */
  alterCount: function (e) {
    var that = this;
    var good = e.currentTarget.dataset.good
    var opera = e.currentTarget.dataset.type
    if(opera == '-'){
      app.subShoppingCart(good)
    }else{
      app.addShoppingCart(good)
    }
    that.flushShoppingCart()
  },
  /**
   * 确认订单
   */
  settleAccounts: function(e) {
    var that = this;
    app.showLoading()
    app.sendRequest({
      url: 'Order_insert_shoppingcreateOrder',
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        SHOPPING_CART:JSON.stringify(app.getShoppingCart()),
        ORDER_DIVISION:0//客户端类型 0店内
      },
      success: function (res) {
        if (res.data.code == '0000') {
          //移除购物车
          app.removeShoppingCart()

          //验证是否开启堂点带出收银
          if (app.globalData.appSetting.tddcsy == true) {
            app.redirectTo(`../checkOut/checkOut?shouldMoney=` + allMoney)
          } else {
            app.reLaunch(`../index/index?page=../menu/menu`);
          }



          wx.showToast({
            title: '创建成功',
          })
        } else if (res.data.code == '3333') {
          //桌位被使用，下单失败
          //TODO 清除当前桌位信息，并跳转至菜单页面自动打开选择桌位栏目
          app.modal({
            content: res.data.data,
            showCancel: false,
            success: function () {
              //更改当前桌位信息
              let tempCart = app.getShoppingCart().table == {}
              app.recoverShoppingCart(tempCart)

              app.pageTurns('../index/index?page=../menu/menu&reserveShow=true')

            }
          })


        } else {
          wx.showToast({
            title: res.data.data,
          })
        }
        that.setData({
          loadingHidden: true
        })
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
  addDish: function(){
    wx.navigateBack({
      delta:1
    }) 
  },
  /**
   * 点击餐桌
   */
  clickTables: function(){
    app.reLaunch('../index/index?page=../menu/menu&reserveShow=true')
  },
  /**
   * 点击人数
   */
  clickPersonNum: function(){
    app.reLaunch('../index/index?page=../menu/menu&quorumShow=true')
  },
  /**
   * 点击清空
   */
  clickClear:function(){
    app.removeShoppingCart()
    app.reLaunch('../index/index?page=../menu/menu')
  },
  /**
   * 挂单
   */
  saveCartOrder:function(){
    app.setStorageOrder(shoppingCart)
    app.reLaunch('../index/index?page=../menu/menu')
  }
})