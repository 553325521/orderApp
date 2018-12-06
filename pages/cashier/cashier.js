// pages/cashier/cashier.js
var app = getApp()
var pageTitle = "收银";

Page({
  options: {
    addGlobalClass: true,
  },
  data: {
    isDiscounts: true,
    result: '',
    process: '',
    newStr: '',
    isYH: false,
    bdsArray:[],
    operateStr:"",
    yhMoney:""
  },
  // 组件所在页面的生命周期函数
  onLoad: function() {
    app.updateTitle(pageTitle);
    console.log("页面show")
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
    console.log('step one');
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
    console.log('step two');
    if (outputStack.length > 0) {
      if (outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '(') {
        throw "error: unmatched ()";
      }
      while (outputStack.length > 0) {
        outputQueue.push(outputStack.pop());
      }
    }
    console.log('step three');
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
    console.log(e.detail.value.length);
    var isDiscounts = e.detail.value.length > 0 ? true : false;
    var isYH = e.detail.value.length > 0 ? false : true;
    that.setData({
      isDiscounts: isDiscounts,
      isYH: isYH
    })
  },
  //处理点击按钮
  processString: function(e) {
    var that = this;
    var str = e.currentTarget.dataset.number;
    if (str == '×' || str == '+'){
      var process = that.data.process;
      that.data.bdsArray.push(parseFloat(process));
      if (str == '×'){
        that.data.bdsArray.push("*");
      }else{
        that.data.bdsArray.push(str);
      }
      that.setData({
        process: "",
        bdsArray: that.data.bdsArray
      })
    }else{
      var process = that.data.process;
      that.setData({
        process: process + str
      })
    }
    var operateStr = that.data.operateStr;
    that.setData({
      operateStr: operateStr + str
    })   
  },
  //清空
  empty: function() {
    var that = this;
    that.setData({
      process: '',
      result: '',
      operateStr:''
    })
  },
  changeYHMoney:function(e){
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
    bdsArray.push(parseFloat(process));
    var hz = this.dal2Rpn(bdsArray);
    var result = this.calc(hz);
    result = result - yhMoney;
    that.setData({
      process:'',
      result: result,
      bdsArray:[]
    })
  },
  /**
   * 二维码收款
   */
  qrCodeCollection: function(e) {
    app.pageTurns('../payMent/payMent');
  },
  /**
   * 扫一扫收款
   */
  richScan: function() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: function(res) {
        console.log(res)
      },
      fail: function(error) {
        console.log(error)
      }
    })
  }

})