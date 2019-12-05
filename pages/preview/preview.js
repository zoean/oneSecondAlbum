// pages/preview/preview.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webViewUrl: 'https://album.guagua.cn/preview'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var pretitle = options.title;
    var presongurl = options.songurl;
    var pretempID = options.tempid;
    var prelist = options.list;
    var presongid = options.songid;
    var uid = options.uid;
    var token = options.token;
    var isnewPhoto = options.isnewphoto
    var photoid = options.photoid
    console.log(presongid)
    var url = this.data.webViewUrl + '?title=' + pretitle + '&songurl=' + presongurl + '&tempid=' + pretempID + '&list=' + prelist + '&viewType=0' + '&songid=' + presongid + '&uid=' + uid + '&token=' + token + '&isnewphoto=' + isnewPhoto + '&photoid=' + photoid
    this.setData({
      webViewUrl: url
    })
    console.log(this.data.webViewUrl)
  },
  loadsuccess: function () {
    console.log('加载成功')
  },
  getmessage:function(e){
    console.log(e)
		var l = e.detail.data.length - 1;
		if (e.detail.data[l].save == true){ //点击了保存按钮，设置回到首页刷新数据
      wx.setStorageSync('isRefresh', true);
      wx.setStorageSync('saveConfirm',true); //接收到此参数说明在预览页保存了，返回上传照片页时不提示是否保存
      wx.setStorageSync('photoID', e.detail.data[l].id);
      wx.setStorageSync('newPhoto', 0);
    } 
		if (e.detail.data[l].tempid != undefined){ //保存预览页的临时模板id
      wx.setStorageSync("pretempid", e.detail.data[l].tempid)
    }
		if (e.detail.data[l].songId != undefined){ //保存预览页选择的音乐
			wx.setStorageSync("presongid", e.detail.data[l].songId)
		}
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
  loadfail:function(){
    // this.setData({
    //   reload: true
    // })
  },
  reloadpage: function () {
    this.setData({
      reload: false
    })
    this.onLoad()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})