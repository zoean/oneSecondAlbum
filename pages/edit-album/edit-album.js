// var compareVersion = require('../../utils/compareVersion.js').compareVersion;
// pages/edit-album/edit-album.js
var webViewOldUrl; //保存初始的url
var isOnLoad = true;
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    webViewUrl: 'https://album.guagua.cn/',
    originalUrl: 'https://album.guagua.cn/',
    unload:false,
    reload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var getSystemInfoData = ''
    var model, system, version, modelInit, systemInit,routerfrom,preid,newid,uid,webtoken;
    preid = options.preid;
    newid = options.newid;
    uid = options.uid;
    webtoken = options.webToken;
    //获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        model = encodeURI(res.model.replace(/\s+/g, ""));
        system = res.system.replace(/\s+/g, "");
        version = res.version.replace(/\s+/g, "");
        getSystemInfoData = '&model=' + model + '&system=' + system + '&version=' + version
        console.log(getSystemInfoData)
      }
    });
    routerfrom = options.from
    //获取二维码中的参数
    console.log(options);
    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined') {
      var decodeid = scene.split("=")[1];
      var postId = decodeid;
      var viewType = 2;
    }else{
      var postId = options.id;
      var viewType = options.viewType;
      var tempMusicId = options.tempMusicId;//临时音乐
      var templateId = options.templateId; //临时模板
    }
    var albumUrl = 'https://cgi.guagua.cn/post/info'; 
    // var addSave = options.addSave;       
    this.setData({
      postId: postId,
      viewType: viewType,      
      webViewUrl: this.data.webViewUrl + '?id=' + postId + '&viewType=' + viewType + '' + getSystemInfoData + '&from=' + routerfrom + '&preid=' + preid + '&newid=' + newid + '&uid=' + uid + '&webToken=' + webtoken
    });
    
    // if (addSave && addSave == true) {
    //   this.setData({
    //     addSave: addSave,
    //   })
    // }
    if(viewType==0){//预览模板、编辑条
      if (templateId != undefined) {
        this.setData({
          templateId: templateId,
          webViewUrl: this.data.webViewUrl + '&templateId=' + templateId + '&getSystemInfo=' + getSystemInfoData + '&preid=' + preid + '&newid=' + newid + '&uid=' + uid + '&webToken=' + webtoken
        });        
        console.log(this.data.webViewUrl)
      } 
      if (tempMusicId != undefined) {
        this.setData({
          tempMusicId: tempMusicId,
          webViewUrl: this.data.webViewUrl + '&tempMusicId=' + tempMusicId + '&getSystemInfo=' + getSystemInfoData + '&preid=' + preid + '&newid=' + newid + '&uid=' + uid + '&webToken=' + webtoken
        });
      }
    }else if(viewType==1){//保存
      console.log('保存');
      console.log(templateId)
      console.log(tempMusicId)
      if (templateId != undefined) {
        this.setData({ 
          webViewUrl: this.data.webViewUrl + '&templateId=' + templateId + '&getSystemInfo=' + getSystemInfoData + '&from=' + options.routerfrom
        });
      }else{
        webViewUrl: this.data.webViewUrl + '&templateId=' + templateId + '&tempMusicId=' + tempMusicId + '&getSystemInfo=' + getSystemInfoData + '&from=' + routerfrom
      }
      this.setAlbumInfo(templateId, tempMusicId);      
    }
    console.log('reload'+this.data.webViewUrl)
    webViewOldUrl = this.data.webViewUrl;   
  },  
  setAlbumInfo: function (templateId, musicId) {
    var that = this;
    var updataAlbumUrl = 'https://cgi.guagua.cn/post/update';
    wx.request({
      url: updataAlbumUrl,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        'id': this.data.postId,
        'templateId': templateId,
        'songId': musicId
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode == 200) {
          webViewOldUrl = that.data.webViewUrl
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.data.unload = true
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
    isOnLoad = true;   
    
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
  
  },
  loadsuccess:function(){
    console.log('加载成功')
  },
  loadfail:function(){
    this.setData({
      reload:true
    })
  },
  reloadpage:function(){
    this.setData({
      reload: false
    })
    this.onLoad()
  },
  getmessage:function(){
		wx.setStorageSync('pretempid', '');
		wx.setStorageSync('presongid', '');
  }
})