// pages/takeOut/takeOutDateil.js
var app = getApp();

var sourceType;
var orderPk;
Page({
  data: {
    isHidden:true,
    orderDetails:{}
  },
  onLoad: function (options) {
    var that = this;
    var type = options.type;
    sourceType = options.SOURCE_NAME;
    orderPk = options.ORDER_PK;
    var title = type == 1 ? '待确定订单' :'待配送订单'
    wx.setNavigationBarTitle({
        title: title,
    });
    that.setData({
      type: type,
      ORDER_PK: options.ORDER_PK,
      SOURCENAME: options.SOURCE_NAME
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.loadOrderDetailsByPk();
  },
  //根据订单Id查询订单详情
  loadOrderDetailsByPk:function(){
    var that = this;
    app.sendRequest({
      url: "Order_select_loadWMDetailsDataByOrderPk",
      method: "post",
      data: {
        partName:that.data.SOURCENAME,
        ORDER_PK: that.data.ORDER_PK
      },
      success: function (res) {
        if(res.data.code == '0000'){
            console.info(res);
            if (sourceType == '智慧云'){
                that.setData({
                    orderDetails: res.data.data[0]
                })
            } else {
                that.setData({
                    orderDetails: res.data.data
                })
            }
        }
        console.info(res.data);
      },
      fail: function (error) {
        console.info(error);
      }
    })
  },
  changeType:function(){
    this.setData({
      type:5
    })
  },
  /**
   * 饿百确认订单
   */
    enterEBOrder:function(e){
        var that = this;
        var orderId = e.currentTarget.dataset.order;
        app.sendRequest({
            url: "eb/order/confirm",
            method: "post",
            data: {
                orderId: orderId
            },
            success: function (res) {
                if (res.data.code == '9999') {
                    wx.showToast({
                        title: '确认失败',
                        icon: 'fail',
                        duration: 1000
                    })

                } else {
                    wx.showToast({
                        title: res.data.data,
                        icon: 'success',
                        duration: 1000
                    })
                    wx.redirectTo({
                        url: '/pages/takeOut/takeOutDateil?ORDER_PK=' + orderPk + '&SOURCE_NAME=' + sourceType
                    })
                    // 跳转页面、、或者刷新页面
                }
            }
        })
    },

    /**
   * 美团确认订单
   */
    enterMTOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.order;
        app.sendRequest({
            url: "order/confirm",
            method: "post",
            data: {
                orderId: orderId
            },
            success: function (res) {
                if (res.data.code == '9999') {
                    wx.showToast({
                        title: '确认失败',
                        icon: 'fail',
                        duration: 1000
                    })

                } else {
                    wx.showToast({
                        title: res.data.data,
                        icon: 'success',
                        duration: 1000
                    })
                    wx.redirectTo({
                        url: '/pages/takeOut/takeOutDateil?ORDER_PK=' + orderPk + '&SOURCE_NAME=' + sourceType
                    })
                    // 跳转页面、、或者刷新页面
                }
            }
        })
    },
    /**
     * 饿百取消订单
     */
    cancelEBOrder: function(e){
        var orderId = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '确认取消订单？',
            confirmColor: '#EF9BA0',
            success(res) {
                if (res.confirm) {
                    var orderId = e.currentTarget.dataset.order;
                    app.sendRequest({
                        url: "eb/order/cancel",
                        method: "post",
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.data.code == '9999') {
                                wx.showToast({
                                    title: '取消失败',
                                    icon: 'fail',
                                    duration: 1000
                                })

                            } else {
                                wx.showToast({
                                    title: res.data.data,
                                    icon: 'success',
                                    duration: 1000
                                })
                                // 跳转页面、、或者刷新页面
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },
    /**
    * 订单送出
    */
    eBOrderSendout: function (e) {
        var orderId = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '确认送出？',
            confirmColor: '#EF9BA0',
            success(res) {
                if (res.confirm) {
                    var orderId = e.currentTarget.dataset.order;
                    app.sendRequest({
                        url: "eb/order/sendout",
                        method: "post",
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.data.code == '9999') {
                                wx.showToast({
                                    title: '操作失败',
                                    icon: 'fail',
                                    duration: 1000
                                })

                            } else {
                                wx.showToast({
                                    title: res.data.data,
                                    icon: 'success',
                                    duration: 1000
                                })
                                // 跳转页面、、或者刷新页面
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },

    /**
       * 美团订单送出
       */
    mTOrderSendout: function (e) {
        var orderId = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '确认送出？',
            confirmColor: '#EF9BA0',
            success(res) {
                if (res.confirm) {
                    var orderId = e.currentTarget.dataset.order;
                    app.sendRequest({
                        url: "order/delivering",
                        method: "post",
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.data.code == '9999') {
                                wx.showToast({
                                    title: '操作失败',
                                    icon: 'fail',
                                    duration: 1000
                                })

                            } else {
                                wx.showToast({
                                    title: res.data.data,
                                    icon: 'success',
                                    duration: 1000
                                })
                                wx.redirectTo({
                                    url: '/pages/takeOut/takeOutDateil?ORDER_PK=' + orderPk + '&SOURCE_NAME=' + sourceType
                                })
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },

    /**
     * 订单送达
     */
    eBOrderComplete: function(e){
        var orderId = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '确认送达？',
            confirmColor: '#EF9BA0',
            success(res) {
                if (res.confirm) {
                    var orderId = e.currentTarget.dataset.order;
                    app.sendRequest({
                        url: "eb/order/complete",
                        method: "post",
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.data.code == '9999') {
                                wx.showToast({
                                    title: '操作失败',
                                    icon: 'fail',
                                    duration: 1000
                                })

                            } else {
                                wx.showToast({
                                    title: res.data.data,
                                    icon: 'success',
                                    duration: 1000
                                })
                                wx.redirectTo({
                                    url: '/pages/takeOut/takeOutDateil?ORDER_PK=' + orderPk + '&SOURCE_NAME=' + sourceType
                                })
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },
    /**
    * 美团订单送达
    */
    mTOrderComplete: function (e) {
        var orderId = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '确认送达？',
            confirmColor: '#EF9BA0',
            success(res) {
                if (res.confirm) {
                    var orderId = e.currentTarget.dataset.order;
                    app.sendRequest({
                        url: "order/arrived",
                        method: "post",
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (res.data.code == '9999') {
                                wx.showToast({
                                    title: '操作失败',
                                    icon: 'fail',
                                    duration: 1000
                                })

                            } else {
                                wx.showToast({
                                    title: res.data.data,
                                    icon: 'success',
                                    duration: 1000
                                })
                                wx.redirectTo({
                                    url: '/pages/takeOut/takeOutDateil?ORDER_PK=' + orderPk + '&SOURCE_NAME=' + sourceType
                                })
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    }
})