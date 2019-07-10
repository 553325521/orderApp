// pages/menu/menu.js
var app = getApp();
var pageTitle = "菜单"; //当前页面title
var greensList = []; //商品列表，一个map，里边两个key 一个是放的是列表，为每个商品的数量及该商品的属性的集合；另一个存放的是该类别下的数量
var navList = []; //分类列表，里边有分类名称和PK

var ordersList = []; //购物车列表吧？
var allMoney = 0.0; //订单总金额
var tableList = []; //桌位列表
// var height = ''; //还不知道是什么高度，应该是购物车的高度
var saveOrdersFalg = false; //挂单按钮是否显示
var currentGood = {}; //当前商品
var reserveShow = false; //显示选择餐位
var quorumShow = false;//显示选择人数
var selectPersonNum = true; //选择人数开关是否开启
var currentTable = {}; //当前桌位
var currentEatPersonNum = 0; //当前餐桌就餐的人数
var menuStatus = 0; //当前菜单页面状态（0：没状态 1：点菜 2：加菜）
var shoppingCart = {}; //购物车信息
var currentCat = "";//当前商品类别
var clickcurrentCat = "";//当前点击的商品类别
var lastTop = 0;
var onerpx = 1;//1rpx对应多少px
var goodsInfo = {};
// var _last_type = "";
// var last_name = "";
var last_guige_price = 0;
var last_kouwei_price = 0;
var last_zuofa_price = 0;

// 组件所在页面的生命周期函数
function onLoad(that) {
    onerpx = app.getSystemInfo().mob_onerpx
    that.setData({
        allowChooseTable: !(app.globalData.appSetting.CHECK_TDKT == "true"),
        tdytmb: app.globalData.appSetting.CHECK_TDYTMB == "true"
    })
  wx.showNavigationBarLoading()
  // initData(that)
  app.updateTitle(pageTitle)
  // pageInit(that);
  getGoodsInfo(that);
  loadTables(that);
  // flushStroageData(that)
  // flushShoppingCart(that)
  // backMainPage(that)
}

/**
 *页面显示方法 
 */
function onShow(that) {
  flushStroageData(that)
  loadCountOrderWei(that);
  flushShoppingCart(that)
  backMainPage(that)
}



//初始化参数
function initData(that) {
  that.setData({
    navList,
    currentCat,
    currentTabInit: 0,
    greensList,
    scrollTop: 0,
    allMoney: allMoney.toFixed(2),
    ordersList,
    // height,
    entryShow: false, //购物车显示
    popShow: false,
    reserveShow,
    quorumShow,
    currentGood,
    currentIndex: null,
    currentItem: null,
    currentTable,
    saveOrdersFalg, //挂单按钮是否显示
    tableList,
    menuStatus,
    shoppingCart,
      allowChooseTable: !(app.globalData.appSetting.CHECK_TDKT == "true"),
    basePath: app.globalData.basePath,
    seachGoods:false,
      tdytmb: app.globalData.appSetting.CHECK_TDYTMB == "true"

  })
  onerpx = app.getSystemInfo().mob_onerpx
}

//自定义页面初始化函数
function pageInit(that) {


  app.showLoading();
   
  // debugger
  // 查询菜单和数量
  getGoodsInfo(that);
  // 查询餐桌
  loadTables(that);
  //TODO 查询开关设置，比如选择人数是否开启
  //。。。。。。。

  flushStroageData(that)

  flushShoppingCart(that)
}
/**
 * 刷新缓存数据
 */
function flushStroageData(that) {
  //判断是加菜状态吗
  if (wx.getStorageSync('ORDER_PK') != undefined && wx.getStorageSync('ORDER_PK') != '') {
    menuStatus = 2
  } else {
    shoppingCart = app.getShoppingCart()
    if (shoppingCart != undefined && shoppingCart != undefined && shoppingCart.table != undefined && shoppingCart.table != '') {
      menuStatus = 1;
      currentTable = shoppingCart.table,
        currentEatPersonNum = shoppingCart.personNum == undefined ? 0 : shoppingCart.personNum
    } else {
      menuStatus = 0
    }

  }

  that.setData({
    menuStatus,
    currentTable
  })

}
/**
 * 刷新购物车信息
 */
