// pages/index/index.js
var app = getApp();
var currentPage = "../menu/menu";//当前是哪个页面


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
      if (currentPage == '../menu/menu') {
        this.menu = this.selectComponent("#menu");
        this.menu.setOptions(options);
      }
      this.setData({
        currentPage
      })
    }
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
   * 用户点击下方的tabBar以后
   */
  switchTab:function(e){
    if (e.currentTarget.dataset.currentPage == '../cashier/cashier'){
      app.pageTurns('../cashier/cashier')
      return;
    }
   
    currentPage = e.currentTarget.dataset.currentPage;
    this.setData({
      currentPage
    })

    //切换Tab
    switch (currentPage){
      case '../founding/founding':
        console.info("加载../founding/founding");break;
      case '../indent/indent':
        console.info("加载../indent/indent"); break;
    }
  
  },
  /**
   * 加载开台页面
   */
  loadFounding: function () {
    console.log("加载了哦")

  },
  /**
   * 加载订单页面
   */
  // loadIndent:function(){
  //   console.log("加载了哦")
  //   var common = require('../../utils/common.js');
  //   var tabBar = require('../template/tabBar.js');
    
  // }


})