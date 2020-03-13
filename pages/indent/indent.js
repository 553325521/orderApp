// pages/indent/indent.js
var app = getApp()
var pageTitle = "订单";
var currentTab = 0;
var orderArray = {};//订单的数组
var onerpx = 0.5; //1rpx对应多少像素
var lastClientY = 0;//上一次点击的位置
var flush = false;
var currentPage = 0;//当前第多少页
var offset = 0;//当前位置
var limit = 20;//每页多少条
var totalPage = 0;//总共多少页
var totalNum = 0;//总共多少条
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
    colors: [],
    currentTab: currentTab,
    font_color: "select-before-color",
    select_img_name: "select_down",
    orderData:[],
    select_id: -1,
    dateArr: ['今天', '昨天', '本周', '本月', '本年'],
    font_color: "select-before-color",
    select_img_name: "select_down",
    selectShow: false, //控制下拉列表的显示隐藏，false隐藏、true显示
    start_date: '2020-01-01',
    end_date: '2020-01-01',
    dateAreaIsShow: false,
    noPayNumber:0
  },
/**
 * 声明周期函数
 */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle);
      const colors = this._generateColors(20);
      this.setData({ colors });
      this.loadOrderData();
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

      },
    hide: function () { },
    resize: function () { },
  },


/**
 * 自定义方法函数
 */
methods:{
  //加载订单数量
  loadOrderNumber: function () {
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
           that.setData({
             noPayNumber: res.data.data.noPayNumber
           });
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单数量失败',
        })
      }
    })
  },

  cancelChoose: function () {
    var that = this;
    that.setData({
      select_id: -1,
      dateAreaIsShow: false,
      takeView: 54
    });
    that.resetSearch();
    that.loadOrderData();
    that.closeSelectArea();//关闭筛选界面
  },
  choose: function () {
    var that = this;
    that.resetSearch();
    that.loadOrderData();
    that.closeSelectArea();//关闭筛选界面
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
    //this.cancelChoose();
    var that = this;
    var current_font_color = that.data.font_color;
    if (current_font_color == 'select-before-color') {
      that.setData({
        font_color: "select-after-color",
        select_img_name: "select_down_red",
        selectShow: 95,
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
  loadOrderData: function (type){   
    var that = this;
    var choosePay = "";
    if (that.data.select_id == 5) {
      choosePay = '自定义';
    } else {
      choosePay = that.data.dateArr[that.data.select_id];
    }
    console.info(choosePay);
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderData.json',
      method: "post",
      data: {
        START_DATE: that.data.start_date,
        END_DATE: that.data.end_date,
        DATE_WAY: choosePay,
        ORDER_PAY_STATE:currentTab,
        FK_SHOP: app.globalData.shopid,
        OFFSET:currentPage*limit,
        LIMIT:limit,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          totalNum = res.data.data.total;
          totalPage = parseInt(totalNum/limit);
          var syRow = totalNum % limit;
          //如果查询到的数量只有一页或者不足一页时，直接全部加载完成
          if (totalPage == 0 || (totalPage == 1 && syRow == 0)){
            that.setData({
              nomore: true
            })
          }
          that.data.orderData = that.data.orderData.concat(res.data.data.orderData);
          that.setData({
            orderData: that.data.orderData
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单失败',
        })
      },
      complete: function () {
        if(type == 'PULL_TYPE'){
          var scrollViewObj = that.selectComponent("#x-scroll-view");
          scrollViewObj.setData({
            pullDownStatus: 4
          });
        }
        that.loadOrderNumber();
      }
    })
  },
  _randomColor: function () {
    return `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${(Math.random() * 0.3 + 0.2).toFixed(1)})`;
  },

  _generateColors: function (length) {
    return new Array(length).fill(null).map(() => this._randomColor());
  },

  //下拉刷新监听函数
  _onPullDownRefresh: function () {
    setTimeout(() => {
      const colors = this._generateColors(20);
      this.setData({
        colors,
        refreshing: false,
      });
    }, 2000);
  },

  _onRefreshPullData:function(){
    console.info("我被调用到了");
    this.resetSearch();
    this.loadOrderData("PULL_TYPE");
  },
  //加载更多监听函数
  _onLoadmore: function () {
    setTimeout(() => {
      if (totalPage == currentPage) {
        this.setData({ nomore: true })
      } else {
        //页码+1
        currentPage = currentPage+1;
        this.loadOrderData();
      }
    }, 1000);
  },

  _onScroll: function (e) {
    //console.log(e);
  },

  navTo: function (e) {
    var orderPK = e.currentTarget.dataset.id;
    var payStatus = e.currentTarget.dataset.status;
    app.pageTurns(`../indent/indentDateil?type=${payStatus}&ORDER_PK=${orderPK}`)
  },
  
resetSearch(){
  var that = this;
  var scrollViewObj = this.selectComponent("#x-scroll-view");
  scrollViewObj.setData({
    scrollTop: 0,//滚动条位置
    lastScrollEnd: 0
  });
  currentPage = 0;
  that.setData({
    orderData: [],
    nomore: false
  });
},
  swichNav: function (e) { 
    var that = this;
    currentTab = e.currentTarget.dataset.type;
    that.setData({
      currentTab: currentTab
    });
    this.resetSearch();//重置查询初始状态
    that.loadOrderData();
  },
}
})