function flushShoppingCart(that) {

  shoppingCart = app.getShoppingCart()
  if (shoppingCart == undefined) {
    shoppingCart = {}
  }
  if (shoppingCart.totalNumber == undefined) {
    shoppingCart.totalNumber = 0
  }
  if (shoppingCart.goods == undefined) {
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
}
/**
 * 加载桌位信息
 */
function loadTables(that) {
  app.sendRequest({
    url: 'Tables_select_loadTableList',
    method: 'POST',
    data: {
      shopid: app.globalData.shopid,
      openid: wx.getStorageSync('openid')
    },
    success: function(res) {
      if (res.data.code == '0000') {
        tableList = res.data.data;
        that.setData({
          tableList
        })
       
        // 查询挂单数量
        loadCountOrderWei(that);
      }
    },
    fail: function(error) {
      app.hintBox('查询桌位失败', 'none')
    }
  });
}

/**
 * 获取商品，先从本地取，看有没有缓存
 */

function getGoodsInfo(that){
  goodsInfo = app.goodsInfo
  if (goodsInfo != undefined){
    greensList = goodsInfo.greensList;
    navList = goodsInfo.navList;
    that.setData({
      navList,
      greensList,
    currentCat: navList[0] != null ? navList[0].GTYPE_PK : null,
    })
console.info("缓存取的数据")
    
    //如果没有类别，就不set类别了
    // if (navList.length > 0) {
    //   that.setData({
        
    //   })
    // }
    
    wx.hideNavigationBarLoading()
    loadGoodsInfo(that)
  }else{
    console.info("正常加载的数据")
    loadGoodsInfo(that)
  }
}

/**
 * 从数据库获取商品信息
 */
function loadGoodsInfo(that) { 
  console.info("获取数据")
  app.sendRequest({
    url: 'GoodsType_select_loadGoodsTypeByShopId',
    method: 'POST',
    data: {
      shopid: app.globalData.shopid,
      openid: wx.getStorageSync('openid')
    },
    success: function(res) {
      if (res.data.code == '0000') {
        // 查询购物车
        getOrdersList(that);
        greensList = res.data.data.greensList;
        navList = res.data.data.navList;
        
        if (goodsInfo == undefined){
          that.setData({
            navList,
            greensList,
              currentCat: navList[0] != null ? navList[0].GTYPE_PK : null,
          })
          wx.hideNavigationBarLoading()
        }
        
        goodsInfo = {
          'greensList': greensList,
          'navList': navList
        }
        app.goodsInfo = goodsInfo
      }
      // wx.hideNavigationBarLoading()
    },
    fail: function(error) {
      app.hintBox('操作失败', 'none')
    }
  });


}
/**
 * 添加购物车和删除购物车
 */
function addQity(that, e) {
  var clickgood = e.currentTarget.dataset.good;
  var type = e.currentTarget.dataset.type;
  var data = greensList;

  var _url = '';

  var good = {
    GOODS_PK: clickgood.GOODS_PK,
    GOODS_NAME: clickgood.GOODS_NAME,
      GOODS_PRICE: clickgood.GOODS_TRUE_PRICE == undefined || clickgood.GOODS_TRUE_PRICE == '' ? clickgood.GOODS_PRICE : clickgood.GOODS_TRUE_PRICE,
    GOODS_DW: clickgood.GOODS_DW,
    GOODS_TYPE: clickgood.GOODS_TYPE,
    GTYPE_NAME: clickgood.GTYPE_NAME,
    GTYPE_FK: clickgood.GTYPE_PK,
      GOODS_PRINT_LABEL: clickgood.GOODS_PRINT_LABEL
  }

  if (type == "+") {
    app.addShoppingCart(good)
  } else {
    app.subShoppingCart(good)
  }

  // List[index].FK_SHOP = app.globalData.shopid;
  // List[index].FK_USER = wx.getStorageSync('openid');

  that.setData({
    greensList
  })
  // 查询购物车
  getOrdersList(that);
  flushguadaiData()
}
/**
 *  查看购物车
 */
function entryOrders(that) {


  // shoppingCart = app.getShoppingCart()

  // if (shoppingCart.goods.length > 4) {
  //   height = 70 + 'vh';
  // } else {
  //   height = ''
  // }
  that.setData({
    // ordersList: ordersList,
    // height: height,
    entryShow: true,
    slide: false,
    allMoney: allMoney.toFixed(2)
  })

}

function getOrdersList(that) {

  flushShoppingCart(that)
}
/**
 *  隐藏挂单
 */
function vanish(that) {

  that.setData({
    entryShow: false
  })
}
/**
 * 清空购物车
 */
function emptyCat(that) {
  // app.clearShoppingCart()
    app.hintBox('购物车已空')
    app.removeShoppingCart()
    wx.setStorageSync('ORDER_PK', '');
    wx.setStorageSync('ORDER_TYPE', '');
    flushShoppingCart(that)
    that.setData({
        greensList,
        entryShow: false,
    })
    flushguadaiData()
    backMainPage(that)
}
/**
 * 移除购物车,和清除购物车最大的区别就是也清除桌位和就餐人员信息
 */
function removeShoppingCart(that) {
  shoppingCart = app.removeShoppingCart()
  flushShoppingCart(that)
  backMainPage(that)
}
/**
 * 关闭弹框
 */
function closePop(that) {

  reserveShow = false;
  that.setData({
    popShow: false,
    reserveShow: reserveShow,
    entryShow: false,
    quorumShow: false
  })
}
/**
 * 选好了
 */
function chosen(that) {
    var ORDER_PK = wx.getStorageSync('ORDER_PK');
    if (menuStatus == 2 && ORDER_PK != undefined && ORDER_PK != '') {
    //加菜
    app.pageTurns('../indent/indentDateil')
    return;
  } else {
    if (currentTable == undefined || currentTable == '' || JSON.stringify(currentTable) == '{}') {
      reserveShow = true; //显示选择餐位
      that.setData({
        reserveShow
      })
    } else if (app.globalData.appSetting.CHECK_JCRS == 'true') {
        //如果当前餐位人数大于该餐桌容纳的数量，自动赋值
        if (currentEatPersonNum > currentTable.TABLES_NUM) {
            currentEatPersonNum = currentTable.TABLES_NUM; //当前桌位就餐人数
        }
        if (currentEatPersonNum == 0) {     

            quorumShow = true;

        } 
        that.setData({
            quorumShow
        })
    } else {
        currentEatPersonNum = 'X'
        shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)
        app.pageTurns('../orderDetail/orderDetail')
    }
  }
}
/**
 * 选择餐位
 */
