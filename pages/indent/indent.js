// pages/indent/indent.js
var app = getApp()
var common = require('../../utils/common.js');
Page({
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
    year: 2015
  },
  onLoad: function (options) {
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
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  swichNav: function (e) {
    var that = this;
    var types = e.currentTarget.dataset.type;
    that.setData({
      currentTab: types,
    })
  },
  // 
  bindStartDateChange: function (e) {
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
  bindDateColumnChange: function (e) {
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
  navTo:function(){
    app.pageTurns(`indentDateil?type=${this.data.currentTab}`)
  }
})