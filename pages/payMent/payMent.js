var app = getApp()
var baseUrl = app.globalData.basePath
var money = 0;
var orderId = '';
var orderType = '';
var aaa;

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

      var failCount = 0;
    aaa = setInterval(function(){
        console.info('1')
        app.sendRequest({
            url: orderType === '2' ? "findPaymentRecordPayStatusByPayId" : "findOrderPayStatusByOrderId",
            data: orderType === '2' ? 
            {
                PAY_PK: orderId
            } 
            : 
            {
                ORDER_PK: orderId
            },
            success: function (res) {
               if(res.data.code == '0000'){
                   if (res.data.data == '1'){
                       app.hintBox('收款成功', 'success')
                       // 播报语音，支付成功
                       that.jumpPage()
                   } 
                   else {
                       if (failCount++ > 20) {
                           app.hintBox('支付超时，请稍后查看', 'none')
                           //语音播报，支付查询异常
                           clearInterval(aaa)
                       }
                    } 
               }
            },
            fail: function (error) {
                console.info(error);
            }
        })
    }, 3000)

  },
  onReady: function () {
  
  },
  onUnload: function(){
      clearInterval(aaa);
  },
    /**
   * 跳转页面
   */
  jumpPage: function () {
        var page = wx.getStorageSync('click_page')
        if (page == '../founding/founding' && app.globalData.appSetting.CHECK_TDKT == 'true') {
            //   app.reLaunch('../index/index?page=../founding/founding')
            app.noFlushBackIndexPage(true)
        } else if (page == '../indent/indent') {
            //   app.reLaunch('../index/index?page=../indent/indent')
            app.noFlushBackIndexPage(false, undefined, page)
        } else {
            //   app.reLaunch('../index/index?page='+page)
            app.noFlushBackIndexPage(false)
        }
    },
})