// pages/takeOut/takeOut.js
var app = getApp();
var common = require('../../utils/common.js');
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    nav: [
      {
        type: 0,
        title: '待确定'
      }, {
        type: 1,
        title: '代配送'
      }, {
        type: 2,
        title: '已完成'
      }
    ],
    currentTab: 0,
    deliveryType:[
      {
        isIn: true,
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
    date: '',
    startIndex:[],
    endIndex: [],
    year:2015
  },

  /**
     * 组件周期函数
     */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      var that = this;
      var date = wx.getStorageSync('datepicker');
      var myDate = new Date();
      var month = myDate.getMonth() + 1;
      var year = myDate.getFullYear();
      that.data.startIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 7, 0, 0]
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
        endIndex: that.data.startIndex
      })
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
    show: function () { console.log("页面show") },
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
      })
    },
    // 选择时间段
    bindStartDateChange:function(e){
      this.setData({
        startIndex: e.detail.value,
        endIndex: e.detail.value
      })
    },
    bindEndDateChange: function (e) {
      this.setData({
        endIndex: e.detail.value
      })
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
        deliveryType: that.data.deliveryType 
      })
    },
    /**
     * 订单详情
     */
    navTo:function(){
      app.pageTurns(`takeOutDateil?type=${this.data.currentTab}`)
    }
  }
})