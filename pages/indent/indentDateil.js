// pages/indent/indentDateil.js
var app = getApp()
var totalMoney = 0;
var ORDER_PK;//订单的id
var orderType;//订单的类型
var smallButton = true;//显示按钮吗还,需要从后台查询

Page({
  data: {
    cardTeams: [],
    startY:0,
    startRight:0,
    orderDetailMap:{},
    smallButton
  },
  onLoad: function (options) {
    var that = this;
    ORDER_PK = options.ORDER_PK
    orderType = options.type
    that.setData({
      orderType: orderType
    })
    that.loadOrderDetail();
    //获取一些设置的参数，比如多久就不能显示开台补单退单开台了
  },
  onReady: function () {
  },
  onShow: function () {
    
  },
  drawStart: function (e) {
    let that = this;
    let touch = e.touches[0];
    let index = e.currentTarget.dataset.index;
    var data = that.data.orderDetailMap.data;
    that.data.startX = touch.clientX;
    that.data.startRight = data[index].right
  },
  drawEnd: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    var data = that.data.orderDetailMap.data;
    if (data[index].right < 30){
      data[index].right = 0
    }else{
      data[index].right = 30
    }
    that.setData({
      orderDetailMap: that.data.orderDetailMap
    });
  },
  drawMove: function (e) {
    let that = this;
    let touch = e.touches[0];
    let startX = that.data.startX;
    let index = e.currentTarget.dataset.index;
    var data = that.data.orderDetailMap.data;
    let endX = touch.clientX;
    if (endX - startX == 0)
      return;
    //从右往左  
    if ((endX - startX) < 0) {
      if (data[index].show != true){
        data[index].show = true;
        that.data.startRight = startX - endX;
        that.data.startRight > 30 ? data[index].right = 30 : data[index].right = that.data.startRight;
      }else{
        data[index].right = 30
      }   
    } else {//从左往右 
      if (data[index].show != true) {
        data[index].right = 0
      } else {
        that.data.startRight = 30 - (endX - startX);
        that.data.startRight < 0 ? data[index].right = 0 : data[index].right = that.data.startRight;
        that.data.startRight <= 0 ? data[index].show = false : data[index].show = true;
      }  
    }
    that.setData({
      orderDetailMap: that.data.orderDetailMap
    });

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
        for (var _index in res.data.data) {
          res.data.data[_index].right = 0;
          res.data.data[_index].show = false;
        }
        that.data.orderDetailMap = that.dealOrderDetailData(res.data.data);
        console.info("easfdaeseew")
        console.info(that.data.orderDetailMap)
        that.setData({
          orderDetailMap: that.data.orderDetailMap
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
//处理订单详情数据
dealOrderDetailData:function(data){
  let that = this;
  var orderDetailMap = new Map();
  console.info("订单")
  console.info(data)
  orderDetailMap.set("ORDER_POSITION",data[0].ORDER_POSITION);
  orderDetailMap.set("ORDER_RS",data[0].ORDER_RS);
  orderDetailMap.set("ORDER_CODE", data[0].ORDER_CODE);
  orderDetailMap.set("ORDER_YMD",data[0].CREATE_TIME.substring(0,10));
  orderDetailMap.set("CREATE_TIME", data[0].CREATE_TIME.substring(11));
  orderDetailMap.set("ARRIVE_TIME", data[0].CREATE_TIME.substring(11));
  
  var totalFS = 0;
  totalMoney = 0;
  for(var i = 0;i < data.length;i++){
    totalMoney = totalMoney + (data[i].ORDER_DETAILS_GMONEY * data[i].ORDER_DETAILS_FS/100.0);
    totalFS = totalFS + parseInt(data[i].ORDER_DETAILS_FS);
  }
  orderDetailMap.set("totalMoney", totalMoney);
  orderDetailMap.set("totalFS", totalFS);
  orderDetailMap.set("data",data);

  return JSON.parse(that.mapToJson(orderDetailMap));
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
    app.clearCart()
    var that = this;
    wx.setStorageSync('ORDER_PK', ORDER_PK);
    wx.setStorageSync('ORDER_TYPE', orderType);


    // app.sendRequest({
    //   url: 'Order_load_loadOrderDetailTableByOrderPK',
    //   data:{
    //     ORDER_PK: ORDER_PK,
    //     openid: wx.getStorageSync('openid')
    //   },
    //   success:function(res){
    //     console.info(res)
    //     var currentTableMessage = {
    //       currentTable: res.data.data,
    //       currentEatPersonNum: res.data.data
    //     }
    //     app.setStorage('currentTableMessage', currentTableMessage)


    //     app.reLaunch('../index/index?page=../menu/menu')
    //   }
    // })

    app.reLaunch('../index/index?page=../menu/menu')
  },
  //退菜
  tuicai: function (e) {
    let that = this;
    var ORDER_DETAILS_PK = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.basePath + 'json/Order_delete_tuiCai.json',
      method: "post",
      data: {
        ORDER_DETAILS_PK:ORDER_DETAILS_PK,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.loadOrderDetail();
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '登录失败',
        })
      }
    })
  },
  navTo:function(){
    app.pageTurns('../checkOut/checkOut?shouldMoney=' + totalMoney + '&ORDER_PK='+ORDER_PK)
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
            that.setTable('','1')
          } else if (opera == '4') {
            that.setTable('', '0')
          }
         
        }
      }
    })

  },
  /**
   * 退单操作
   */
  cancalOrder: function (orderId){
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
  setTable: function (orderId,status) {
    console.info("开台空台成功"+status)
  }
})