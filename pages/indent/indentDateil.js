// pages/indent/indentDateil.js
var app = getApp()
Page({
  data: {
    cardTeams: [],
    startY:0,
    startRight:0,
    orderDetailMap:{}
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      type : options.type,
      ORDER_PK: options.ORDER_PK
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    var that = this;
    that.loadOrderDetail();
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
      ORDER_PK: that.data.ORDER_PK,
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
  orderDetailMap.set("ORDER_POSITION",data[0].ORDER_POSITION);
  orderDetailMap.set("ORDER_RS",data[0].ORDER_RS);
  orderDetailMap.set("ORDER_CODE", data[0].ORDER_CODE);
  orderDetailMap.set("ORDER_YMD",data[0].CREATE_TIME.substring(0,10));
  orderDetailMap.set("CREATE_TIME", data[0].CREATE_TIME.substring(11));
  orderDetailMap.set("ARRIVE_TIME", data[0].ARRIVE_TIME.substring(11));
  var totalMoney = 0;
  var totalFS = 0;
  for(var i = 0;i < data.length;i++){
    totalMoney = totalMoney + (data[i].ORDER_DETAILS_GMONEY * data[i].ORDER_DETAILS_FS/100);
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
  addDish:function(){
    wx.switchTab({
      url: '../menu/menu',
    })
  },
  navTo:function(){
    app.pageTurns(`../entryOrders/entryOrders`)
  } 
})