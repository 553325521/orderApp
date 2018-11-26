var app = getApp()
var baseUrl = app.globalData.basePath

Page({
  data: {
    // QRCodeUrl: app.globalData.basePath + 'json/starPosPay_generatePayQRCode.json?orderId='+ "555"
    QRCodeUrl: baseUrl+"json/starPosPay_generatePayQRCode.json?orderId=66"
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
  
  },
})