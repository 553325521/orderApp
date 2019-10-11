// pages/summary/summary.js
var app = getApp();
Page({
  data: {
    pageShow:false,
    shopArr: [],
    shopIndexArray:[],
    shopIndex: 0,
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
    cashPayOrderMoney: 0,
    shaiXuanBtnIsActive:false, //筛选按钮是否被激活
    selectShow: 0,
    start_date: '2019-01-01',
    end_date: '2019-01-01',
    dateArr: ['今天', '昨天', '本周', '本月', '本年'],
    dateIndex: 0,
    select_id: -1,
    takeView:54
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadShopRunData("今天");
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
  selectBtn: function (e) {
    var id = e.currentTarget.dataset.id;
    console.info(e);
    var that = this;
    if (id == 5) {
      that.setData({
        dateAreaIsShow: true,
        takeView: 0
      })
    } else {
      that.setData({
        dateAreaIsShow: false,
        takeView: 54
      })
    }
    that.setData({
      select_id: id
    })
  },
  //关闭筛选
  closeSelectArea: function () {
    var that = this;
    that.setData({
      selectShow: 0,
      shaiXuanBtnIsActive: false
    })
  },
  cancelChoose: function () {
    var that = this;
    that.setData({
      select_id: -1,
      dateAreaIsShow: false,
      takeView: 54
    });
  },
  choose: function () {
    var that = this;
    var choosePay = "";
    if (that.data.select_id == 5) {
      choosePay = '自定义';
    } else {
      choosePay = that.data.dateArr[that.data.select_id];
    }
    this.loadShopRunData(choosePay);
    this.closeSelectArea();
    },
  bindStartDateChange: function (e) {
    this.setData({
      start_date: e.detail.value
    })
  },
  bindEndDateChange: function (e) {
    this.setData({
      end_date: e.detail.value
    })
  },
  //点击筛选
  openSelect: function () {
    var that = this;
    var isActive = that.data.shaiXuanBtnIsActive;
    if (!isActive) {
      that.setData({
        selectShow: 100,
        shaiXuanBtnIsActive:true
      })
    } else {
      that.setData({
        selectShow: 0,
        shaiXuanBtnIsActive:false
      })
    }
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
loadShopRunData:function(selectTime){
  var that = this;
  //当前选择的店铺
  var shopId = app.globalData.shopid;
  wx.request({
    url: app.globalData.basePath + "json/Shop_load_loadShopRunData.json",
    method: "post",
    data: {
      FK_SHOP:shopId,
      selectTime:selectTime,
      START_DATE:that.data.start_date,
      END_DATE:that.data.end_date
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
          totalOrderMoney: res.data.data.totalOrderMoney,
          wxPayOrderNumber: res.data.data.wxPayOrderNumber,
          wxPayOrderMoney: res.data.data.wxPayOrderMoney,
          aliPayOrderNumber: res.data.data.aliPayOrderNumber,
          aliPayOrderMoney: res.data.data.aliPayOrderMoney,
          posPayOrderNumber: res.data.data.posPayOrderNumber,
          posPayOrderMoney: res.data.data.posPayOrderMoney,
          cashPayOrderNumber: res.data.data.cashPayOrderNumber,
          cashPayOrdeMoney: res.data.data.cashPayOrdeMoney,
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

},
  navTo: function (e) {
    var url = e.currentTarget.dataset.url
    app.pageTurns(url)
  }

})