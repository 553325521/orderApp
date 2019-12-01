var money = 0;
var app = getApp();
//用来标记是否第一次进入界面
var flag;
Page({
  data:{
    orderId: "",//当前处理的订单Id
    yfMoney:0,//应付金额
  },
  onLoad: function(options) {
    money = (options.money) / 100;
    flag = 0;
    this.setData({
      money: money,
      yfMoney:options.money,
      displayValue: money,
      sc: '0',
      orderId:options.orderId
    })
  },

  onTapDigit: function(event) {
    const key = event.target.dataset.key; // 根据data-key标记按键
    if (key == 'key-dot') {
      if (flag == 1) {
        // 按下点号
        if (!(/\./).test(this.data.displayValue)) {
          this.setData({
            displayValue: this.data.displayValue + '.'
          })
        }
      } else {
        this.setData({
          displayValue: '0'
        })
      }
      flag = 1;
    } else {
      //如果是回退键  全部清空
      if (key == 'key-back') {
        this.setData({
          displayValue: money,
          sc: '0'
        })
        flag = 0;
      } else if (key == 'key-sum') {//快结按钮处理
        var orderId = this.data.orderId;
        var yfMoney = this.data.yfMoney;
        app.sendRequest({
          url: "Order_update_cashPay",
          method: "post",
          data: {
            ORDER_PK: orderId,
            ORDER_SHOPMONEY:yfMoney,
            openid: wx.getStorageSync('openid')
          },
          success: function (res) {
            var data = res.data.data;
            if (res.data.code == '0000') {
              app.reLaunch('/pages/index/index?page=../indent/indent');//跳转订单界面
              //app.pageTurns('../index/index?page=../indent/indent');
            } else {
              app.toast(res.data.data);
            }
          },
          fail: function (error) {
            console.info(error);
          }
        })
      } else {
        if (key == 'key-100') {
          var diaplayValue = this.data.displayValue;
          if (diaplayValue != undefined && flag !=0) {
            //100
            this.setData({
              displayValue: 100 + parseFloat(diaplayValue)
            })
          } else {
            this.setData({
              displayValue: 100
            })
          }
          flag = 1;
        } else if (key == 'key-10') {
          var diaplayValue = this.data.displayValue;
          if (diaplayValue != undefined && flag != 0) {
            //10
            this.setData({
              displayValue: 10 + parseFloat(diaplayValue)
            })
          } else {
            this.setData({
              displayValue: 10
            })
          }
          flag = 1;
        } else if (key == 'key-50') {
          var diaplayValue = this.data.displayValue;
          if (diaplayValue != undefined && flag != 0) {
            //50
            this.setData({
              displayValue: 50 + parseFloat(diaplayValue)
            })
          } else {
            this.setData({
              displayValue: 50
            })
          }
          flag = 1;
        } else {
          // 按下数字键
          const digit = key[key.length - 1];
          if (flag == 1) {
            var displayValue;
            if (this.data.displayValue == undefined || this.data.displayValue == '0') {
              //单个数字的
              this.setData({
                displayValue: String(digit)
              })
            } else {
              this.setData({
                displayValue: this.data.displayValue + String(digit)
              })
            }
          } else {
            this.setData({
              displayValue: String(digit)
            })
          }
          flag = 1;
        }
      }
      
      var displayValue = this.data.displayValue;
      var moneySum = this.data.money;
      var moneySc = 0;
      if (this.data.displayValue - this.data.money > 0) {
        moneySc = this.data.displayValue - this.data.money;
      }
      //快结键 计算找零的数量
      this.setData({
        sc: moneySc
      })
    }

  }
})