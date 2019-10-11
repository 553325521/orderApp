
var app = getApp();
Page({
  data: {
    //全局变量
    list: [],
    //加载样式是否显示
    loading: true,
    noData:false, //无数据样式是否显示
    payWay:undefined
  },

  onLoad: function (options) {
    var that = this       //很重要，一定要写
    that.loadData();
    that.setData({
      payWay:options.payWay
    });
  },
  //加载数据
  loadData:function(){
    var that = this;
    wx.request({
      url: app.globalData.basePath + 'json/PaymentRecord_load_loadPaymentRecordDataBySource.json',//和后台交互的地址，默认是json数据交互，由于我的就是json，这里就没有对header进行编写
      data: { openid: wx.getStorageSync('openid'),
        FK_SHOP: app.globalData.shopid,
        ORDER_PAY_STATE:'1',
        PAY_SOURCE:'1'},
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        that.setData({//隐藏加载中
          loading:false
        });
        if (res.data.code == '0000') {
          var dataArray = res.data.data;
          if(dataArray.length !=0){
            that.setData({
              list: dataArray,
              noData:false
            });
          }else{
            that.setData({
              noData: true
            });
          }
        }else{
          that.setData({
            noData:true
          });
        }
      },
      fail: function (res) {
        console.log('submit fail');
      },
      complete: function (res) {
        console.log('submit complete');
      }
    })
  }
})