// pages/menu/menu.js
var basemenu = require("basemenu.js");

var app = getApp();


Page({

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
})