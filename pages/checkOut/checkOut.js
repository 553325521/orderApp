// pages/checkOut/checkOut.js
var app = getApp();
var payWay = -1;
var trueMoney;//实收金额
var shouldMoney;//应收金额
var discountsMoneyShow = true;//优惠金额显示不显示
var discountCouponShow = true;//优惠券显示不显示
var jfdxShow = true;//积分抵现显示不显示
var czzfShow = true;//储值支付显示不显示
var ORDER_PK;//订单ID

Page({
  data: {
    operList:[1,1,1],
    payWayList:[
      {
        img:"../../images/icon/xj.png",
        text:'现金',
        w:76,
        h:78,
        type:0
      },
      {
        img: "../../images/icon/QR-scan.png",
        text: '二维码',
        w: 62,
        h: 62,
        type: 1
      },
      {
        img: "../../images/icon/scan-QR.png",
        text: '扫一扫',
        w: 50,
        h: 50,
        type: 2
      },
      {
        img: "../../images/icon/pos.png",
        text: 'POS',
        w:60,
        h:46,
        type: 3
      },
      {
        img: "../../images/icon/cz.png",
        text: '储值',
        w: 56,
        h: 46,
        type: 4
      },
      {
        img: "../../images/icon/qtzf.png",
        text: '其他',
        w:52,
        h:52,
        type: 5
      },
    ],
    wzShow:false,
    couponShow:false,
    memberShow:false,
    discountsMoneyShow: discountsMoneyShow,
    discountCouponShow: discountCouponShow,
    jfdxShow: jfdxShow,
    czzfShow: czzfShow

  },
  onLoad: function (options) {
    var that = this;
    //获取传过来的数据
    ORDER_PK = options.ORDER_PK
    shouldMoney = options.shouldMoney//应收金额
    trueMoney = shouldMoney
    console.info("多少钱" + trueMoney);
    that.setData({
      trueMoney:Number(trueMoney).toFixed(2),
      shouldMoney: Number(shouldMoney).toFixed(2)
    })

    var mobInfo = app.getSystemInfo();
    that.setData({
      W: mobInfo.mob_width + 'px',
      H: mobInfo.mob_height + 'px'
    })
  },
  onReady: function () {
    
  },
  checkboxChange:function(e){
    var that = this;
    console.log(e.detail.value.length);
    var num = e.detail.value.length>0?1:0;
    var index = e.currentTarget.dataset.index;
    that.data.operList[index] = num
    that.setData({
      operList: that.data.operList
    })
  },
  /**
   * 
   */
  addMember:function(){
    var that = this;
    that.setData({
      memberShow: true
    })
  },
   /**
   * 会员扫一扫
   */
  richScan:function(){
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: function (res) {
        console.log(res)
      },
      fail: function (error) {
        console.log(error)
      }
    })
  },
  /**
   * 查看优惠券
   */
  showCoupon:function(){
    var that = this;
    that.setData({
      couponShow: true
    })
  },
  /**
   * 选择优惠券
   */
  seleCoupon:function(){
    var that = this;
    that.setData({
      couponShow: false
    })
  },
  /**
   * 选择支付方式
   */
  selectPay:function(e){
    var that = this;
    payWay = e.currentTarget.dataset.index
    if(//payWay == 2 ||
     payWay == 3){
      that.data.wzShow = true
      that.setData({
        wzShow: that.data.wzShow
      })
    }
    that.setData({
      currentTab: payWay
    })
  },
  /**
   * 确定支付
   */
  settleAccounts:function(){
    var that = this;
    var currentTab = that.data.currentTab;
    console.log(currentTab)
    if (currentTab == undefined){
      app.hintBox('请选择支付方式','none')
    } else if (currentTab == 2 || currentTab == 3){//如果选的是微信或者支付宝支付
      //that.data.wzShow = true
      app.pageTurns('../payMent/payMent?money=' + trueMoney + '&orderId=' + ORDER_PK);
    }else{
      //请求网络，进行支付
      that.sendPay(payWay)
    }
    that.setData({
      wzShow: that.data.wzShow
    })
  },
  /**
   * 关闭所有弹框
   */
  vanish:function(){
    var that = this;
    that.setData({
      wzShow: false,
      couponShow:false,
      memberShow:false
    })
  },

  /**
   * 支付相关
   */
  payWay:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    console.log(type)
    if(type == '0'){
      that.sendPay(payWay + '0')
    }else if(type == '2'){
        that.sendPay(payWay + '2',function success(res){
        app.pageTurns('../payMent/payMent?money=' + trueMoney + '&orderId=' + ORDER_PK);
      })
    }else{
      wx.scanCode({
        onlyFromCamera:true,
        scanType: ['qrCode'],
        success:function(res){
          //扫码成功
          console.log(res)
          var code = res.result
          if (code != null){
            //进行支付前先生成支付订单
            sendPay(payWay + '1', function success(res) {
              //进行支付
              app.sendRequest({
                url: 'ShopScanPay',
                method: "post",
                data: {
                  qrCode: code,
                  //openid: wx.getStorageSync('openid'),
                  payWay: payWay,
                  ORDER_PK: ORDER_PK
                },
                success: function (res) {
                  console.info(res)
                  if (res.data.code == '0000') {
                    if (res.data.data.result == 'A') {
                      wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '等待用户确认支付',
                        success: function (res) { }
                      })
                    } else if (res.data.data.result == 'S') {
                      app.toast('支付成功')
                      app.reLaunch('../index/index?page=../indent/indent')
                    }

                  } else {
                    wx.showModal({
                      title: '提示',
                      showCancel: false,
                      content: '支付失败,原因:' + res.data,
                      success: function (res) { }
                    })
                  }
                },
                fail: function (error) {
                  app.hintBox('支付失败')
                }
              })
            })
          }
        },
        fail:function(error){
          console.log(error)
          wx.showToast({
            title: error,
          })
        }
      })
    }
  },
  /**
   * 卡券列表
   */
  couponList:function(){
    app.pageTurns('../couponList/couponList');
  },
  /**
   * 发送请求支付
   */
  sendPay:function(payWay,fun){
    var that = this
    //请求网络，进行付款成功
    app.sendRequest({
      url: 'Order_update_OrderShopSettleAccounts',
      data: {
        SHOP_FK: app.globalData.shopid,
        OPEN_ID: wx.getStorageSync('openid'),
        ORDER_PK: ORDER_PK,
        payWay: payWay
      },
      success: function (res) {
        if (fun != undefined){
          fun(res)
        }else{
          if (res.data.code = "0000") {
            app.hintBox('收款成功', 'success')
            that.vanish()
            that.jumpPage()
            
          } else {
            app.hintBox(res.data.data, 'none')
          }
        }
      }
    })
    
  },
  /**
   * 跳转页面
   */
  jumpPage:function(){
    var page = wx.getStorageSync('click_page')
    if (page == '../indent/indent'){
      app.reLaunch('../index/index?page=../indent/indent')
    }else{
      app.reLaunch('../index/index?page=../founding/founding')
    }
   
  }
})