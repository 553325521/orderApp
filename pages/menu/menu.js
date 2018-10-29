// pages/menu/menu.js
var app = getApp();
Page({
  data: {
    loadingHidden:true,
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
    currentGood: null,
    currentIndex: null,
    currentItem: null,
    goodsGuige:{
      guige: [],
      zuofa: [],
      kouwei: []
    },
    isSelected: false,
    tableList: []
  },
  onShow: function (options) {
    var that = this;
    that.setData({
      loadingHidden: false
    })
    var mobInfo = app.getSystemInfo();
    that.setData({
      W: mobInfo.mob_width +'px',
      H: mobInfo.mob_height +'px'
    })
    // 查询菜单和数量
    that.loadGoodsInfo();
    // 查询餐桌
    that.loadTables();
  },
  onReady: function () {
  
  },
  loadTables: function() {
    let that = this;
    wx.request({
      url: app.globalData.basePath + 'json/Tables_select_loadTableList.json',
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
          that.setData({
            tableList: res.data.data,
            loadingHidden:true
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '查询失败~',
        })
      }
    })
  },
  loadGoodsInfo: function () {
    let that = this;
    that.setData({
      loadingHidden: false
    })
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
          that.data.allQiry = 0;
          for (let i = 0; i < res.data.data.greensList.length; i++) {
            qityArr.push(parseFloat(res.data.data.greensList[i].GTYPE_QITY));
            that.data.allQiry += parseFloat(res.data.data.greensList[i].GTYPE_QITY);
          }
          // 查询购物车
          that.getOrdersList();

          that.setData({
            navList: res.data.data.navList,
            greensList: res.data.data.greensList,
            currentTab: res.data.data.navList[0].GTYPE_PK,
            qityArr: qityArr,
            allQiry: that.data.allQiry
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
      }
    })
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
    var data = that.data.greensList;
    var List = data[item].infos;
    var _url = '';
    // 已点数量
    var qity = 0;
    if (List[index].qity != undefined) {
      qity = List[index].qity;
    }
    var qityArr = that.data.qityArr[item];
    if (type == "+"){
      that.data.qityArr[item] = qityArr + 1
      List[index].qity = qity + 1;
      that.data.allQiry++;
      _url = app.globalData.basePath + 'json/ShoppingCart_insert_insertCart.json';
    }else{
      that.data.qityArr[item] = qityArr - 1
      List[index].qity = qity - 1;
      that.data.allQiry--
      _url = app.globalData.basePath + 'json/ShoppingCart_update_removeCart.json';
    }
    List[index].FK_SHOP = app.globalData.shopid;
    List[index].FK_USER = wx.getStorageSync('openid');

    wx.request({
      url: _url,
      method: "post",
      data: List[index],
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: that.data.greensList,
            qityArr: that.data.qityArr,
            allQiry: that.data.allQiry
          })
          // 查询购物车
          that.getOrdersList();
          wx.showToast({
            title: '操作成功~',
          })
        } else {
          wx.showToast({
            title: '操作失败~',
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
      }
    })
  },
  /**
   *  查看挂单
   */
  entryOrders:function(){
    var that = this;
    wx.request({
      url: app.globalData.basePath + 'json/ShoppingCart_load_loadCartDataByUser.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        CART_STATE: 'zancun'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          var allMoney = 0;
          var greensList = that.data.greensList;
          that.data.ordersList = res.data.data;
          if (res.data.data.length > 0) {
            for (var _index in that.data.ordersList) {
              allMoney += parseFloat(that.data.ordersList[_index].GOODS_PRICE);
            }

            for (let i = 0; i < greensList.length; i++) {
              for (let j = 0; j < greensList[i].infos.length; j++) {
                if (greensList[i].infos[j].qity > 0) {
                  for (var _index in that.data.ordersList) {
                    if (that.data.ordersList[_index].FK_GOODS == greensList[i].infos[j].GOODS_PK) {
                      that.data.ordersList[_index].i = i;
                      that.data.ordersList[_index].j = j;
                    }
                  }
                }
              }
            }
          }
          if (that.data.ordersList.length > 4) {
            that.data.height = 384 + 'rpx';
          } else {
            that.data.height = ''
          }
          that.setData({
            ordersList: that.data.ordersList,
            height: that.data.height,
            entryShow: true,
            slide: false,
            allMoney: allMoney / 100 + '.00'
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
      }
    })
  },
  getOrdersList:function() {
    var that = this;
    wx.request({
      url: app.globalData.basePath + 'json/ShoppingCart_load_loadCartDataByUser.json',
      method: "post",
      data: {
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid'),
        CART_STATE: 'zancun'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          var allMoney = 0;
          var greensList = that.data.greensList;
          that.data.ordersList = res.data.data;
          if (res.data.data.length > 0) {
            for (var _index in that.data.ordersList) {
              allMoney += parseFloat(that.data.ordersList[_index].GOODS_PRICE);
            }

            for (let i = 0; i < greensList.length; i++) {
              for (let j = 0; j < greensList[i].infos.length; j++) {
                if (greensList[i].infos[j].qity > 0) {
                  for (var _index in that.data.ordersList) {
                    if (that.data.ordersList[_index].FK_GOODS == greensList[i].infos[j].GOODS_PK) {
                      that.data.ordersList[_index].i = i;
                      that.data.ordersList[_index].j = j;
                    }
                  }
                }
              }
            }
          }
          that.setData({
            ordersList: that.data.ordersList,
            allMoney: allMoney / 100 + '.00',
            loadingHidden: true
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
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
        } else {
          wx.showToast({
            title: '系统错误~',
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '系统错误~',
        })
      }
    })

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
      that.data.qityArr[i]++;
      that.data.greensList[i].infos[j].qity++;
      that.data.allQiry++;
      that.data.ordersList[index].qity++;
      that.data.allMoney = parseFloat(that.data.allMoney) + parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100;
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    }else{
      tpnum = that.data.greensList[i].infos[j].qity - 1;
      that.data.qityArr[i]--;
      that.data.allQiry--;
      that.data.ordersList[index].qity--;
      that.data.greensList[i].infos[j].qity--;
      that.data.allMoney = parseFloat(that.data.allMoney) - parseFloat(that.data.ordersList[index].GOODS_PRICE) / 100;
      if (tpnum <= 0) {
        that.data.ordersList.splice(index, 1)
      }
      _url = app.globalData.basePath + 'json/ShoppingCart_update_updateCartNum.json';
    }

    // that.data.greensList[i].infos[j].FK_SHOP = app.globalData.shopid;
    // that.data.greensList[i].infos[j].FK_USER = wx.getStorageSync('openid');

    wx.request({
      url: _url,
      method: "post",
      data: {
        CART_PK: that.data.ordersList[index].CART_PK,
        GOODS_NUM: tpnum,
        FK_SHOP: app.globalData.shopid,
        FK_USER: wx.getStorageSync('openid')
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: that.data.greensList,
            qityArr: that.data.qityArr,
            allQiry: that.data.allQiry,
            ordersList: that.data.ordersList,
            allMoney: that.data.allMoney.toFixed(2),
            loadingHidden: true
          })
          // 购物车里面空的时候隐藏购物车列表
          if (that.data.ordersList.length == 0) {
            that.setData({
              entryShow: false
            })
          }
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
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
    var orderId = wx.getStorageSync('ORDER_PK');
    if (orderId != null && orderId != undefined) {
      // 直接加入订单里面
      that.setData({
        loadingHidden: false
      })
      wx.request({
        url: app.globalData.basePath + 'json/ShoppingCart_update_updateCartToOrderMore.json',
        method: "post",
        data: {
          FK_ORDER: orderId,
          FK_SHOP: app.globalData.shopid,
          FK_USER: wx.getStorageSync('openid')
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success: function (res) {
          if (res.data.code == '0000') {
            wx.showToast({
              title: '操作成功~',
            })
            app.pageTurns(`../indent/indentDateil?ORDER_PK=` + orderId)
          }
          wx.showToast({
            title: '操作失败~',
          })
        },
        fail: function (error) {
          wx.showToast({
            title: '操作失败~',
          })
        }
      })
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
    var queryBean = JSON.stringify(that.data.tableList[index]);
    var orders = JSON.stringify(that.data.ordersList);
    that.setData({
      reserveShow: false
      //quorumShow: true
    })
    app.pageTurns(`../orderDetail/orderDetail?queryBean=` + queryBean + '&ordersList=' + orders + '&allMoney=' + that.data.allMoney)
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
    info.LAST_PIRCE = info.GOODS_PRICE / 100;
    that.data.goodsGuige.guige = JSON.parse(info.GOODS_SPECIFICATION);
    that.data.goodsGuige.zuofa = JSON.parse(info.GOODS_RECIPE);
    that.data.goodsGuige.kouwei = JSON.parse(info.GOODS_TASTE);
    that.setData({
      popShow: true,
      goodsGuige: that.data.goodsGuige,
      currentGood: info,
      currentIndex : index,
      currentItem: item
    })
  },
  selectGg: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var _type = e.currentTarget.dataset.type;
    var list = that.data.goodsGuige;
    if (_type != '' && _type != undefined) {
      if (_type == 'guige') {
        let _list = that.data.goodsGuige.guige;
        for (var _index in _list) {
          _list[_index].checked = false;
        }
        _list[index].checked = true;
        that.data.isSelected = true;
      } else if (_type == 'kouwei') {
        let _list = that.data.goodsGuige.kouwei;
        for (var _index in _list) {
          _list[_index].checked = false;
        }
        _list[index].checked = true;
        that.data.isSelected = true;
      } else if (_type == 'zuofa') {
        let _list = that.data.goodsGuige.zuofa;
        for (var _index in _list) {
          _list[_index].checked = false;
        }
        _list[index].checked = true;
        that.data.isSelected = true;
      }
  
      var _price = 0;
      if (list.guige.length > 0) {
        for (var _index in list.guige) {
          if (list.guige[_index].checked) {
            var price = list.guige[_index].price;
            price = parseInt(price.substring(1, price.length));
            _price += price;
          }
        }
      }

      if (list.zuofa.length > 0) {
        for (var _index in list.zuofa) {
          if (list.zuofa[_index].checked) {
            var price = list.zuofa[_index].price;
            price = parseInt(price.substring(1, price.length));
            _price += price;
          }
        }
      }

      if (list.kouwei.length > 0) {
        for (var _index in list.kouwei) {
          if (list.kouwei[_index].checked) {
            var price = list.kouwei[_index].price;
            price = parseInt(price.substring(1, price.length));
            _price += price;
          }
        }
      }
      if (!that.data.isSelected) {
        wx.showToast({
          title: '请选择规格、做法或口味~',
        })
      } else {
        that.data.currentGood.LAST_PIRCE = that.data.currentGood.GOODS_PRICE / 100 + _price;
        that.setData({
          goodsGuige: that.data.goodsGuige,
          currentGood: that.data.currentGood,
          isSelected: that.data.isSelected
        })
      }
    }
  },
  /**
   * 规格弹窗加入购物车逻辑
   */
  addToCart2: function (e) {
    var that = this;
    if (!that.data.isSelected) {
      wx.showToast({
        title: '请选择~',
      })
      return;
    }
    var item = that.data.currentItem;
    var index = that.data.currentIndex;
    var list = that.data.goodsGuige;
    var data = that.data.greensList;
    var List = data[item].infos;
    var _url = '';
    // 已点数量
    var qity = 0;
    if (List[index].qity != undefined) {
      qity = List[index].qity;
    }
    var qityArr = that.data.qityArr[item];
    that.data.qityArr[item] = qityArr + 1
    List[index].qity = qity + 1;
    that.data.allQiry++;
    _url = app.globalData.basePath + 'json/ShoppingCart_insert_insertCart.json';

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
    wx.request({
      url: _url,
      method: "post",
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
        GOODS_PRICE: that.data.currentGood.LAST_PIRCE * 100,
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
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: function (res) {
        if (res.data.code == '0000') {
          that.setData({
            greensList: that.data.greensList,
            qityArr: that.data.qityArr,
            allQiry: that.data.allQiry,
            loadingHidden: true
          })
          that.closePop();
          wx.showToast({
            title: '添加成功~',
          })
        } else {
          wx.showToast({
            title: '操作失败~',
          })
        }
      },
      fail: function (error) {
        wx.showToast({
          title: '操作失败~',
        })
      }
    })
  }
})