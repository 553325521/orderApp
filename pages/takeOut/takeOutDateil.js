// pages/takeOut/takeOutDateil.js
var app = getApp();
Page({
  data: {
    isHidden:true,
    orderDetails:{}
  },
  onLoad: function (options) {
    var that = this;
    var type = options.type;
    var title = type == 1 ? '待确定订单' :'待配送订单'
    wx.setNavigationBarTitle({
        title: title,
    });
    that.setData({
      type: type,
      ORDER_PK: options.ORDER_PK,
      SOURCENAME: options.SOURCE_NAME
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadOrderDetailsByPk();
  },
  //根据订单Id查询订单详情
  loadOrderDetailsByPk:function(){
    var that = this;
    app.sendRequest({
      url: "Order_select_loadWMDetailsDataByOrderPk",
      method: "post",
      data: {
        partName:that.data.SOURCENAME,
        ORDER_PK: that.data.ORDER_PK
      },
      success: function (res) {
        if(res.data.code == '0000'){
          that.setData({
            orderDetails:res.data.data[0]
          })
        }
        console.info(res.data);
      },
      fail: function (error) {
        console.info(error);
      }
    })
  },
  changeType:function(){
    this.setData({
      type:5
    })
  }

})