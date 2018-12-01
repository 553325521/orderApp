// pages/consumptionStatistics/consumptionStatistics.js
var app = getApp();
Page({
  data: {
    shopArr: [],
    shopIndexArray: [],
    shopIndex: 0,
    dateArr: ['今天', '昨天', '本周', '本月'],
    dateIndex: 0,
    wayArr: ['微信', '支付宝', '现金', 'POS刷卡'],
    wayIndex: 0,
    orderArray: {},
    pageShow:false,
    isExistData:true
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadShopConsumeData();
  },
  //切换商铺事件
  bindShopChange: function (e) {
    this.setData({
      pageShow: false,
      shopIndex: e.detail.value
    });
    this.loadShopConsumeData();
  },
  //切换日期事件
  bindDateChange: function (e) {
    this.setData({
     pageShow: false,
      dateIndex: e.detail.value
    });
    this.loadShopConsumeData();
  },
  //切换支付方式事件
  bindPayWayChange:function(e){
    this.setData({
      pageShow: false,
      wayIndex: e.detail.value
    });
    this.loadShopConsumeData();
  },
  //加载当前用户管理的商铺
  // loadUserShopArray: function () {
  //   var unionId = wx.getStorageSync('unionId');
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.basePath + "json/Shop_load_loadShopSideByUserUnionId.json",
  //     method: "post",
  //     data: {
  //       unionId: unionId
  //     },
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  //     },
  //     success: function (res) {
  //       var shopArray = [];
  //       var shopIndexArray = [];
  //       for (var i = 0; i < res.data.data.length; i++) {
  //         shopArray[i] = res.data.data[i].SHOP_NAME;
  //         shopIndexArray[i] = res.data.data[i].SHOP_ID;
  //       }
  //       that.setData({
  //         shopArr: shopArray,
  //         shopIndexArray: shopIndexArray
  //       })
  //       that.loadShopConsumeData();
  //     },
  //     fail: function (error) {
  //       console.log(error)
  //       wx.showToast({
  //         title: '报表获取商铺失败',
  //       })
  //     }
  //   })
  // },
  //根据选择店铺、时间、支付方式加载消费统计
  loadShopConsumeData: function () {
    var that = this;
    //当前选择的时间
    var selectTime = that.data.dateArr[that.data.dateIndex];
    //当前选择的店铺
    var shopId = app.globalData.shopid;
    //当前选择的支付方式
    var payWay = that.data.wayIndex;
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderDataByShopOrTimeOrWay.json',
      method: "post",
      data: {
        selectTime: selectTime,
        ORDER_PAY_WAY: payWay,
        FK_SHOP: shopId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.dealOrderDate(res.data.data);
          that.data.orderArray = that.dealOrderDate(res.data.data);
          that.setData({
            pageShow: true,
            orderArray: that.data.orderArray
          });
          if(that.data.orderArray.length!=0){
            that.setData({
              isExistData: true
            })
          }else{
            that.setData({
              isExistData: false
            })
          }
        }else{
            that.setData({
              isExistData: false
            })
        }
       
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单数据失败',
        })
      }
    })
    },
  //分组订单数据
  dealOrderDate: function (data) {
    var that = this;
    var dateStr = "";
    var allMoney = 0;
    var orderList = [];
    var orderMap = new Map();
    var orderBigList = [];
    for (var i = 0; i < data.length; i++) {
      dateStr = data[i].CREATE_TIME.substring(0, 10);
      if (!orderMap.has(dateStr)) {
        allMoney = 0;
        orderList = [];
        orderMap.clear();
        for (var j = 0; j < data.length; j++) {
          if (data[j].CREATE_TIME.indexOf(dateStr) != -1) {
            data[j].SF = data[j].CREATE_TIME.substring(11);
            if (data[j].ORDER_PAY_WAY == 0) {
              data[j].payWay = '微信';
            } else if (data[j].ORDER_PAY_WAY == 2) {
              data[j].payWay = 'POS';
            } else if (data[j].ORDER_PAY_WAY == 1){
              data[j].payWay = '支付宝';
            }else {
              data[j].payWay = '现金';
            }
            orderList.push(data[j]);
            allMoney = allMoney + parseFloat(data[j].TOTAL_MONEY);
          }
        }
        orderMap.set(dateStr, null);
        orderMap.set("data", orderList);
        orderMap.set("keyName", dateStr);
        orderMap.set("totalMoney", allMoney);
        orderMap.set("timeWidth", "140rpx");
        orderMap.set("seatWidth", "100rpx");
        orderMap.set("partWidth", "140rpx");
        orderMap.set("moneyWidth", "120rpx");
        orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
      }
    }
    return orderBigList;
  },
  strMapToObj: function (strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  },
  /**
  *map转换为json
  */
  mapToJson: function (map) {
    return JSON.stringify(this.strMapToObj(map));
  }
})