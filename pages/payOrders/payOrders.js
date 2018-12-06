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
  // wx.requestPayment({
    //   appId:'wx3326999f88e7077a',
    //   timeStamp: '1543484072',
    //   nonceStr: '2727b32b4e0a407e9cf01f9e25120304',
    //   package: 'prepay_id=wx291734320062914b0f49dade2319482583',
    //   signType: 'RSA',
    //   paySign: 'm5TNqqUT/EuU6zBfwPimmYTyMbniVS6fVXf 6 dedENA0YcONNvM/uqPEAu0tpW64Zk3hoC6La5kmL6sQWruDLp GxW1QqaxRxgDC6KZhveYKjI0ORUpXk/hxlQMcgFBkEVBcVCZEwSOyyXqPculaR4QOfFmGVV/wau6Y6vHN8at3zTrb3IuxfV7z66d6eiOAh49Rk 8tx467x3r0zalfgaOtm/ba04coifSx0uXXe7tC4fLr2peKivmUuGXMzZvvi55gxNz8N3TeVb4xeyi 9NI/63ERz3uu67qU2Q4yNm/c6/qHI/vJsjPMrd8puECROKcetwS9H6jRF0h8hewzQ==',
    //   success(res) { console.info(res)},
    //   fail(res) { console.info(res)}
    // })


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