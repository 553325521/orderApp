// pages/orderDetail/orderDetail.js
var util = require('../../utils/util.js');  
var app =getApp()
var allMoney=0.0;//订单总金额
var currentTable;//当前桌位的信息
var ordersList;
var currentTime;
var currentEatPersonNum = 0;//当前桌位的人数

Page({
  data: {
    loadingHidden: true
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      loadingHidden: false
    })
    //从本地缓存取出当前桌位和当前桌位就餐人数
    var value = wx.getStorageSync('currentTableMessage')
    if (value){
      currentTable = value.currentTable;
      if(currentTable == null){
        app.modal({
          content: '请选择餐位',
          showCancel: false,
          success: function () {
            app.reLaunch('../index/index?page=../menu/menu')
            return;
          }
        })
      }
      currentEatPersonNum = value.currentEatPersonNum;
    }else{
      //如果没有
      app.modal({
        content: '请选择餐位',
        showCancel: false,
        success: function () {
          app.reLaunch('../index/index?page=../menu/menu')
          return;
        }
      })
    }
    ordersList = JSON.parse(options.ordersList);
    console.info("ordersList")
    console.info(ordersList)
    currentTime = util.nowTime().split(' ');
    allMoney = parseFloat(options.allMoney)


    that.setData({
      currentTable: currentTable,
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
  /**
   * 确认订单
   */
  settleAccounts: function(e) {
    var that = this;
    var _type = e.currentTarget.dataset.type;
    that.setData({
      loadingHidden: false
    })
    var _open = 'on';
    console.info('tablepk')
    console.info(currentTable.TABLES_PK)
    wx.request({
      url: app.globalData.basePath + 'json/Order_insert_createOrder.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        ORDER_POSITION: currentTable.TABLES_PK,
        ORDER_STATE: _type,
        ORDER_RS: currentEatPersonNum,
        TABLES_PK: currentTable.TABLES_PK
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          //清除当前桌位信息
          wx.removeStorage({
            key: 'currentTableMessage',
            success(res) {
              if (_type == 3) {
                // 验证是否开启堂点带出收银
                if (_open == 'on') {
                  app.redirectTo(`../checkOut/checkOut?shouldMoney=` + allMoney)
                } else {
                  app.reLaunch(`../index/index?page=../menu/menu`);
                }
              } else {
                app.reLaunch(`../index/index?page=../menu/menu`);
              }
            }
          })

         
          
          wx.showToast({
            title: '创建成功',
          })
        } else if (res.data.code == '3333'){
          //桌位被使用，下单失败
          //TODO 清除当前桌位信息，并跳转至菜单页面自动打开选择桌位栏目
          app.modal({
            content: res.data.data,
            showCancel: false,
            success: function(){
              //更改当前桌位信息
              var currentTableMessage = wx.getStorageSync('currentTableMessage');
              currentTableMessage.currentTable = null;
              //把当前桌位信息存储在本地缓存里边
              app.setStorage('currentTableMessage', currentTableMessage)
              app.pageTurns('../index/index?page=../menu/menu&reserveShow=true')
              
            }
          })
         
          
        }else{
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
    // wx.navigateBack({
    //   delta:1
    // })
    //判断是不是已经生成订单了
    if (ordersList.ORDER_PK != undefined){
      //根据桌位ID拿到桌位信息
      var TABLE_ID = ordersList.ORDER_PK;
      app.sendRequest({
        url:'Tables_query_findTablesById',
        method: 'POST',
        data: {
          tables_id: TABLE_ID
        },
        success: function (res) {
          if(res.data.code == '0000'){
            currentTable = res.data.data
            currentEatPersonNum = ordersList.ORDER_RS;

            var currentTableMessage = {
              currentTable: ordersList,
              currentEatPersonNum: currentEatPersonNum
            }
            //把当前桌位信息存储在本地缓存里边
            app.setStorage('currentTableMessage', currentTableMessage)

            app.reLaunch('../index/index?page=../menu/menu')
          }else{
            app.toast(error)
          }
        },
        fail: function (error) {
          app.toast(error)
        }
      })

    }else{
      app.reLaunch('../index/index?page=../menu/menu')
    }
    
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
    app.reLaunch('../index/index?page=../menu/menu&clearCart=true')
  }
})