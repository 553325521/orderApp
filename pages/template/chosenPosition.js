// pages/template/chosenPosition.js
var app = getApp();
Page({
  data: {
  
  },
  onLoad: function (options) {
    var that = this;
    var mobInfo = app.getSystemInfo();
    that.setData({
      W: mobInfo.mob_width + 'px',
      H: mobInfo.mob_height + 'px'
    })
  },
  onReady: function () {
  
  },
})