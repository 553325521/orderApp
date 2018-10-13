// pages/menu/menu.js
var app = getApp();
Page({
  data: {
    navList:null,
    currentTab:0,
    currentTabInit: 0,
    greensList:null,
    qityArr:null,
    scrollTop:0,
    allQiry:0,
    allMoney:0,
    ordersList:[],
    height:'',
    entryShow:false,
    popShow:false,
    reserveShow:false,
    quorumShow:false,
    goodsGuige:{
      guige: [],
      zuofa: [],
      kouwei: []
    }
  },
  onShow: function (options) {
    var that = this;
    var mobInfo = app.getSystemInfo();
    that.setData({
      W: mobInfo.mob_width +'px',
      H: mobInfo.mob_height +'px'
    })
    that.loadGoodsInfo();
  },
  onReady: function () {
  
  },
  loadGoodsInfo: function () {
    let that = this;
    wx.request({
      url: app.globalData.basePath + 'json/GoodsType_select_loadGoodsTypeByShopId.json',
      method: "post",
      data: {
        shopid: app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          let qityArr = [];
          for (let i = 0; i < res.data.data.greensList.length; i++) {
            qityArr.push(0);
          }
          that.setData({
            navList: res.data.data.navList,
            greensList: res.data.data.greensList,
            currentTab: res.data.data.navList[0].GTYPE_PK,
            qityArr: qityArr
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '登录失败',
        })
      }
    })
  },
  /**
   * 无图点餐的减少数量
   */
  orderDishes:function(e){
    var that = this;
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var data = that.data.greensList;
    var List = data[item].infos;
    var qity = List[index].qity;
    var qityArr = that.data.qityArr[item];
    var allQiry = that.data.allQiry;
    if (qity > 0){
      qity--;
      that.data.qityArr[item] = qityArr - 1;
      that.data.allQiry --
    }else{
      qity++;
      that.data.qityArr[item] = qityArr + 1;
      that.data.allQiry ++
    }
    qityArr = [];
    for (let i = 0; i < that.data.greensList.length; i++) {
      qityArr.push(0);
    }
    List[index].qity = qity;
    that.setData({
      greensList: that.data.greensList,
      qityArr: qityArr,
      allQiry: that.data.allQiry
    })
  },
  /**
   * 添加购物车和删除购物车
   */
  addQity:function(e){
    var that = this;
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var data = that.data.greensList;
    var List = data[item].infos;
    // 已点数量
    var qity = 0;
    if (List[index].qity != undefined) {
      qity = List[index].qity;
    }
    var qityArr = that.data.qityArr[item];
    if (type == "+"){
      that.data.qityArr[item] = qityArr + 1
      List[index].qity = qity + 1;
      that.data.allQiry++
    }else{
      that.data.qityArr[item] = qityArr - 1
      List[index].qity = qity - 1;
      that.data.allQiry--
    }
    that.addCart(List[index]);
    that.setData({
      greensList: that.data.greensList,
      qityArr: that.data.qityArr,
      allQiry: that.data.allQiry
    })
  },
  /**
   * 添加购物车
   */
  addCart:function(item) {
    console.info(item);
    // wx.request({
    //   url: app.globalData.basePath + 'json/GoodsType_add_addGoodsToCart.json',
    //   method: "post",
    //   data: {
    //     shopid: app.globalData.shopid,
    //     openid: wx.getStorageSync('openid')
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    //   },
    //   success: function (res) {
    //     if (res.data.code == '0000') {
    //       let qityArr = [];
    //       for (let i = 0; i < res.data.data.greensList.length; i++) {
    //         qityArr.push(0);
    //       }
    //       that.setData({
    //         navList: res.data.data.navList,
    //         greensList: res.data.data.greensList,
    //         currentTab: res.data.data.navList[0].GTYPE_PK,
    //         qityArr: qityArr
    //       })
    //     }
    //   },
    //   fail: function (error) {
    //     wx.showToast({
    //       title: '登录失败',
    //     })
    //   }
    // })
  },
  /**
   *  查看挂单
   */
  entryOrders:function(){
    var that = this;
    that.data.ordersList = [];
    var greensList = that.data.greensList;
    let allMoney = 0
    for (let i = 0; i < greensList.length;i++){
      for (let j = 0; j < greensList[i].infos.length; j++){
        if (greensList[i].infos[j].qity>0){
          var obj = greensList[i].infos[j];
          obj.i = i;
          obj.j = j;
          that.data.ordersList.push(obj)
          allMoney = parseFloat(obj.GOODS_PRICE) + parseFloat(allMoney);
        }
      }
    }
    if (that.data.ordersList.length>4){
      that.data.height = 384+'rpx';
    }else{
      that.data.height=''
    }
    that.setData({
      ordersList: that.data.ordersList,
      height: that.data.height,
      entryShow: true,
      slide:false,
      allMoney: allMoney /100 + '.00'
    })
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
    var greensList = that.data.greensList
    for (let i = 0; i < greensList.length; i++) {
      for (let j = 0; j < greensList[i].infos.length; j++) {
        greensList[i].infos[j].qity = 0
      }
    }
    let qityArr = [];
    for (let i = 0; i < that.data.greensList.length; i++) {
      qityArr.push(0);
    }
    that.setData({
      greensList: that.data.greensList,
      qityArr: qityArr,
      allQiry: 0,
      entryShow: false,
      ordersList:[],
      allMoney: 0
    })
  },
  /**
   * 查看挂单修改数量
   */
  alterCount:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var i = e.currentTarget.dataset.i;
    var j = e.currentTarget.dataset.j;
    if (type == "+") {
      that.data.qityArr[i]++;
      that.data.greensList[i].infos[j].qity++;
      that.data.allQiry++;
      that.data.ordersList[index].qity++;
      that.data.allMoney = parseFloat(that.data.allMoney) + parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100
    } else {
      let tpnum = that.data.greensList[i].infos[j].qity - 1;
      that.data.qityArr[i]--;
      that.data.allQiry--;
      that.data.ordersList[index].qity--;
      that.data.greensList[i].infos[j].qity--;
      that.data.allMoney = parseFloat(that.data.allMoney) - parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100
      if (tpnum <= 0) {
        that.data.ordersList.splice(index, 1)
      }
    }
    that.setData({
      greensList: that.data.greensList,
      qityArr: that.data.qityArr,
      allQiry: that.data.allQiry,
      ordersList: that.data.ordersList,
      allMoney: that.data.allMoney.toFixed(2)
    })
    // 购物车里面空的时候隐藏购物车列表
    if (that.data.ordersList.length == 0) {
      that.setData({
        entryShow: false
      })
    }
  },
  /**
   * 关闭弹框
   */
  closePop:function(){
    var that = this;
    that.setData({
      popShow:false,
      reserveShow: false,
      entryShow: false,
      quorumShow: false
    })
  },
  /**
   * 选好了
   */
  chosen:function(){
    var that = this;
    that.setData({
      reserveShow: true,
      entryShow: false
    })
  },
  /**
   * 选择餐位
   */
  reserveConfirm:function(){
    var that = this;
    that.setData({
      reserveShow: false,
      quorumShow: true
    })
  },
  /**
   * 
   */
  reserveQuorum:function(){
    var that = this;
    that.setData({
      quorumShow: false
    })
    app.pageTurns(`../orderDetail/orderDetail`)
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
    that.data.greensList.forEach(function (item, i) {
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
  selectGuige: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var data = that.data.greensList;
    var info = data[item].infos[index];
    that.data.goodsGuige.guige = JSON.parse(info.GOODS_SPECIFICATION);
    that.data.goodsGuige.zuofa = JSON.parse(info.GOODS_RECIPE);
    that.data.goodsGuige.kouwei = JSON.parse(info.GOODS_TASTE);
    that.setData({
      popShow: true,
      goodsGuige: that.data.goodsGuige
    })
    console.info(that.data.goodsGuige)
  }
})