// components/xing/x-scroll-view/x-scroll-view.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pullText: {
      type: String,
      value: '下拉可以刷新',
    },
    releaseText: {
      type: String,
      value: '松开立即刷新',
    },
    loadingText: {
      type: String,
      value: '刷新数据中',
    },
    finishText: {
      type: String,
      value: '',
    },
    loadmoreText: {
      type: String,
      value: '加载更多数据...',
    },
    nomoreText: {
      type: String,
      value: '全部加载完毕',
    },
    pullDownHeight: {
      type: Number,
      value: 60,
    },
    refreshing: {
      type: Boolean,
      value: false,
      observer: '_onRefreshFinished',
    },
    nomore: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pullDownStatus: 0,
    lastScrollEnd: 0,
    slideStart: [],
    scrollHeigh:0,
    scrollTop:0
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    //组件被加载
    attached: function () {
      var currentHeight = wx.getSystemInfoSync().windowHeight;
      console.info(currentHeight);
      const px = 100 / 750 * wx.getSystemInfoSync().windowWidth;
      this.setData({
        scrollHeigh:currentHeight-px
      })
    },
    moved: function () { console.log("组件被moved") },
    //组件被移除
    detached: function () {
      console.log("detached");
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _onScroll: function (e) {
      this.triggerEvent('scroll', e.detail);
      const status = this.data.pullDownStatus;
      if (status === 3 || status == 4) return;
      const height = this.properties.pullDownHeight;
      const scrollTop = e.detail.scrollTop;
      let targetStatus;
      if (scrollTop < -1 * height) {
        targetStatus = 2;
      } else if (scrollTop < 0) {
        targetStatus = 1;
      } else {
        targetStatus = 0;
      }
      if (status != targetStatus) {
        this.setData({
          pullDownStatus: targetStatus,
        })
      }
    },
    /**开始滑动 */
    touchstart(e) {
      /**记录开始滑动的时间 */
      this.setData({
        slideStart: e.touches[0]
      })
    },
    /**滑动 */
    touchmove(e) {
      let slideStart = this.data.slideStart;
      let slideMove = e.touches[0];
      let startX = slideStart.pageX;
      let startY = slideStart.pageY;
      let moveEndX = slideMove.pageX;
      let moveEndY = slideMove.pageY;
      let X = moveEndX - startX;
      let Y = moveEndY - startY;
      if (Math.abs(Y) > Math.abs(X) && Y > 0) { // 从上向下滑
        this.setData({
          pullDownStatus: 3
        });
      } else if (Math.abs(Y) > Math.abs(X) && Y < 0) { // 从下向上滑
        console.log("bottom 2 top");
      }
    },
    //滑动结束
    touchend(e) {
      //加载刷新数据
      setTimeout(() => {
        this.triggerEvent('refreshPullData');
        console.info("123");
        this.setData({
          pullDownStatus: 4
        })
      }, 1500);
    },
    _onTouchEnd: function (e) {
      console.info(wx.createSelectorQuery().select('#top-item'));
      wx.createSelectorQuery().select('#top-item').boundingClientRect(function (rect) {
        console.info(rect);
      }).exec();
      const status = this.data.pullDownStatus;
      if (status === 2) {
        this.setData({
          pullDownStatus: 3,
        })
        this.properties.refreshing = true;
        setTimeout(() => {
          this.triggerEvent('pulldownrefresh');
        }, 500);
      }
    },

    _onRefreshFinished(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.properties.nomore = false;
        this.setData({
          nomore: false,
        })
        this.setData({
          pullDownStatus: 4,
          lastScrollEnd: 0,
        })
        setTimeout(() => {
          this.setData({
            pullDownStatus: 0,
          })
        }, 500);
      }
    },

    _onLoadmore() {
      if (!this.properties.nomore) {
        let query = wx.createSelectorQuery().in(this);
        query.select('.scroll-view').fields({
          size: true,
          scrollOffset: true,
        }, res => {
          console.info(res);
          console.info(this.data.lastScrollEnd);
          if (Math.abs(res.scrollTop - this.data.lastScrollEnd) > res.height/20) {
            this.setData({
              lastScrollEnd: res.scrollTop,
            })
            this.triggerEvent('loadmore');
          }
        }).exec();
      }
    },
  },
})
