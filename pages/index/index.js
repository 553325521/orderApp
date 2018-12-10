// pages/index/index.js
var app = getApp();
var currentPage = app.globalData.tabBar.list[0].pagePath;//当前是哪个页面
var foundingSwitch = app.globalData.appSetting.foundingSwitch;
var indexPage = foundingSwitch ? '../founding/founding' : '../menu/menu';

//引入单页面页面的js
// var indent = require('../indent/indent.js');//引入modul

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentPage: currentPage,
    tabBar: app.globalData.tabBar//获取tabBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options != undefined && options.page != undefined) {
      currentPage = options.page;
      if (options.page == 'indexPage'){
        currentPage = indexPage;
      }
      //set数据在上边，不然页面没出来，下边后去不到
      this.setData({
        currentPage
      })
      if (currentPage == '../menu/menu') {
        this.menu = this.selectComponent("#menu");
        this.menu.setOptions(options);
      }
    }
    this.pageInit()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
   
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 页面初始化
   */
  pageInit:function(){
    var that = this;
   
    // currentPage = menu;
    // if (app.globalData.appSetting.foundingSwitch){
    //   if (app.getShoppingCart().table == undefined){
    //     app.globalData.tabBar.list[0].pagePath = "../founding/founding"
    //     app.globalData.tabBar.list[0].text = "开台"
    //     if (currentPage == '../menu/menu'){
    //       currentPage = '../founding/founding'
    //     }
    //   }else{
    //     app.globalData.tabBar.list[0].pagePath = "../menu/menu"
    //     app.globalData.tabBar.list[0].text = "菜单"
    //     if (currentPage == '../founding/founding') {
    //       currentPage = '../menu/menu'
    //     }
    //   }
    //   that.setData({
    //     currentPage,
    //     tabBar: app.globalData.tabBar//获取tabBar
    //   })
    // }
    
  },
  /**
   * 用户点击下方的tabBar以后
   */
  switchTab:function(e){
    let clickPage = e.currentTarget.dataset.currentPage
    var that = this
    if (clickPage == '../cashier/cashier'){
      app.pageTurns('../cashier/cashier')
      return;
    }

    //判断是不是点了第一个按钮
    // if (clickPage == '../menu/menu'){
    //   that.switchMenu('../founding/founding')
    // } else if (clickPage == '../founding/founding'){
    //   that.switchMenu('../menu/menu')
    // }else{
    //   currentPage = clickPage
    // }
    currentPage = clickPage
    that.setData({
      tabBar: app.globalData.tabBar,
      currentPage
    })

  },
  /**
   * 加载开台页面
   */
  loadFounding: function () {
    console.log("加载了哦")

  },
  /**
   * 切换当前页面
   */
  switchPage:function(page){
    var switchPage = page.detail.page
    this.switchMenu(switchPage)
    currentPage = page.detail.page
    this.setData({ currentPage})
  },
  setMenuData:function(options){
    this.menu = this.selectComponent("#menu");
    this.menu.setOptions(options);
  }
    
})