function reserveConfirm(that, e) {

  var quorumShow = false;
//   if (selectPersonNum != undefined && selectPersonNum != '' && currentEatPersonNum == 0) {
//     //如果选择就餐人数的开关是打开的，那么就显示就餐人数
//     quorumShow = true;
//   }
    currentTable = tableList[e.target.dataset.index] //当前桌位信息
    if (app.globalData.appSetting.CHECK_JCRS == 'true') {
        //如果当前餐位人数大于该餐桌容纳的数量，自动赋值
        if (currentEatPersonNum > currentTable.TABLES_NUM) {
            currentEatPersonNum = currentTable.TABLES_NUM; //当前桌位就餐人数
        }
        //如果选择就餐人数的开关是打开的，那么就显示就餐人数
        if (currentEatPersonNum == 0){
            quorumShow = true;
        }
        
    }else{
        currentEatPersonNum = 'X'
    }

  
  

  shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)
  flushStroageData(that)
  reserveShow = false;
  that.setData({
    currentTable,
    reserveShow,
    quorumShow
  })
  if (!quorumShow) {
    app.pageTurns('../orderDetail/orderDetail')
  }
}
/**
 * 选择就餐人数
 */
function reserveQuorum(that, e) {

  currentEatPersonNum = e.target.dataset.index
  shoppingCart = app.addTableInCart(currentTable, currentEatPersonNum)

  that.setData({
    quorumShow: false
  })
  app.pageTurns('../orderDetail/orderDetail')
}
/**
 * 查看挂单
 */
function checkEntryOrders(that) {
  app.pageTurns(`../entryOrders/entryOrders`)
}
/**
 * 菜品滑动事件
 */
// function doScroll(that, e) {
//   createSelectorQuery(that)
//   var scrollTop = e.detail.scrollTop,
//     h = 0;
//   let currentTab = 0;

//   greensList.forEach(function(item, i) {
//     var _h = 24.4 + 71.2 * item.infos.length;
//     if (scrollTop >= h) {
//       currentTab = item.GTYPE_PK
//     }
//     h += _h;
//   })
//   that.setData({
//     currentTab: currentTab
//   })
// }
/**
 * 切换菜单
 */
function switchNav(that, e) {
  currentCat = e.currentTarget.dataset.id;
  clickcurrentCat = currentCat;
  that.setData({
    currentCat,
    clickcurrentCat
  })
}
/**
 * 选择规格
 */
