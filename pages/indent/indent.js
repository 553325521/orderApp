// pages/indent/indent.js
var app = getApp()
var common = require('../../utils/common.js');
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    nav: [
      {
        type: 0,
        title: '未付款'
      }, {
        type: 1,
        title: '已付款'
      }, {
        type: 2,
        title: '全部'
      }
    ],
    currentTab: 0,
    date: '',
    startIndex: [],
    endIndex: [],
    year: 2015,
    orderArray: {},
    orderCount: {}
  },
/**
 * 声明周期函数
 */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      this.init();
    },
    moved: function () { console.log("组件被moved")},
    //组件被移除
    detached: function () { console.log("detached")},
  },
  
/**
 * page的生命周期
 */
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {this.init();console.log("页面show") },
    hide: function () { },
    resize: function () { },
  },


/**
 * 自定义方法函数
 */
methods:{
  //初始化页面
  init:function(){
    var that = this;
    var date = wx.getStorageSync('datepicker');
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var year = myDate.getFullYear();
    that.data.startIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 2, 23, 0, 0]
    that.data.endIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 22, 0, 59]
    if (date == '') {
      date = [];
      var yeas = common.getYears();
      var months = common.getMonths();
      var days = common.getDays().days1;
      var hours = common.getHours();
      var mins = common.getMins();
      date[0] = yeas;
      date[1] = '-';
      date[2] = months;
      date[3] = '-';
      date[4] = days;
      date[5] = hours;
      date[6] = ':';
      date[7] = mins;
      wx.setStorageSync('datepicker', date);
    }
    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
      date[4] = common.getDays().days4
    } else if (month == 2) {
      if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
        date[4] = common.getDays().days1
      } else {
        date[4] = common.getDays().days2
      }
    } else {
      date[4] = common.getDays().days3
    }
    that.setData({
      date: date,
      startIndex: that.data.startIndex,
      endIndex: that.data.endIndex
    });
    that.loadOrderNumber();
    that.loadOrderData();
  },
  //加载订单数量
  loadOrderNumber: function(){
    let that = this;
    var startTime = that.data.date[0][that.data.startIndex[0]] + "-" + that.data.date[2][that.data.startIndex[2]] + "-" + that.data.date[4][that.data.startIndex[4]] + " " + that.data.date[5][that.data.startIndex[5]] + ":" + that.data.date[7][that.data.startIndex[7]];
    var endTime = that.data.date[0][that.data.endIndex[0]] + "-" + that.data.date[2][that.data.endIndex[2]] + "-" + that.data.date[4][that.data.endIndex[4]] + " " + that.data.date[5][that.data.endIndex[5]] + ":" + that.data.date[7][that.data.endIndex[7]];
    if (that.data.date[5][that.data.startIndex[5]] == 24) {
      startTime = that.data.date[0][that.data.startIndex[0]] + "-" + that.data.date[2][that.data.startIndex[2]] + "-" + (parseInt(that.data.date[4][that.data.startIndex[4]]) + 1) + " 00:" + that.data.date[7][that.data.startIndex[7]];
    }
    if (that.data.date[5][that.data.endIndex[5]] == 24) {
      var endTime = that.data.date[0][that.data.endIndex[0]] + "-" + that.data.date[2][that.data.endIndex[2]] + "-" + (parseInt(that.data.date[4][that.data.endIndex[4]]) + 1) + " 00:" + that.data.date[7][that.data.endIndex[7]];
    }
    var payState = that.data.currentTab;
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderNumber.json',
      method: "post",
      data: {
        CREATE_TIME: startTime,
        END_TIME: endTime,
        FK_SHOP: app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          console.info(res.data);
          var orderCountMap = new Map();
           orderCountMap.set("first", 0);
           orderCountMap.set("second", 0);
          if(res.data.data.length !=0 ){
              for(var i = 0;i < res.data.data.length;i++){
                if (res.data.data[i].ORDER_PAY_STATE == "0"){
                  orderCountMap.set("first", res.data.data[i].ORDER_NUMBER);
                }else{
                  orderCountMap.set("second", res.data.data[i].ORDER_NUMBER);
                }
              }
          }
           that.data.orderCount = JSON.parse(that.mapToJson(orderCountMap));
           that.setData({
             orderCount: that.data.orderCount
           });
           console.info(that.data.orderCount);
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单数量失败',
        })
      }
    })
  },
  //加载订单数据
    loadOrderData:function () {
    let that = this;
    var startTime = that.data.date[0][that.data.startIndex[0]] + "-" + that.data.date[2][that.data.startIndex[2]] + "-" + that.data.date[4][that.data.startIndex[4]] + " " + that.data.date[5][that.data.startIndex[5]] + ":" + that.data.date[7][that.data.startIndex[7]];
    var endTime = that.data.date[0][that.data.endIndex[0]] + "-" + that.data.date[2][that.data.endIndex[2]] + "-" + that.data.date[4][that.data.endIndex[4]] + " " + that.data.date[5][that.data.endIndex[5]] + ":" + that.data.date[7][that.data.endIndex[7]];
    if (that.data.date[5][that.data.startIndex[5]] == 24) {
      startTime = that.data.date[0][that.data.startIndex[0]] + "-" + that.data.date[2][that.data.startIndex[2]] + "-" + (parseInt(that.data.date[4][that.data.startIndex[4]]) + 1) + " 00:" + that.data.date[7][that.data.startIndex[7]];
    }
    if (that.data.date[5][that.data.endIndex[5]] == 24) {
      var endTime = that.data.date[0][that.data.endIndex[0]] + "-" + that.data.date[2][that.data.endIndex[2]] + "-" + (parseInt(that.data.date[4][that.data.endIndex[4]]) + 1) + " 00:" + that.data.date[7][that.data.endIndex[7]];
    }
    var payState = that.data.currentTab;
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderDataByTime.json',
      method: "post",
      data: {
        CREATE_TIME: startTime,
        END_TIME:endTime,
        ORDER_PAY_STATE:payState,
        FK_SHOP:app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.dealOrderDate(res.data.data);
          console.info("res");
          console.info(res.data.data);
          that.data.orderArray = that.dealOrderDate(res.data.data);
          console.info("array");
          console.info(that.data.orderArray);
          that.setData({
            orderArray: that.data.orderArray
          });
          console.info(that.data.orderArray);
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
  dealOrderDate:function (data){
    var that = this;
    var dateStr = "";
    var allMoney = 0;
    var orderList = [];
    var orderMap = new Map();
    var orderBigList = [];
    for(var i = 0; i < data.length;i++){
      dateStr = data[i].CREATE_TIME.substring(0, 10);
      if(!orderMap.has(dateStr)){
          allMoney = 0;
          orderList = [];
          orderMap.clear();
          for(var j = 0;j < data.length;j++){
            if (data[j].CREATE_TIME.indexOf(dateStr)!=-1){
              data[j].SF = data[j].CREATE_TIME.substring(11);
              if (data[j].ORDER_PAY_WAY == 1){
                data[j].payWay = '现付';
              } else if (data[j].ORDER_PAY_WAY == 2){
                data[j].payWay = '网付';
              }else{
                data[j].payWay = '';
              }
                orderList.push(data[j]);
                allMoney = allMoney + parseFloat(data[j].TOTAL_MONEY);
            }
          }
          orderMap.set(dateStr, null);
          orderMap.set("data", orderList);
          orderMap.set("keyName",dateStr);
          orderMap.set("totalMoney",allMoney);
          if (that.data.currentTab == 0){
            orderMap.set("timeWidth", "180rpx");
            orderMap.set("seatWidth", "180rpx");
            orderMap.set("partWidth", "180rpx");
            orderMap.set("moneyWidth", "auto");
          }else{
            orderMap.set("timeWidth", "140rpx");
            orderMap.set("seatWidth", "140rpx");
            orderMap.set("partWidth", "140rpx");
            orderMap.set("moneyWidth", "140rpx");
          }

          orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
      }
    }
    return orderBigList;
  },
  strMapToObj:function (strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  },
  /**
  *map转换为json
  */
  mapToJson:function (map) {
    return JSON.stringify(this.strMapToObj(map));
  },
  getPhoneNumber:function (e) {
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '授权失败,原因:' + e.detail.errMsg,
        success: function (res) { }
      })
    } else {
          wx.request({
            url: app.globalData.basePath + 'json/Wx_checkAesKey.json',
            method: "post",
            data: {
              iv: e.detail.iv,
              openid: wx.getStorageSync('openid'),
              encryptedData: e.detail.encryptedData
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success: function (res) {
              console.info(res)
              if (res.data.code == '0000') {
                wx.showToast({
                  title: '授权成功',
                })
              } else {
                wx.showModal({
                  title: '提示',
                  showCancel: false,
                  content: '授权失败,原因:' + res.data.data,
                  success: function (res) { }
                })
              }
            },
            fail: function (error) {
              wx.showToast({
                title: '登录失败',
              })
            }
          })
    } 
  },

  //定时任务
  // updateOrderNumber:function(that){
  //   setTimeout(function () {
  //     that.loadOrderNumber()
  //     that.updateOrderNumber(that);
  //   },60000)
  // },
  swichNav:function (e) {
    var that = this;
    var types = e.currentTarget.dataset.type;
    that.setData({
      currentTab: types,
    });
    that.loadOrderData();
  },
  // 
  bindStartDateChange:function (e) {
    var that = this;
    this.setData({
      startIndex: e.detail.value
    });
    that.loadOrderData();
    that.loadOrderNumber();
  },
  bindEndDateChange:function (e) {
    var that = this;
    this.setData({
      endIndex: e.detail.value
    });
    that.loadOrderData();
    that.loadOrderNumber();
  },
  // 
  bindDateColumnChange:function (e) {
    var that = this;
    var column = e.detail.column;
    var value = e.detail.value;
    if (column == 0) {
      that.data.year = value + 1990;
    }
    if (column == 2) {
      value = value + 1

      if (value == 1 || value == 3 || value == 5 || value == 7 || value == 8 || value == 10 || value == 12) {
        that.data.date[4] = common.getDays().days4
      } else if (value == 2) {
        var year = that.data.year
        console.log(year)
        if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
          that.data.date[4] = common.getDays().days1
        } else {
          that.data.date[4] = common.getDays().days2
        }
      } else {
        that.data.date[4] = common.getDays().days3
      }
    }
    that.setData({
      date: that.data.date
    })
  },
  navTo:function (e){
    var orderPK = e.currentTarget.dataset.id;
    console.info(orderPK);
    app.pageTurns(`../indent/indentDateil?type=${this.data.currentTab}&ORDER_PK=${orderPK}`)
  }
}
})