// pages/summary/summary.js
var app = getApp();
Page({
  data: {
    shopArr: ['五里店', '观音桥'],
    shopIndexArray:[],
    shopIndex: 0,
    dateArr: ['今天', '昨天', '本周', '本月'],
    dateIndex: 0,
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadUserShopArray();
  },
  bindShopChange:function(e){
    this.setData({
      shopIndex:e.detail.value
    });
  },
  bindDateChange:function(e){
    this.setData({
      dateIndex: e.detail.value
    });
  },
  //加载当前用户管理的商铺
  loadUserShopArray:function(){
    var unionId = wx.getStorageSync('unionId');
    var that = this;
    wx.request({
      url: app.globalData.basePath +"json/Shop_load_loadShopSideByUserUnionId.json",
      method: "post",
      data: {
        unionId:unionId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        var shopArray = [];
        var shopIndexArray = [];
        for(var i = 0;i < res.data.data.length;i++){
          shopArray[i] = res.data.data[i].SHOP_NAME;
          shopIndexArray[i] = res.data.data[i].SHOP_ID;
        }
        that.setData({
            shopArr:shopArray,
            shopIndexArray: shopIndexArray
        })
        that.loadShopRunData();
      },
      fail: function (error) {
        console.log(error)
        wx.showToast({
          title: '报表获取商铺失败',
        })
      }
    })
  },
//根据选择店铺和时间加载经营概况
loadShopRunData:function(){
  var that = this;
  //当前选择的时间
  var selectTime = that.data.dateArr[that.data.dateIndex];
  //当前选择的店铺
  var shopId = that.data.shopIndexArray[that.data.shopIndex];
  console.info(selectTime);
  console.info(shopId);
  // wx.request({
  //   url: app.globalData.basePath + "json/Shop_load_loadShopSideByUserUnionId.json",
  //   method: "post",
  //   data: {
      
  //   },
  //   header: {
  //     'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  //   },
  //   success: function (res) {
     
  //   },
  //   fail: function (error) {
  //     console.log(error)
  //     wx.showToast({
  //       title: '店铺经营状况获取失败',
  //     })
  //   }
  // })

}

})