function selectGuige(that, e) {
    // _last_type = "";
    // last_name = "";
    // last_price = "";
  var data = greensList;
  currentGood = e.currentTarget.dataset.good;
  currentGood.LAST_PIRCE = currentGood.GOODS_TRUE_PRICE == undefined || currentGood.GOODS_TRUE_PRICE == "" ? currentGood.GOODS_PRICE : currentGood.GOODS_TRUE_PRICE;
  that.setData({
    popShow: true,
    currentGood,
  })
}
/**
 * 选择规格里边的属性
 */
function selectGg(that, e) {

    var _type = e.currentTarget.dataset.type;
    var name = e.currentTarget.dataset.name;
    var price = e.currentTarget.dataset.price;
    var opera = price.substring(0, 1);
    price = parseInt(parseFloat(price.substring(1, price.length)) * 100);
   
    if (opera == "-") {
        price = -price
    }

    var last_price = price;




    //如果选的规格以前选过，减去上次选择的价格
    if (currentGood.guige != undefined && _type == 'guige') {
        last_price -= last_guige_price
    } else if (currentGood.kouwei != undefined && _type == 'kouwei') {
        last_price -= last_kouwei_price
    } else if (currentGood.zuofa != undefined && _type == 'zuofa') {
        last_price -= last_zuofa_price
    }

    if (_type != '' && _type != undefined) {
        if (_type == 'guige') {
            if (currentGood.guige != name) {
                currentGood.guige = name
                last_guige_price = price
            }else{
                last_price -= last_guige_price
                currentGood.guige = undefined
            }
        } else if (_type == 'kouwei') {
            if (currentGood.kouwei != name) {
                currentGood.kouwei = name
                last_kouwei_price = price
            }else{
                last_price -= last_kouwei_price
                currentGood.kouwei = undefined
            }
        } else if (_type == 'zuofa') {
            if (currentGood.zuofa != name) {
                currentGood.zuofa = name
                last_zuofa_price = price
            } else {
                last_price -= last_zuofa_price
                currentGood.zuofa = undefined
            }
        }

        currentGood.LAST_PIRCE = parseInt(currentGood.LAST_PIRCE) + last_price

  

    that.setData({
      currentGood
    })

  }
}
/**
 * 规格弹窗加入购物车逻辑
 */
function addToCart2(that, e) {

  if (currentGood.guige == undefined && currentGood.zuofa == undefined && currentGood.kouwei == undefined) {
    app.hintBox('请选择规格、做法或口味', 'none')
    return;
  }

  app.addShoppingCart({
    GOODS_PK: currentGood.GOODS_PK,
    GOODS_NAME: currentGood.GOODS_NAME,
    GOODS_PRICE: currentGood.LAST_PIRCE,
    GOODS_FORMAT: currentGood.guige,
    GOODS_TASTE: currentGood.kouwei,
    GOODS_MAKING: currentGood.zuofa,
    GOODS_DW: currentGood.GOODS_DW,
    GOODS_TYPE: currentGood.GOODS_TYPE,
    GTYPE_NAME: currentGood.GTYPE_NAME,
    GTYPE_FK: currentGood.GTYPE_PK
  })

  shoppingCart = app.getShoppingCart()
  that.setData({
    greensList,
    shoppingCart
  })
  closePop(that);
  currentGood = undefined
    // _last_type = "";
    // last_name = "";
    // last_price = "";
  flushguadaiData()
}

/**
 * index.js调用的函数
 */
function setOptions(that, options) {
  var quorumShow = false;
  if (options != undefined) {
    if (options.reserveShow != undefined && options.reserveShow) {
      reserveShow = true;
      // quorumShow = false;
    } else if (options.quorumShow != undefined && options.quorumShow) {
      quorumShow = true;
    }

  }

  that.setData({
    reserveShow,
    quorumShow
  })
}
/**
 * 增加或者减少购物车商品数量
 */
function operaGoodsNumber(that, e) {
  var opera = e.currentTarget.dataset.type
  var good = e.currentTarget.dataset.good
  if (opera == '1') {
    app.subShoppingCart(good)
    entryOrders(that)
  } else {
    app.addShoppingCart(good)
  }
  shoppingCart = app.getShoppingCart()
  // flushPageData(that)
  that.setData({
    shoppingCart
  })
  flushguadaiData()
}
/**
 * 查看挂单修改数量
 */
