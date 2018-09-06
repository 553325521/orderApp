// pages/statement/statement.js
var app = getApp()
Page({

  data: {
  
  },
  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },
  onShow: function () {
  
  },
  navTo:function(e){
    var url = e.currentTarget.dataset.url
    app.pageTurns(url)
  }
})