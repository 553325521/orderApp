var util = require('../../utils/util.js'); 

var app = getApp();
var pageTitle = "开台";//当前页面名字
var areaMess = [];//区域的信息
var currentClickArea = 0;//当前区域
var currentDate;//当前时间
var isUseTableNum = 0;//桌子正在被使用的数量
var allTableNum = 0;//所有桌子的数量
var currentLookStatus = 0;//当前查看的状态(0:全部 1：空台 2：已开台)

Component({
  options: {
    addGlobalClass: true,
  },
  data:{
    currentClickArea,
    isUseTableNum,
    allTableNum,
    currentLookStatus
  },
  
  /**
 * 声明周期函数
 */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle)
      this.pageInit();
    },
    moved: function () { console.log("组件被moved") },
    //组件被移除
    detached: function () { console.log("detached") },
  },
  methods:{
    /**
     * 页面初始化方法,加载所有区域和桌位
     */
    pageInit:function(){
      app.showLoading()
      //先获取时间
      currentDate = util.nowTime()
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
            console.info(areaMess)
            that.setData({
              areaMess
            })
          }else{
            app.toast(res.data.data)
          }
          app.hideLoading()
        },
        fail:function(error){
          app.hideLoading()
          app.toast(error)
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
      console.info("点击了桌子")
      console.info(e)
      var status = e.currentTarget.dataset.usestatus
      var table = e.currentTarget.dataset.table
      if(status == '0'){
        //如果有订单数据的话，先清空订单数据
        wx.setStorageSync('ORDER_PK', '');
        wx.setStorageSync('ORDER_TYPE', '');
        
        //点击了空台，插入桌子数据，然后跳转到菜单
        var myEventDetail = { // detail对象，提供给事件监听函数  
          //监听函数可以通过e.detail查看传递的数据;
          page: '../menu/menu'
        }  　　
        //创建一个空的购物车
        app.createShoppingCart(table, 0)
        //先把当前桌子数据放进去
        // var currentTableMessage = {
        //   currentTable: table,
        //   currentEatPersonNum:0
        // }
        // app.setStorage('currentTableMessage', currentTableMessage)

        this.triggerEvent('switchPage', myEventDetail);
        
      }else if(status == '1'){
        //点击了开台的桌子，进入订单详情
        app.pageTurns(`../indent/indentDateil?type=${table.ORDER_PAY_STATE}&ORDER_PK=${table.ORDER_PK}`)
      }

    }
  }
})
