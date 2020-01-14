// pages/indent/indent.js
var app = getApp()
var pageTitle = "订单";
var currentTab = 0;
var orderArray = {};//订单的数组
var onerpx = 0.5; //1rpx对应多少像素
var lastClientY = 0;//上一次点击的位置
var flush = false;

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
    currentTab: currentTab,
    date: '',
    select_id: 0,
    dateArr: ['今天', '昨天', '本周', '本月', '本年'],
    font_color: "select-before-color",
    select_img_name: "select_down",
    selectShow: false, //控制下拉列表的显示隐藏，false隐藏、true显示
    start_date: '2019-01-01',
    end_date: '2019-01-01',
    dateAreaIsShow: false,
    startIndex: [],
    endIndex: [],
    year: 2015,
    orderArray: orderArray,
    orderCount: {},
    downflush:false,
    touchHeigh:48,
    scaleData:null,
    refreshFinishIsShow:false,
    touch:0,
    noDataIsShow:false,
    windowHeight: '',
    windowWidth: '',
    isScroll:'scroll' //界面是否出现滚动条
  },
/**
 * 声明周期函数
 */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle);
      this.init();
      var mobJson = app.getSystemInfo();
    },
    moved: function () { console.log("组件被moved")},
    //组件被移除
    detached: function () {
      console.log("detached");
      // this.triggerEvent('stopDownFlush');//停止下拉刷新,
    }
  },
  
