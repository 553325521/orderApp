// pages/indent/indentDateil.js
var app = getApp()
Page({
  data: {
    cardTeams: [{ right: 0, show: false }, { right: 0, show: false }, { right: 0, show: false }],
    startY:0,
    startRight:0
  },
  onLoad: function (options) {
    console.log(options)
    var that = this;
    that.setData({
      type : options.type
    })
  },
  onReady: function () {
  
  },
  drawStart: function (e) {
    let that = this;
    let touch = e.touches[0];
    let index = e.currentTarget.dataset.index;
    console.log(index)
    that.data.startX = touch.clientX;
    that.data.startRight = that.data.cardTeams[index].right
  },
  drawEnd: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    if (that.data.cardTeams[index].right < 30){
      that.data.cardTeams[index].right = 0
    }else{
      that.data.cardTeams[index].right = 30
    }
    that.setData({
      cardTeams: that.data.cardTeams
    });
  },
  drawMove: function (e) {
    let that = this;
    let touch = e.touches[0];
    let startX = that.data.startX;
    let index = e.currentTarget.dataset.index;
    let endX = touch.clientX;
    if (endX - startX == 0)
      return;
    //从右往左  
    if ((endX - startX) < 0) {
      if (that.data.cardTeams[index].show != true){
        that.data.cardTeams[index].show = true;
        that.data.startRight = startX - endX;
        that.data.startRight > 30 ? that.data.cardTeams[index].right = 30 : that.data.cardTeams[index].right = that.data.startRight;
      }else{
        that.data.cardTeams[index].right = 30
      }   
    } else {//从左往右 
      if (that.data.cardTeams[index].show != true) {
        that.data.cardTeams[index].right = 0
      } else {
        that.data.startRight = 30 - (endX - startX);
        that.data.startRight < 0 ? that.data.cardTeams[index].right = 0 : that.data.cardTeams[index].right = that.data.startRight;
        that.data.startRight <= 0 ? that.data.cardTeams[index].show = false : that.data.cardTeams[index].show = true;
      }  
      
    }
    that.setData({
      cardTeams: that.data.cardTeams
    });

  },
  //删除item  
  delItem: function (e) {
    var dataId = e.target.dataset.id;
    console.log("删除" + dataId);
    var cardTeams = this.data.cardTeams;
    var newCardTeams = [];
    for (var i in cardTeams) {
      var item = cardTeams[i];
      if (item.id != dataId) {
        newCardTeams.push(item);
      }
    }
    this.setData({
      cardTeams: newCardTeams
    });
  },
  /**
   * 加菜
   */
  addDish:function(){
    wx.switchTab({
      url: '../menu/menu',
    })
  },
  navTo:function(){
    app.pageTurns(`../entryOrders/entryOrders`)
  } 
})