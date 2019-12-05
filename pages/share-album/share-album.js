// pages/share-album/share-album.js
/**
 * 画海报步骤
 * 点击分享到触发shareFirendsCircle()
 * drawBg() => 画海报圆角背景色
*/

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showPoster: false,
    showClose: false,
    isAuthorize: true,
    maskShow:false,
    reload:false,
    barHeight:0,
    options:'',
    navData: {
      title: '分享',
      color: '#333',
      back:true
    }
  },

  /**
   * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this;
    that.setData({
      options: options
    })
    wx.getNetworkType({
      success(res) {
        if (res.networkType == 'none'){
          that.setData({
            reload:true
          })
        }
      }
    })
    var albumId = options.id; 
    const ctx = wx.createCanvasContext('albumPreview', this)
    //var scene = decodeURIComponent(options.scene);
    var sendSceneUrl = 'https://cgi.guagua.cn/wx/getwxacodeunlimit';    
    this.setData({
      albumId: albumId
    })
    //判断是否授权 拒绝授权显示openSetting按钮 还未授权显示授权按钮
    wx.getSetting({
      success(res){
        //拒绝授权 isAuthorize: false        
        if (res.authSetting['scope.writePhotosAlbum'] == false){          
          that.setData({
            isAuthorize: false
          })
        } else {//已授权 isAuthorize: true
          that.setData({
            isAuthorize: true
          })
        }
      }
    })
    //传入生成小程序二维码分享链接url携带参数 scene
    wx.request({
      url: sendSceneUrl,
      header:{
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken'),
        'content-type':'application/x-www-form-urlencoded'
      },
      data: {
        page: 'pages/edit-album/edit-album',
        id: albumId,
        scene: 'id=' + albumId
      },
      method:"POST",
      success: function(res){
        that.setData({
          qrCodeUrl: res.data.content.codeUrl
        })
      }
    })
    //获取相册信息
    var albumInfoUrl = 'https://cgi.guagua.cn/post/info'
    wx.request({
      url: albumInfoUrl,
      data: {
        id: that.data.albumId
      },
      success: function (res) {
        var albumInfo = res.data.content;
        that.setData({
          albumInfo: albumInfo
        })
        console.log(that.data.albumInfo.coverImg)
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function (){
        //console.log(that.data.albumInfo.postType)
        if (that.data.albumInfo.postType == 0) {
          that.getTemplateList(0);
        } else {
          that.getTemplateList(1);
        }
        // wx.showLoading({
        //   title: '加载中...',
        // })
      }
    }) 
    //获取用户设备信息
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        var deviceWidth  = res.windowWidth;
        var deviceHeight = res.windowHeight;
        var devicePixelRatio = res.pixelRatio;
        that.setData({
          deviceWidth: deviceWidth,
          deviceHeight: deviceHeight,
          devicePixelRatio: devicePixelRatio
        })
      },
    })   

    var systemInfo = wx.getSystemInfoSync();
    var reg = /ios/i;
    var pt = 20;//导航状态栏上内边距
    var h = 44;//导航状态栏高度
    if (reg.test(systemInfo.system)) {
      pt = systemInfo.statusBarHeight;
      h = 44;
    } else {
      pt = systemInfo.statusBarHeight;
      h = 48;
    }
    console.log(pt)
    console.log(h)
    this.setData({
      barHeight: pt
    })
  },
  shareFirendsCircle: function(){
    var that = this;
    wx.getNetworkType({
      success: function(res) {
        if (res.networkType == 'none'){
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 2000
          })
        }else{
          console.log('分享到');
          var ctx = wx.createCanvasContext('posterImg', this);
          wx.getSetting({
            success(res) {
              console.log(res)
              if (!res.authSetting['scope.writePhotosAlbum']) {//如果未授权    
                //调起授权
                wx.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success(res) {//如果同意授权 生成海报并保存到系统相册
                    console.log(res)
                    that.setData({
                      showPoster: true,//显示画布
                      isAuthorize: true,//已授权
                      maskShow: true
                    })

                    that.drawBg(ctx, 1);
                    wx.saveImageToPhotosAlbum();
                  },
                  fail(res) {//拒绝授权
                    that.setData({
                      showPoster: false,//显示画布
                      isAuthorize: false//未授权
                    })
                  }
                })
              } else {//已经授权过
                that.setData({
                  showPoster: true,//显示画布
                  isAuthorize: true,//已授权
                  maskShow: true
                })

                that.drawBg(ctx, 1);
                wx.saveImageToPhotosAlbum();
              }
            }
          })
        }
      },
    })
  },
  handleSetting: function (e){
    var that = this; 
    var ctx = wx.createCanvasContext('posterImg', this);
    console.log(e)
    if(e.detail.authSetting['scope.writePhotosAlbum'] == true){
      that.setData({
        showPoster: true,//显示画布
        isAuthorize: true,//已授权
        maskShow:true
      })
      that.drawBg(ctx, 1);
      wx.saveImageToPhotosAlbum();
    }else{
      that.setData({
        showPoster: false,//显示画布
        isAuthorize: false//已授权
      })
    }
    // this.setData({
    //   showPoster: true,//显示画布
    //   isAuthorize: true//已授权
    // })     
  },
  drawBg: function (ctx, type){
    var that = this;
    var path = that.data.tempImage;
    var deviceWidth = this.data.deviceWidth;
    var deviceHeight = this.data.deviceHeight;
    var x = 0,
    y = 0,
    w = (deviceWidth / 750) * 600,
    h = (deviceWidth / 750) * 944,
    r = 10;
    console.log('我开始画了');
    wx.getImageInfo({
      src: path + '',
      success: function (res) {
        console.log(res);
        // that.setData({
        //   getImageInfoW : res.width,
        //   getImageInfoH : res.height
        // })
        console.log('能够拿到相册信息');
        var obj = res.path + '';
        var pattern = ctx.createPattern(obj, "no-repeat");

        //canvas画圆角矩形兼容安卓
        ctx.beginPath();
        ctx.setFillStyle('#ffffff');
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


        if(type == 1){
          //that.drawTitle(ctx);//画title文字
        }
        that.drawCoverImg(ctx);//画封面图
        
      },
      fail:function(){
        console.log('不能够拿到相册信息');
        that.setData({
          maskShow:false
        })
        wx.showToast({
          title: '生成海报失败，请稍后重试',
        })
      },
      complete: function () {
        console.log('huoquxinxi');
      }
    })
  },


  drawMaskImg: function (ctx){//白色轮廓图
    var that = this;
    var path = '../../images/mask.png';
    var deviceWidth = this.data.deviceWidth;
    var x = 0,
    y = (deviceWidth / 750) * 590,
    w = (deviceWidth / 750) * 600,
    h = (deviceWidth / 750) * 316;
    ctx.drawImage(path, x, y, w, h);//画二维码底图
    ctx.save();
    ctx.restore();
    this.drawQrCode(ctx); 
    //ctx.stroke();    
  },
  drawQrCode: function (ctx){
    var that = this;
    console.log('二维码信息'+that.data.qrCodeUrl);
    var getdrawQrCode = that.data.qrCodeUrl;
    var deviceWidth = this.data.deviceWidth;
    console.log(deviceWidth)
    var x = (deviceWidth / 750) * 410,
      y = (deviceWidth / 750) * 760,
      w = (deviceWidth / 750) * 150,
      h = (deviceWidth / 750) * 150;
      console.log(this.data.qrCodeUrl)
    wx.getImageInfo({
      src: that.data.qrCodeUrl,
      success: function(res){
        console.log('我要拿qrCodeUrl的信息');
        console.log(res.path)
        ctx.drawImage(res.path + '', x, y, w, h);
        ctx.save();
        ctx.restore();
        ctx.draw(false, function () {
          console.log("绘制完成后回调");
          wx.canvasToTempFilePath({
            canvasId: 'posterImg',
            // destWidth: that.data.deviceWidth * that.data.devicePixelRatio,
            // destHeight: that.data.deviceHeight * that.data.devicePixelRatio,
            success: function (res) {
              var tempFilePath = res.tempFilePath;
              //console.log(tempFilePath);
              that.setData({
                posterImg: tempFilePath,
                showClose: true,
                maskShow:false
              })
              wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success(res) {
                  console.log(res)
                }
              })
            }
          }, this)
        }); 
      },
      fail:function (res){
        console.log(res);
        that.setData({
          maskShow: false
        })
        wx.showToast({
          title: '生成海报失败，请稍后重试',
        })
      }
    })
  },

  drawCoverImg: function (ctx){
    var that = this;
    var path = this.data.albumInfo.coverImg;  
    var deviceWidth = this.data.deviceWidth;

    
    var x = (deviceWidth / 750) * 12,
    y = (deviceWidth / 750) * 10,
    // y = 0,
    r = 20;
    wx.getImageInfo({
      src: path,
      success: function (res){
        var obj = res.path + '';
        //获取图片的宽高
        that.setData({
          getImageInfoW : res.width,
          getImageInfoH : res.height
        })
        var w = that.data.getImageInfoW;
        var h = that.data.getImageInfoH;
        var ctxW = (deviceWidth / 750) * 576
        var ctxH = (deviceWidth / 750) * 720
        var dw = ctxW / w          //canvas与图片的宽高比
        var dh = ctxH / h
        var ratio
        // 裁剪图片中间部分
        if (w > ctxW && h > ctxH || w < ctxW && h < ctxH) {
          if (dw > dh) {
            ctx.drawImage(res.path + '', 0, (h - ctxH / dw) / 2, w, ctxH / dw, x, y, ctxW, ctxH)
          } else {
            ctx.drawImage(res.path + '', (w - ctxW / dh) / 2, 0, ctxW / dh, h, x, y, ctxW, ctxH)
          }
        }
        // 拉伸图片
        else {
          if (w < ctxW) {
            ctx.drawImage(res.path + '', 0, (h - ctxH / dw) / 2, w, ctxH / dw, x, y, ctxW, ctxH)
          } else {
            ctx.drawImage(res.path + '', (w - ctxW / dh) / 2, 0, ctxW / dh, h, x, y, ctxW, ctxH)
          }
        }
        // ctx.drawImage(res.path + '', x, y, w, h);
        ctx.save();
        ctx.restore();
        that.drawMaskImg(ctx);
      },
      fail:function(){
        that.setData({
          maskShow: false
        })
        wx.showToast({
          title: '生成海报失败，请稍后重试',
        })
      },
      complete: function (){
      }
    })
  },




  // drawCoverImg: function (ctx) {
  //   var that = this;
  //   var path = this.data.albumInfo.coverImg;
  //   console.log('drawCoverImg');
  //   console.log(path);
  //   var deviceWidth = this.data.deviceWidth;
  //   var x = 0,
  //     y = (deviceWidth / 750) * 100,
  //     w = (deviceWidth / 750) * 670,
  //     h = (deviceWidth / 750) * 780,
  //     r = 10;
  //   wx.getImageInfo({
  //     src: path,
  //     success: function (res) {
  //       //画封面照片       
  //       var obj = res.path + '';
  //       ctx.drawImage(res.path + '', x, y, w, h);
  //       ctx.save();
  //       ctx.restore();
  //       that.drawMaskImg(ctx);
  //     },
  //     complete: function () {
  //     }
  //   })
  // },

  drawTitle: function (ctx){
    var albumTitle = this.data.albumInfo.title;
    var deviceWidth = this.data.deviceWidth;
    var x = (deviceWidth / 750) * 40,
      y = (deviceWidth / 750) * 60,
      w = (deviceWidth / 750) * 700;
    ctx.setTextAlign('left');
    ctx.setFillStyle('#000');
    ctx.setFontSize(20);
    if (albumTitle.length > 0) {
      if (albumTitle.length > 14) {
        albumTitle = albumTitle.substring(0, 13) + '...';
      }
      ctx.fillText(albumTitle, x, y, w)
      ctx.save();
      ctx.restore();
    }
  },
  getAlbumData: function (){
    var that = this;
    var albumInfoUrl = 'https://cgi.guagua.cn/post/info'
    wx.request({
      url: albumInfoUrl,
      data: {
        id: that.data.albumId
      },
      success: function (res) {
        var albumInfo = res.data.content;
        that.setData({
          albumInfo: albumInfo
        })
      },
      fail: function (res) {

      }
    })
  },
  getTemplateList: function (type){
    var type = type;
    var that = this;
    const ctx = wx.createCanvasContext('albumPreview', this); 
    var templateListUrl = 'https://cgi.guagua.cn/template/list';
    wx.request({
      url: templateListUrl,
      data:{
        'type': type
      },
      success: function (res){
        var templateList = res.data.content;
        if(type==0){
          that.setData({
            tempTeletext: templateList
          })
          //console.log(that.data.tempTeletext)
        }
        if(type==1){
          that.setData({
            tempMusic: templateList
          })          
        }
      },
      complete: function (){
        if(type==0){
          var tempTeletext = that.data.tempTeletext;
          for (var i = 0; i < tempTeletext.length; i++){
            if (tempTeletext[i].id == that.data.albumInfo.templateId) {
              that.setData({
                tempImage: tempTeletext[i].picUrl
              })
              //console.log('模板图片路径：' + that.data.tempImage)
              //that.drawBg(ctx, 0);            
            }
          }
        }else{
          var tempMusic = that.data.tempMusic;
          console.log('相册模板'+that.data.albumInfo.templateId)
          for (var i = 0; i < tempMusic.length; i++) {              //console.log('模板列表'+tempMusic[i].id)
            //console.log(tempMusic.length)
            if (tempMusic[i].id == that.data.albumInfo.templateId){
              that.setData({
                tempImage: tempMusic[i].picUrl
              })
              console.log('模板图片路径：'+ that.data.tempImage)               
            }
          }

        }
      }
    })
  },
  onShareAppMessage: function (res){    
    return {
      title: this.data.albumInfo.title,
      path: '/pages/edit-album/edit-album?id='+this.data.albumInfo.id+'&viewType=2',
      success:function(res){
        wx.reLaunch({
          url: '../homePage/homepage',
        })
      }
    }
  },
  closePoster: function (){
    var ctx = wx.createCanvasContext('albumPreview', this);
    var deviceWidth = this.data.deviceWidth;
    var w = (deviceWidth / 750) * 470;
    var h = (deviceWidth / 750) * 690;
    this.setData({
      showPoster: false,
      showClose: false
    })
    ctx.clearRect(0, 0, w, h)
    wx.reLaunch({
      url: '../homePage/homepage'
    })
  },
  reloadpage:function(){
    var that = this
    this.setData({
      reload: false
    })
    this.onLoad(that.data.options)
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
  //图片下载完成
  imageLoad:function(e){
    var originalWidth = e.detail.width;
    var originalHeight = e.detail.height;
    console.log(originalWidth);
    console.log(originalHeight);
  }
})