var util = require('../../utils/util.js'); 

var app = getApp();
var pageTitle = "开台";//当前页面名字
var areaMess = [];//区域的信息
var currentClickArea = 0;//当前区域
var currentDate;//当前时间
var isUseTableNum = 0;//桌子正在被使用的数量
var allTableNum = 0;//所有桌子的数量
var currentLookStatus = 0;//当前查看的状态(0:全部 1：空台 2：已开台)
var autoMin = 0;//自动更新的时间
var dingshiqi;//定时器

Component({
  options: {
    addGlobalClass: true
  },
  data:{
    currentClickArea,
    isUseTableNum,
    allTableNum,
    currentLookStatus,
    // allowChooseTable: app.globalData.appSetting.CHECK_TDKT
  },
  
  /**
 * 声明周期函数
 */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle)
      
      wx.showNavigationBarLoading()
      this.pageInit();
      // wx.hideNavigationBarLoading()
    },
    moved: function () { console.log("组件被moved") },
    //组件被移除
    detached: function () {console.log("detached") },
  },
  /**
   * page的生命周期
   */
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      // this.pageInit();
    },
    hide: function () { },
    resize: function () { },
  },


  methods:{
    /**
     * 页面初始化方法,加载所有区域和桌位
     */
    pageInit:function(){
      // app.showLoading()
      //先获取时间
      currentDate = util.nowTime()
      //获取挂单的数据(founding开启的情况下没有挂单数据，全是放在购物车里，即查询购物车里的信息))
      var guadanshuju = app.getShoppingCart('all')
        this.setData({
          guadanshuju
        })
      
      this.setData({
        currentDate
      })

      var that = this;
      app.sendRequest({
        url: 'TablesArea_update_findTablesAreaAndTablesUseStatusByShopId',
        data:{
          SHOP_PK: app.globalData.shopid
        },
        success:function(res){
          if(res.data.code == '0000'){
            areaMess = res.data.data
            that.flushTableNum();
            clearInterval(dingshiqi)
            dingshiqi = that.autoUpdateTime()
            console.info(areaMess)
            autoMin = 0;
            that.setData({
              areaMess,
              autoMin
            })
          }else{
            app.hintBox(res.data.data)
          }
          // app.hideLoading()
          wx.hideNavigationBarLoading()
        },
        fail:function(error){
          app.hideLoading()
          app.hintBox(error)
        }

      })
    },
    /**
     * 点击了区域
     */
    clickArea: function(e){
      currentClickArea = e.target.dataset.areaid
      this.flushTableNum()
      this.setData({
        currentClickArea
      })
    },
    /**
     * 刷新桌子空台和已开台（下边显示的）的数量
     *
     */
    flushTableNum: function(){
      allTableNum = 0;
      isUseTableNum = 0;
      areaMess.forEach(a=>{
        if (currentClickArea == 0 || currentClickArea == a.TABLES_AREA_PK) {
          a.tables.forEach(t=>{
            allTableNum++
            if (t.TABLES_ISUSE == '1'){
              isUseTableNum++
            }
          })
        
          this.setData({
            allTableNum,
            isUseTableNum
          })
        }
      })
    },
    /**
     * 点击了查看状态
     */
    clicklookStatus:function(e){
      currentLookStatus = e.currentTarget.dataset.status
      this.setData({
        currentLookStatus
      })

    },
    /**
     * 点击了桌子
     */
    clickTable:function(e){
      var status = e.currentTarget.dataset.usestatus
      var table = e.currentTarget.dataset.table
      if(status == '0'){
        //如果有订单数据的话，先清空订单数据
        wx.setStorageSync('ORDER_PK', '');
        wx.setStorageSync('ORDER_TYPE', '');
        
        //改需求
        app.pageTurns('../menu/menupage')
        app.createShoppingCart(table, 0)
        
      }else if(status == '1'){
        //点击了开台的桌子，进入订单详情
        app.pageTurns(`../indent/indentDateil?type=${table.ORDER_PAY_STATE}&ORDER_PK=${table.ORDER_PK}`)
      }

    },
    /**
     * 查看挂单
     */
    checkEntryOrders: function () {
      app.pageTurns(`../entryOrders/entryOrders`)
    },
    /**
     * index刷新数据
     */
    indexFlushData:function(params){
      console.info('founding刷新')
      this.setData(params)
    },
    /**
 * 自动更新时间的定时器
 */
    autoUpdateTime:function (){
      var that = this
      return setInterval(function callback(){
        console.info('定时器执行了')
        autoMin += 1
        that.setData({
          autoMin
        })
      }, 60000)
    }
      
  }
})
