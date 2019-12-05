// pages/edit-photo-music/edit-photo-music.js
var app = getApp();
var resUpLoadArrJson = [];//已经上传的图片res
var keepLocalPicUrl = []; //保存本地选择的图片地址
var editPhotoPic = []; 
var iseditTitle = ''
var keepTitle = ''
var keepUpLoadPicUrl = [];//已经上传图片的url
var UtilEdit = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    editTitle: '',//当前相册的标题
    editPhotoPic: '',//渲染图片地址数组
    editPicStartNum: '', //已经渲染图片原有数量
    titleLimit:'' //标题最多输入50个字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    
    //清空数组保存内容
    editPhotoPic = []; 
    keepLocalPicUrl = [];
    resUpLoadArrJson = [];
    // console.log(options);
    var editPhotoId = options.id;
    var editMusicId = options.tempMusicId;
    var editTemplateId = options.templateId;
    wx.setStorageSync('musicPhotoTemplateId', editTemplateId);
    console.log('相册id' + editPhotoId + '音乐id' + editMusicId + '模板id' + editTemplateId);
    that.setData({
      id: editPhotoId 
    })
    wx.showLoading({
      title: '加载中..',
    })
    wx.request({
      url: 'https://cgi.guagua.cn/post/info?id=' + editPhotoId,
      // url: 'https://cgi.guagua.cn/post/info?id=168',
      method:'GET',
      header:'application/json',
      success:function(data){
        if (data.statusCode == 200){
          // console.log(data);
          var picLis = data.data.content.list;
          for (var i in picLis) {
            editPhotoPic.push(picLis[i].resUrl + '!editAlbum');
            keepUpLoadPicUrl.push(picLis[i].resUrl)
          }
        
          var id = data.data.content.id; //相册id
          var picnum = editPhotoPic.length;
          var editTitle = data.data.content.title ;
          var templateId = data.data.content.templateId;
          var titleLimit = 50 - editTitle.length;

          
          keepTitle = data.data.content.title;
          iseditTitle = editTitle;
          console.log(editPhotoPic)
          that.setData({
            editnum: picnum,//显示当前已经选择的图片张数
            editTitle: editTitle,//当前相册的标题
            editPhotoPic: editPhotoPic,//渲染图片地址数组
            editPicStartNum: picnum, //已经渲染图片原有数量
            titleLimit: titleLimit
          });
          wx.hideLoading();
          for (var j in picLis){
            resUpLoadArrJson.push({
              "resUrl": picLis[j].resUrl,//必选
              "des": ""//可为null
            });
          }
        }else{
          wx.showToast({
            title: '加载失败！',
            icon:'loading',
            duration:'2000'
          })
        }
      }
    });
    wx.request({
      url: 'https://cgi.guagua.cn/post/assumeRole',
      header: {
        'content-type': 'application/json', // 默认值
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      success: function (res) {
        var ossData = res.data
        // console.log(ossData);
        console.log('请求到了签名参数')
        wx.setStorageSync('uploadData', ossData);
      }
    })
    // if (wx.getStorageSync('uploadData')) {
    //   var limitUploadTime = UtilEdit.timestampToTime(wx.getStorageSync('uploadData').content.expire);
    //   var nowUploadTime = UtilEdit.nowTime();
    //   if (nowUploadTime > limitUploadTime) {
    //     wx.removeStorageSync('uploadData');
    //     wx.request({
    //       url: 'https://cgi.guagua.cn/post/assumeRole',
    //       header: {
    //         'content-type': 'application/json', // 默认值
    //         'userid': wx.getStorageSync('uid'),
    //         'webToken': wx.getStorageSync('webToken')
    //       },
    //       success: function (res) {
    //         var ossData = res.data
    //         // console.log(ossData);
    //         console.log('请求到了签名参数')
    //         wx.setStorageSync('uploadData', ossData);
    //       }
    //     })
    //   };
    //   console.log(limitUploadTime);
    //   console.log(nowUploadTime);
    // }





    wx.request({
      url: 'https://cgi.guagua.cn/post/update',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        id: editPhotoId,
        templateId: editTemplateId,
        songId: editMusicId
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          console.log('添加照片页面更新帖子成功');
          // //填充编辑条页url
          // var pages = getCurrentPages();
          // var prevPage = pages[pages.length - 2];
          // prevPage.prevSet();  
        }
      }
    })
  },
  //添加图片
  addpic:function(){
    var that = this;
    var editPhotoPicLength = that.data.editPhotoPic.length;
    
    // console.log(editPhotoPicLength)
    wx.chooseImage({
      count: 100 - editPhotoPicLength, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        console.log(res.tempFilePaths);
        var choosePicArr = res.tempFilePaths;
        var newPicUrlData = that.data.editPhotoPic.concat(res.tempFilePaths);
        keepLocalPicUrl = keepLocalPicUrl.concat(res.tempFilePaths);
        console.log(keepLocalPicUrl)
        console.log(newPicUrlData);
        that.setData({
          editPhotoPic: newPicUrlData,
          editnum: newPicUrlData.length
        });
      },
    })
  },
  //获取标题
  bindinput: function (e) {
    var that = this;
    console.log(e);
    var editNewTitle = e.detail.value;
    iseditTitle = editNewTitle;
    var editNewTitleLimit = editNewTitle.length;
    that.setData({
      titleLimit: editNewTitleLimit
    })
    console.log(iseditTitle);
  },
  //删除照片
  editRemovePic: function (e) {
    var that = this;
    var picLength = that.data.editPhotoPic.length;
    var removeUrlIndex //已经上传的图片删除的是第几个
    if (picLength == 1){
      wx.showToast({
        title: '至少保留一张照片',
        icon:'none',
        duration:1500
      })
    }else{
      //页面展示
      var editPicArr = that.data.editPhotoPic;
      var removeUrl = e.target.dataset.url;
      removeUrlIndex = editPicArr.indexOf(removeUrl);
      console.log(removeUrlIndex);
      editPicArr.splice(removeUrlIndex,1);
      console.log(editPicArr)
      that.setData({
        editPhotoPic: editPicArr,
        editnum: editPicArr.length
      })

      //处理接口上传数据
      if (removeUrl.indexOf('https') != -1){
        console.log(removeUrl)
        resUpLoadArrJson.splice(removeUrlIndex,1); //在上传的参数中删除相应的图片json数据
        console.log(resUpLoadArrJson)
      }else{
        var keepLocalPicIndex = keepLocalPicUrl.indexOf(removeUrl);
        keepLocalPicUrl.splice(keepLocalPicIndex,1);
      }
      console.log(keepLocalPicUrl);
      console.log(resUpLoadArrJson);
    }
  },
  //保存相册
  savephoto: function () {
    var that = this;
    var newpolicy = wx.getStorageSync('uploadData').content.policy;
    var newOSSAccessKeyId = wx.getStorageSync('uploadData').content.accessid;
    var newsignature = wx.getStorageSync('uploadData').content.signature;
    var newhost = wx.getStorageSync('uploadData').content.host;
    var updatePinJson = resUpLoadArrJson;
    var updataUid = wx.getStorageSync('uid');
    var updataWebToken = wx.getStorageSync('webToken');
    var updateId = that.data.id;
    var musicPhotoTemplateId = wx.getStorageSync('musicPhotoTemplateId');
    var updataTitle;
    var resurlArr = [];
    var resurlFailArr = [];
    if (keepLocalPicUrl.length > 0){
      if (iseditTitle != keepTitle){
        updataTitle = iseditTitle //更新修改的相册标题
      }else{
        updataTitle = keepTitle
      }
      console.log('上传图片');
      wx.showLoading({
        title: '照片上传中',
      })
      UtilEdit.addimage({
        url: newhost,//这里是你图片上传的接口
        path: keepLocalPicUrl,//这里是选取的图片的地址数组
        policy: newpolicy,
        OSSAccessKeyId: newOSSAccessKeyId,
        signature: newsignature,
        pagethis: that,
        // postType: postType,
        resurl: resurlArr,
        resurlFail: resurlFailArr,
        updateId: updateId,
        updatePinJson: updatePinJson,
        updataTitle: updataTitle
        // ishomePage: true
      });
    } else if ((keepLocalPicUrl.length == 0 && resUpLoadArrJson.length < that.data.editPicStartNum) || (keepLocalPicUrl.length == 0 && iseditTitle != that.data.editTitle)){
      UtilEdit.update(updataUid, updataWebToken, updateId, updatePinJson, [], iseditTitle)
    } else{
      wx.redirectTo({
        url: '../edit-album/edit-album?id=' + updateId + '&viewType=' + 1 + '&templateId=' + musicPhotoTemplateId,
      })
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
    // //填充编辑条页url
    // var pages = getCurrentPages();
    // var prevPage = pages[pages.length - 2];
    // prevPage.prevSet();  
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

  },
})