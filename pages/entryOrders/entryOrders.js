// pages/entryOrders/entryOrders.js
var app = getApp()
// var currentSlideOrderId = 0;//当前移动的order
var movedistance = 0;//移动的距离
var startX = 0;//开始滑动的时候的x轴位置
var sliderWidth = 120;//滑块的宽度，单位rpx
var silderStatus = false;//当前滑块是打开的吗
var shopSaveOrderMessage = [];

var cardTeams = [//挂单的列表，每个属性是按日期分开的
]

var currentIJ = {
  i : -1,
  j:-1
}

Page({
  data: {
    cardTeams,
    movedistance,
    sliderWidth,
    currentIJ
  },
  onLoad: function (options) {
    this.pageInit();
    //加载挂单
    this.flushSaveOrderMess()
  
  },
  onReady: function () {
  
  },
  onShow: function () {
    
  },
  pageInit:function(){
    movedistance = 0;//移动的距离
    startX = 0;//开始滑动的时候的x轴位置
    sliderWidth = 120;//滑块的宽度，单位rpx
    silderStatus = false;//当前滑块是打开的吗
  },
  /**
   * 刷新挂单数据
   */
  flushSaveOrderMess:function(){
    var that = this;
    shopSaveOrderMessage =  app.getStorageOrder()
    if(shopSaveOrderMessage.length < 1){
      app.reLaunch('../index/index?page=../menu/menu')
      return;
    }
    cardTeams = []
    var orders={}
    orders.list = []
    var lastTime = ""
    shopSaveOrderMessage.forEach(function(order,index){
      if (order.saveOrderDate.substring(0,11) != lastTime){
        if (orders.list.length > 0){
          cardTeams.push(orders)
        }
        orders = {}
        orders.CREATE_TIME = order.saveOrderDate
        orders.list = []
        orders.totalMoney = 0
        lastTime = order.saveOrderDate.substring(0, 11)
      }   
      orders.totalMoney += Number(order.totalMoney)
      orders.list.push(order)
    })
    //TODo listBug
    cardTeams.push(orders)
    
    console.info(cardTeams)
    that.setData({
      cardTeams
    })
  },
  /**
   * 手指滑动，刚点击的时候触发该事件
   */
  drawStart: function (e) {
    console.info(e)
    console.info(this)
    console.info(silderStatus)
    console.info(movedistance)
    if (silderStatus && e.currentTarget.dataset.i != currentIJ.i && e.currentTarget.dataset.j != currentIJ.j){
      silderStatus = false;
      movedistance = 0
      this.setData({
        movedistance
      })
    }
    currentIJ.i = e.currentTarget.dataset.i
    currentIJ.j = e.currentTarget.dataset.j

    let touch = e.touches[0];
    startX = touch.clientX;
    this.setData({
      currentIJ
    })
  },
  /**
   * 手指滑动，过程中触发该事件
   */
  drawMove: function (e) {
    let touch = e.touches[0];
    let length = touch.clientX - startX;
    if (silderStatus && length > 0 && length < sliderWidth){
      movedistance = length - sliderWidth
      this.setData({
        movedistance
      })
    }else if(!silderStatus && length < 0 && length > -sliderWidth){
      movedistance = length
      this.setData({
        movedistance
      })
    }
  },
  /**
   * 手指滑动，结束的时候触发该事件
   */
  drawEnd: function (e) {
    let touch = e.changedTouches[0];
    let length = touch.clientX - startX;
    if (silderStatus && length > 10){//如果滑之前滑块是开的，并且现在往右滑了超过10rpx的话，就关闭滑块
        silderStatus = false;
        movedistance = 0
        this.setData({
          movedistance
        })  
    } else if (!silderStatus) {//如果滑之前滑块是关的
      if (-length > sliderWidth/2){//如果现在滑的距离大于滑块的一半的话，就自动打开滑块
        silderStatus = true
        movedistance = -sliderWidth
      } else {//反之，自动关闭滑块
        silderStatus = false;
        movedistance = 0
      }
      this.setData({
        movedistance
      })  
    }
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
   * 删除订单
   */
  deleteOrder:function(e){
    var that = this;
    var deleteI = e.currentTarget.dataset.i
    var deleteJ = e.currentTarget.dataset.j

    app.modal({
      content:'确定删除？',
      success:function(res){
        if(res.confirm){
          that.removeSaveOrder(deleteI, deleteJ)
          that.flushSaveOrderMess()
        } else if (res.cancel){
          //闭合滑块
            silderStatus = false;
            movedistance = 0
        
            that.setData({
              movedistance
            })
        }
      }
    })
    
  },
  /**
   * 根据当前点击的序号删除指定的挂单单子
   */
  removeSaveOrder: function (deleteI, deleteJ){
    var that = this
    var lastTime = ""
    var tempI = 0;
    var tempJ = 0;
    var deleteIndex = -1;
    shopSaveOrderMessage.forEach(function (order, index) {
      if (deleteI == tempI && deleteJ == tempJ) {
        deleteIndex = index
      }
      if (order.saveOrderDate.substring(0, 11) != lastTime) {
        if (lastTime != "") {
          tempI++
          tempJ = 0
        }
        lastTime = order.saveOrderDate.substring(0, 11)
      }
      tempJ++
    })
    if (deleteIndex != -1) {
      var deleteShoppingCart = app.removeStorageOrder(deleteIndex)
    }
    return deleteShoppingCart
  },
  /**
   * 恢复挂单的单子
   */
  clickOrder: function(e){
    var that = this;
    var deleteI = e.currentTarget.dataset.i
    var deleteJ = e.currentTarget.dataset.j
    var shoppingCart = that.removeSaveOrder(deleteI, deleteJ)
    console.info(shoppingCart)
    app.recoverShoppingCart(shoppingCart)
    app.redirectTo('../orderDetail/orderDetail')
  }
})