// pages/commodityStatistics/commodityStatistics.js
var app = getApp();
Page({
  data: {
    shopArr:['五里店','观音桥'],
    shopIndex:0,
    dateArr: ['今天', '昨天', '本周', '本月'],
    dateIndex: 0,
    operatorArr: ['用户自点','操作员1','操作员2'],
    operatorIndexArray:[0],
    operatorIndex: 0,
    productList:[],
    isExistData:false,
    shaiXuanBtnIsActive:false,
    selectShow: 0,
    start_date: '2019-01-01',
    end_date: '2019-01-01',
    dateArr: ['今天', '昨天', '本周', '本月', '本年'],
    dateIndex: 0,
    select_id: -1,
    operator_id:-1,
    takeView:54,
    font_color: "select-before-color",
    select_img_name: "select_down",
    isScroll: 'scroll' //界面是否出现滚动条
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadOperator();
    this.loadGoodsData('今天');
  },
  //切换日期事件
  bindDateChange: function (e) {
    this.setData({
      dateIndex: e.detail.value
    });
    this.loadGoodsData();
  },
  selectOperator:function(e){
    var id = e.currentTarget.dataset.id;
    var that = this;
    that.setData({
      operator_id: id
    })
  },
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
  cancelChoose: function () {
    var that = this;
    that.setData({
      select_id: -1,
      operator_id:-1,
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
    that.loadGoodsData(choosePay);
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
    var current_font_color = that.data.font_color;
    if (current_font_color == 'select-before-color') {
      that.setData({
        font_color: "select-after-color",
        select_img_name: "select_down_red",
        selectShow: 93,
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
  //切换操作员事件
  bindOperatorChange:function(e){
    this.setData({
      operatorIndex: e.detail.value
    });
    this.loadGoodsData();
  },
  //加载操作员信息
  loadOperator:function(){
    var that = this;
    app.sendRequest({
      url:"Shop_load_loadShopOperatorsById",
      method:"post",
      data:{
        FK_SHOP: app.globalData.shopid
      },
      success:function(res){
        console.info(res.data);
        if(res.data.code == '0000'){
          var resultData = res.data.data;
          var operators = [];
          var operatorIndexArray = [];
          operators[0] = ['用户自点'];
          operatorIndexArray[0] = '0';
          for(var i = 0;i<resultData.length;i++){
            if (resultData[i].USER_NAME == "" || resultData[i].USER_NAME == undefined ){
              operators[i + 1] = resultData[i].USER_SN;
            }else{
              operators[i + 1] = resultData[i].USER_NAME;
            }
            operatorIndexArray[i + 1] = resultData[i].USER_PK;
          }
          that.setData({
            operatorArr:operators,
            operatorIndexArray:operatorIndexArray
          })
        }
        that.loadGoodsData();
      },
      fail: function (error) {
        console.info(error);
      }
    })
  },
  //加载商品统计数据
  loadGoodsData: function (selectTime){
    var that = this;
    app.sendRequest({
      url: "loadGoodsCountData",
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: that.data.operatorIndexArray[that.data.operatorIndex],
        selectTime: selectTime,
        START_TIME:that.data.start_date,
        END_TIME:that.data.end_date
      },
      success: function (res) {
        console.info(res.data);
        if(res.data.code = '0000' && res.data.data.length!=0){
            that.setData({
              productList:res.data.data,
              isExistData:true
            })
        }else{
          that.setData({
            isExistData: false
          })
        }
      },
      fail: function (error) {
        console.info(error);
      }
    })
  }
})