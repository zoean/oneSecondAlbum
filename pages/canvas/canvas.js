// pages/canvas/canvas.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceWidth:'',
    deviceHeight:'',
    devicePixelRatio:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var deviceWidth = res.windowWidth;
        var deviceHeight = res.windowHeight;
        var devicePixelRatio = res.pixelRatio;
        that.setData({
          deviceWidth: deviceWidth,
          deviceHeight: deviceHeight,
          devicePixelRatio: devicePixelRatio
        })
      },
    })   
  },
  canvasfn:function(){
    console.log('绘制海报');
    var ctx = wx.createCanvasContext('myCanvas');
    // console.log(ctx);
    // ctx.fillRect(10, 10, 150, 100)
    // ctx.draw()
    // ctx.fillRect(50, 50, 150, 100)
    // ctx.draw(true)



    var deviceWidth = this.data.deviceWidth;
    var deviceHeight = this.data.deviceHeight;
    var x = 0,
      y = 0,
      w = (deviceWidth / 750) * 600,
      h = (deviceWidth / 750) * 944,
      r = 10;
    console.log('我开始画了');
    ctx.beginPath();
    ctx.setFillStyle('#000');
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.lineTo(x + w, y + r);
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - r);
    ctx.lineTo(x + w - r, y + h);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
    ctx.lineTo(x + r, y + h);
    ctx.lineTo(x, y + h - r);
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x + r, y);
    ctx.fill();
    ctx.closePath();
    ctx.draw()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})