var app = getApp()
var baseUrl = app.globalData.basePath
var money = 0;
var orderId = '';

Page({
  data: {

  },
  onLoad: function (options) {
    var that = this;
    money = options.money;
    orderId = options.orderId;
    that.setData({
      money,
      QRCodeUrl: baseUrl + "json/starPosPay_generatePayQRCode.json?orderId=" + orderId
    })
  },
  onReady: function () {
  
  },
})