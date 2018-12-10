// pages/menu/menu.js
var app = getApp();
var pageTitle = "菜单";//当前页面title
var greensList;//商品列表，一个map，里边两个key 一个是放的是列表，为每个商品的数量及该商品的属性的集合；另一个存放的是该类别下的数量
var navList;//分类列表，里边有分类名称和PK
var qityArr = null;//一个列表，存放的是每个分类下点的商品的数量的集合
// var allQiry=0;//商品总数量
var ordersList = [];//购物车列表吧？
var allMoney = 0.0;//订单总金额
var tableList = [];//桌位列表
var goodsGuige = {
  guige: [],
  zuofa: [],
  kouwei: []
}//当前弹框的属性 规格做法和口味  
var height = '';//还不知道是什么高度
var saveOrdersFalg = false;//挂单按钮是否显示
var currentGood;//当前商品
var isSelected = false;//选择规格了吗
var reserveShow = false;//显示选择餐位
// var quorumShow = false;//显示选择人数
var selectPersonNum = true;//选择人数开关是否开启
var currentTable = {};//当前桌位
var currentEatPersonNum = 0;//当前餐桌就餐的人数
var menuStatus = 0;//当前菜单页面状态（0：没状态 1：点菜 2：加菜）
var shoppingCart = {};//购物车信息

