// pages/takeOut/takeOut.js
var app = getApp();
var pageTitle = "外卖";

var common = require('../../utils/common.js');
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    nav: [
      {
        type: 1,
        title: '待确定',
        orderNumber:0
      }, {
        type: 5,
        title: '待配送',
        orderNumber: 0
      }, {
        type: 9,
        title: '已完成',
        orderNumber: 0
      }
    ],
    currentTab: 1,
    deliveryType: [
      {
        isIn: false,
        title: '智慧云',
      }, {
        isIn: false,
        title: '饿了么'
      }, {
        isIn: true,
        title: '美团外卖'
      }, {
        isIn: false,
        title: '百度外卖'
      }
    ],
    wmOrderData: [],
    date: '',
    startIndex:[],
    endIndex: [],
    year:2015,
    pageShow:false,
    isExistData:true
  },

  /**
     * 组件周期函数
     */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle)
      var that = this;
      var date = wx.getStorageSync('datepicker');
      var myDate = new Date();
      var month = myDate.getMonth() + 1;
      var year = myDate.getFullYear();
      that.data.startIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 0, 0, 0];
      that.data.endIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 23, 0, 59];
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
        endIndex: that.data.endIndex,
        pageShow:false,
        isExistData: true
      })
      this.loadWMData();
    },
    moved: function () { console.log("组件被moved") },
    //组件被移除
    detached: function () { console.log("detached") },
  },
  /**
   * page的生命周期
   */
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      console.log("页面show")
      //this.loadWMData();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 自定义方法
   */
  methods: {
    /**选择状态 */
    swichNav: function (e) {
      var that = this;
      var types = e.currentTarget.dataset.type;
      that.setData({
        currentTab: types,
        wmOrderData: []
      });
      that.setData({
        pageShow: false,
        isExistData: true
      })
      this.loadWMData();
    },
    // 选择时间段
    bindStartDateChange:function(e){
      this.setData({
        startIndex: e.detail.value,
        pageShow: false,
        isExistData: true
      });
      this.loadWMData();
    },
    bindEndDateChange: function (e) {
      this.setData({
        endIndex: e.detail.value,
        pageShow: false,
        isExistData: true
      });
      this.loadWMData();
    },
    // 
    bindDateColumnChange:function(e){
      var that = this;
      var column = e.detail.column;
      var value = e.detail.value;
      if (column == 0){
        that.data.year = value+1990;
      }
      if (column == 2){
        value = value+1
        
        if (value == 1 || value == 3 || value == 5 || value == 7 || value == 8 || value == 10 || value == 12 ){
          that.data.date[4] = common.getDays().days4
        } else if (value == 2){
          var year = that.data.year
          console.log(year)
          if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)){
            that.data.date[4] = common.getDays().days1
          }else{
            that.data.date[4] = common.getDays().days2
          }
        }else{
          that.data.date[4] = common.getDays().days3
        }
      }
      that.setData({
        date: that.data.date
      })
    },
    /**
     * 选择配送方式
     */
    selectDistributionMode:function(e){
      var that = this;
      var index = e.currentTarget.dataset.index;
      that.data.deliveryType[index].isIn = !that.data.deliveryType[index].isIn;
      that.setData({
        deliveryType: that.data.deliveryType,
        wmOrderData: []
      });
      that.setData({
        pageShow: false,
        isExistData: true
      })
      this.loadWMData();
    },
    // 加载外卖数据
    loadWMData: function () {
        console.info('加载外卖数据')
      var that = this;
      //选择状态 1:待确定 5：待配送 9:已完成
      var orderState = that.data.currentTab;
      //选择时间
      var startTime = that.data.date[0][that.data.startIndex[0]] + "-" + that.data.date[2][that.data.startIndex[2]] + "-" + that.data.date[4][that.data.startIndex[4]] + " " + that.data.date[5][that.data.startIndex[5]] + ":" +
        that.data.date[7][that.data.startIndex[7]];
      var endTime = that.data.date[0][that.data.endIndex[0]] + "-" + that.data.date[2][that.data.endIndex[2]] + "-" + that.data.date[4][that.data.endIndex[4]] + " " + that.data.date[5][that.data.endIndex[5]] + ":" + that.data.date[7]
    [that.data.endIndex[7]];
      //选择外卖来源
      var pt = that.data.deliveryType;
      var selectPt = [];
      var j = 0;
      for (var i = 0; i < pt.length; i++) {
        if (!pt[i].isIn) {
          selectPt[j] = pt[i].title;
          j++;
        }
      }
      var selectPtStr = selectPt.join(",");
      app.sendRequest({
        url: "Order_select_loadWMOrderData",
        method: "post",
        data: {
          FK_SHOP: app.globalData.shopid,
          selectSource: selectPtStr,
          startTime: startTime,
          endTime: endTime,
          orderStatus: that.data.currentTab
        },
        success: function (res) {
          var orderNumberMap = res.data.data.orderNumber;
          var tabNumberData = that.data.nav;
          for (var i = 0; i < tabNumberData.length; i++) {
            if (tabNumberData[i].title == '待确定') {
              tabNumberData[i].orderNumber = orderNumberMap.noConfirmNumber;
            } else if (tabNumberData[i].title == '待配送') {
              tabNumberData[i].orderNumber = orderNumberMap.isConfirmNumber;
            } else {
              tabNumberData[i].orderNumber = orderNumberMap.isFinishNumber;
            }
          }
          that.setData({
            nav: tabNumberData
          })
          if (res.data.code == '0000' && res.data.data.orderData.length != 0) {
            var orderArray = that.dealOrderDate(res.data.data.orderData);
            that.setData({
              wmOrderData: orderArray,
            })
          }else{
            that.setData({
              isExistData: false
            })
          }
          that.setData({
            pageShow:true
          })
        },
        fail: function (error) {
          console.info(error);
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
                    data[j].SF = data[j].CREATE_TIME.substring(10, 16);
                    data[j].WM_USERPHONE = "*" + data[j].WM_USERPHONE.substring(7);
                    orderList.push(data[j]);
                    allMoney = allMoney + parseFloat(data[j].ORDER_SHOPMONEY);
                }
          }
          orderMap.set(dateStr, null);
          orderMap.set("data", orderList);
          orderMap.set("keyName", dateStr);
          orderMap.set("totalMoney", allMoney);
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
    },
    /**
     * 订单详情
     */
    navTo:function(e){
      var currentItem = e.currentTarget.dataset.id;
      console.info(currentItem.SOURCENAME);
        app.pageTurns(`../takeOut/takeOutDateil?type=${this.data.currentTab}&ORDER_PK=${currentItem.ORDER_PK || currentItem.MTWM_ORDER_PK}&SOURCE_NAME=${currentItem.SOURCENAME}`)
    }
  }
})