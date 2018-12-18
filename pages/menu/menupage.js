// pages/menu/menu.js
var basemenu = require("basemenu.js");

var app = getApp();
var pageTitle = "菜单"; //当前页面title
var greensList = []; //商品列表，一个map，里边两个key 一个是放的是列表，为每个商品的数量及该商品的属性的集合；另一个存放的是该类别下的数量
var navList = []; //分类列表，里边有分类名称和PK

var ordersList = []; //购物车列表吧？
var allMoney = 0.0; //订单总金额
var tableList = []; //桌位列表
// var height = ''; //还不知道是什么高度，应该是购物车的高度
var saveOrdersFalg = false; //挂单按钮是否显示
var currentGood = {}; //当前商品
var reserveShow = false; //显示选择餐位
// var quorumShow = false;//显示选择人数
var selectPersonNum = true; //选择人数开关是否开启
var currentTable = {}; //当前桌位
var currentEatPersonNum = 0; //当前餐桌就餐的人数
var menuStatus = 0; //当前菜单页面状态（0：没状态 1：点菜 2：加菜）
var shoppingCart = {}; //购物车信息
var currentCat = "";//当前商品类别
var clickcurrentCat = "";//当前点击的商品类别
var lastTop = 0;
var onerpx = 1;//1rpx对应多少px
var goodsInfo = {};

Page({
  data: {
    navList: null,
    currentCat,
    currentTabInit: 0,
    greensList,
    scrollTop: 0,
    allMoney: allMoney.toFixed(2),
    ordersList,
    // height,
    entryShow: false, //购物车显示
    popShow: false,
    reserveShow,
    quorumShow: false,
    currentGood,
    currentIndex: null,
    currentItem: null,
    currentTable,
    saveOrdersFalg, //挂单按钮是否显示
    tableList,
    menuStatus,
    shoppingCart,
    allowChooseTable: !app.globalData.appSetting.foundingSwitch,
    basePath: app.globalData.basePath,
    seachGoods: false
  },

    // 组件所在页面的生命周期函数
    onLoad: function () {
      var mobInfo = app.getSystemInfo();

      this.setData({
        W: mobInfo.mob_width + 'px',
        H: mobInfo.mob_height + 'px',
        scrollHeight: mobInfo.mob_height - 90 * mobInfo.mob_onerpx
      })
      basemenu.onLoad(this);
      },
      onShow:function(){
        basemenu.onShow(this)
      },
    hide: function () { },
    resize: function () { },

    /**
     * 添加购物车和删除购物车
     */
    addQity:function(e){
      basemenu.addQity(this, e)
    },
    /**
     *  查看购物车
     */
    entryOrders:function(){
      basemenu.entryOrders(this)
    },
    /**
     *  隐藏挂单
     */
    vanish:function(){
      basemenu.vanish(this)
    },
    /**
     * 清空购物车
     */
    emptyCat:function(){
      basemenu.emptyCat(this)
    },
    /**
     * 移除购物车,和清除购物车最大的区别就是也清除桌位和就餐人员信息
     */
    removeShoppingCart:function(){
      basemenu.removeShoppingCart(this)
    },
    /**
     * 关闭弹框
     */
    closePop:function(){
      basemenu.closePop(this)
    },
    /**
     * 选好了
     */
    chosen: function (){
      basemenu.chosen(this)
    },
    /**
     * 选择餐位
     */
    reserveConfirm:function(e){
      basemenu.reserveConfirm(this, e)
    },
    /**
     * 选择就餐人数
     */
    reserveQuorum:function(e){
      basemenu.reserveQuorum(this, e)
    },
    /**
     * 查看挂单
     */
    checkEntryOrders:function(){
      basemenu.checkEntryOrders(this)
    },
    /**
     * 菜品滑动事件
     */
    doScroll:function (e) {
      basemenu.doScroll(this,e)
    },
    /**
     * 切换菜单
     */
    switchNav: function (e) {
      basemenu.switchNav(this, e)
    },
    /**
     * 选择规格
     */
    selectGuige: function (e) {
      basemenu.selectGuige(this, e)
    },
    /**
     * 选择规格里边的属性
     */
    selectGg: function(e) {
      basemenu.selectGg(this, e)
    },
    /**
     * 规格弹窗加入购物车逻辑
     */
    addToCart2: function (e) {
      basemenu.addToCart2(this, e)
    },

    setOptions:function(options){
      basemenu.setOptions(this, options)
    },
    /**
     * 增加或者减少购物车商品数量
     */
    operaGoodsNumber: function (e) {
      basemenu.operaGoodsNumber(this, e)
    },
    /**
     * 刷新数据
     */
    flushPageData:function(){
    },  
    /**
     * 用户查找菜品
     */
    searchGoods:function(e){
      basemenu.searchGoods(this, e)
    }
})