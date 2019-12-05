// pages/edit-photo-music/edit-photo-music.js
var util = require('../../utils/util.js');
var subString = require('../../utils/subString.js').subString;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //albumInfo
    updataAlbumUrl: 'https://cgi.guagua.cn/post/update'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.removeStorageSync('photoId');
    wx.removeStorageSync('albumInfo');
    var that = this;
    var albumId = options.id;
    var viewType = options.viewType;
    var templateId = options.templateId;
    var tempMusicId = options.tempMusicId;
    //console.log(tempMusicId + ' ' + albumId)
    var albumInfo = '';
    var albumUrl = 'https://cgi.guagua.cn/post/info';
    var aliyunOssUrl = 'https://cgi.guagua.cn/post/assumeRole';
    this.setData({
      id: albumId,
      viewType: viewType,
      templateId: templateId,
      tempMusicId: tempMusicId
    });
    //console.log(this.data.tempMusicId)
    //获取当前相册信息
    wx.showLoading({
      title: '加载中..',
    });
    wx.request({
      url: albumUrl,
      data: {
        id: albumId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        albumInfo = res.data.content;
        for (var i = 0; i < albumInfo.list.length; i++) {
          if (albumInfo.list[i].des == "") {
            albumInfo.list[i].shortDes = '点击这里添加描述最多200字'
          } else {
            albumInfo.list[i].shortDes = subString(albumInfo.list[i].des, 50, true);
          }
        }
        that.setData({
          albumInfo: albumInfo
        });
        wx.hideLoading();
        wx.setStorageSync('albumInfo', that.data.albumInfo);      }
    });
    //获取签名
    wx.request({
      url: aliyunOssUrl,
      header: {
        'content-type': 'application/json',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      success: function (res) {
        var ossData = res.data;
        wx.setStorageSync('uploadData', ossData)
      }
    });
    //保存之前选择
    wx.request({
      url: 'https://cgi.guagua.cn/post/update',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        id: albumId,
        templateId: templateId,
        songId: tempMusicId
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
  updataDes: function (photoId) {
    var albumInfoSync = wx.getStorageSync('albumInfo');
    var albumInfo = this.data.albumInfo;
    console.log(albumInfoSync)
    if (albumInfoSync.list[photoId].des == '') {
      albumInfo.list[photoId].des = '';
      albumInfo.list[photoId].shortDes = '点击这里添加描述最多200字'
    } else {
      albumInfo.list[photoId].des = albumInfoSync.list[photoId].des;
      albumInfo.list[photoId].shortDes = subString(albumInfoSync.list[photoId].des, 50, true)
    }
    this.setData({
      albumInfo: albumInfo
    })
  },
  onShow: function () {
    var albumInfo = wx.getStorageSync('albumInfo');
    this.setData({
      albumInfo: albumInfo
    }) 
  },
  onHide: function (){
  },
  setAlbumTitle: function (event){//设置相册title
    var albumInfo = wx.getStorageSync('albumInfo');
    albumInfo.title = event.detail.value;
    this.setData({
      albumInfo: albumInfo
    })
    wx.setStorageSync('albumInfo', this.data.albumInfo);
  },
  editPhotoDes: function (event) {
    var albumInfo = wx.getStorageSync('albumInfo');
    var photoId = event.currentTarget.dataset.photoid;
    var photoDes = albumInfo.list[photoId].des;    
    wx.setStorageSync('photoId', photoId);
    wx.setStorageSync('albumInfo', this.data.albumInfo);
    wx.navigateTo({
      url: '../edit-photo-des/edit-photo-des'
    })
  },
  moveUp: function (event) {//上移
    var that = this;
    var albumUpdate = this.data.albumInfo;//相册信息
    //当前对象sortid
    var sortOrder = event.currentTarget.dataset.sortorder;
    var index = event.currentTarget.dataset.index;
    //当前对象
    var targetObj = albumUpdate.list[sortOrder];
    //被动对象
    var anotherObj = albumUpdate.list[sortOrder - 1];
    //被动项sortid
    var anotherSortOrder = sortOrder - 1;
    //暂存
    var targetDel = '';
    if (sortOrder > 0) {
      albumUpdate.list[sortOrder].sortOrder = sortOrder - 1;
      albumUpdate.list[anotherSortOrder].sortOrder = sortOrder;
      targetDel = albumUpdate.list.splice(index, 1);
      albumUpdate.list.splice(index - 1, 0, targetDel[0]);
      this.setData({
        albumInfo: albumUpdate
      })
      wx.setStorageSync('albumInfo', this.data.albumInfo);
      console.log(this.data.albumInfo)
    } else {
      wx.showToast({
        title: '当前已是第一张',
        icon: 'none',
        duration: 2000
      })
    }
  },
  moveDown: function (event) {//下移
    var that = this;
    var albumUpdate = this.data.albumInfo;//相册信息
    //当前对象sortid
    var sortOrder = event.currentTarget.dataset.sortorder;
    var index = event.currentTarget.dataset.index;
    //当前对象
    var targetObj = albumUpdate.list[sortOrder];
    //被动对象
    var anotherObj = albumUpdate.list[sortOrder + 1];
    //被动项sortid
    var anotherSortOrder = sortOrder + 1;
    //暂存
    var targetDel = '';
    if (sortOrder < albumUpdate.list.length - 1) {
      albumUpdate.list[sortOrder].sortOrder = sortOrder + 1;
      albumUpdate.list[anotherSortOrder].sortOrder = sortOrder;
      targetDel = albumUpdate.list.splice(index, 1);
      albumUpdate.list.splice(index + 1, 0, targetDel[0]);
      this.setData({
        albumInfo: albumUpdate
      })
      wx.setStorageSync('albumInfo', this.data.albumInfo);
    } else {
      wx.showToast({
        title: '当前已经最后一张',
        icon: 'none',
        duration: 2000
      })
    }
  },
  delPhoto: function (event) {//删除照片
    var that = this;
    var albumUpdate = this.data.albumInfo;//相册信息
    //当前对象sortid
    var sortOrder = event.currentTarget.dataset.sortorder;
    //当前对象
    var targetObj = albumUpdate.list[sortOrder];
    if (albumUpdate.list.length > 1) {
      albumUpdate.list.splice(sortOrder, 1);
      for (var i = 0; i < albumUpdate.list.length; i++) {
        albumUpdate.list[i].sortOrder = i;
        this.setData({
          albumInfo: albumUpdate
        })
        wx.setStorageSync('albumInfo', this.data.albumInfo);
      }
    } else {
      wx.showToast({
        title: '至少保留一张照片',
        icon: 'none',
        duration: 2000
      })
    }
  },
  addPhoto: function () {//添加照片
    var that = this;
    var albumInfo = this.data.albumInfo;
    var newPhotoData = [];
    var uploadPhotos = [];
    wx.chooseImage({
      count: 100 - this.data.albumInfo.list.length,
      sizeType: ['compress'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        uploadPhotos = res.tempFiles;
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          newPhotoData.push({ resUrl: res.tempFilePaths[i], des: '', shortDes: '点击这里添加描述最多200字', sortOrder: albumInfo.list.length + i, local: true })
        }
        albumInfo.list = albumInfo.list.concat(newPhotoData);
        that.setData({
          albumInfo: albumInfo,
        })
        wx.setStorageSync('albumInfo', that.data.albumInfo);
      }
    });
  },
  saveAlbum: function () {//保存相册修改
    var that = this;
    var albumInfo = this.data.albumInfo;
    //上传新照片
    var accessid = wx.getStorageSync('uploadData').content.accessid;//上传器ID
    var policy = wx.getStorageSync('uploadData').content.policy;//策略
    var signature = wx.getStorageSync('uploadData').content.signature;//签名
    var dir = wx.getStorageSync('uploadData').content.dir;//目录
    var host = wx.getStorageSync('uploadData').content.host;//主机
    var expire = wx.getStorageSync('uploadData').content.expire;//过期时间
    var currentTime = new Date();//当前时间
    var albumList = this.data.albumInfo.list;
    var newAlbumList = [];//需要request传递的list
    var ossPath = 'pic/' + wx.getStorageSync('uid') + '/';
    var uploadFiles = [];//需上传的文件
    var uploadFailFiles = [];//上传失败照片
    var uploadFailIndex = [];//上传失败照片ID
    var uploadIndex = [];//需上传文件的ID
    var successCount = 0;//成功个数
    var failCount = 0;//失败个数             
    var newFileName = [];//新文件名
    var j = 0; //新文件名索引
    for (var i in albumList) {
      var albumInfo = this.data.albumInfo;
      var resUrl = albumList[i].resUrl;//照片url
      var localPhoto = albumList[i].local; //是否是本地照片 
      var photoId = albumList[i].sortOrder;
      var photoDes = albumList[i].des;
      newAlbumList.push({
        "resUrl": resUrl,
        "des": photoDes,
        "sortOrder": photoId
      })
      if (localPhoto && localPhoto == true) {//本地图片/需要上传的图片
        uploadFiles.push(resUrl);//需要上传的照片url数组
        uploadIndex.push(photoId);  //需要上传照片的index数组        
        var fileExtension = resUrl.split('.');
        var fileExtension = fileExtension[1];
        var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000);
        var fileName = fileRandName + "." + fileExtension;
        var fileKey = ossPath + fileName;
        newFileName.push(fileKey);
      }
    }
    if (newFileName.length < 1) {//如果没有需要上传的新照片，则更新
      this.setData({
        newAlbumList: newAlbumList
      })
      this.sendAlbum();
    } else {//如果有需要上传的照片      
      console.log(albumList)//带本地路径的相册信息
      console.log(uploadFiles)//需上传的文件数组
      console.log(uploadIndex)//需上传文件的INDEX
      console.log(newFileName)//新文件名
      wx.showLoading({
        title: '正在上传...',
      })
      this.uploadPhoto(albumList, newAlbumList, uploadFiles, uploadIndex, newFileName, successCount);
    }
  }, //albumList 带本地路径的相册信息 newFile 新文件数组 fileKey 新文件名
  uploadPhoto: function (albumList, newAlbumList, uploadFiles, uploadIndex, newFileName, successCount) {
    var that = this;
    var index = 0;
    var photoId = uploadIndex[successCount];

    var albumList = albumList;
    var newAlbumList = newAlbumList;
    var uploadFiles = uploadFiles;
    var uploadIndex = uploadIndex;
    var newFileName = newFileName;
    var successCount = successCount;

    //上传新照片
    var accessid = wx.getStorageSync('uploadData').content.accessid;//上传器ID
    var policy = wx.getStorageSync('uploadData').content.policy;//策略
    var signature = wx.getStorageSync('uploadData').content.signature;//签名
    var dir = wx.getStorageSync('uploadData').content.dir;//目录
    var host = wx.getStorageSync('uploadData').content.host;//主机
    console.log(photoId)
    wx.uploadFile({
      url: host,
      filePath: uploadFiles[successCount],
      name: 'file',
      formData: {
        key: newFileName[successCount],
        policy: policy,
        OSSAccessKeyId: accessid,
        signature: signature,
        success_action_status: "200"
      },
      success: function (res) {
        if (res.statusCode == 200) {
          albumList[photoId].resUrl = host + '/' + newFileName[successCount];
          albumList[photoId].local = false;
          newAlbumList[photoId].resUrl = host + '/' + newFileName[successCount];
          successCount++;
          console.log(newAlbumList[photoId].resUrl)
          console.log('上传成功：' + successCount);
        } else {
          console.log(res.statusCode)
        }
      },
      fail: function (res) {
        console.log(res)
        failCount++;
        uploadFailFiles.push(uploadFiles[successCount]);//上传失败的照片
      },
      complete: function (res) {
        if (successCount >= 1) {
          wx.hideLoading();
          that.setData({
            newAlbumList: newAlbumList
          })
          that.sendAlbum();
        } else {
          // console.log(albumList)
          // console.log(newAlbumList)
          //console.log(uploadFiles)
          // console.log(uploadIndex)
          // console.log(newFileName)
          // console.log(successCount)
          that.uploadPhoto(albumList, newAlbumList, uploadFiles, uploadIndex, newFileName, successCount);
        }
      }
    })
  },
  sendAlbum: function () {
    wx.hideLoading();
    var that = this;
    this.data.newAlbumList = this.data.albumInfo.list;
    this.data.newAlbumList = this.data.albumInfo.list;
    var resList = [];
    var albumInfoList = this.data.albumInfo.list;
    console.log(albumInfoList)
    for (var i = 0; i < albumInfoList.length; i++) {
      resList.push({ des: albumInfoList[i].des, resUrl: albumInfoList[i].resUrl });
    }
    wx.request({
      url: this.data.updataAlbumUrl,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        id: this.data.albumInfo.id,
        title: this.data.albumInfo.title,
        res: JSON.stringify(resList),
        templateId: this.data.templateId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          //本地保存修改
          var appHomePageData = app.globalData.homePageList;
          var appPhotoIndex = app.globalData.photoIndex;
          appHomePageData[appPhotoIndex].title = that.data.albumInfo.title; //本地保存修改的标题，返回首页时展示
          appHomePageData[appPhotoIndex].coverImg = that.data.newAlbumList[0].resUrl; //本地保存修改的图片，返回首页时展示
          console.log('++++++++++++++++++++++' + '../edit-album/edit-album?id=' + that.data.id + "&viewType=1")          
          wx.redirectTo({
            url: '../edit-album/edit-album?id=' + that.data.id + "&viewType=1"
          });
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showModal({
          "title": "保存相册失败",
          //"content": res.errMsg + " 请重试",
          "content": "相册保存失败。检测到您的网络较差，请重试一次吧",
          success: function (res) {
            if (confirm) {
              console.log("确定")
            }
          }

        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  }
})