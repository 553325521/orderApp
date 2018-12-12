// pages/menu/menu.js
var app = getApp();
var pageTitle = "菜单";//当前页面title
var greensList;//商品列表，一个map，里边两个key 一个是放的是列表，为每个商品的数量及该商品的属性的集合；另一个存放的是该类别下的数量
var navList;//分类列表，里边有分类名称和PK

var ordersList = [];//购物车列表吧？
var allMoney = 0.0;//订单总金额
var tableList = [];//桌位列表
var goodsGuige = {
  guige: [],
  zuofa: [],
  kouwei: []
}//当前弹框的属性 规格做法和口味  
var height = '';//还不知道是什么高度
var saveOrdersFalg = false;//挂单按钮是否显示
var currentGood;//当前商品
var isSelected = false;//选择规格了吗
var reserveShow = false;//显示选择餐位
// var quorumShow = false;//显示选择人数
var selectPersonNum = true;//选择人数开关是否开启
var currentTable = {};//当前桌位
var currentEatPersonNum = 0;//当前餐桌就餐的人数
var menuStatus = 0;//当前菜单页面状态（0：没状态 1：点菜 2：加菜）
var shoppingCart = {};//购物车信息

Page({

  data: {
    addGlobalClass:true,
    navList:null,
    currentTab:0,
    currentTabInit: 0,
    greensList,
   
    scrollTop:0,
    allMoney: allMoney.toFixed(2),
    ordersList,
    height,
    entryShow:false,//购物车显示
    popShow:false,
    reserveShow,
    quorumShow:false,
    currentGood,
    currentIndex: null,
    currentItem: null,
    currentTable,
    saveOrdersFalg,//挂单按钮是否显示
    goodsGuige,
    // isSelected: isSelected,
    tableList,
    menuStatus,
    shoppingCart,
    allowChooseTable: !app.globalData.appSetting.foundingSwitch,
    basePath: app.globalData.basePath
  },


  /**
   * page的生命周期
   */

    // 组件所在页面的生命周期函数
    onLoad: function () {
     
      app.updateTitle(pageTitle)
      this.pageInit();
      this.loadGoodsInfo();
      this.flushStroageData()
      this.flushShoppingCart()
      this.backMainPage()
      },
      onShow:function(){
        this.flushStroageData()
        this.flushShoppingCart()
        this.backMainPage()
      },
    hide: function () { },
    resize: function () { },

    //自定义页面初始化函数
    pageInit:function(){
      var that = this;
      app.showLoading();
      var mobInfo = app.getSystemInfo();
      
      that.setData({
        W: mobInfo.mob_width + 'px',
        H: mobInfo.mob_height + 'px',
        scrollHeight: mobInfo.mob_height - 90 * mobInfo.mob_onerpx
      })
      // 查询菜单和数量
      // that.loadGoodsInfo();
      // 查询餐桌
      that.loadTables();
      //TODO 查询开关设置，比如选择人数是否开启
      //。。。。。。。

      // that.flushStroageData()
     
      // that.flushShoppingCart()
    },
    /**
     * 刷新缓存数据
     */
    flushStroageData:function(){
      var that = this;
      console.info(wx.getStorageSync('ORDER_PK'))
      //判断是加菜状态吗
      if(wx.getStorageSync('ORDER_PK') != undefined && wx.getStorageSync('ORDER_PK') != ''){
        menuStatus = 2
      }else{
        shoppingCart = app.getShoppingCart()
        if (shoppingCart != undefined && shoppingCart != undefined && shoppingCart.table != undefined && shoppingCart.table != '') {
          menuStatus = 1;
          currentTable = shoppingCart.table,
            currentEatPersonNum = shoppingCart.personNum == undefined ? 0 : shoppingCart.personNum
        }else{
          menuStatus = 0
        }
        
      }

      that.setData({
        menuStatus,
        currentTable
      })
    },
    /**
     * 刷新购物车信息
     */
    flushShoppingCart:function(){
      var that = this;
      shoppingCart = app.getShoppingCart()
      if (shoppingCart == undefined){
        shoppingCart = {}
      }
      if (shoppingCart.totalNumber == undefined){
        shoppingCart.totalNumber = 0
      }
      if (shoppingCart.goods == undefined){
        shoppingCart.goods = []
      }
      if (shoppingCart.totalMoney == undefined) {
        shoppingCart.totalMoney = 0;
      }
      currentTable = shoppingCart.table == undefined ? {} : shoppingCart.table,
        currentEatPersonNum = shoppingCart.personNum == undefined ? 0 : shoppingCart.personNum
      
      that.setData({
        shoppingCart,
        currentTable
      })
    },

    loadTables: function() {
      let that = this;
      app.sendRequest({
        url: 'Tables_select_loadTableList',
        method: 'POST',
        data: {
          shopid: app.globalData.shopid,
          openid: wx.getStorageSync('openid')
        },
        success: function (res) {
          if (res.data.code == '0000') {
            tableList = res.data.data;
            that.setData({
              tableList: tableList,
            })
            // 查询挂单数量
            // that.loadCountOrderWei();
          }
        },
        fail: function (error) {
          app.hintBox('查询失败', 'none')
        }
      });
    },
    loadGoodsInfo: function () {
      let that = this;
      app.showLoading()
      app.sendRequest({
        url: 'GoodsType_select_loadGoodsTypeByShopId',
        method: 'POST',
        data: {
          shopid: app.globalData.shopid,
          openid: wx.getStorageSync('openid')
        },
        success: function (res) {
          if (res.data.code == '0000') {
            app.hideLoading()
            // 查询购物车
            that.getOrdersList();

            greensList = res.data.data.greensList;
            navList = res.data.data.navList;
         

            if (greensList.length>1){
              that.setData({
                isExistData:true
              })
            }

            //如果没有类别，就不set类别了
            if (navList.length != 0) {
              that.setData({
                currentTab: navList[0].GTYPE_PK,
              })
            }
            that.setData({
              navList,
              greensList
            })
          }
        },
        fail: function (error) {
          app.hintBox('操作失败', 'none')
        }
      });


    },
    /**
     * 添加购物车和删除购物车
     */
    addQity:function(e){
      console.info("添加购物车和删除后无车")
      var that = this;

      var clickgood = e.currentTarget.dataset.good;
      var type = e.currentTarget.dataset.type;
      var data = greensList;
   
      var _url = '';

      var good = {
        GOODS_PK: clickgood.GOODS_PK,
        GOODS_NAME: clickgood.GOODS_NAME,
        GOODS_PRICE: clickgood.GOODS_TRUE_PRICE == undefined ? clickgood.GOODS_PRICE : clickgood.GOODS_TRUE_PRICE,
        GOODS_DW: clickgood.GOODS_DW,
        GOODS_TYPE: clickgood.GOODS_TYPE,
        GTYPE_NAME: clickgood.GTYPE_NAME,
        GTYPE_FK: clickgood.GTYPE_PK
      }

      if (type == "+"){
        app.addShoppingCart(good)
      }else{
        app.subShoppingCart(good)
      }

      // List[index].FK_SHOP = app.globalData.shopid;
      // List[index].FK_USER = wx.getStorageSync('openid');

      that.setData({
        greensList
      })
      // 查询购物车
      that.getOrdersList();
    },
    /**
     *  查看购物车
     */
    entryOrders:function(){
      var that = this;

      shoppingCart = app.getShoppingCart()

      if (shoppingCart.goods.length > 4) {
        height = 384 + 'rpx';
      } else {
        height = ''
      }
      that.setData({
        // ordersList: ordersList,
        height: height,
        entryShow: true,
        slide: false,
        allMoney: allMoney.toFixed(2)
      })

    },
    getOrdersList:function() {
      var that = this;
      that.flushShoppingCart()
    },
    /**
     *  隐藏挂单
     */
    vanish:function(){
      var that = this;
      that.setData({
        entryShow: false
      })
    },
    /**
     * 清空购物车
     */
    emptyCat:function(){
      var that = this;
      // app.clearShoppingCart()
      app.removeShoppingCart()
      that.flushShoppingCart()
      that.backMainPage()
      that.setData({
        greensList,
        entryShow: false,
      })
    },
    /**
     * 移除购物车,和清除购物车最大的区别就是也清除桌位和就餐人员信息
     */
    removeShoppingCart:function(){
      shoppingCart = app.removeShoppingCart()
      this.flushShoppingCart()
      this.backMainPage()
    },
    /**
     * 关闭弹框
     */
    closePop:function(){
      var that = this;
      reserveShow = false;
      that.setData({
        popShow:false,
        reserveShow: reserveShow,
        entryShow: false,
        quorumShow: false
      })
    },
    /**
     * 选好了
     */
    chosen: function (){
      var that = this;
      if(menuStatus == 2){
        //加菜
        app.pageTurns('../indent/indentDateil')
        return;
      }else{
        if (currentTable == undefined || currentTable == '' || JSON.stringify(currentTable) == '{}'){
          reserveShow = true;//显示选择餐位
          this.setData({
            reserveShow
          })
        } else if (currentEatPersonNum == 0){
          this.setData({
            quorumShow:true
          })
        }else{
          app.pageTurns('../orderDetail/orderDetail')
        }
      }   
    },
    /**
     * 选择餐位
     */
    reserveConfirm:function(e){
    
      var that = this;
      var quorumShow = false;
      if (selectPersonNum !=undefined && selectPersonNum != '' && currentEatPersonNum == 0){//如果选择就餐人数的开关是打开的，那么就显示就餐人数
        quorumShow = true;
      }

      currentTable = tableList[e.target.dataset.index]//当前桌位信息
  //如果当前餐位人数等于0或者大于该餐桌容纳的数量，自动赋值
      if (currentEatPersonNum == 0 || currentEatPersonNum > currentTable.TABLES_NUM) {
        currentEatPersonNum = currentTable.TABLES_NUM;//当前桌位就餐人数
      }
    
      shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)
      console.info(currentTable)
      that.flushStroageData()
      reserveShow = false;
      console.info(currentTable.TABLES_NUM)
      that.setData({
        currentTable,
        reserveShow,
        quorumShow
      })
      if (!quorumShow){
        app.pageTurns('../orderDetail/orderDetail')
      }
    },
    /**
     * 选择就餐人数
     */
    reserveQuorum:function(e){
      var that = this;
      currentEatPersonNum = e.target.dataset.index
      shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)

      that.setData({
        quorumShow:false
      })
      app.pageTurns('../orderDetail/orderDetail')
    },
    /**
     * 查看挂单
     */
    checkEntryOrders:function(){
      app.pageTurns(`../entryOrders/entryOrders`)
    },
    /**
     * 菜品滑动事件
     */
    doScroll: function (e) {
      var that = this;
      var scrollTop = e.detail.scrollTop,
      h = 0; 
      let currentTab = 0;
      greensList.forEach(function (item, i) {
        var _h = 24.4 + 71.2 * item.infos.length;
        if (scrollTop >= h) {
          currentTab = item.GTYPE_PK
        }
        h += _h;
      })
    that.setData({
      currentTab: currentTab
    })
    },
    /**
     * 切换菜单
     */
    switchNav: function (e) {
      var that = this;
      var type = e.currentTarget.dataset.type;
      var index = e.currentTarget.dataset.index;
      that.setData({
        currentTabInit: type
      })
    },
    /**
     * 选择规格
     */
    selectGuige: function (e) {
      var that = this;
      var data = greensList;
      currentGood = e.currentTarget.dataset.good;
      currentGood.LAST_PIRCE = currentGood.GOODS_TRUE_PRICE == undefined || currentGood.GOODS_TRUE_PRICE == "" ? currentGood.GOODS_PRICE : currentGood.GOODS_TRUE_PRICE;
      that.setData({
        popShow: true,
        currentGood,
      })
    },
    /**
     * 选择规格里边的属性
     */
    selectGg: function(e) {
      var that = this; 
      var _type = e.currentTarget.dataset.type;
      var name = e.currentTarget.dataset.name;
      var price = e.currentTarget.dataset.price;
      var add = true;//是添加规格还是移除规格
      if (_type != '' && _type != undefined) {
        if (_type == 'guige') {
          if (currentGood.guige == name){
            currentGood.guige = undefined
            add = false
          }else{
            currentGood.guige = name
          }
        } else if (_type == 'kouwei') {
          if (currentGood.kouwei == name) {
            currentGood.kouwei = undefined
            add = false
          } else {
            currentGood.kouwei = name
          }
        } else if (_type == 'zuofa') {
          if (currentGood.zuofa == name) {
            currentGood.zuofa = undefined
            add = false
          } else {
            currentGood.zuofa = name
          }
        }

        var opera = price.substring(0, 1);
        price = parseInt(parseFloat(price.substring(1, price.length)) * 100);
        currentGood.LAST_PIRCE = parseInt(currentGood.LAST_PIRCE)
        if (opera == "-" && add || opera == "+" && !add) {
          currentGood.LAST_PIRCE -= price
        } else {
          currentGood.LAST_PIRCE += price
        }
    
          that.setData({
            currentGood
          })
      }
    },
    /**
     * 规格弹窗加入购物车逻辑
     */
    addToCart2: function (e) {
      var that = this;
      if (currentGood.guige == undefined && currentGood.zuofa == undefined && currentGood.kouwei == undefined) {
        app.hintBox('请选择规格、做法或口味', 'none')
        return;
      }

      app.addShoppingCart({
        GOODS_PK: currentGood.GOODS_PK,
        GOODS_NAME: currentGood.GOODS_NAME,
        GOODS_PRICE: currentGood.LAST_PIRCE,
        GOODS_FORMAT: currentGood.guige,
        GOODS_TASTE: currentGood.kouwei,
        GOODS_MAKING: currentGood.zuofa,
        GOODS_DW: currentGood.GOODS_DW,
        GOODS_TYPE: currentGood.GOODS_TYPE,
        GTYPE_NAME: currentGood.GTYPE_NAME,
        GTYPE_FK: currentGood.GTYPE_PK
      })

      shoppingCart = app.getShoppingCart()
      that.setData({
        greensList,
        shoppingCart
      })
      that.closePop();
      currentGood = undefined
    },

    setOptions:function(options){
      var quorumShow = false;
      if (options != undefined) {
        if (options.reserveShow != undefined && options.reserveShow) {
          reserveShow = true;
          // quorumShow = false;
        } else if (options.quorumShow != undefined && options.quorumShow) {
          quorumShow = true;
        } 
       
      }

      this.setData({
        reserveShow,
        quorumShow
      })
    },
    /**
     * 增加或者减少购物车商品数量
     */
    operaGoodsNumber: function (e) {
      var opera = e.currentTarget.dataset.type
      var good = e.currentTarget.dataset.good
      if (opera == '1'){
        app.subShoppingCart(good)
      }else{
        app.addShoppingCart(good)
      }
      shoppingCart = app.getShoppingCart()
      this.flushPageData()
      this.setData({
        shoppingCart
      })
      
    },
    /**
     * 刷新数据
     */
    flushPageData:function(){
    },
    /**
     * 判断需要返回首页吗
     */
    backMainPage:function(){
      if (shoppingCart == undefined || shoppingCart.table == undefined || shoppingCart.table == '' || shoppingCart.table == '' && app.globalData.appSetting.foundingSwitch) {
          app.reLaunch('../index/index?page=../founding/founding')
          return
        }
    }
  
})