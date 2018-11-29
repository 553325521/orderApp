// pages/cashier/cashier.js
var app = getApp()
var pageTitle = "收银";

Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    isDiscounts:true,
    result:'',
    process:'',
    newStr:''
  },

  /**
     * 组件周期函数
     */
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      app.updateTitle(pageTitle)
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
    show: function () { console.log("页面show") },
    hide: function () { },
    resize: function () { },
  },


  methods:{
    checkboxChange:function(e){
      var that = this;
      console.log(e.detail.value.length);
      var isDiscounts = e.detail.value.length > 0 ? true : false;
      that.setData({
        isDiscounts: isDiscounts
      })
    },
    processString:function(e){
      var that = this;
      var str = e.currentTarget.dataset.number;
      var process = that.data.process;
      var lastStr = process.charAt(process.length - 1);
      var lastButStr = process.charAt(process.length - 2);
      if (str == '+' || str == '.'){
        if (process == '' || lastStr =='+'){
          str = ''
        }else{
          str = str
        }
      }
      if (str == '0'){
        if ((lastStr == '0' && lastButStr == "+") || process == '0'){
          str = ''
        } else {
          str = str
        }
      }
      if (str == '+'){
        that.data.newStr = '';
        var arr = process.split("+");
        if(arr.length>=2){
          that.calculate()
        }
      }else{
        that.data.newStr = that.data.newStr + str
      }
      var newStr = that.data.newStr;
      var count = newStr.split(".").length - 1;
      if (str == '.'){
        if (count > 1) {
          str = ''
        } else {
          str = str
        }
      }
      that.setData({
        process: process + str
      })
    },
    empty:function(){
      var that = this;
      that.setData({
        process:'',
        newStr:'',
        result:''
      })
    },
    calculate:function(){
      var that = this;
      var process = that.data.process;
      console.log(process)
      if (process == ''){
        return false
      }
      var finallyStr = process[process.length-1];
      if (finallyStr == '+'){
        return false
      }
      var arr = process.split("+");
      var result;
      if (arr.length==2){
        result = parseFloat(arr[0]) + parseFloat(arr[1])
      } else if (arr.length > 2){
        result = that.data.result + parseFloat(arr[arr.length-1])
      }
      that.setData({
        process: process + '+',
        result: result
      }) 
    },
    /**
     * 二维码收款
     */
    qrCodeCollection:function(e){
      app.pageTurns('../payMent/payMent');
    },
    /**
     * 扫一扫收款
     */
    richScan:function(){
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: function (res) {
          console.log(res)
        },
        fail: function (error) {
          console.log(error)
        }
      })
    }
  }
})