var app = getApp();
var pageTitle = "开台";//当前页面名字

Component({
  options: {
    addGlobalClass: true,
  },
  
  /**
 * 声明周期函数
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
})