Page({

  data: {
    addGlobalClass:true,
    navList:null,
    currentTab:0,
    currentTabInit: 0,
    greensList,
    qityArr: qityArr,//一个数组，里边装的是每个分类点的菜的数量
    scrollTop:0,
    // allQiry,
    allMoney: allMoney.toFixed(2),
    ordersList,
    height,
    entryShow:false,//购物车显示
    popShow:false,
    reserveShow,
    quorumShow:false,
    currentGood,
    currentIndex: null,
    currentItem: null,
    currentTable,
    saveOrdersFalg,//挂单按钮是否显示
    goodsGuige,
    // isSelected: isSelected,
    tableList,
    menuStatus,
    shoppingCart,
    allowChooseTable: !app.globalData.appSetting.foundingSwitch
  },


  /**
   * page的生命周期
   */

    // 组件所在页面的生命周期函数
    onLoad: function () {
     
      app.updateTitle(pageTitle)
      this.pageInit();
      this.loadGoodsInfo();
      this.flushStroageData()
      this.flushShoppingCart()
      this.backMainPage()
      },
    hide: function () { },
    resize: function () { },

    //自定义页面初始化函数
    pageInit:function(){
      var that = this;
      app.showLoading();
      var mobInfo = app.getSystemInfo();
      
      that.setData({
        W: mobInfo.mob_width + 'px',
        H: mobInfo.mob_height + 'px',
        scrollHeight: mobInfo.mob_height - 90 * mobInfo.mob_onerpx
      })
      // 查询菜单和数量
      // that.loadGoodsInfo();
      // 查询餐桌
      that.loadTables();
      //TODO 查询开关设置，比如选择人数是否开启
      //。。。。。。。

      // that.flushStroageData()
     
      // that.flushShoppingCart()
    },
    /**
     * 刷新缓存数据
     */
    flushStroageData:function(){
      var that = this;
      console.info(wx.getStorageSync('ORDER_PK'))
      //判断是加菜状态吗
      if(wx.getStorageSync('ORDER_PK') != undefined && wx.getStorageSync('ORDER_PK') != ''){
        menuStatus = 2
      }else{
        shoppingCart = app.getShoppingCart()
        if (shoppingCart != undefined && shoppingCart != undefined && shoppingCart.table != undefined && shoppingCart.table != '') {
          menuStatus = 1;
          currentTable = shoppingCart.table,
            currentEatPersonNum = shoppingCart.personNum == undefined ? 0 : shoppingCart.personNum
        }else{
          menuStatus = 0
        }
        
      }

     

      that.setData({
        menuStatus,
        currentTable
      })
    },
    /**
     * 刷新购物车信息
     */
    flushShoppingCart:function(){
      var that = this;
      shoppingCart = app.getShoppingCart()
      if (shoppingCart == undefined){
        shoppingCart = {}
      }
      if (shoppingCart.totalNumber == undefined){
        shoppingCart.totalNumber = 0
      }
      if (shoppingCart.goods == undefined){
        shoppingCart.goods = []
      }
      if (shoppingCart.totalMoney == undefined) {
        shoppingCart.totalMoney = 0;
      }
      currentTable = shoppingCart.table == undefined ? {} : shoppingCart.table,
        currentEatPersonNum = shoppingCart.personNum == undefined ? 0 : shoppingCart.personNum
      
      that.setData({
        shoppingCart,
        currentTable
      })
    },

    loadTables: function() {
      let that = this;
      app.sendRequest({
        url: 'Tables_select_loadTableList',
        method: 'POST',
        data: {
          shopid: app.globalData.shopid,
          openid: wx.getStorageSync('openid')
        },
        success: function (res) {
          if (res.data.code == '0000') {
            tableList = res.data.data;
            that.setData({
              tableList: tableList,
            })
            // 查询挂单数量
            // that.loadCountOrderWei();
          }
        },
        fail: function (error) {
          app.hintBox('查询失败', 'none')
        }
      });
    },
    loadGoodsInfo: function () {
      let that = this;
      app.showLoading()
      app.sendRequest({
        url: 'GoodsType_select_loadGoodsTypeByShopId',
        method: 'POST',
        data: {
          shopid: app.globalData.shopid,
          openid: wx.getStorageSync('openid')
        },
        success: function (res) {
          if (res.data.code == '0000') {
            app.hideLoading()
            // 查询购物车
            that.getOrdersList();
            qityArr = [];
            greensList = res.data.data.greensList;
            navList = res.data.data.navList;
            for (let i = 0; i < greensList.length; i++) {
              var count = 0;
              if (shoppingCart != undefined && shoppingCart.goods != undefined){
                shoppingCart.goods.forEach(function (good, index) {
                  if (navList[i].GTYPE_PK == good.GTYPE_FK) {
                    count+=good.GOODS_NUMBER
                  }
                })
              }
              qityArr.push(count);
            }

            if (greensList.length>1){
              that.setData({
                isExistData:true
              })
            }

            //如果没有类别，就不set类别了
            if (navList.length != 0) {
              that.setData({
                currentTab: navList[0].GTYPE_PK,
              })
            }
            that.setData({
              navList,
              greensList,
              qityArr
            })
          }
        },
        fail: function (error) {
          app.hintBox('操作失败', 'none')
        }
      });


    },
    /**
     * 添加购物车和删除购物车
     */
    addQity:function(e){
      console.info("添加购物车和删除后无车")
      var that = this;
      app.showLoading()
      var item = e.currentTarget.dataset.item;
      var index = e.currentTarget.dataset.index;
      var type = e.currentTarget.dataset.type;
      var List = data[item].infos;
      var _url = '';
      // 已点数量
      var qity = 0;
      if (List[index].qity != undefined) {
        qity = List[index].qity;
      }
      var qityArr = qityArr[item];
      if (type == "+"){
        qityArr[item] = qityArr + 1
        List[index].qity = qity + 1;
      }else{
        qityArr[item] = qityArr - 1
        List[index].qity = qity - 1;
      }
      List[index].FK_SHOP = app.globalData.shopid;
      List[index].FK_USER = wx.getStorageSync('openid');

      that.setData({
        greensList,
        qityArr
      })
      // 查询购物车
      that.getOrdersList();
    },
    /**
     *  查看购物车
     */
    entryOrders:function(){
      var that = this;

      shoppingCart = app.getShoppingCart()

      if (shoppingCart.goods.length > 4) {
        height = 384 + 'rpx';
      } else {
        height = ''
      }
      that.setData({
        // ordersList: ordersList,
        height: height,
        entryShow: true,
        slide: false,
        allMoney: allMoney.toFixed(2)
      })

    },
    getOrdersList:function() {
      var that = this;
      that.flushShoppingCart()

      console.info("购物车")
      console.info(shoppingCart)
    

    
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
      for (let i = 0; i < greensList.length; i++) {
        for (let j = 0; j < greensList[i].infos.length; j++) {
          greensList[i].infos[j].qity = 0
        }
      }
      qityArr = [];
      for (let i = 0; i < greensList.length; i++) {
        qityArr.push(0);
      }
      // app.clearShoppingCart()
      app.removeShoppingCart()
      that.flushShoppingCart()
      that.backMainPage()
      that.setData({
        greensList: greensList,
        qityArr: qityArr,
        entryShow: false,
      })
    },
    /**
     * 移除购物车,和清除购物车最大的区别就是也清除桌位和就餐人员信息
     */
    removeShoppingCart:function(){
      shoppingCart = app.removeShoppingCart()
      this.flushShoppingCart()
      this.backMainPage()
    },
    /**
     * 查看挂单修改数量
     */
    alterCount:function(e){
      var that = this;
      var that = this;
      var index = e.currentTarget.dataset.index;
      var type = e.currentTarget.dataset.type;
      var _url = '';
      var tpnum = 0;
      if (type == "+") {
        tpnum = ++greensList[i].infos[j].qity;
      }else{
        tpnum = greensList[i].infos[j].qity - 1;
       
        greensList[i].infos[j].qity--;
       
      }
      that.setData({
        greensList: greensList,
        qityArr: qityArr,
              
        // ordersList: ordersList,
        allMoney: allMoney.toFixed(2),
      })
    },
    /**
     * 关闭弹框
     */
    closePop:function(){
      var that = this;
      reserveShow = false;
      that.setData({
        popShow:false,
        reserveShow: reserveShow,
        entryShow: false,
        quorumShow: false
      })
    },
    /**
     * 选好了
     */
    chosen: function (){
      var that = this;
      if(menuStatus == 2){
        //加菜
        app.pageTurns('../indent/indentDateil')
        return;
      }else{
        if (currentTable == undefined || currentTable == '' || JSON.stringify(currentTable) == '{}'){
          reserveShow = true;//显示选择餐位
          this.setData({
            reserveShow
          })
        } else if (currentEatPersonNum == 0){
          this.setData({
            quorumShow:true
          })
        }else{
          app.pageTurns('../orderDetail/orderDetail')
        }
      }   
    },
    /**
     * 选择餐位
     */
    reserveConfirm:function(e){
    
      var that = this;
      var quorumShow = false;
      if (selectPersonNum !=undefined && selectPersonNum != '' && currentEatPersonNum == 0){//如果选择就餐人数的开关是打开的，那么就显示就餐人数
        quorumShow = true;
      }

      currentTable = tableList[e.target.dataset.index]//当前桌位信息
  //如果当前餐位人数等于0或者大于该餐桌容纳的数量，自动赋值
      if (currentEatPersonNum == 0 || currentEatPersonNum > currentTable.TABLES_NUM) {
        currentEatPersonNum = currentTable.TABLES_NUM;//当前桌位就餐人数
      }
    
      shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)
      console.info(currentTable)
      that.flushStroageData()
      reserveShow = false;
      console.info(currentTable.TABLES_NUM)
      that.setData({
        currentTable,
        reserveShow,
        quorumShow
      })
      if (!quorumShow){
        app.pageTurns('../orderDetail/orderDetail')
      }
    },
    /**
     * 选择就餐人数
     */
    reserveQuorum:function(e){
      var that = this;
      currentEatPersonNum = e.target.dataset.index
      shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)

      that.setData({
        quorumShow:false
      })
      app.pageTurns('../orderDetail/orderDetail')
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
      greensList.forEach(function (item, i) {
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
    /**
     * 选择规格
     */
    selectGuige: function (e) {
      var that = this;
      var item = e.currentTarget.dataset.item;
      var index = e.currentTarget.dataset.index;
      var data = greensList;
      currentGood = data[item].infos[index];
      currentGood.LAST_PIRCE = (currentGood.GOODS_PRICE / 100.0).toFixed(2);
      goodsGuige.guige = JSON.parse(currentGood.GOODS_SPECIFICATION);
      goodsGuige.zuofa = JSON.parse(currentGood.GOODS_RECIPE);
      goodsGuige.kouwei = JSON.parse(currentGood.GOODS_TASTE);
      that.setData({
        popShow: true,
        goodsGuige: goodsGuige,
        currentGood: currentGood,
        currentIndex : index,
        currentItem: item
      })
    },
    /**
     * 选择规格里边的属性
     */
    selectGg: function(e) {
      var that = this;
      var index = e.currentTarget.dataset.index;
      var _type = e.currentTarget.dataset.type;
      var list = goodsGuige;
      if (_type != '' && _type != undefined) {
        if (_type == 'guige') {
          let _list = goodsGuige.guige;
          for (var _index in _list) {
            _list[_index].checked = false;
          }
          _list[index].checked = true;
          isSelected = true;
        } else if (_type == 'kouwei') {
          let _list = goodsGuige.kouwei;
          for (var _index in _list) {
            _list[_index].checked = false;
          }
          _list[index].checked = true;
          isSelected = true;
        } else if (_type == 'zuofa') {
          let _list = goodsGuige.zuofa;
          for (var _index in _list) {
            _list[_index].checked = false;
          }
          _list[index].checked = true;
          isSelected = true;
        }
    
        var _price = 0;
        if (list.guige.length > 0) {
          for (var _index in list.guige) {
            if (list.guige[_index].checked) {
              var price = list.guige[_index].price;
              var opera = price.substring(0, 1);//运算符
              price = parseFloat(price.substring(1, price.length));
              if(opera == "-"){
                _price -= price
              } else if (opera == "+"){
                _price += price
              }
              
            }
          }
        }
        if (list.zuofa.length > 0) {
          for (var _index in list.zuofa) {
            if (list.zuofa[_index].checked) {
              var price = list.zuofa[_index].price;
              var opera = price.substring(0, 1);//运算符
              price = parseFloat(price.substring(1, price.length));
              if (opera == "-") {
                _price -= price
              } else if (opera == "+") {
                _price += price
              }
            }
          }
        }

        if (list.kouwei.length > 0) {
          for (var _index in list.kouwei) {
            if (list.kouwei[_index].checked) {
              var price = list.kouwei[_index].price;
              var opera = price.substring(0, 1);//运算符
              price = parseFloat(price.substring(1, price.length));
              if (opera == "-") {
                _price -= price
              } else if (opera == "+") {
                _price += price
              }
            }
          }
        }
        if (!isSelected) {
          wx.showToast({
            title: '请选择规格、做法或口味',
          })
        } else {
          currentGood.LAST_PIRCE = (currentGood.GOODS_PRICE / 100.0 + _price).toFixed(2);
          that.setData({
            goodsGuige: goodsGuige,
            currentGood: currentGood,
            // isSelected: that.data.isSelected
          })
        }
      }
    },
    /**
     * 规格弹窗加入购物车逻辑
     */
    addToCart2: function (e) {
      var that = this;
      if (!isSelected) {
        app.hintBox('请选择规格', 'none')
        return;
      }
      var item = that.data.currentItem;
      var index = that.data.currentIndex;
      var list = goodsGuige;
      var data = greensList;
      var List = data[item].infos;
      // var _url = '';
      // 已点数量
      var qity = 0;
      if (List[index].qity != undefined) {
        qity = List[index].qity;
      }
      qityArr[item] = qityArr[item] + 1;
      List[index].qity = qity + 1;
      // allQiry++;
      // _url = app.globalData.basePath + 'json/.json';

      let reqObj = {
        GOODS_SPECIFICATION: '',
        GOODS_RECIPE: '',
        GOODS_TASTE: ''
      };
      if (list.guige.length > 0) {
        for (var _index in list.guige) {
          if (list.guige[_index].checked) {
            reqObj.GOODS_SPECIFICATION = list.guige[_index].name;
          }
        }
      }

      if (list.zuofa.length > 0) {
        for (var _index in list.zuofa) {
          if (list.zuofa[_index].checked) {
            reqObj.GOODS_RECIPE = list.zuofa[_index].name;
          }
        }
      }

      if (list.kouwei.length > 0) {
        for (var _index in list.kouwei) {
          if (list.kouwei[_index].checked) {
            reqObj.GOODS_TASTE = list.kouwei[_index].name;
          }
        }
      }
      var that = this;

      app.addShoppingCart({
        GOODS_PK: List[index].GOODS_PK,
        GOODS_NAME: List[index].GOODS_NAME,
        GOODS_PRICE: currentGood.LAST_PIRCE * 100,
        GOODS_FORMAT: reqObj.GOODS_SPECIFICATION,
        GOODS_TASTE: reqObj.GOODS_TASTE,
        GOODS_MAKING: reqObj.GOODS_RECIPE,
        GOODS_DW: List[index].GOODS_DW,
        GOODS_TYPE: List[index].GOODS_TYPE,
        GTYPE_NAME: List[index].GTYPE_NAME,
        GTYPE_FK: List[index].GTYPE_PK
      })

      shoppingCart = app.getShoppingCart()
      that.setData({
        greensList,
        qityArr,
        // allQiry,
        shoppingCart
      })
      that.closePop();
      isSelected = false;//清除规格选择状态
    },

    setOptions:function(options){
      var quorumShow = false;
      if (options != undefined) {
        if (options.reserveShow != undefined && options.reserveShow) {
          reserveShow = true;
          // quorumShow = false;
        } else if (options.quorumShow != undefined && options.quorumShow) {
          quorumShow = true;
        } 
       
      }

      this.setData({
        reserveShow,
        quorumShow
      })
    },
    /**
     * 取消点菜或加菜
     */
    // cancalAddCai: function(e){
    //   let status = e.currentTarget.dataset.meunstatus
    //   var that = this
    //   app.modal({
    //     content: '确定取消' + (status == 1 ? '点菜' : '加菜') +'？',
    //     success:function(res){
    //       if(res.confirm){
    //         if (status == 1) {
    //           currentTable = {};//当前桌位
    //           currentEatPersonNum = 0;//当前餐桌就餐的人数
    //           that.removeShoppingCart()
    //         } else if (status == 2) {
    //           //清除当前桌位信息
    //           that.removeShoppingCart()
    //           wx.setStorageSync('ORDER_PK', '');
    //           wx.setStorageSync('ORDER_TYPE', '');
    //         }
    //         menuStatus = 0;
    //         that.pageInit()
            
    //         if (app.globalData.appSetting.foundingSwitch) {
    //           // var myEventDetail = { // detail对象，提供给事件监听函数  
    //           //   //监听函数可以通过e.detail查看传递的数据;
    //           //   page: '../founding/founding'
    //           // }
    //           // that.triggerEvent('switchPage', myEventDetail);
    //           app.reLaunch('../index/index?page=../founding/founding')
    //         }
    //       }
    //     }

    //   })
    // },
    /**
     * 增加或者减少购物车商品数量
     */
    operaGoodsNumber: function (e) {
      var opera = e.currentTarget.dataset.type
      var good = e.currentTarget.dataset.good
      if (opera == '1'){
        app.subShoppingCart(good)
      }else{
        app.addShoppingCart(good)
      }
      shoppingCart = app.getShoppingCart()
      this.flushPageData()
      this.setData({
        shoppingCart,
        qityArr
      })
      
    },
    /**
     * 刷新数据
     */
    flushPageData:function(){

      qityArr = []
      for (let i = 0; i < greensList.length; i++) {
        var count = 0;
        if (shoppingCart != undefined && shoppingCart.goods != undefined)
          shoppingCart.goods.forEach(function (good, index) {
          if (navList[i].GTYPE_PK == good.GTYPE_FK) {
            count += good.GOODS_NUMBER
          }
        })
        qityArr.push(count);
      }
      this.setData({
        qityArr
      })
    },
    backMainPage:function(){
      // if (menuStatus != 2){
        if (shoppingCart == undefined || shoppingCart.table == undefined || shoppingCart.table == '' && app.globalData.appSetting.foundingSwitch) {
          app.reLaunch('../index/index?page=../founding/founding')
          return
        }
      // }
    }
  
})