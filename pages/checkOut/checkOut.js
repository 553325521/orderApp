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
//第一次随机价格值
var firstSJMoney = -1;
Page({
  data: {
    operList:[1,1,1],
    payWayList:[
      {
        img:"../../images/icon/xj.png",
        text:'现金',
        w:76,
        h:78,
        type:1
      },
      {
        img: "../../images/icon/scan-QR.png",
        text: '扫一扫',
        w: 50,
        h: 50,
        type: 2
      },
      {
        img: "../../images/icon/QR-scan.png",
        text: '二维码',
        w: 62,
        h: 62,
        type: 3
      },
     
      {
        img: "../../images/icon/pos.png",
        text: 'POS',
        w:60,
        h:46,
        type: 4
      },
      {
        img: "../../images/icon/cz.png",
        text: '储值',
        w: 56,
        h: 46,
        type: 5
      },
      {
        img: "../../images/icon/qtzf.png",
        text: '其他',
        w:52,
        h:52,
        type: 6
      },
    ],
    wzShow:false,
    couponShow:false,
    memberShow:false,
    discountsMoneyShow: discountsMoneyShow,
    discountCouponShow: discountCouponShow,
    jfdxShow: jfdxShow,
    czzfShow: czzfShow,
    isShowUpdateAccount:false,//是否显示修改金额
    newAccount:0.0,//实收金额
    //优惠规则列表
    ruleList:[],
    //优惠金额
    favorMoney:0,
    //会员卡号
    vipNumber:'',
    kyjf: 0 , //可用积分
    kdje:0, //积分可抵金额
    kycz:0 //可用储值
  },
  onLoad: function (options) {
    var that = this;
    //获取传过来的数据
    ORDER_PK = options.ORDER_PK;
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
  onShow:function(){
    this.loadRuleByShop();
  },


//输入会员卡号发生变化
  vipNumberChange:function(e){
    var that = this;
    that.setData({
      vipNumber:e.detail.value
    });
  },
  //输入实收金额发生变化
  getNewAccount: function (e) {
    var that = this;
    that.setData({
      newAccount: e.detail.value
    });
  },
  //加载优惠规则
  loadRuleByShop:function(){
    var that = this;
    app.sendRequest({
      url: "ShopInfo_select_loadPreferntialRuleByShop",
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid
      },
      success: function (res) {
          var data = res.data.data;
          if(res.data.code == '0000' && res.data.data.length != 0){
            for(var i = 0;i < data.length;i++){
              data[i]['selected'] = false;
            }
              that.setData({
                ruleList: data
              })
            console.info(that.data.ruleList);
          }else{
            that.setData({
              discountsMoneyShow:false
            })
          }
      },
      fail: function (error) {
        console.info(error);
      }
    })
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
  //积分选择方法
  checkboxJFChange:function(e){
     var that = this;
     //app.toast('成功');
     console.info(app.globalData.shopid);
  },
  /**
   * 显示会员卡设置区域
   */
  addMember:function(){
    var that = this;
    that.setData({
      memberShow: true
    })
  },
  // 显示修改实付金额页面
  showUpdateAccount:function(){
    var that = this;
    that.setData({
      isShowUpdateAccount: true
    })
  },
  // 隐藏修改实付金额页面
  closeUpdateAccount: function () {
    var that = this;
    that.setData({
      isShowUpdateAccount: false
    })
  },
  //修改按钮确认
  confirmNewAccount:function(){
    this.setData({
      trueMoney:parseFloat(this.data.newAccount)*100
    });
    this.closeUpdateAccount();
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
   * 查看优惠规则
   */
  showCoupon:function(){
    var that = this;
    that.setData({
      couponShow: true
    })
  },
  /**
   * 选择优惠券规则
   */
  seleCoupon:function(e){
    var that = this;
    //当前选中的优惠规则ID
    var currentSelectedRuleId = e.currentTarget.dataset.id;
    var dataArray = that.data.ruleList;
    for(var i = 0; i < dataArray.length;i++){
      if (dataArray[i].preferential_rule_pk == currentSelectedRuleId ){
          dataArray[i].selected = true;
      }else{
        dataArray[i].selected = false;
      }
    }
    that.computeFavorMoney(currentSelectedRuleId);
    that.setData({
      couponShow: false,
      ruleList:dataArray
    })
  },
  //计算优惠金额
  computeFavorMoney:function(rulePk){
    var that = this;
    app.sendRequest({
      url: "ShopInfo_select_loadFavorMoney",
      method: "post",
      data: {
        RULE_PK:rulePk,
        ORDER_PK:ORDER_PK
      },
      success: function (res) {
        var data = res.data.data;
        if (res.data.code == '0000') {
          var favorName = res.data.data.favorName;
          if(favorName == '随机满减'){
            if (firstSJMoney == -1){
              firstSJMoney = res.data.data.favourMoney;
              that.setData({
                favorMoney: firstSJMoney
              })
            }else{
              that.setData({
                favorMoney: firstSJMoney
              })
            }
          }else{
            that.setData({
              favorMoney: res.data.data.favourMoney
            })
          }
        } 
      },
      fail: function (error) {
        console.info(error);
      }
    })
  },
  /**
   * 选择支付方式
   */
  selectPay:function(e){
    var that = this;
    payWay = e.currentTarget.dataset.payway
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
    } else if (currentTab == 1) {//如果选的是现金支付
      //that.data.wzShow = true
      var tempMoney = that.data.trueMoney;
      //获取店员开关的配置
      let setting = wx.getStorageSync('setting');
      if (setting.CHECK_XJSYT == 'true'){
        app.pageTurns('../calculator/calculator?money=' + tempMoney + '&orderId=' + ORDER_PK);
      }else{
        that.sendPay("1");
      }
      
    }  else if (currentTab == 3){//如果选的是微信或者支付宝支付
      //that.data.wzShow = true
      app.pageTurns('../payMent/payMent?money=' + trueMoney + '&orderId=' + ORDER_PK + '&orderType=1');
    } else if (currentTab == 2){
      that.scanCode()
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
    //根据当前店铺的id，用户输入的会员卡号判断会员卡是否存在
    app.sendRequest({
      url: "VipCard_select_selectVipCardListByShopIdAndVipNumber",
      method: "post",
      data: {
        vipNumber: that.data.vipNumber,
        shopId: app.globalData.shopid
      },
      success: function (res) {
        console.info(res.data.code);
        if (res.data.code == '9999'){
          app.toast("会员卡不存在");
        }else{ //会员卡号存在，初始化可用积分，储值
          that.setData({
            kyjf: res.data.data[0].USER_VCARD_JF,
            kdje: res.data.data[0].USER_VCARD_JF,
            kycz: res.data.data[0].USER_VCARD_CZ
          });
        }
      },
      fail: function (error) {
        console.info(error);
      }
    });
    that.setData({
      wzShow: false,
      couponShow:false,
      memberShow:false
    })
  },

  /**
   * 支付相关
   */
  // payWay:function(e){
  //   var that = this;
  //   var type = e.currentTarget.dataset.type;
  //   console.log(type)
  //   if(type == '0'){
  //     that.sendPay(payWay + '0')
  //   }else if(type == '2'){
  //       that.sendPay(payWay + '2',function success(res){
  //       app.pageTurns('../payMent/payMent?money=' + trueMoney + '&orderId=' + ORDER_PK);
  //     })
  //   }else{
  //     wx.scanCode({
  //       onlyFromCamera:true,
  //       scanType: ['qrCode'],
  //       success:function(res){
  //         //扫码成功
  //         console.log(res)
  //         var code = res.result
  //         if (code != null){
  //           //进行支付前先生成支付订单
  //           that.sendPay(payWay + '1', function success(res) {
  //             //进行支付
  //             app.sendRequest({
  //               url: 'ShopScanPay',
  //               method: "post",
  //               data: {
  //                 qrCode: code,
  //                 //openid: wx.getStorageSync('openid'),
  //                 payWay: payWay,
  //                 ORDER_PK: ORDER_PK
  //               },
  //               success: function (res) {
  //                 console.info(res)
  //                 if (res.data.code == '0000') {
  //                   if (res.data.data.result == 'A') {
  //                     wx.showModal({
  //                       title: '提示',
  //                       showCancel: false,
  //                       content: '等待用户确认支付',
  //                       success: function (res) { }
  //                     })
  //                   } else if (res.data.data.result == 'S') {
  //                     app.toast('支付成功')
  //                     app.reLaunch('../index/index?page=../indent/indent')
  //                   }

  //                 } else {
  //                   wx.showModal({
  //                     title: '提示',
  //                     showCancel: false,
  //                     content: '支付失败,原因:' + res.data,
  //                     success: function (res) { }
  //                   })
  //                 }
  //               },
  //               fail: function (error) {
  //                 app.hintBox('支付失败')
  //               }
  //             })
  //           })
  //         }
  //       },
  //       fail:function(error){
  //         console.log(error)
  //         wx.showToast({
  //           title: error,
  //         })
  //       }
  //     })
  //   }
  // },
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
        payWay: payWay,
        trueMoney: trueMoney
      },
      success: function (res) {
        if (fun != undefined){
          fun(res)
        }else{
          if (res.data.code == "0000") {
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
      if (page == '../founding/founding' && app.globalData.appSetting.CHECK_TDKT == 'true'){
    //   app.reLaunch('../index/index?page=../founding/founding')
          app.noFlushBackIndexPage(true)
      } else if (page == '../indent/indent'){
    //   app.reLaunch('../index/index?page=../indent/indent')
          app.noFlushBackIndexPage(false, undefined,page)
    }else{
    //   app.reLaunch('../index/index?page='+page)
          app.noFlushBackIndexPage(false)
    }
  },
  scanCode:function(){
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: function (res) {
        //扫码成功
        console.log(res)
        var code = res.result
        if (code != null) {
          //进行支付前先生成支付订单
          that.sendPay(payWay + '1', function success(res) {
            //进行支付
            app.sendRequest({
              url: 'ShopScanPay',
              orderType:'1',
              method: "post",
              data: {
                qrCode: code,
                //openid: wx.getStorageSync('openid'),
                payWay: payWay,
                ORDER_PK: ORDER_PK,
                shopId: app.globalData.shopid
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
                    //语音提醒支付成功
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
      fail: function (error) {
        console.log(error)
        wx.showToast({
          title: error,
        })
      }
    })
  }
})