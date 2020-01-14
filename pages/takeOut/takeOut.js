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
        type: null,
        title: '全部',
        orderNumber: 0
      }
    ],
    currentTab: 1,
    deliveryType: [
      {
        isIn: false,
        title: '智云',
      }, {
        isIn: false,
        title: '饿了么'
      }, {
        isIn: false,
        title: '美团外卖'
      }, {
        isIn: false,
        title: '星选'
      }
    ],
    wmOrderData: [],
    date: '',
    startIndex:[],
    endIndex: [],
    year:2015,
    pageShow:false,
    isExistData:true,
    font_color: "select-before-color",
    select_img_name: "select_down",
    selectShow: 0,
    dateArr: ['今天', '昨天', '本周', '本月', '本年'],
    dateIndex: 0,
    takeView: 54,
    dateAreaIsShow: false,
    start_date: '2019-01-01',
    end_date: '2019-01-01',
    select_id: 0,
    isScroll: 'scroll' //界面是否出现滚动条
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
    selectBtn: function (e) {
      var id = e.currentTarget.dataset.id;
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
        font_color: "select-before-color",
        select_img_name: "select_down",
        selectShow: 0,
        isScroll: 'scroll'
      })
    },
    //点击筛选
    openSelect: function () {
      var that = this;
      var current_font_color = that.data.font_color;
      if (current_font_color == 'select-before-color') {
        that.setData({
          font_color: "select-after-color",
          select_img_name: "select_down_red",
          selectShow: 92.7,
          isScroll: 'hidden'
        })
      } else {
        that.setData({
          font_color: "select-before-color",
          select_img_name: "select_down",
          selectShow: 0,
          isScroll: 'scroll'
        })
      }
    },
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
    cancelChoose: function () {
      var that = this;
      for (var i = 0; i < that.data.deliveryType.length; i++) {
        that.data.deliveryType[i].isIn = false;
      }
      that.setData({
        select_id: 0,
        dateAreaIsShow: false,
        deliveryType: that.data.deliveryType,
        takeView: 54
      });
      this.loadWMData();
    },
    choose:function(){
      var that = this;
      that.loadWMData();//加载订单数据
      that.closeSelectArea();//关闭筛选界面
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
      var choosePay = "";
      if (that.data.select_id == 5) {
        choosePay = '自定义';
      } else {
        choosePay = that.data.dateArr[that.data.select_id];
      }
      app.sendRequest({
        url: "Order_select_loadWMOrderData",
        method: "post",
        data: {
          FK_SHOP: app.globalData.shopid,
          selectSource: selectPtStr,
          START_DATE: that.data.start_date,
          END_DATE: that.data.end_date,
          DATE_WAY: choosePay,
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