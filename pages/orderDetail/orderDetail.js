// pages/orderDetail/orderDetail.js
var app =getApp()
Page({
  data: {
  
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  settleAccounts:function(){
    app.pageTurns(`../checkOut/checkOut`)
  },
  /**
   * 加菜
   */
  addDish:function(){
    wx.navigateBack({
      delta:1
    })
  }
})