function alterCount(that, e) {
  var index = e.currentTarget.dataset.index;
  var type = e.currentTarget.dataset.type;
  var _url = '';
  var tpnum = 0;
  if (type == "+") {
    tpnum = ++greensList[i].infos[j].qity;
  } else {
    tpnum = greensList[i].infos[j].qity - 1;

    greensList[i].infos[j].qity--;

  }
  that.setData({
    greensList: greensList,
    qityArr: qityArr,

    // ordersList: ordersList,
    allMoney: allMoney.toFixed(2),
  })
  flushguadaiData()
}

/**
 * 返回主页吗
 */
function backMainPage(that) {
  if (shoppingCart == undefined || shoppingCart.table == undefined || shoppingCart.table == '' || shoppingCart.table == '') {
    var pages = getCurrentPages()
    var currentPage = pages[0]
      if (app.globalData.appSetting.CHECK_TDKT == 'true'){
          if (currentPage.route == 'pages/index/index'){
             currentPage.__data__.currentPage = '../founding/founding'
              wx.navigateBack({
                  delta: pages.length - 1
              })
          }else{
              app.reLaunch('../index/index?page=indexPage')
          }
       
        return
    }    
    //  || !app.globalData.appSetting.foundingSwitch && currentPage.route == 'pages/index/index' && currentPage.__data__.currentPage == '../menu/menu'
    // app.reLaunch('../index/index?page=indexPage')
    return
  }
}

/**
 * 加载挂单数量
 * 
 * lps  2018年11月29日02:24:21
 */
function loadCountOrderWei(that) {
  var shopStorageOrder = app.getStorageOrder()
  if (shopStorageOrder.length > 0) {
    var saveOrdersFalg = true;
  } else {
    var saveOrdersFalg = false;
  }
  that.setData({
    saveOrdersFalg
  });
}
/**
 * 滑动事件
 */
function doScroll(that,e){
  createSelectorQuery(that,e)
}
/**
 * 创建节点,用来监听菜单的滑动，以便即时切换左边商品类别
 */
function createSelectorQuery(that,e){ 
  // var _observer = wx.createIntersectionObserver(that, {observeAll:true})
  // _observer
  //   .relativeTo('.shou-greens-box')
  //   .observe('.ball', (res) => {
  //     console.log(res);
  // var that = this;
  // var scrollTop = e.detail.scrollTop,
  //   h = 0;
  // greensList.forEach(function (item, i) {
  //   var _h = 24.4 + 71.2 * item.infos.length;
  //   if (scrollTop >= h) {
  //     currentCat = item.GTYPE_PK
  //   }
  //   h += _h;
  // })
  // that.setData({
  //   currentCat: currentCat
  // })

    if (app.globalData.appSetting.CHECK_TDKT == "false"){
        var query = wx.createSelectorQuery().in(that)
      } else {
        var query = wx.createSelectorQuery()
      }
      query.selectAll('.ball').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {
        res[0].forEach(function (item) {
          if (item.dataset.id != currentCat && item.top < onerpx * 96 && item.bottom > onerpx * 96) {
              console.info("换")
            currentCat = item.dataset.id
            that.setData({ currentCat })
            return
          }
        })
      })


    // })

  
}

function flushguadaiData(){
    if (app.globalData.appSetting.CHECK_TDKT=="true"){
    app.flushOtherPage({ 'guadanshuju': app.getShoppingCart('all') })
  }
}

/**
 * 搜索商品
 */
function searchGoods(that, e){
  var seachGoods = e.detail.value.replace(/(^\s*)|(\s*$)/g, "");
  seachGoods = seachGoods == "" ? false : seachGoods
  that.setData({
    seachGoods: seachGoods
  })
}

/**
 * 清空搜索条件
 */
function clearSearchContent (that) {
    that.setData({
        seachGoods: false
    }) 
}


module.exports = {
    operaGoodsNumber: operaGoodsNumber,
    setOptions: setOptions,
    addToCart2: addToCart2,
    selectGg: selectGg,
    selectGuige,
    switchNav,
    doScroll,
    checkEntryOrders,
    reserveQuorum,
    reserveConfirm,
    chosen,
    closePop,
    removeShoppingCart,
    emptyCat,
    vanish,
    getOrdersList,
    entryOrders,
    addQity,
    loadGoodsInfo,
    loadTables,
    flushShoppingCart: flushShoppingCart,
    flushStroageData: flushStroageData,
    pageInit,
    onLoad,
    alterCount,
    onShow,
    backMainPage,
    searchGoods,
    clearSearchContent
};

