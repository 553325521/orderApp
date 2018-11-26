// pages/payOrders/payOrders.js
var app = getApp();
var currentPayWay = -1;
var select_cou = false;
var select_jf = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    select_cou: select_cou,
    select_jf: select_jf,
    currentPayWay: currentPayWay,//当前选择的支付方式
    selectPayWayImg:'http://m.ddera.com/dcxt/assets/img/select.webp',
    payList:[
        {
          payName:'现金',
          payImg:'http://m.ddera.com/dcxt/assets/img/xj.webp',
          payTag:0
        },
        {
          payName: '微信',
          payImg: 'http://m.ddera.com/dcxt/assets/img/weixinpay.png',
          payTag: 0
        },
        {
          payName: '支付宝',
          payImg: 'http://m.ddera.com/dcxt/assets/img/alipay.webp',
          payTag: 1
        },
        {
          payName: 'POS',
          payImg: 'http://m.ddera.com/dcxt/assets/img/yhk.webp',
          payTag: 0
        },
        {
          payName: '储值',
          payImg: 'http://m.ddera.com/dcxt/assets/img/cz.webp',
          payTag: 0
        },
        {
          payName: '其他',
          payImg: 'http://m.ddera.com/dcxt/assets/img/other.webp',
          payTag: 0
        },
      ]
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

  console.info("支付方式为" + currentPayWay)
  wx.request({
    url: app.globalData.basePath + 'json/pubSigPay.json',

    method: "post",
    data: {
      shopid: app.globalData.shopid,
      openid: wx.getStorageSync('openid')
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: function (res) {
      console.info(res);
      if (res.data.code == '0000') {
        var payData = res.data.data;
        console.info(payData);
        wx.requestPayment({
          timeStamp: payData.apiTimestamp,
          nonceStr: payData.apiNoncestr,
          package: payData.apiPackage,
          signType: payData.apiSigntype,
          paySign: payData.apiPaysign,
          success(res) {
            console.info("支付success")
            console.info(res);
          },
          fail(res) {
            console.info("支付faild");
            console.info(res);
          }
        })
      }
    },
    fail: function (error) {
      console.log(error)
      wx.showToast({
        title: '支付失败~',
      })
    }
  })

 
  
},
  //选择支付方式
  clickPayWay:function(e){
    currentPayWay = e.currentTarget.dataset.index
    this.setData({
      currentPayWay: currentPayWay
    })
  },
  click_cou:function(){//点击使用优惠券
    select_cou = select_cou ? false:true;
    this.setData({
      select_cou: select_cou
    })
  },
  click_jf:function(){//点击使用积分抵现
    select_jf = select_jf ? false : true;
    this.setData({
      select_jf: select_jf
    })
  }

})