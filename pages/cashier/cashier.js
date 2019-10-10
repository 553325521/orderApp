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
    isFirst:true,
    tempTime:0 //第几次输入数字
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
    debugger;
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
    var operateStr = that.data.operateStr;
    if (isFoucs && that.data.noYH == false){
      if (str != '×' && str != '+'){
        var why = yhMoney.indexOf(".");
        if (str == "." && why == -1){
          if(yhMoney.indexOf(".") == -1){
            yhMoney = yhMoney + str;
            this.setData({
              yhMoney: yhMoney
            })
          }
        }else{
          if (yhMoney.indexOf(".") == -1 || str != '.') {
            yhMoney = yhMoney + str;
            this.setData({
              yhMoney: yhMoney
            })
          }
        }
       
      }
    } else if (that.data.isComputeFocus == true){
      if (str == '×' || str == '+') {
        var process = that.data.process;
        if(process != ""){
          that.data.bdsArray.push(parseFloat(process));
        }
        if (str == '×') {//删除按钮
          var len = that.data.bdsArray.length;
          if(len != 0 && operateStr != ""){
            var lastSign = that.data.bdsArray[len - 1];
            if(lastSign != '+'){
              that.data.bdsArray.splice(len-1,1);
              if(operateStr.indexOf("+") == -1){//如果当前输入串不包含+，删除所有
                operateStr = operateStr.substring(0, operateStr.length - 1);
                that.data.bdsArray[0] = operateStr;
                that.data.process = operateStr;
                that.setData({
                  result: operateStr,
                  process:that.data.process
                })
              }else{//如果包含+,删除到+
                that.data.bdsArray.splice(len-1, 1);//删除倒数第一个元素
                operateStr = operateStr.substring(0,operateStr.lastIndexOf("+")+1);
              }
            }else{
              that.data.bdsArray.splice(len - 1, 1);//删除倒数第一个元素
              operateStr = operateStr.substring(0,operateStr.length-1);
            }
          }
        } else {
          if(str == '+'){//解决连续输入两次+的情况
            //查看当前计算数组最后一位是不是+号
            var len = that.data.bdsArray.length;
            if (len == 0 || operateStr == ""){ //第一次不能输入+
              return;
            }else{
              var lastSign = that.data.bdsArray[len-1];
              if(lastSign != '+'){//最后一个不是+,往数组里新增，否则不做处理
                that.data.bdsArray.push(str);
                operateStr = operateStr + str;  
              }
            }
            //每次点击+，计算一下
            var tempArray = that.data.bdsArray.join(",").split(",");
            tempArray.splice(tempArray.length-1,1);
            var hz = this.dal2Rpn(tempArray);
            var result = this.calc(hz);
            that.setData({
              result:result
            });
          }else{
            that.data.bdsArray.push(str);
          }
        }
        that.setData({
          tempTime: 1 //当输入运算符的时候，输入结果和运算结果不再保持一致
        })
        that.setData({
          process: "",
          bdsArray: that.data.bdsArray
        });
     
      } else {
        var process = that.data.process;
        if(process == "" && str == "."){//第一次不能输入.
          return;
        }else if(process.indexOf(".") != -1 && str == "."){//包含.不能再次输入.
          return;
        }else{
          if (that.data.tempTime == 0) {
            that.setData({
              result: process + str
            })
          }
          that.setData({
            process: process + str
          });
          operateStr = operateStr + str;
        }
        
      } 
    }
    that.setData({
      operateStr: operateStr
    }); 
  },
  //清空
  empty: function() {
    var that = this;
    that.setData({
      process: '',
      result: '',
      tempTime: 0,
      operateStr:'',
      bdsArray:[],
      yhMoney:"",
      noYH:true,
      isComputeFocus:true,
      isFocus:false,
      isFirst: true
    })
  },
  yhMoneyChange:function(e){
    debugger;
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
    var money = Math.floor(Number(that.data.result) * 100);
    // 生成支付记录表数据
    app.sendRequest({
        url: 'savePaymentRecord',
        data: {
            PAY_SOURCE: 2,
            FK_SHOP: app.globalData.shopid
        },
        success: function(res){
            if(res.data.code === '0000'){
                app.pageTurns('../payMent/payMent?money=' + money + '&orderType=2&orderId=' + res.data.data);

            }
            else {
                app.hintBox('操作失败','none')
            }
        }
    });
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