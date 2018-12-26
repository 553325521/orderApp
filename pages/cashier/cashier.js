// pages/cashier/cashier.js
var app = getApp()
var pageTitle = "收银";

Page({
  options: {
    addGlobalClass: true,
  },
  data: {
    result: '',
    process: '',
    newStr: '',
    noYH: true,
    isFocus:false,
    isComputeFocus:true,
    bdsArray:[],
    operateStr:"",
    yhMoney:"",
    isFirst:true
  },
  // 组件所在页面的生命周期函数
  onLoad: function() {
    app.updateTitle(pageTitle);
  },
  onReady: function() {},
  onShow: function() {},
  //判断是否是运算符
  isOperator: function(value) {
    var operatorString = "+-*/()";
    return operatorString.indexOf(value) > -1
  },
  //给运算符赋予优先数
  getPrioraty: function(value) {
    switch (value) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;

    }
  },
  //比较两个运算符优先级
  prioraty: function(o1, o2) {
    return this.getPrioraty(o1) <= this.getPrioraty(o2);

  },
  changeComputeFocus:function(){
    this.setData({
      isComputeFocus:true,
      isFocus:false
    })
  },
  changeYHINPUT:function(){
    this.setData({
      isFocus:true,
      isComputeFocus: false
    })
  },
  //中缀表达式转后缀表达式
  dal2Rpn: function(exp) {
    var inputStack = [];
    var outputStack = [];
    var outputQueue = [];

    for (var i = 0, len = exp.length; i < len; i++) {
      var cur = exp[i];
      if (cur != ' ') {
        inputStack.push(cur);
      }
    }
    while (inputStack.length > 0) {
      var cur = inputStack.shift();
      if (this.isOperator(cur)) {
        if (cur == '(') {
          outputStack.push(cur);

        } else if (cur == ')') {
          var po = outputStack.pop();
          while (po != '(' && outputStack.length > 0) {
            outputQueue.push(po);
            po = outputStack.pop();

          }
          if (po != '(') {
            throw "error: unmatched ()";
          }

        } else {
          while (this.prioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0) {
            outputQueue.push(outputStack.pop());
          }
          outputStack.push(cur);
        }
      } else {
        outputQueue.push(new Number(cur));
      }
    }
    if (outputStack.length > 0) {
      if (outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '(') {
        throw "error: unmatched ()";
      }
      while (outputStack.length > 0) {
        outputQueue.push(outputStack.pop());
      }
    }
    return outputQueue;
  },
  //后缀表达式计算结果
  calc: function (expr) {
    var arr = expr;
    var stack = [];
    var result = 0;
    for (var i = 0; i < arr.length; i++) {
      if (!isNaN(arr[i])) {
        stack.push(arr[i]);
      } else {
        var opr1 = parseFloat(stack.pop());
        var opr2 = parseFloat(stack.pop());
        switch (arr[i]) {
          case "+":
            stack.push(opr1 + opr2);
            break;
          case "-":
            stack.push(opr2 - opr1);
            break;
          case "*":
            stack.push(opr1 * opr2);
            break;
          case "/":
            stack.push(opr2 / opr1);
            break;
          default:
            throw new Error("UnSupportHandle");
        }
      }
    }
    result = stack.length == 1 ? stack.pop() : Math.max.apply(Math, stack);
    return result ? result : 0;
  },
  //是否优惠状态改变
  checkboxChange: function(e) {
    var that = this;
    var currentIndex = e.currentTarget.dataset.index;
    var noYH = currentIndex == 0 ? false : true;
    var isFocus = !noYH;
    that.setData({
      noYH: noYH,
      yhMoney:"",
      isFocus:isFocus
    })
  },
  //处理点击按钮
  processString: function(e) {
    var that = this;
    var str = e.currentTarget.dataset.number;
    var isFoucs = that.data.isFocus;
    var yhMoney = that.data.yhMoney+"";
    if (isFoucs && that.data.noYH == false){
      if (str != '×' && str != '+'){
        var why = yhMoney.indexOf(".");
        if (str == "." && why == -1){
          yhMoney = yhMoney + str;
          this.setData({
            yhMoney:yhMoney
          })
        }else{
          yhMoney = yhMoney + str;
          this.setData({
            yhMoney: parseFloat(yhMoney)
          })
        }
       
      }
    } else if (that.data.isComputeFocus == true){
      if (str == '×' || str == '+') {
        var process = that.data.process;
        if(process != ""){
          that.data.bdsArray.push(parseFloat(process));
        }
        if (str == '×') {
          that.data.bdsArray.push("*");
        } else {
          that.data.bdsArray.push(str);
        }
        that.setData({
          process: "",
          bdsArray: that.data.bdsArray
        })
      } else {
        var process = that.data.process;
        that.setData({
          process: process + str
        })
      }
      var operateStr = that.data.operateStr;
      that.setData({
        operateStr: operateStr + str
      })   
    }
   
  },
  //清空
  empty: function() {
    var that = this;
    that.setData({
      process: '',
      result: '',
      operateStr:'',
      bdsArray:[],
      yhMoney:"",
      noYH:true,
      isFirst: true
    })
  },
  yhMoneyChange:function(e){
    this.setData({
      yhMoney:e.detail.value
    })
  },
  //计算
  calculate: function() {
    var that = this;
    var process = that.data.process;
    var bdsArray = that.data.bdsArray;
    var yhMoney = 0;
    if (that.data.yhMoney != ""){
      yhMoney = parseFloat(that.data.yhMoney);
    }
    if(process!=""){
      bdsArray.push(parseFloat(process));
    }
    var result = 0;
    if(bdsArray.length != 0){
      var hz = this.dal2Rpn(bdsArray);
      result = this.calc(hz);
      if (that.data.isFirst == true){
        result = result - yhMoney;
        this.setData({
          isFirst:false
        })
      }
      bdsArray = [];
      bdsArray.push(result);
    }
    that.setData({
      process:'',
      result: result,
      bdsArray: bdsArray
     // operateStr:""
    })
  },
  /**
   * 二维码收款
   */
  qrCodeCollection: function(e) {
    var that = this
    var money = Math.floor(Number(that.data.result) * 100)
    app.pageTurns('../payMent/payMent?money=' + money + '&orderType=2');
  },
  /**
   * 扫一扫收款
   */
  richScan: function() {
    var that = this
    var money = Math.floor(Number(that.data.result) * 100) * 100
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: function(res) {
        //扫码成功
        console.log(res)
        var code = res.result
        if (code != null) {
          //进行支付前先生成支付订单
          // that.sendPay(payWay + '1', function success(res) {
            //进行支付
            app.sendRequest({
              url: 'ShopScanPay',
              method: "post",
              data: {
                qrCode: code,
                //openid: wx.getStorageSync('openid'),
                // ORDER_PK: ORDER_PK,
                orderType: '2',
                money: money,
                shopId: app.globalData.shopid
              },
              success: function (res) {
                console.info(res)
                if (res.data.code == '0000') {
                  if (res.data.data.result == 'A') {
                    wx.showModal({
                      title: '提示',
                      showCancel: false,
                      content: '等待用户确认支付',
                      success: function (res) { }
                    })
                  } else if (res.data.data.result == 'S') {
                    app.toast('支付成功')
                    //语音提醒支付成功
                    app.reLaunch('../index/index?page=../indent/indent')
                  }

                } else {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: '支付失败,原因:' + res.data,
                    success: function (res) { }
                  })
                }
              },
              fail: function (error) {
                app.hintBox('支付失败')
              }
            })
          // })
        }
      },
      fail: function(error) {
        console.log(error)
      }
    })
  }

})