// pages/menu/menu.js
var app = getApp();
var pageTitle = "菜单";//当前页面title
var greensList;//商品列表，一个map，里边两个key 一个是放的是列表，为每个商品的数量及该商品的属性的集合；另一个存放的是该类别下的数量
var navList;//分类列表，里边有分类名称和PK
var qityArr = [];//一个列表，存放的是每个分类下点的商品的数量的集合
var allQiry=0;//商品总数量
var ordersList = [];//购物车列表吧？
var allMoney = 0.0;//订单总金额
var tableList = [];//桌位列表
var goodsGuige = {
  guige: [],
  zuofa: [],
  kouwei: []
}//当前弹框的属性 规格做法和口味  
var height = '';//还不知道是什么高度
var ordersFalg = true;//隐藏挂单按钮
var currentGood;//当前商品
var isSelected = false;//选择规格了吗

Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    loadingHidden:true,
    navList:null,
    currentTab:0,
    currentTabInit: 0,
    // greensList:null,
    // qityArr:null,//一个数组，里边装的是每个分类点的菜的数量
    scrollTop:0,
    allQiry: allQiry,
    allMoney: allMoney.toFixed(2),
    ordersList: ordersList,
    height:height,
    entryShow:false,//购物车显示
    popShow:false,
    reserveShow:false,
    quorumShow:false,
    currentGood: currentGood,
    currentIndex: null,
    currentItem: null,
    ordersFalg: ordersFalg,//隐藏购买了的订单信息
    goodsGuige: goodsGuige,
    // isSelected: isSelected,
    tableList: tableList
  },


  /**
     * 组件周期函数
     */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle)
      this.pageInit();
    },
    moved: function () { console.log("组件被moved") },
    //组件被移除
    detached: function () { console.log("detached") },
  },
  /**
   * page的生命周期
   */
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {console.log("页面show") },
    hide: function () { },
    resize: function () { },
  },
  methods:{
    //自定义页面初始化函数
    pageInit:function(){
      var that = this;
      that.setData({
        loadingHidden: false
      })
      var mobInfo = app.getSystemInfo();
      that.setData({
        W: mobInfo.mob_width + 'px',
        H: mobInfo.mob_height + 'px',
        scrollHeight: mobInfo.mob_height - 180 * mobInfo.mob_onerpx
      })
      // 查询菜单和数量
      that.loadGoodsInfo();
      // 查询餐桌
      that.loadTables();
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
            loadingHidden: true
          })
          // 查询挂单数量
          that.loadCountOrderWei();
        }
      },
      fail: function (error) {
        app.toast('查询失败')
      }
    });
  },
  loadGoodsInfo: function () {
    let that = this;
    that.setData({
      loadingHidden: false
    })
    app.sendRequest({
      url: 'GoodsType_select_loadGoodsTypeByShopId',
      method: 'POST',
      data: {
        shopid: app.globalData.shopid,
        openid: wx.getStorageSync('openid')
      },
      success: function (res) {
        if (res.data.code == '0000') {
          allQiry = 0;
          greensList = res.data.data.greensList;
          navList = res.data.data.navList;
          for (let i = 0; i < greensList.length; i++) {
            qityArr.push(parseFloat(greensList[i].GTYPE_QITY));
            allQiry += parseFloat(greensList[i].GTYPE_QITY);
          }
          // 查询购物车
          that.getOrdersList();
          //如果没有类别，就不set类别了
          if (navList.length != 0) {
            that.setData({
              currentTab: navList[0].GTYPE_PK,
            })
          }
          that.setData({
            navList: navList,
            greensList: greensList,
            qityArr: qityArr,
            allQiry: allQiry
          })
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
    });


  },
  /**
   * 添加购物车和删除购物车
   */
  addQity:function(e){
    var that = this;
    that.setData({
      loadingHidden: false
    })
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    // var data = greensList;
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
      allQiry++;
      _url = 'ShoppingCart_insert_insertCart';
    }else{
      qityArr[item] = qityArr - 1
      List[index].qity = qity - 1;
      allQiry--
      _url = 'ShoppingCart_update_removeCart';
    }
    List[index].FK_SHOP = app.globalData.shopid;
    List[index].FK_USER = wx.getStorageSync('openid');
    app.sendRequest({
      url: _url,
      method: 'POST',
      data: List[index],
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: greensList,
            qityArr: qityArr,
            allQiry: allQiry
          })
          // 查询购物车
          that.getOrdersList();
          app.toast('操作成功')
        } else {
          app.toast('操作失败')
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
    })
  },
  /**
   *  查看购物车
   */
  entryOrders:function(){
    var that = this;
    app.sendRequest({
      url: 'ShoppingCart_load_loadCartDataByUser',
      method: 'POST',
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        CART_STATE: 'zancun'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          allMoney = 0;
          ordersList = res.data.data;
          if (res.data.data.length > 0) {
            for (var _index in ordersList) {
              allMoney += parseFloat(ordersList[_index].GOODS_PRICE)/100.0;
            }

            for (let i = 0; i < greensList.length; i++) {
              for (let j = 0; j < greensList[i].infos.length; j++) {
                if (greensList[i].infos[j].qity > 0) {
                  for (var _index in ordersList) {
                    if (ordersList[_index].FK_GOODS == greensList[i].infos[j].GOODS_PK) {
                      ordersList[_index].i = i;
                      ordersList[_index].j = j;
                    }
                  }
                }
              }
            }
          }
          if (ordersList.length > 4) {
            height = 384 + 'rpx';
          } else {
            height = ''
          }
          that.setData({
            ordersList: ordersList,
            height: height,
            entryShow: true,
            slide: false,
            allMoney: allMoney.toFixed(2)
          })
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
    });
  },
  getOrdersList:function() {
    var that = this;
    app.sendRequest({
      url: 'ShoppingCart_load_loadCartDataByUser',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        CART_STATE: 'zancun'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          allMoney = 0;
          ordersList = res.data.data;
          if (res.data.data.length > 0) {
            for (var _index in ordersList) {
              allMoney += parseFloat(ordersList[_index].GOODS_PRICE)/100.0;
            }

            for (let i = 0; i < greensList.length; i++) {
              for (let j = 0; j < greensList[i].infos.length; j++) {
                if (greensList[i].infos[j].qity > 0) {
                  for (var _index in ordersList) {
                    if (ordersList[_index].FK_GOODS == greensList[i].infos[j].GOODS_PK) {
                      ordersList[_index].i = i;
                      ordersList[_index].j = j;
                    }
                  }
                }
              }
            }
          }
          that.setData({
            ordersList: ordersList,
            allMoney: allMoney.toFixed(2),
            loadingHidden: true
          })
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
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
    var greensList = greensList
    for (let i = 0; i < greensList.length; i++) {
      for (let j = 0; j < greensList[i].infos.length; j++) {
        greensList[i].infos[j].qity = 0
      }
    }
    let qityArr = [];
    for (let i = 0; i < greensList.length; i++) {
      qityArr.push(0);
    }

    wx.request({
      url: app.globalData.basePath + 'json/ShoppingCart_update_removeAllCart.json',
      method: "post",
      data: {
        shopid : app.globalData.shopid,
        openid : wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: greensList,
            qityArr: qityArr,
            allQiry: allQiry,
            ordersList: ordersList,
            allMoney: allMoney.toFixed(2)
          })
          // 购物车里面空的时候隐藏购物车列表
          if (ordersList.length == 0) {
            that.setData({
              entryShow: false
            })
          }
        } else {
          app.toast('系统错误')
        }
      },
      fail: function (error) {
        app.toast('系统错误')
      }
    })
    allMoney = 0;
    allQiry = 0;
    that.setData({
      greensList: greensList,
      qityArr: qityArr,
      allQiry: allQiry,
      entryShow: false,
      ordersList:[],
      allMoney: allMoney.toFixed(2)
    })
  },
  /**
   * 查看挂单修改数量
   */
  alterCount:function(e){
    var that = this;
    var that = this;
    that.setData({
      loadingHidden: false
    })
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    var i = e.currentTarget.dataset.i;
    var j = e.currentTarget.dataset.j;
    var _url = '';
    var tpnum = 0;
    if (type == "+") {
      qityArr[i]++;
      tpnum = greensList[i].infos[j].qity++;
      allQiry++;
      ordersList[index].qity++;
      allMoney = parseFloat(allMoney) + parseFloat(ordersList[index].GOODS_PRICE) / 100.0;
      _url = 'ShoppingCart_update_updateCartNum';
    }else{
      tpnum = greensList[i].infos[j].qity - 1;
      qityArr[i]--;
      allQiry--;
      ordersList[index].qity--;
      greensList[i].infos[j].qity--;
      allMoney = parseFloat(allMoney) - parseFloat(ordersList[index].GOODS_PRICE) / 100.0;
      if (tpnum <= 0) {
        ordersList.splice(index, 1)
      }
      _url = 'ShoppingCart_update_updateCartNum';
    }
    app.sendRequest({
      url: _url,
      method: "post",
      data: {
        CART_PK: ordersList[index].CART_PK,
        GOODS_NUM: tpnum,
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid')
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: greensList,
            qityArr: qityArr,
            allQiry: allQiry,
            ordersList: ordersList,
            allMoney: allMoney.toFixed(2),
            loadingHidden: true
          })
          // 购物车里面空的时候隐藏购物车列表
          if (ordersList.length == 0) {
            that.setData({
              entryShow: false
            })
          }
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
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
  chosen: function (){
    var that = this;

    this.getOrdersList()

    var orderId = wx.getStorageSync('ORDER_PK');
    if (orderId != null && orderId != undefined && orderId != '') {
      // 直接加入订单里面
      that.setData({
        loadingHidden: false
      })
      app.sendRequest({
        url: 'Order_update_updateCartToOrderMore',
        method: 'POST',
        data: {
          FK_ORDER: orderId,
          FK_SHOP: app.globalData.shopid,
          FK_USER: wx.getStorageSync('openid')
        },
        success: function (res) {
          if (res.data.code == '0000') {
            let _type = wx.getStorageSync('ORDER_TYPE', '');
            app.toast('操作成功')
            that.setData({
              loadingHidden: true
            })
            wx.setStorageSync('ORDER_PK', '');
            wx.setStorageSync('ORDER_TYPE', '');
            app.pageTurns(`../indent/indentDateil?ORDER_PK=` + orderId + `&type=` + _type)
          } else {
            app.toast('操作失败')
          }
        },
        fail: function (error) {
          that.setData({
            loadingHidden: true
          })
          app.toast('操作失败')
        }
      });
    } else {
      that.setData({
        reserveShow: true,
        entryShow: false
      })
    }
  },
  /**
   * 选择餐位
   */
  reserveConfirm:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var queryBean = JSON.stringify(tableList[index]);
    var orders = JSON.stringify(ordersList);
    that.setData({
      reserveShow: false
      //quorumShow: true
    })
    app.pageTurns(`../orderDetail/orderDetail?queryBean=` + queryBean + '&ordersList=' + orders + '&allMoney=' + allMoney)
  },
  /**
   * 
   */
  reserveQuorum:function(e){
    var that = this;
    
    // that.setData({
    //   quorumShow: false
    // })
    // app.pageTurns(`../orderDetail/orderDetail`)
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
      app.toast('请选择规格')
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
    allQiry++;
    // _url = app.globalData.basePath + 'json/.json';

    let reqObj = {
      GOODS_SPECIFICATION: [],
      GOODS_RECIPE: [],
      GOODS_TASTE: []
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
    that.setData({
      loadingHidden: false
    })

    app.sendRequest({
      url: 'ShoppingCart_insert_insertCart',
      method: 'POST',
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        GOODS_CODE: List[index].GOODS_CODE,
        GOODS_DESC: List[index].GOODS_DESC,
        GOODS_DW: List[index].GOODS_DW,
        GOODS_LABEL: List[index].GOODS_LABEL,
        GOODS_NAME: List[index].GOODS_NAME,
        GOODS_NUM: List[index].GOODS_NUM,
        GOODS_PK: List[index].GOODS_PK,
        GOODS_PRICE: currentGood.LAST_PIRCE * 100,
        GOODS_PXXH: List[index].GOODS_PXXH,
        GOODS_RECIPE: reqObj.GOODS_RECIPE,
        GOODS_SPECIFICATION: reqObj.GOODS_SPECIFICATION,
        GOODS_TASTE: reqObj.GOODS_TASTE,
        GOODS_TYPE: List[index].GOODS_TYPE,
        GTYPE_NAME: List[index].GTYPE_NAME,
        GTYPE_PK: List[index].GTYPE_PK,
        PICTURE_URL: List[index].PICTURE_URL,
        SHOW_RANGE: List[index].SHOW_RANGE
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: greensList,
            qityArr: qityArr,
            allQiry: allQiry,
            loadingHidden: true
          })
          that.closePop();
          app.toast('添加成功')
        } else {
          app.toast('操作失败')
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
    });
  },

  /**
   * 加载订单里边已经买了的菜的数量
   * 
   * lps  2018年11月29日02:24:21
   */
  loadCountOrderWei: function() {
    app.sendRequest({
      url: 'Order_select_loadCountOrderWei',
      method: 'POST',
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid')
      },
      success: function (res) {
        if (res.data.code == '0000') {
          console.info(res.data);
          if (res.data.ORDER_COUNT > 0) {
            ordersFalg = false;
            console.info("哈哈")
            that.setData({
              ordersFalg: ordersFalg
            });
          }
        }
      },
      fail: function (error) {
        app.toast('操作失败')
      }
    });
  }

 
  }
})