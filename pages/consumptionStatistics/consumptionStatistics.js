// pages/consumptionStatistics/consumptionStatistics.js
var app = getApp();
Page({
  data: {
    shopArr: [],
    shopIndexArray: [],
    shopIndex: 0,
    dateArr: ['今天', '昨天', '本周', '本月','本年'],
    dateIndex: 0,
    wayArr: [{'checked':false,'name':'现金'},
      { 'checked': false, 'name': '微信' },
      { 'checked': false, 'name': '支付宝' },
      { 'checked': false, 'name': 'POS' },
      { 'checked': false, 'name': '储值' }],
    wayResultArr: [{ 'checked': false, 'name': '现金' },
    { 'checked': false, 'name': '微信' },
    { 'checked': false, 'name': '支付宝' },
    { 'checked': false, 'name': 'POS' },
    { 'checked': false, 'name': '储值' },
    { 'checked': false, 'name': '其他' }],
    wayIndex: 0,
    orderArray: {},
    pageShow: false,
    isExistData: true,
    selectShow: false, //控制下拉列表的显示隐藏，false隐藏、true显示
    selectData: ['15:10', '15:15', '15:20'], //下拉列表的数据
    index: 0, //选择的下拉列表下标
    font_color: "select-before-color",
    select_img_name: "select_down",
    selectShow: 0,
    select_id:-1,
    select_way_id: -1,
    start_date:'2019-01-01',
    end_date:'2019-01-01',
    dateAreaIsShow:false,
    isSelectCancel:false,
    isSelectConfirm:false,
    wayUser:false,
    takeView:54,
    isDataHide:false //是否显示数据
  },
  loadXFData:function(){

  },
  cancelChoose:function(){
    var that = this;
    for (var i = 0; i < that.data.wayArr.length; i++) {
      that.data.wayArr[i].checked = false;
    }
    for (var i = 0; i < that.data.wayResultArr.length; i++) {
      that.data.wayResultArr[i].checked = false;
    }
    that.setData({
      select_id: -1,
      wayArr: that.data.wayArr,
      wayUser: false,
      wayResultArr: that.data.wayResultArr,
      dateAreaIsShow: false,
      takeView: 54
    });
  },
  selectCancel:function(){
    var that =this;
    for(var i = 0;i < that.data.wayArr.length;i++){
      that.data.wayArr[i].checked = false;
    }
    that.setData({
      select_id:-1,
      wayArr:that.data.wayArr,
      wayUser:false
    })
  },
  choose:function(){
    var that = this;
    var choosePay = "";
    if(that.data.select_id == 5){
      choosePay = '自定义';
    }else{
      choosePay = that.data.dateArr[that.data.select_id];
    }
    console.info(choosePay);
    console.info(that.data.start_date);
    console.info(that.data.end_date);
    var chooseWay = that.data.wayResultArr;
    var chooseWayArray = [];
    for(var i = 0; i< chooseWay.length;i++){
      if (chooseWay[i].checked){
        if (chooseWay[i].name == '现金'){
          chooseWayArray.push('1');
        } else if (chooseWay[i].name == '微信'){
          chooseWayArray.push('31');
        } else if (chooseWay[i].name == '支付宝') {
          chooseWayArray.push('32');
        } else if (chooseWay[i].name == 'POS') {
          chooseWayArray.push('4');
        } else if (chooseWay[i].name == '储值') {
          chooseWayArray.push('5');
        } else if (chooseWay[i].name == '其他') {
          chooseWayArray.push('6');
        }
        
      }
    }

    console.info(JSON.stringify(chooseWayArray));

    var shopId = app.globalData.shopid;
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderDataByShopOrTimeOrWay.json',
      method: "post",
      data: {
        SELECT_PERIOD: choosePay,
        START_DATE: that.data.start_date,
        END_DATE: that.data.end_date,
        ORDER_PAY_WAY: JSON.stringify(chooseWayArray),
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
          if (that.data.orderArray.length != 0) {
            that.setData({
              isDataHide:false
            })
          } else {
            var initDataArray = [];
            var orderBigList = [];
            initDataArray[0] = {
              "SF": "--:--",
              "ORDER_POSITION": "-",
              "TOTAL_FS": "0",
              "TOTAL_MONEY": "0",
              "payWay": "-"
            };
            var orderMap = new Map();
            orderMap.set("data", initDataArray);
            orderMap.set("keyName", "");
            orderMap.set("totalMoney", 0);
            orderMap.set("timeWidth", "140rpx");
            orderMap.set("seatWidth", "100rpx");
            orderMap.set("partWidth", "140rpx");
            orderMap.set("moneyWidth", "120rpx");
            orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
            that.data.orderArray = orderBigList;
            that.setData({
              pageShow: true,
              orderArray: that.data.orderArray,
              isDataHide: true
            });
            that.setData({
              isExistData: true
            })
          }
        } else {
          var initDataArray = [];
          var orderBigList = [];
          initDataArray[0] = {
            "SF": "--:--",
            "ORDER_POSITION": "-",
            "TOTAL_FS": "0",
            "TOTAL_MONEY": "0",
            "payWay": "-"
          };
          var orderMap = new Map();
          orderMap.set("data", initDataArray);
          orderMap.set("keyName", "");
          orderMap.set("totalMoney", 0);
          orderMap.set("timeWidth", "140rpx");
          orderMap.set("seatWidth", "100rpx");
          orderMap.set("partWidth", "140rpx");
          orderMap.set("moneyWidth", "180rpx");
          orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
          that.setData({
            isExistData: true
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '加载订单数据失败',
        })
      }
    });
    that.cancelChoose();
    that.closeSelectArea();
  },
  selectWayBtn:function(e){
    var id = e.currentTarget.dataset.id;
    var index = parseInt(id);
    var that = this;
    if(index == 5){
      that.setData({
        wayUser: true
      })
    }else{
      that.data.wayArr[index].checked = true;
      var newArray = that.data.wayArr;
      that.setData({
        wayArr: newArray
      })
    }
    that.data.wayResultArr[index].checked = true;
    that.setData({
      wayResultArr: that.data.wayResultArr
    })
  },
  selectBtn:function(e){
    var id = e.currentTarget.dataset.id;
    console.info(e);
    var that = this;
    if(id == 5){
      that.setData({
        dateAreaIsShow: true,
        takeView:0
      })
    }else{
      that.setData({
        dateAreaIsShow: false,
        takeView:54
      })
    }
    that.setData({
      select_id:id
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
  //关闭筛选
  closeSelectArea:function(){
    var that = this;
    that.setData({
      font_color: "select-before-color",
      select_img_name: "select_down",
      selectShow: 0
    })
  },
  //点击筛选
  openSelect: function() {
    var that = this;
    var current_font_color = that.data.font_color;
    if (current_font_color == 'select-before-color') {
      that.setData({
        font_color: "select-after-color",
        select_img_name: "select_down_red",
        selectShow: 100
      })
    } else {
      that.setData({
        font_color: "select-before-color",
        select_img_name: "select_down",
        selectShow: 0
      })
    }
  },
  // 点击下拉显示框
  selectTap() {
    this.setData({
      selectShow: !this.data.selectShow
    });
  },
  // 点击下拉列表
  optionTap(e) {
    let Index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
    this.setData({
      index: Index,
      selectShow: !this.data.selectShow
    });
  },


  onLoad: function(options) {

  },
  onReady: function() {

  },
  onShow: function() {
    this.loadShopConsumeData();
  },
  //切换商铺事件
  bindShopChange: function(e) {
    this.setData({
      pageShow: false,
      shopIndex: e.detail.value
    });
    this.loadShopConsumeData();
  },
  //切换日期事件
  bindDateChange: function(e) {
    this.setData({
      pageShow: false,
      dateIndex: e.detail.value
    });
    this.loadShopConsumeData();
  },
  //切换支付方式事件
  bindPayWayChange: function(e) {
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
  loadShopConsumeData: function() {
    var that = this;
    //当前选择的店铺
    var shopId = app.globalData.shopid;
    var choosePay = '今天';
    var chooseWayArray = ['现金','微信'];
    wx.request({
      url: app.globalData.basePath + 'json/Order_load_loadOrderDataByShopOrTimeOrWay.json',
      method: "post",
      data: {
        SELECT_PERIOD: choosePay,
        START_DATE: that.data.start_date,
        END_DATE: that.data.end_date,
        ORDER_PAY_WAY: JSON.stringify(chooseWayArray),
        FK_SHOP: shopId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function(res) {
        if (res.data.code == '0000') {
          that.dealOrderDate(res.data.data);
          that.data.orderArray = that.dealOrderDate(res.data.data);
          that.setData({
            pageShow: true,
            orderArray: that.data.orderArray
          });
          if (that.data.orderArray.length != 0) {
            that.setData({
              isDataHide: false
            })
          } else {
            var initDataArray = [];
            var orderBigList = [];
            initDataArray[0] = {
              "SF": "--:--",
              "ORDER_POSITION": "-",
              "TOTAL_FS": "0",
              "TOTAL_MONEY": "0",
              "payWay": "-"
            };
            var orderMap = new Map();
            orderMap.set("data", initDataArray);
            orderMap.set("keyName", "");
            orderMap.set("totalMoney", 0);
            orderMap.set("timeWidth", "140rpx");
            orderMap.set("seatWidth", "100rpx");
            orderMap.set("partWidth", "140rpx");
            orderMap.set("moneyWidth", "120rpx");
            orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
            that.data.orderArray = orderBigList;
            that.setData({
              pageShow: true,
              orderArray: that.data.orderArray
            });
            that.setData({
              isDataHide: true
            })
          }
        } else {
          var initDataArray = [];
          var orderBigList = [];
          initDataArray[0] = {
            "SF": "--:--",
            "ORDER_POSITION": "-",
            "TOTAL_FS": "0",
            "TOTAL_MONEY": "0",
            "payWay": "-"
          };
          var orderMap = new Map();
          orderMap.set("data", initDataArray);
          orderMap.set("keyName", "xxxx-xx-xx");
          orderMap.set("totalMoney", 0);
          orderMap.set("timeWidth", "140rpx");
          orderMap.set("seatWidth", "100rpx");
          orderMap.set("partWidth", "140rpx");
          orderMap.set("moneyWidth", "180rpx");
          orderBigList.push(JSON.parse(that.mapToJson(orderMap)));
          that.setData({
            isDataHide: true
          })
        }

      },
      fail: function(error) {
        wx.showToast({
          title: '加载订单数据失败',
        })
      }
    })
  },
  //分组订单数据
  dealOrderDate: function(data) {
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
            if (data[j].ORDER_PAY_WAY == 1) {
              data[j].payWay = '现金';
            } else if (data[j].ORDER_PAY_WAY == 2) {
              data[j].payWay = '扫一扫';
            } else if (data[j].ORDER_PAY_WAY == 3) {
              data[j].payWay = '二维码';
            } else if (data[j].ORDER_PAY_WAY == 4){
              data[j].payWay = 'POS';
            } else if (data[j].ORDER_PAY_WAY == 5) {
              data[j].payWay = '储值';
            } else if (data[j].ORDER_PAY_WAY == 6) {
              data[j].payWay = '其他';
            } else if (data[j].ORDER_PAY_WAY == 21) {
              data[j].payWay = '微信扫一扫';
            } else if (data[j].ORDER_PAY_WAY == 22) {
              data[j].payWay = '支付宝扫一扫';
            } else if (data[j].ORDER_PAY_WAY == 23) {
              data[j].payWay = '银联扫一扫';
            } else if (data[j].ORDER_PAY_WAY == 31) {
              data[j].payWay = '微信二维码';
            } else if (data[j].ORDER_PAY_WAY == 31) {
              data[j].payWay = '支付宝二维码';
            } else {
              data[j].payWay = '未知';
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
  strMapToObj: function(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  },
  /**
   *map转换为json
   */
  mapToJson: function(map) {
    return JSON.stringify(this.strMapToObj(map));
  }
})