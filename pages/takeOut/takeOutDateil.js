// pages/takeOut/takeOutDateil.js
Page({
  data: {
    isHidden:true
  },
  onLoad: function (options) {
    var that = this;
    var type = options.type;
    var title = type == 0 ? '待确定订单' :'待配送订单'
    wx.setNavigationBarTitle({
        title: title,
    })
    that.setData({
      type: type
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },

})