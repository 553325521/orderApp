// pages/statement/statement.js
var app = getApp()
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    SUM_MONEY:0.0,
    SUM_GOODS_NUMBER:0,
    SUM_MEMBER:0
  },
  
  /**
   * 组件周期函数
   */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
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
    show: function () {console.log("页面show") },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 自定义方法
   */
  methods:{
    //加载数据
    loadTotalData:function(){
      var that = this;
      wx.request({
        url: app.globalData.basePath + 'json/Shop_load_loadShopReportByShopID.json',
        method: "post",
        data: {
          FK_SHOP: app.globalData.shopid
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success: function (res) {
          that.setData({
            SUM_MONEY: res.data.data.SUM_MONEY,
            SUM_GOODS_NUMBER: res.data.data.SUM_ORDER,
            SUM_MEMBER: res.data.data.SUM_MEMBER
          });
        },
        fail: function (error) {
          wx.showToast({
            title: '加载报表总数据失败',
          })
        }
      })
    },
    navTo:function(e){
      var url = e.currentTarget.dataset.url
      app.pageTurns(url)
    }
  }
})