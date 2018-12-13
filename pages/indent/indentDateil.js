// pages/indent/indentDateil.js
var app = getApp()

var ORDER_PK;//订单的id
var orderType;//订单的类型
var smallButton = true;//显示按钮吗还,需要从后台查询
var jiacai = false;//是加菜状态

var currentSlideOrderId = -1;//当前滑动触摸的orderid
var movedistance = 0;//移动的距离
var startX = 0;//开始滑动的时候的x轴位置
var sliderWidth = 120;//滑块的宽度，单位rpx
var silderStatus = false;//当前滑块是打开的吗

var shoppingCart={
  totalMoney:0,
  totalNumber:0
};//购物车

Page({
  data: {
    cardTeams: [],
    startY:0,
    startRight:0,
    orderDetailMap:{},
    smallButton,
    sliderWidth,
    foundingSwitch:app.globalData.appSetting.foundingSwitch,
    currentOrderPk:""
  },
  onLoad: function (options) {
    var that = this;
    that.initParam()
    ORDER_PK = options.ORDER_PK
    that.setData({
      currentOrderPk:ORDER_PK
    })
    orderType = options.type
    if (ORDER_PK == undefined || ORDER_PK == '') {
      ORDER_PK = wx.getStorageSync('ORDER_PK');
      if (ORDER_PK != undefined && ORDER_PK != ''){
        jiacai = true;
        shoppingCart = app.getShoppingCart()
      }
      orderType = 0
    } else if (app.getShoppingCart() != undefined && app.getShoppingCart().totalNumber > 0){
      shoppingCart = app.getShoppingCart()
      orderType = 0
    }else{
      jiacai = false;//是加菜状态
      shoppingCart = {
        totalMoney: 0,
        totalNumber: 0
      };//购
    }
    that.setData({
      orderType,
      jiacai,
      shoppingCart
    })
    that.loadOrderDetail();
    //获取一些设置的参数，比如多久就不能显示开台补单退单开台了
  },
  onReady: function () {
  },
  onShow: function () {
    
  },
  initParam:function(){
    var that = this;
    movedistance = 0;//移动的距离
    startX = 0;//开始滑动的时候的x轴位置
    sliderWidth = 120;//滑块的宽度，单位rpx
    silderStatus = false;//当前滑块是打开的吗
    currentSlideOrderId = -1;
    that.setData({
      movedistance, silderStatus, currentSlideOrderId
    })
  },
  drawStart: function (e) {
    let that = this;
    let touch = e.touches[0];
    currentSlideOrderId = e.currentTarget.dataset.orderid;
    startX = touch.clientX;
    that.setData({currentSlideOrderId})
  },
  drawEnd: function (e) {
    let touch = e.changedTouches[0];
    let length = touch.clientX - startX;
    if (silderStatus && length > 10) {//如果滑之前滑块是开的，并且现在往右滑了超过10rpx的话，就关闭滑块
      silderStatus = false;
      movedistance = 0
      this.setData({
        movedistance
      })
    } else if (!silderStatus) {//如果滑之前滑块是关的
      if (-length > sliderWidth / 2) {//如果现在滑的距离大于滑块的一半的话，就自动打开滑块
        silderStatus = true
        movedistance = -sliderWidth
      } else {//反之，自动关闭滑块
        silderStatus = false;
        movedistance = 0
      }
      this.setData({
        movedistance
      })
    }
  },
  drawMove: function (e) {
    let touch = e.touches[0];
    let length = touch.clientX - startX;
    if (silderStatus && length > 0 && length < sliderWidth) {
      movedistance = length - sliderWidth
      this.setData({
        movedistance
      })
    } else if (!silderStatus && length < 0 && length > -sliderWidth) {
      movedistance = length
      this.setData({
        movedistance
      })
    }
  },
//请求订单详情数据
loadOrderDetail:function(){
  let that = this;
  wx.request({
    url: app.globalData.basePath + 'json/Order_load_loadOrderDetailByOrderPK.json',
    method: "post",
    data: {
      ORDER_PK: ORDER_PK,
      openid: wx.getStorageSync('openid')
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: function (res) {
      if (res.data.code == '0000') {
        console.info(res.data.data[0])
        for (var _index in res.data.data) {
          res.data.data[_index].right = 0;
          res.data.data[_index].show = false;
        }
     
        that.setData({
          orderDetailMap: res.data.data[0]
        });
      }
    },
    fail: function (error) {
      wx.showToast({
        title: '登录失败',
      })
    }
  })
},
strMapToObj: function (strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
},
/**
*map转换为json
*/
mapToJson: function (map) {
  return JSON.stringify(this.strMapToObj(map));
},
  //删除item  
  delItem: function (e) {
    var dataId = e.target.dataset.id;
    console.log("删除" + dataId);
    var cardTeams = this.data.cardTeams;
    var newCardTeams = [];
    for (var i in cardTeams) {
      var item = cardTeams[i];
      if (item.id != dataId) {
        newCardTeams.push(item);
      }
    }
    this.setData({
      cardTeams: newCardTeams
    });
  },
  /**
   * 加菜
   */
  addDish: function (){
    // app.clearCart()
    var that = this;
    wx.setStorageSync('ORDER_PK', ORDER_PK);
    wx.setStorageSync('ORDER_TYPE', orderType);

    app.createShoppingCart({
      TABLES_PK: that.data.orderDetailMap.TABLES_PK,
      TABLE_NAME: that.data.orderDetailMap.TABLES_NAME
      }, 0)

    app.jumpMenu()
  },
  //退菜
  tuicai: function (e) {
    let that = this;
    var ORDER_DETAILS_PK = e.currentTarget.dataset.id;
    app.modal({
      content: '确定退菜？',
      success: function (res) {
        if (res.confirm) {
          app.sendRequest({
            url:'Order_delete_tuiCai',
            data: {
              ORDER_DETAILS_PK: ORDER_DETAILS_PK,
              openid: wx.getStorageSync('openid')
            },
            success: function (res) {
              if (res.data.code == '0000') {
                that.initParam()
                that.loadOrderDetail();
              }else{
                app.hintBox(res.data.data,'none')
              }
            }
          })
         
        } else if (res.cancel) {
          //闭合滑块
          silderStatus = false;
          movedistance = 0

          that.setData({
            movedistance
          })
        }
      }
    })
    
  },
  /**
   * 删除购物车的菜
   */
  deleteGoods:function(e){
    let that = this;
    var index = e.currentTarget.dataset.index;
    app.modal({
      content: '确定删除？',
      success: function (res) {
        if (res.confirm) {
          app.removeShoppingCartGoods(index)
          that.initParam()
          that.loadOrderDetail();
          that.flushShoppingCart()
        } else if (res.cancel) {
          //闭合滑块
          silderStatus = false;
          movedistance = 0

          that.setData({
            movedistance
          })
        }
      }
    })

  },
  /**
   * 确定订单
   */
  navTo:function(){
    var that = this
    if (jiacai){
      app.modal({
        content:'确定加菜？',
        success(res) {
          if (res.confirm) {
            app.sendRequest({
              url:'Order_insert_OrderAddGoods',
              data:{
                FK_SHOP: app.globalData.shopid,
                FK_USER: wx.getStorageSync('openid'),
                ORDER_PK: ORDER_PK,
                SHOPPING_CART:JSON.stringify(app.getShoppingCart())
              },
              success: function (res) {
               if(res.code='0000'){
                  //清空购物车
                 app.removeShoppingCart()
                 wx.setStorageSync('ORDER_PK', '');
                 wx.setStorageSync('ORDER_TYPE', '');
                 jiacai = false;
                 var shoppingMoney = shoppingCart.totalMoney;
                 shoppingCart = {
                   totalMoney: 0,
                   totalNumber: 0
                  }

                  that.setData({
                    jiacai,
                    shoppingCart
                  })
                 that.loadOrderDetail();
                 if (app.globalData.appSetting.tddcsy){
                   app.pageTurns('../checkOut/checkOut?shouldMoney=' + (Number(that.data.orderDetailMap.ORDER_YFMONEY) + Number(shoppingMoney)) + '&ORDER_PK=' + ORDER_PK)
                 }
               }else{
                 app.hintBox(res.data.data)
               }
              },
            })
          }
        }
      })
    }else{
      app.pageTurns('../checkOut/checkOut?shouldMoney=' + that.data.orderDetailMap.ORDER_YFMONEY + '&ORDER_PK=' + ORDER_PK)
    }
  },
  /**
   * 点击了右上角小按钮
   */
  clickSmallButton:function(e){
    let opera = e.currentTarget.dataset.opera
    let text = '';
    if (opera == '1'){
      text = '补单'
    } else if (opera == '2'){
      text = '退单'
    } else if (opera == '3'){
      text = '开台'
    } else if (opera == '4'){
      text = '空台'
    }else{
      return;
    }
    let that = this;
    app.modal({
      content:'确定' + text + '？',
      success:function(res){
        if (res.confirm){
          if (opera == '1') {
            //补单，打印机操作
          } else if (opera == '2') {
            that.cancalOrder()
          } else if (opera == '3') {
            that.setTable(that.data.orderDetailMap.TABLES_PK,'1')
          } else if (opera == '4') {
            that.setTable(that.data.orderDetailMap.TABLES_PK, '0')
          }
         
        }
      }
    })

  },
  /**
   * 退单操作
   */
  cancalOrder: function (orderId){
    var that = this;
    app.sendRequest({
      url:'Order_update_cancelOrder',
      data:{
        SHOP_FK: app.globalData.shopid,
        OPEN_ID: wx.getStorageSync('openid'),
        ORDER_PK:that.data.currentOrderPk
      },
      success: function (res) {
        console.info(res.data);
          var flag = res.data.code == '0000' ? 'success':'none';
          app.hintBox(res.data.data,flag);
          app.reLaunch('/pages/index/index?page=../indent/indent')
      },
      fail: function (error) {
        console.info(error);
      }
    })
    console.info("退单成功")
  },
  /**
   * 补单操作
   */
  supplementOrder: function (orderId){
    console.info("补单成功，请查看打印机")
  },
  /**
   * 开台 空台操作
   * status:台开还是空台 1：开台 0：空台
   */
  setTable: function (tableId,status) {

    app.sendRequest({
      url:'Tables_update_updateTableIsUseByTableId',
      data:{
        TABLES_PK: tableId,
        TABLES_ISUSE: status
      },
      success:function(res){
        if(res.data.code == '0000'){
          app.toast('操作成功')
        }else{
          app.hintBox(res.data.data)
        }
      }
    })
    
  },
  /**
   * 刷新购物车
   */
  flushShoppingCart:function(){
    var that = this
    shoppingCart = app.getShoppingCart()
    that.setData({
      shoppingCart
    })
  }
})