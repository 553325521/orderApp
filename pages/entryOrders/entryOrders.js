// pages/entryOrders/entryOrders.js
Page({
  data: {
    cardTeams: [
      {
        list: [{ right: 0, show: false }, { right: 0, show: false }, { right: 0, show: false }]
      },
      {
        list: [{ right: 0, show: false }, { right: 0, show: false }, { right: 0, show: false }]
      }
    ],
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    
  },
  drawStart: function (e) {
    let that = this;
    let touch = e.touches[0];
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    that.data.startX = touch.clientX;
    that.data.startRight = that.data.cardTeams[index].list[item].right
  },
  drawEnd: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    if (that.data.cardTeams[index].list[item].right < 50) {
      that.data.cardTeams[index].list[item].right = 0
    } else {
      that.data.cardTeams[index].list[item].right = 50
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
    let item = e.currentTarget.dataset.item;
    let endX = touch.clientX;
    if (endX - startX == 0)
      return;
    //从右往左  
    if ((endX - startX) < 0) {
      if (that.data.cardTeams[index].list[item].show != true) {
        that.data.cardTeams[index].list[item].show = true;
        that.data.startRight = startX - endX;
        that.data.startRight > 50 ? that.data.cardTeams[index].list[item].right = 50 : that.data.cardTeams[index].list[item].right = that.data.startRight;
      } else {
        that.data.cardTeams[index].list[item].right = 50
      }
    } else {//从左往右 
      if (that.data.cardTeams[index].list[item].show != true) {
        that.data.cardTeams[index].list[item].right = 0
      } else {
        that.data.startRight = 50 - (endX - startX);
        that.data.startRight < 0 ? that.data.cardTeams[index].list[item].right = 0 : that.data.cardTeams[index].list[item].right = that.data.startRight;
        that.data.startRight <= 0 ? that.data.cardTeams[index].list[item].show = false : that.data.cardTeams[index].list[item].show = true;
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
})