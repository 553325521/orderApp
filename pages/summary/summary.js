// pages/summary/summary.js
var app = getApp();
Page({
  data: {
    pageShow:false,
    shopArr: [],
    shopIndexArray:[],
    shopIndex: 0,
    dateArr: ['今天', '昨天', '本周', '本月'],
    dateIndex: 0,
    memberNumber: 0,
    innerOrderNumber:0,
    outOrderNumber:0,
    produceJF: 0,
    customJF:0,
    sendCardNumber:0,
    useCardNumber: 0,
    totalOrderNumber:0,
    wxPayOrderNumber:0,
    aliPayOrderNumber:0,
    posPayOrderNumber:0,
    cashPayOrderNumber:0,
    totalOrderMoney: 0,
    wxPayOrderMoney: 0,
    aliPayOrderMoney: 0,
    posPayOrderMoney: 0,
    cashPayOrderMoney: 0
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadShopRunData();
  },
  bindShopChange:function(e){
    this.setData({
      pageShow: false,
      shopIndex:e.detail.value
    });
    this.loadShopRunData();
  },
  bindDateChange:function(e){
    this.setData({
      pageShow: false,
      dateIndex: e.detail.value
    });
    this.loadShopRunData();
  },
  //加载当前用户管理的商铺
  // loadUserShopArray:function(){
  //   var unionId = wx.getStorageSync('unionId');
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.basePath +"json/Shop_load_loadShopSideByUserUnionId.json",
  //     method: "post",
  //     data: {
  //       unionId:unionId
  //     },
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  //     },
  //     success: function (res) {
  //       var shopArray = [];
  //       var shopIndexArray = [];
  //       for(var i = 0;i < res.data.data.length;i++){
  //         shopArray[i] = res.data.data[i].SHOP_NAME;
  //         shopIndexArray[i] = res.data.data[i].SHOP_ID;
  //       }
  //       that.setData({
  //           shopArr:shopArray,
  //           shopIndexArray: shopIndexArray
  //       })
  //       that.loadShopRunData();
  //     },
  //     fail: function (error) {
  //       console.log(error)
  //       wx.showToast({
  //         title: '报表获取商铺失败',
  //       })
  //     }
  //   })
  // },
//根据选择店铺和时间加载经营概况
loadShopRunData:function(){
  var that = this;
  //当前选择的时间
  var selectTime = that.data.dateArr[that.data.dateIndex];
  //当前选择的店铺
  var shopId = app.globalData.shopid;
  wx.request({
    url: app.globalData.basePath + "json/Shop_load_loadShopRunData.json",
    method: "post",
    data: {
      FK_SHOP:shopId,
      selectTime:selectTime
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: function (res) {
      if(res.data.code == '0000'){
        that.setData({
          pageShow: true,
          memberNumber: res.data.data.memberNumber,
          innerOrderNumber: res.data.data.innerOrderNumber,
          outOrderNumber: res.data.data.outOrderNumber,
          produceJF: res.data.data.produceJF,
          customJF: res.data.data.customJF,
          sendCardNumber: res.data.data.sendCardNumber,
          useCardNumber: res.data.data.useCardNumber,
          totalOrderNumber: res.data.data.totalOrderNumber,
          wxPayOrderNumber: res.data.data.wxPayOrderNumber,
          aliPayOrderNumber: res.data.data.aliPayOrderNumber,
          posPayOrderNumber: res.data.data.posPayOrderNumber,
          cashPayOrderNumber: res.data.data.cashPayOrderNumber,
        })
      }
    },
    fail: function (error) {
      console.log(error);
      wx.showToast({
        title: '店铺经营状况获取失败',
      })
    }
  })

}

})