/**
 * page的生命周期
 */
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      this.init();
      },
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
    onerpx = app.getSystemInfo().mob_onerpx
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var year = myDate.getFullYear();
    if (wx.getStorageSync("order_current_startIndex") == "" && wx.getStorageSync("order_current_endIndex") == "")
    {
      that.data.startIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 0, 0, 0]
      that.data.endIndex = [year - 1990, 0, month - 1, 0, myDate.getDate() - 1, 23, 0, 59]
    }else{
      that.data.startIndex = wx.getStorageSync("order_current_startIndex");
      that.data.endIndex = wx.getStorageSync("order_current_endIndex");
    }
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
  },
  //加载订单数量
  loadOrderNumber: function(){
    let that = this;
    var payState = currentTab;
    var choosePay = "";
    if (that.data.select_id == 5) {
      choosePay = '自定义';
    } else {
      choosePay = that.data.dateArr[that.data.select_id];
    }
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderNumber.json',
      method: "post",
      data: {
        START_DATE: that.data.start_date,
        END_DATE: that.data.end_date,
        DATE_WAY: choosePay,
        FK_SHOP: app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
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
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单数量失败',
        })
      },
      complete:function(){
        that.loadOrderData();
      }
    })
  },
  //关闭筛选
  closeSelectArea: function () {
    var that = this;
    that.setData({
      font_color: "select-before-color",
      select_img_name: "select_down",
      selectShow: 0,
      isScroll:'scroll'
    })
  },
  //点击筛选
  openSelect: function () {
    //this.cancelChoose();
    var that = this;
    var current_font_color = that.data.font_color;
    if (current_font_color == 'select-before-color') {
      that.setData({
        font_color: "select-after-color",
        select_img_name: "select_down_red",
        selectShow: 95,
        isScroll:'hidden'
      })
    } else {
      that.setData({
        font_color: "select-before-color",
        select_img_name: "select_down",
        selectShow: 0,
        isScroll:'scroll'
      })
    }
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
  //加载订单数据
    loadOrderData:function (way) {
      wx.showNavigationBarLoading()
    var that = this;
    var payState = currentTab;
    var choosePay = "";
    if (that.data.select_id == 5) {
        choosePay = '自定义';
    } else {
        choosePay = that.data.dateArr[that.data.select_id];
    }
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderDataByTime.json',
      method: "post",
      data: {
        START_DATE: that.data.start_date,
        END_DATE: that.data.end_date,
        ORDER_PAY_STATE:payState,
        DATE_WAY: choosePay,
        FK_SHOP:app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          console.info(res.data.data.length);
          that.dealOrderDate(res.data.data);
          orderArray = that.dealOrderDate(res.data.data);
          if(res.data.data.length == 0 || orderArray.length == 0){
              that.setData({
                noDataIsShow:true
              })
          }else{
            that.setData({
              noDataIsShow: false
            })
          }
          that.setData({
            orderArray: orderArray
          });
          that.setData({
            flushMessage: "刷新成功"
          })
        }else{
          that.setData({
            flushMessage: "刷新失败"
          })
        }
        wx.hideNavigationBarLoading()
        that.heightChange(48, 500);
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
      if(data[i].CREATE_TIME == undefined){
        dateStr = "数据日期解析异常";
        continue;
      }else{
        dateStr = data[i].CREATE_TIME.substring(0, 10);
      }
      if(!orderMap.has(dateStr)){
          allMoney = 0;
          orderList = [];
          orderMap.clear();
          for(var j = 0;j < data.length;j++){
            if (data[j].CREATE_TIME == undefined){
              //"数据日期解析异常";
              continue;
            }
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
          if (currentTab == 0){
            orderMap.set("timeWidth", "180rpx");
            orderMap.set("seatWidth", "180rpx");
            orderMap.set("partWidth", "160rpx");
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
    currentTab = e.currentTarget.dataset.type;
    that.setData({
      currentTab: currentTab,
    });
    that.loadOrderData();
  },
  // 
  // bindStartDateChange:function (e) {
  //   var that = this;
  //   this.setData({
  //     startIndex: e.detail.value
  //   });
  //   wx.setStorageSync("order_current_startIndex",that.data.startIndex);
  //   wx.setStorageSync("order_current_endIndex", that.data.endIndex);
  //   that.loadOrderData();
  //   that.loadOrderNumber();
  // },
  // bindEndDateChange:function (e) {
  //   var that = this;
  //   this.setData({
  //     endIndex: e.detail.value
  //   });
  //   wx.setStorageSync("order_current_endIndex", that.data.endIndex);
  //   that.loadOrderData();
  //   that.loadOrderNumber();
  // },
  // 
  cancelChoose: function () {
    var that = this;
    that.setData({
      select_id: 0,
      dateAreaIsShow: false,
      takeView: 54
    });
    that.loadOrderData();//加载订单数据
    that.loadOrderNumber();//加载订单数量
    that.closeSelectArea();//关闭筛选界面
  },
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
    var payStatus = e.currentTarget.dataset.status;
    app.pageTurns(`../indent/indentDateil?type=${payStatus}&ORDER_PK=${orderPK}`)
  },
  moveStart:function(e){
    lastClientY = e.touches[0].clientY;
    console.info("lastClientY" + lastClientY);
    var that = this
    console.info("下拉刷新")
    that.setData({
      flushMessage: "下拉刷新"
    })
  },
  move: function (e) {
    console.info("move")
    var that = this
    const query = wx.createSelectorQuery().in(that)
    query.select('#flag').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      console.info(res[0].top) // #flag节点的上边界坐标
      var a = onerpx * 88  //距离顶部的高度
      console.info("a"+a)
      if (a - 1 < res[0].top) {
        var thisClientY = e.touches[0].clientY
        if (lastClientY != 0) {
          let hh = thisClientY - lastClientY + a
          hh = hh >= 89 ? 89:hh
          that.heightChange(hh, 500)
          console.info("thisClientY - lastClientY > 60  " + (thisClientY - lastClientY - 60))
          if (thisClientY - lastClientY > 60) {
            flush = true
            // console.info("trueteutue")
            // that.heightChange(89,500)//调用下拉刷新
            console.info("释放刷新")
            that.setData({
              flushMessage: "释放刷新"
            })
          }
        } else {
          lastClientY = e.touches[0].clientY
        }
      }
    })

 
  },
  moveStop:function(e){
   
    var that = this
    lastClientY = 0;
    //this.triggerEvent('stopDownFlush');//刷新结束
    if (flush) {
      that.loadOrderData()
      that.setData({
        flushMessage: "正在刷新"
      })
      console.info("正在刷新")
    }else{
      console.info("取消刷新")
      that.setData({
        flushMessage: "取消刷新"
      })
      that.heightChange(48, 500);
    }

    flush = false;
    

  },
  //高度变化动画
  heightChange:function(heightNumber,speed){
    var animation = wx.createAnimation({})
    animation.height(heightNumber).step({ duration:speed })
    this.setData({
      scaleData: animation.export(),
    })
  },
  choose: function () {
    var that = this;
    that.loadOrderData();//加载订单数据
    that.loadOrderNumber();//加载订单数量
    that.closeSelectArea();//关闭筛选界面
    }
}
})