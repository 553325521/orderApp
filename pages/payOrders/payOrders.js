// pages/payOrders/payOrders.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

/**
 * 自定义方法
 */


/**
 * 点击了支付
 */
clickPay:function (){
  
  wx.request({
    url: app.globalData.basePath + 'json/Tables_select_loadTableList.json',
    method: "post",
    data: {
      shopid: app.globalData.shopid,
      openid: wx.getStorageSync('openid')
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: function (res) {
      if (res.data.code == '0000') {
        //that.setData({
          //tableList: res.data.data,
          //loadingHidden: true
        //})
        console.log(res.data)
      }
    },
    fail: function (error) {
      wx.showToast({
        title: '支付失败~',
      })
    }
  })

  // wx.requestPayment({
  //   timeStamp: '',
  //   nonceStr: '',
  //   package: '',
  //   signType: 'MD5',
  //   paySign: '',
  //   success(res) { },
  //   fail(res) { }
  // })
  
}

})