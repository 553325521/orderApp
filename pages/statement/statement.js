// pages/statement/statement.js
var app = getApp()
Page({

  data: {
    SUM_MONEY:0.0,
    SUM_GOODS_NUMBER:0,
    SUM_MEMBER:0
  },
  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },
  onShow: function () {
    var that = this;
    that.loadTotalData();
  },
  //加载数据
  loadTotalData:function(){
    var that = this;
    wx.request({
      url: app.globalData.basePath + 'json/Shop_load_loadShopReportByShopID.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        that.setData({
          SUM_MONEY: res.data.data.SUM_MONEY,
          SUM_GOODS_NUMBER: res.data.data.SUM_ORDER,
          SUM_MEMBER: res.data.data.SUM_MEMBER
        });
      },
      fail: function (error) {
        wx.showToast({
          title: '加载报表总数据失败',
        })
      }
    })
  },
  navTo:function(e){
    var url = e.currentTarget.dataset.url
    app.pageTurns(url)
  }
})