var app = getApp()
var baseUrl = app.globalData.basePath
var money = 0;
var orderId = '';
var orderType = '';

Page({
  data: {

  },
  onLoad: function (options) {
    var that = this;
    money = options.money;
    orderId = options.orderId;
    orderType = options.orderType;
    that.setData({
      money,
      QRCodeUrl: baseUrl + "json/starPosPay_generatePayQRCode.json?orderId=" + orderId + '&orderType=' + orderType + '&money=' + money +'&shopId='+app.globalData.shopid
    })
  },
  onReady: function () {
  
  },
})