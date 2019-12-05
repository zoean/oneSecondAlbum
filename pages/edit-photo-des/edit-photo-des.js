var subString = require('../../utils/subString.js').subString;
// pages/edit-photo-des/edit-photo-des.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var photoId = wx.getStorageSync('photoId');
    var albumInfo = wx.getStorageSync('albumInfo');
    var photoDes = albumInfo.list[photoId].des;
    this.setData({
      photoDes: photoDes,
      albumInfo: albumInfo
    })
  },
  // setPhotoDes: function (event){
  //   var photoId = this.data.photoId;
  //   var photoDes = event.detail.value;
  //   console.log(photoDes)
  //   if (photoDes ==''){
  //     albumInfo.list[photoId].shortDes = '点击这里添加描述最多200字';
  //     albumInfo.list[photoId].des = '';
  //   }else{
  //     albumInfo.list[photoId].des = photoDes;
  //     albumInfo.list[photoId].shortDes = subString(photoDes, 50, true);      
  //   }
  //   this.setData({
  //     albumInfo: albumInfo, 
  //     photoDes: photoDes
  //   });
  //   wx.setStorageSync('albumInfo', albumInfo);
  // },  
  saveEditDes: function (event) {
    var photoId = wx.getStorageSync('photoId');
    var photoDes = event.detail.value;
    var albumInfo = wx.getStorageSync('albumInfo');
    if (photoDes == '') {
      albumInfo.list[photoId].shortDes = '点击这里添加描述最多200字';
      albumInfo.list[photoId].des = '';
    }else{
      albumInfo.list[photoId].des = photoDes;
      albumInfo.list[photoId].shortDes = subString(photoDes, 50, true);      
    }
    console.log(albumInfo.list[photoId].shortDes)
    this.setData({
      albumInfo: albumInfo
    });
    wx.setStorageSync('albumInfo', albumInfo);
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
   * 页面卸载时触发。如redirectTo或navigateBack到其他页面时。
   */
  onUnload: function () {
    //this.saveEditDes();
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