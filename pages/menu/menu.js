// pages/menu/menu.js
var app = getApp();
Page({
  data: {
    navList:[
      {
        title:"10元区",
        type:0
      },{
        title: "20元区",
        type:1
      }, {
        title: "30元区",
        type:2
      }, {
        title: "40元区",
        type: 3
      }
    ],
    currentTab:0,
    greensList:[
      {
        title:'10元区',
        arr:[
          {
            name:'青椒肉丝',
            price:10,
            sales:185,
            qity:0
          }, {
            name: '青椒肉丝',
            price: 10,
            sales: 185,
            qity: 0
          }, {
            name: '青椒肉丝',
            price: 10,
            sales: 185,
            qity: 0
          }, {
            name: '青椒肉丝',
            price: 10,
            sales: 185,
            qity: 0
          }
        ]
      }, {
        title: '20元区',
        arr: [
          {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }
        ]
      }, {
        title: '30元区',
        arr: [
          {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }
        ]
      },{
        title: '40元区',
        arr: [
          {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }, {
            name: '泡椒肉丝',
            price: 20,
            sales: 185,
            qity: 0
          }
        ]
      }
    ],
    qityArr:[0,0,0,0],
    scrollTop:0,
    allQiry:0,
    ordersList:[],
    height:'',
    entryShow:false,
    popShow:false,
    reserveShow:false,
    quorumShow:false
  },
  onLoad: function (options) {
    var that = this;
    var mobInfo = app.getSystemInfo();
    that.setData({
      W: mobInfo.mob_width +'px',
      H: mobInfo.mob_height +'px'
    })
  },
  onReady: function () {
  
  },
  /**
   * 切换菜单
   */
  switchNav:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    var top = 0
    if(index>0){
      for(let i = 0;i<index;i++){
        var query = wx.createSelectorQuery()
        query.select(`#item${i}`).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          top = top + res[0].height;
          if(i==index-1){
            that.setData({
              scrollTop: top,
            })
          }
        })
      }
    }else{
      that.setData({
        scrollTop:0,
      })
    }
    that.setData({
   
      currentTab: e.currentTarget.dataset.type
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
    var List = data[item].arr;
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
    List[index].qity = qity;
    that.setData({
      greensList: that.data.greensList,
      qityArr: that.data.qityArr,
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
    var List = data[item].arr;
    var qity = List[index].qity;
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
    that.setData({
      greensList: that.data.greensList,
      qityArr: that.data.qityArr,
      allQiry: that.data.allQiry
    })
  },
  /**
   *  查看挂单
   */
  entryOrders:function(){
    var that = this;
    that.data.ordersList = [];
    var greensList = that.data.greensList
    for (let i = 0; i < greensList.length;i++){
      for (let j = 0; j < greensList[i].arr.length; j++){
        if (greensList[i].arr[j].qity>0){
          var obj = greensList[i].arr[j];
          obj.i = i;
          obj.j = j;
          that.data.ordersList.push(obj)
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
      slide:false
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
      for (let j = 0; j < greensList[i].arr.length; j++) {
        greensList[i].arr[j].qity = 0
      }
    }
    that.setData({
      greensList: that.data.greensList,
      qityArr: [0, 0, 0, 0],
      allQiry: 0,
      entryShow: false,
      ordersList:[]
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
      that.data.greensList[i].arr[j].qity++;
      that.data.allQiry++;
      that.data.ordersList[index].qity++
    } else {
      that.data.qityArr[i]--;
      that.data.greensList[i].arr[j].qity--;
      that.data.allQiry--;
      that.data.ordersList[index].qity--
    }
    that.setData({
      greensList: that.data.greensList,
      qityArr: that.data.qityArr,
      allQiry: that.data.allQiry,
      ordersList: that.data.ordersList
    })
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
  }
})