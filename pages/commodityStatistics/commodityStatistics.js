// pages/commodityStatistics/commodityStatistics.js
var app = getApp();
Page({
  data: {
    shopArr:['五里店','观音桥'],
    shopIndex:0,
    dateArr: ['今天', '昨天', '本周', '本月'],
    dateIndex: 0,
    operatorArr: ['用户自点'],
    operatorIndexArray:[0],
    operatorIndex: 0,
    productList:[],
    isExistData:false
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadOperator();
  },
  //切换日期事件
  bindDateChange: function (e) {
    this.setData({
      dateIndex: e.detail.value
    });
    this.loadGoodsData();
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
  loadGoodsData:function(){
    var that = this;
    app.sendRequest({
      url: "loadGoodsCountData",
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: that.data.operatorIndexArray[that.data.operatorIndex],
        selectTime: that.data.dateArr[that.data.dateIndex],
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