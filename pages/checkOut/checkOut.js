// pages/checkOut/checkOut.js
var app = getApp();
var payWay = -1;
var trueMoney;//实收金额
var shouldMoney;//应收金额
var discountsMoneyShow = false;//优惠金额显示不显示
var discountCouponShow = false;//优惠券显示不显示
var jfdxShow = false;//积分抵现显示不显示
var czzfShow = false;//储值支付显示不显示
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
        img: "../../images/icon/wx.png",
        text: '微信',
        w: 62,
        h: 52,
        type: 1
      },
      {
        img: "../../images/icon/zfb.png",
        text: '支付宝',
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
    //获取传过来的实收金额
    shouldMoney = options.shouldMoney
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
    console.info("payWay"+payWay)
    that.setData({
      currentTab: payWay
    })
  },
  /**
   * 确定支付
   */
  settleAccounts:function(){
    console.info("点击了")

    wx.requestPayment({
      appId:'wxc1531dc6935daa38',
      timeStamp: '1543482074',
      nonceStr: '0053e1d524eb4c3fafbace17f9608844',
      package: 'prepay_id=wx29170114233862eed5ef9bfe4028463379',
      signType: 'RSA',
      paySign: 'uwTz6T3wJJB7X/TzrkOynAmOmv7SMmmgHVrcLQi2gbKtwrTDQjhe5TbKd/HVQ7jtpC9IT7tyRSLWwCq0uVuBE/lY8aDm7qGIJO EKaC0NhBOIxdBeyLn5BDoqRdZOQvD6jJGfqH6EsfFOCEN2ygFbI2creXtlYrntrU9q3b82iENL9MuuyvHctV8Y54dQr WAi0hrKTKOtp6cOkR/DNXjgXZbOb7WN8Yzb N9EQVd/vFa1Q28cnZneKj5V33T q1/fEmIR771bc9afivs7ltZQyicFxxlZq//TVKumVDv3owVCh BRkviiPYg/PMK279ozX6KA6JDWOrcvY7bCjMpw==',
      success(res) { console.info(res)},
      fail(res) { console.info(res)}
    })


    // var that = this;
    // var currentTab = that.data.currentTab;
    // console.log(currentTab)
    // if (currentTab == undefined){
    //   app.hintBox('请选择支付方式','none')
    // } else if (currentTab == 1 || currentTab == 2){
    //   console.log(1)
    //   that.data.wzShow = true
    // }else{
    //   app.hintBox('付款成功','success')
    // }
    // that.setData({
    //   wzShow: that.data.wzShow
    // })
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
      app.hintBox('付款成功','success')
      that.setData({
        wzShow: false
      })
    }else if(type == '2'){
      app.pageTurns('../payMent/payMent');
    }else{
      wx.scanCode({
        onlyFromCamera:true,
        scanType: ['qrCode'],
        success:function(res){
          //扫码成功
          console.log(res)
          var code = res.result
          if (code != null){
            //进行支付
            wx.request({
              url: app.globalData.basePath + 'json/ShopScanPay.json',
              method: "post",
              data: {
                qrCode: code,
                //openid: wx.getStorageSync('openid'),
                payWay: payWay
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
              },
              success: function (res) {
                console.info(res)
                if (res.data.code == '0000') {
                  if(res.data.data.result == 'A'){
                    wx.showModal({
                      title: '提示',
                      showCancel: false,
                      content: '等待用户确认支付',
                      success: function (res) { }
                    })
                  } else if(res.data.data.result == 'S'){
                    wx.showToast({
                      title: '支付成功',
                    })
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
                wx.showToast({
                  title: '支付失败',
                })
              }
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
  }
})