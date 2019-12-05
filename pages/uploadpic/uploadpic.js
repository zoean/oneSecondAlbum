const app = getApp();
var requestUrl = require('../../utils/request.js');
var x, y, x1, y1, x2, y2; //拖拽排序相关
Page({
  //页面的初始数据
  data: {
    picArr: [], //存储图片路径的数组
    arrLength:0, //记录已有照片的数目
		successLoad:0, //记录成功上传的张数
    photoId:'', //记录正在编辑相册的id
    photoTitle:'', //记录相册描述
    templateArr:[], //保存模板列表数据
    songlistArr:[], //保存歌曲列表数据
    templistShow:false, //底层蒙板显示隐藏开关
    choosetemp:false, //模板列表显示隐藏开关
    choosesong:false, //歌曲列表显示隐藏开关
    selectTempIndex:9999, //记录选择了第几个模板 默认为第一个
    selectSongIndex:9999, //记录选择了第几个歌曲 默认为第一个
    resUrl: [], //保存最终生成相册时需要上传的图片资源json
    loadingPicLoacl:0, //正在上传图片总张数--loading框计数用
    loadComplete: 0, //上传完成图片张数--loading框计数用
    loadFiled: 0, //上传完成失败张数--loading框计数用
    maskShow:false, //上传图片弹框显示隐藏开关
    saveMaskShow:false, //保存相册弹窗显示隐藏开关
    iscomplete: false, //是否显示上传完成弹窗
    postType:0, //保存相册类型
    songurl:'', //预览模板用到的音乐链接
    options:'',
    routerFrom:'', //判断页面来源
    netWork:false, //上传图片时检查网络状态变化
    reLoad:false,
    moveTrue:false, //拖动的元素添加类名
		isIphonex:false, //判断是不是iphonex
    barHeight:0,
    textareaShow:true, //textarea显示隐藏
    column:0,
    navData:{
      title:'',
      back:true,
      isedit:1
    },
    current: -1,
    s_v: 8, 
    s_h: 8,
    u_w: 204,
    u_h: 204,
    move_x: '', 
    move_y: '',
    pxToRpx:0,
    isNewPhoto:0 //判断是新建相册还是编辑相册 0编辑1新建
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {

    //详细页进入此页时url会带入id，防止点击保存又重新创建相册
    if(options.id){
      wx.setStorageSync('photoID', options.id)
    }
    var that = this
    this.setData({
      options: options
    })
    this.setData({
      isNewPhoto: options.newPhoto
    })
    wx.setStorageSync('newPhoto', options.newPhoto)

    //进入页面时检查网络状态
    wx.getNetworkType({
      success(res) {
        if (res.networkType == 'none') {
          that.setData({
            reload: true,
            textareaShow:false,
            navData: {
              title: '无网络',
              back: true,
              isedit: 1
            },
          })
        }else{
          that.setpageTitle()
          that.getPhoneBarH()
          that.getUploadImgData(options)
        }
      }
    })
  },

  //页面显示相应的标题 删除预览时创建的临时相册
  setpageTitle:function(){
    var that = this
    var pages = getCurrentPages();
    var prevpage = pages[pages.length - 2];
		console.log(pages)
    console.log(prevpage.route);
    if (prevpage.route.indexOf('homepage') > -1){
      var pagetitle = wx.getStorageSync('setTitle')
      that.setData({
        textareaShow: true,
        navData: {
          title: pagetitle,
          back: true,
          isedit: 1
        },
      })
    }else{
      console.log('来自详细页')
      that.setData({
        navData: {
          title: '编辑相册',
          back: true,
          isedit: 1
        },
      })
    }
  },

  //获取设备状态栏高度,识别设备型号
  getPhoneBarH:function(){
		var that = this
    var systemInfo = wx.getSystemInfoSync();
    console.log(systemInfo)
		var sysModel = systemInfo.model;
		if (sysModel.search('iPhone X') != -1) {
			that.setData({
				isIphonex:true
			})
		}else{
			that.setData({
				isIphonex: false
			})
		}
		console.log(that.data.isIphonex);
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
    var pxRpx = 750 / (systemInfo.windowWidth);
    console.log(pxRpx);
    this.setData({
      barHeight: pt,
      pxToRpx: pxRpx
    })
  },

  //获取上传图片需要使用的参数
  getUploadImgData: function (options){
    var that = this;
    //获取当前时间戳，判断上传图片参数是否过期 如果过期重新请求
    var timetamp = Math.round(new Date().getTime() / 1000).toString();  
    if (wx.getStorageSync('uploadExpire') == ''){
      that.requestUpData(options);
    }else{
      var upExpire = wx.getStorageSync('uploadExpire');
      if (timetamp > upExpire){
        that.requestUpData(options);
      }else{
        that.getNewPhotoPic(options);
      }
    }
  },
  
  //获取图片上传参数
  requestUpData: function (options){
    var that = this;
    wx.showLoading({
      title: '请求上传数据',
      mask:true
    })
    wx.request({
      url: 'https://cgi.guagua.cn/post/assumeRole',
      header: {
        'content-type': 'application/json', // 默认值
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            reload: false
          })
          wx.hideLoading();
          var ossData = res.data
          console.log(ossData);
          console.log('请求到了签名参数');
          wx.setStorageSync('uploadData', ossData);
          wx.setStorageSync('uploadExpire', parseInt(ossData.content.expire));
          //进入页面自动设置传图片参数，如果是新建相册直接上传图片，如果是点击编辑按钮进入此页面则获取相册信息
          that.getNewPhotoPic(options);
        } else {
          
        }
      },
      fail:function(){
        wx.hideLoading()
        that.setData({
          reload:true
        })
      }
    })
  },
 
  //建立新相册进入上传照片页面执行的方法，如果参数newPhoto == 1则是新建的相册
  getNewPhotoPic:function(data){
    var that = this
    //接收新建相册选择的照片的路径 
    if (data.newPhoto == 1) {
      var getPicPathArr = JSON.parse(data.picurl)
      // wx.setStorageSync("photoIdInit", 1)
      that.uploadImage(getPicPathArr,0,0);
    } else { //编辑已有相册，获取相册信息
      that.photoId = data.id; 
      that.getPhotoData(that.photoId)
      // that.getPhotoData(1424)
    }
  },

  //获取相册详细信息
  getPhotoData:function(photoid){
    var saveDataArr = []; //保存页面展示
    var resDataArr = []; //保存接口上传
    var onlinePic = []; //线上图片 删除图片时用
    var that = this
    wx.showLoading({
      title: '加载相册信息',
      mask:true
    })
    wx.request({
      url: 'https://cgi.guagua.cn/post/info?id=' + photoid,
      method: 'GET',
      header: 'application/json',
      success: function (data) {
        if (data.statusCode == 200) {
          var picLis = data.data.content.list;
          for (var i in picLis) {
            var temppicObj = {
              url: picLis[i].resUrl + '!editAlbum',
              state:'success',
              "resUrl": picLis[i].resUrl
            }
            var respicObj = {
              "resUrl": picLis[i].resUrl,//必选
              "des": ""//可为null
            }
            onlinePic.push(picLis[i].resUrl)
            saveDataArr.push(temppicObj);
            resDataArr.push(respicObj);
          }
          var picnum = saveDataArr.length;
          var editTitle = data.data.content.title;
          var idinit = data.data.content.id;
          console.log(wx.getStorageSync("photoID"))
          that.setData({
            picArr: saveDataArr,
            arrLength: picnum,//显示当前已经选择的图片张数
            photoTitle: editTitle,//当前相册的描述
            selectTempIndex: data.data.content.templateId, //模板id
            selectSongIndex: data.data.content.songId, //音乐id
            resUrl: resDataArr,
            picOnline: onlinePic,
            photoId: data.data.content.id,
            reload:false,
						successLoad: picnum
          });
          //保存相册原始数据，没有修改不弹出是否保存弹窗
          wx.setStorageSync("photoTitle", editTitle);
          wx.setStorageSync("photoArr", saveDataArr);
          //保存相册最开始时id
          wx.hideLoading();
          //排版图片
          // that.setViewStyle(saveDataArr)
        } else {
          wx.showToast({
            title: '加载失败！',
            icon: 'loading',
            duration: '2000'
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        that.setData({
          reload: true
        })
      }
    });
  },


  //计算各图片的位置，定位布局
  setViewStyle:function(arr){
    console.log('我要开始定位布局了');
    var that = this
    var getarr = arr;
    wx.getSystemInfo({
      success: function (res) {
        var width = that.data.all_width = res.windowWidth * that.data.pxToRpx, _w = 0, row = 0, column = 0;
        console.log(width)
        for (var i in getarr) {
          getarr[i].left = (that.data.u_w + that.data.s_h) * row + that.data.s_h;
          getarr[i].top = (that.data.u_h + that.data.s_v) * column + that.data.s_v;
          getarr[i]._left = getarr[i].left;
          getarr[i]._top = getarr[i].top;
          _w += that.data.u_w + that.data.s_h;
          if (_w + that.data.u_w + that.data.s_h > width) {
            _w = 0;
            row = 0;
            column++;
          } else {
            row++;
          }
        }
        console.log(getarr);
        that.setData({
          picArr: getarr,
          row: row,
          column:column
        })
        console.log(that.data.row)
        console.log(that.data.column)
      }
    });
  },

  //拖拽排序相关
  movestart:function(e){
    var that = this;
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
    x1 = e.currentTarget.offsetLeft;
    y1 = e.currentTarget.offsetTop;
    this.setData({
      current: e.currentTarget.dataset.index,
      move_x: x1 * that.data.pxToRpx,
      move_y: y1 * that.data.pxToRpx
    });
    console.log(x1)
    console.log(y1)
  }, 
  move: function (e) {
    var self = this;
    x2 = (e.touches[0].clientX - x + x1) * self.data.pxToRpx;
    y2 = (e.touches[0].clientY - y + y1) * self.data.pxToRpx;
    var underIndex = this.getCurrnetUnderIndex();

    // var now_current=this.data.current;
    if (underIndex != null && underIndex != this.data.current) {
      var arr = [].concat(this.data.picArr);
      this.changeArrayData(arr, underIndex, this.data.current);
      this.changeArrayData(this.data.resUrl ,underIndex, this.data.current)
      this.setData({
        picArr: arr,
        current: underIndex
      })
    }

    this.setData({
      move_x: x2,
      move_y: y2
    });
    console.log(x2)
  },
  moveend: function (e) {
    this.setData({
      current: -1,
    })
  },

  changeArrayData: function (arr, i1, i2) {
    var temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;

    var _left = arr[i1]._left, _top = arr[i1]._top;
    arr[i1]._left = arr[i2]._left;
    arr[i1]._top = arr[i2]._top;
    arr[i2]._left = _left;
    arr[i2]._top = _top;

    var left = arr[i1].left, top = arr[i1].top;
    arr[i1].left = arr[i2].left;
    arr[i1].top = arr[i2].top;
    arr[i2].left = left;
    arr[i2].top = top;
  },

  getCurrnetUnderIndex: function (endx, endy) {//获取当前移动下方index
    var endx = x2 + this.data.u_w / 2,
      endy = y2 + this.data.u_h / 2;
    var v_judge = false, h_judge = false, column_num = (this.data.all_width - this.data.s_h) / (this.data.s_h + this.data.u_w) >> 0;
    // console.log(endx,endy);
    var _column = (endy - this.data.s_v) / (this.data.u_h + this.data.s_v) >> 0;
    var min_top = this.data.s_v + (_column) * (this.data.u_h + this.data.s_v),
      max_top = min_top + this.data.u_h;
    // console.log('v', _column, endy, min_top, max_top);
    if (endy > min_top && endy < max_top) {
      v_judge = true;
    }
    var _row = (endx - this.data.s_h) / (this.data.u_w + this.data.s_h) >> 0;
    var min_left = this.data.s_h + (_row) * (this.data.u_w + this.data.s_h),
      max_left = min_left + this.data.u_w;
    // console.log('x', _row, endx, min_left, max_left);
    if (endx > min_left && endx < max_left) {
      h_judge = true;
    }
    if (v_judge && h_judge) {
      var index = _column * column_num + _row;
      if (index > this.data.picArr.length - 1) {//超过了
        return null;
      } else {
        return index;
      }
    } else {
      return null;
    }
  },
 

  //继续添加图片
  addPic:function(){
    var that = this;
    that.setData({
      loadFiled:0 //每次新选择照片时，清空失败计数
    })
    var chooselimit = 30 - that.data.picArr.length
    wx.chooseImage({
      count: chooselimit, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var picArrList = res.tempFilePaths;
        var newpicArrList = that.data.picArr.concat(picArrList);
				that.uploadImage(picArrList, 0, 0);
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },


  //上传图片
  uploadImage:function(data,i,j){
    var that = this;
		wx.getNetworkType({
			success: function(res) {
				if(res.networkType == 'none'){
					that.setData({
						netWork: true,
						reload:false
					})
					return
				}
			},
		})
    that.setData({
      maskShow:true,
      loadingPicLoacl: data.length, //正在上传图片总张数--loading框计数用
      loadComplete: j, 
      iscomplete: false,
      textareaShow:false
    })
    var getPicPathArr = that.data.picArr //上传完之后追加到本地数组
    var getPicResArr = that.data.resUrl //上传成功的图片添加到接口参数数组里
    var myDate = new Date();
    var ossFilePath = 'pic/' + wx.getStorageSync('uid') + '/'
    // 获取文件后缀  
    var pathArr = data[i].split('.');
    //  随机生成文件名称  
    var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000)
    var fileName = fileRandName + '.' + pathArr[1]
    // 要提交的key  
    var fileKey = ossFilePath + fileName

    wx.uploadFile({
      url: 'https://storage.guagua.cn',
      filePath: data[i],
      name: 'file',
      formData: {
        key: fileKey,
        policy: wx.getStorageSync('uploadData').content.policy,
        OSSAccessKeyId: wx.getStorageSync('uploadData').content.accessid,
        signature: wx.getStorageSync('uploadData').content.signature,
        success_action_status: "200"
      },
      success: function (resp) {
				console.log('上传成功')
        j++ //上传成功图片张数
				// var successpicObj = {
				// 	url: data[i],
				// 	state:'success',
				// 	"resUrl": 'https://storage.guagua.cn/' + fileKey
				// }
				var successpicObj = {
					url: data[i],
					state: 'success'
				}
				getPicPathArr.push(successpicObj);
				console.log('11111111111111111111111');
				console.log(getPicPathArr);
				var arr_l = that.data.successLoad + 1
				var successResObj = {
					"resUrl": 'https://storage.guagua.cn/' + fileKey,//必选
					"des": ""//可为null
				}
				
				getPicResArr.push(successResObj);
				
				that.setData({
					picArr: getPicPathArr,
					arrLength: arr_l,
					resUrl: getPicResArr,
					successLoad: arr_l
				});
      },
      fail: function (res) {
        console.log('上传失败')
        var failNum = that.data.loadFiled;
        failNum ++;
        console.log(failNum)
        var failpicObj = {
          url: data[i],
          state: 'fail'
        }
        getPicPathArr.push(failpicObj);
        var successResObj = {
          "resUrl": data[i],
          "des": ""//可为null
        }
        getPicResArr.push(successResObj);
       
        that.setData({
          picArr: getPicPathArr,
          loadFiled: failNum,
          resUrl: getPicResArr
        });
        
      },
      complete: function () {
        i++; //这个图片执行完上传后，开始上传下一张
        console.log('--------------------------')
        that.setData({
          loadingPicLoacl: data.length, //正在上传图片总张数--loading框计数用
          loadComplete: j
        })
        if(i == data.length){
          console.log('上传完成');
          //上传完成后显示完成弹窗，2s后隐藏
          var timeFn,timeComplete;
          clearTimeout(timeFn);
          clearTimeout(timeComplete);
					if (that.data.picArr.length > 0){
						timeComplete = setTimeout(function () {
							that.setData({
								iscomplete: true
							})
						}, 500)
						timeFn = setTimeout(function () {
							that.setData({
								maskShow: false,
								textareaShow: true
							})
						}, 2000)
					}else{
						that.setData({
							maskShow: false,
							textareaShow: true
						})
						wx.showToast({
							title: '上传错误',
							icon:'none',
							duration:2000
						})
					}
          return
        }else{
          console.log('没上传完继续上传')
          that.uploadImage(data,i,j)
        }
      }
    })
  },

  //点击选择模板按钮事件
  chooseMoudle: function () {
    var that = this;
    wx.getNetworkType({
      success: function(res) {
        if(res.networkType == 'none'){
          wx.showToast({
            title: '网络异常',
            icon:'none',
            duration:2000
          })
        }else{
          if (that.data.templateArr.length == 0) {
            var saveTempArr = []; //保存音乐模板和图文模板拼接后的数据
            that.setData({
              templistShow: true,
              choosetemp: true,
              textareaShow: false
            })
            requestUrl.getData('https://cgi.guagua.cn/template/list?type=0', function (data) {
              var textTemp = data.data.content;
              saveTempArr = saveTempArr.concat(textTemp);
              requestUrl.getData('https://cgi.guagua.cn/template/list?type=1', function (data) {
                var musicTemp = data.data.content;
                saveTempArr = saveTempArr.concat(musicTemp);
                that.setData({
                  templateArr: saveTempArr
                })
                console.log(that.data.templateArr)
              })
            })
          } else {
            that.setData({
              templistShow: true,
              choosetemp: true,
              textareaShow: false
            })
          }
        }
      },
    })
  },

  //关闭选择模板弹窗
  closetemplist: function () {
    this.setData({
      templistShow: false,
      choosetemp: false,
      textareaShow: true
    })
  },

  //点击选择音乐按钮事件
  chooseMusic: function () {
    console.log('点击了音乐按钮')
    var that = this;
    wx.getNetworkType({
      success: function(res) {
        if(res.networkType == 'none'){
          wx.showToast({
            title: '网络异常',
            icon:'none',
            duration:2000
          })
        }else{
          var songlistdata = [];
          if (that.data.songlistArr.length == 0) {
            that.setData({
              templistShow: true,
              choosesong: true,
              textareaShow: false
            })
            requestUrl.getData('https://cgi.guagua.cn/song/list', function (data) {
              console.log(data);
              songlistdata = data.data.content;
              that.setData({
                songlistArr: songlistdata
              })
            })
          } else {
            that.setData({
              templistShow: true,
              choosesong: true,
              textareaShow: false
            })
          }
        }
      }
    })
  },

  //关闭选择歌曲列表
  closesonglist: function () {
    this.setData({
      templistShow: false,
      choosesong: false,
      textareaShow: true
    })
  },

  //点击蒙版关闭列表
  closelist:function(){
    this.setData({
      templistShow: false,
      choosesong: false,
      choosetemp: false,
      textareaShow: true
    })
  },
  //选择模板
  selectTemp: function (e) {
    
    if(e.target.dataset.index < 999){
      this.setData({
        selectTempIndex: e.target.dataset.index,
        postType:0,
				textareaShow: false
      })
    }else{
      this.setData({
        selectTempIndex: e.target.dataset.index,
				postType: 1,
        textareaShow: false
      })
    }
    this.previewPhoto()
  },

  //选择音乐
  selectSong: function (e) {
    
    this.setData({
      selectSongIndex: e.currentTarget.dataset.index
    })
    this.setData({
      songurl: e.currentTarget.dataset.songurl
    })
    this.previewPhoto()
  },

  //预览相册
  previewPhoto:function(){
    var that = this
    //保存需要上传的图片resUrl数组
    var saveResUrl = [];
    for (var i in that.data.resUrl) {
      if (that.data.resUrl[i].resUrl.indexOf('https') > -1) {
        saveResUrl.push(that.data.resUrl[i])
      }
    }
    //区分编辑已有相册/新建相册
    if (saveResUrl.length > 0) {
      var savetitle = that.data.photoTitle || '';
      var saveTempID = that.data.selectTempIndex || 9999;
      var saveSongId = that.data.selectSongIndex || 9999;
      var saveType = that.data.postType || 0;
      var saveSongurl = that.data.songurl || '';
      console.log(savetitle)
      console.log(saveTempID)
      console.log(saveSongId)
      console.log(saveType)
      console.log(saveResUrl)
    
      var pretitle = encodeURI(encodeURI(savetitle));
      var presongurl = encodeURI(saveSongurl);
      var pretempID = saveTempID;
      var prelist = encodeURI(JSON.stringify(saveResUrl))
      var presongid = saveSongId;
      var preuid = wx.getStorageSync("uid");
      var pretoken = wx.getStorageSync("webToken");
      var isnewphoto = that.data.isNewPhoto;
      var photoId = wx.getStorageSync('photoID')
      console.log(isnewphoto)
      wx.navigateTo({
        url: '/pages/preview/preview?title=' + pretitle + '&songurl=' + presongurl + '&tempid=' + pretempID + '&list=' + prelist + '&viewType=0' + '&songid=' + presongid + '&uid=' + preuid + '&token=' + pretoken + '&isnewphoto=' + isnewphoto + '&photoid=' + photoId,   
      })
    } else {
      wx.showToast({
        title: '需要至少一张照片',
        icon: 'none',
        duration: 1500
      })
    }
  },

  //修改相册标题
  bindinput:function(e){
    var inputValue = e.detail.value;
    this.setData({
      photoTitle: inputValue
    })
		var query = wx.createSelectorQuery();
		query.select('#title-area').boundingClientRect();
		query.exec(function(res){
			var area_h = res[0].height;
			console.log(area_h);
			if (area_h > 100){

			}
		})
  },

  //删除图片
  removePic:function(e){
    var that = this
    var removeIndex = e.target.dataset.index;
		var loadtype = e.target.dataset.state;
    if (that.data.picArr.length == 1){
      wx.showToast({
        title: '至少保留一张照片',
        icon: 'none',
        duration: 1500
      })
    }else{
      var newPicarr = that.data.picArr;
      newPicarr.splice(removeIndex, 1);
      var newResUrl = that.data.resUrl;
      newResUrl.splice(removeIndex, 1);
			if (loadtype == 'success'){
				var successnum = that.data.successLoad - 1
			}else{
				var successnum = that.data.successLoad
			}
			
      that.setData({
        picArr: newPicarr,
        resUrl: newResUrl,
        arrLength: newPicarr.length,
				successLoad: successnum
      })
      //删除图片后重新计算各图片的位置
      // that.setViewStyle(newPicarr)
    }
  },



 
  //保存相册
  savePhoto:function(data){
		var that = this;
		wx.getNetworkType({
			success: function(res) {
				if(res.networkType == 'none'){
					wx.showToast({
						title: '网络异常',
						icon:'none',
						duration:2000
					})
				}else{
					wx.setStorageSync('isRefresh', true);

					that.setData({
						saveMaskShow: true
					})
					//保存需要上传的图片resUrl数组
					var saveResUrl = [];
					for (var i in that.data.resUrl) {
						if (that.data.resUrl[i].resUrl.indexOf('https') > -1) {
							saveResUrl.push(that.data.resUrl[i])
						}
					}
					console.log(saveResUrl)
					//区分编辑已有相册/新建相册
					if (saveResUrl.length > 0) {
						var savetitle = that.data.photoTitle || '';
						var saveTempID = that.data.selectTempIndex || 9999;
						var saveSongId = that.data.selectSongIndex || 1;
						var saveType = that.data.postType || 0;
						console.log(savetitle)
						console.log(saveTempID)
						console.log(saveSongId)
						console.log(saveType)
						console.log(saveResUrl)
						var isNewPhoto = wx.getStorageSync('newPhoto'); //0更新已有相册，1创建新相册
						if (isNewPhoto == 0) {
							console.log('gengxin')
							that.updatePhoto(savetitle, saveTempID, saveSongId, JSON.stringify(saveResUrl), wx.getStorageSync('photoID'), data)
						} else {
							console.log('xinjian')
							that.creatNewPhoto(savetitle, saveTempID, saveSongId, JSON.stringify(saveResUrl), that.data.postType, data, 1, false)
						}
					} else {
						that.setData({
							saveMaskShow: false
						})
						wx.showToast({
							title: '需要至少一张照片',
							icon: 'none',
							duration: 1500
						})
					}
				}
			},
		})
  },

  //更新相册
  updatePhoto:function(title,temp,song,res,id,data,viewtype){
    console.log(res)
    console.log(title)
    console.log(id)
    var that = this
    wx.request({
      url: 'https://cgi.guagua.cn/post/update',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        id: id,
        templateId: temp,
        songId: song,
        title: title,
        res: res
      },
      success: function (res) {
        wx.setStorageSync('isRefresh', true)
        that.setData({
          saveMaskShow: false
        })
        console.log(res);
        if (res.statusCode == 200) {
          console.log('添加照片页面更新帖子成功');
          if(data == 1){
            wx.navigateBack({
              delta:1
            })
          }else{
						wx.reLaunch({
              url: "../edit-album/edit-album?id=" + id + '&viewType=' + 1 + '&from=0'
            })
          }
        }
      },
      fail:function(){
        that.setData({
          saveMaskShow: false
        })
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      }
    })
  },

  //创建新相册
  creatNewPhoto: function (title, temp, song, resurl, type, data, viewtype,ispre){
    console.log('posddsadaad');
    console.log(type)
    var that = this
    wx.request({
      url: 'https://cgi.guagua.cn/post/create',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'userid': wx.getStorageSync('uid'),
        'webToken': wx.getStorageSync('webToken')
      },
      data: {
        postType: type,
        res: resurl,
        title: title,
        songId: song,
        templateId: temp
      },
      success: function (res) {
        that.setData({
          saveMaskShow: false
        })
        console.log(res)
        console.log('创建相册接口请求' + res);
        if (res.statusCode == 200) {
          //如果创建帖子成功保存变量，回到首页时会刷新数据，展示新建的相册
          wx.setStorageSync('isRefresh', true)
          console.log('发布帖子成功')
          var postid = res.data.content.postId;
          console.log(postid)
          // wx.setStorageSync('newPhoto',1);
          wx.setStorageSync('photoID', postid)
         
          if(data == 1){
            wx.navigateBack({
              delta: 1
            })
          }else{
            if(!ispre){
							wx.reLaunch({
                url: "../edit-album/edit-album?id=" + postid + '&viewType=' + viewtype
              })
            }else{
              var uid = wx.getStorageSync("uid");
              var webToken = wx.getStorageSync("webToken");
							wx.reLaunch({
                url: "../edit-album/edit-album?id=" + postid + '&viewType=' + viewtype + '&from=0' + '&preid=' + preid + '&newid=' + newid
              })
            }
          }
          
        } else {
          that.setData({
            saveMaskShow: false
          })
          wx.showToast({
            title: '保存失败',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      },
      fail: function (res) {
        that.setData({
          saveMaskShow: false
        })
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000,
          mask:true
        })
      }
    }) 
  },

  //重新上传上传失败的图片
  reuploadpic:function(e){ 
    var that = this;
    console.log(e)
		wx.getNetworkType({
			success: function(res) {
				if(res.networkType == 'none'){
					wx.showToast({
						title: '网络异常',
						icon:'none',
						duration:2000
					})
				}else{
					var reUploadIndex = e.target.dataset.index
					var reUploadUrl = e.target.dataset.url;
					var uploadUrl = [];
					uploadUrl.push(reUploadUrl)
					console.log(uploadUrl);
					that.setData({
						maskShow: true,
						loadingPicLoacl: 1, //正在上传图片总张数--loading框计数用
						loadComplete: 0,
						iscomplete: false,
						loadFiled: 0
					})
					var changeArr = that.data.picArr;
					var changeResArr = that.data.resUrl;
					var myDate = new Date();
					var ossFilePath = 'pic/' + wx.getStorageSync('uid') + '/'
					//  获取文件后缀  
					var pathArr = reUploadUrl.split('.');
					//  随机生成文件名称  
					var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000)
					var fileName = fileRandName + '.' + pathArr[1]
					//  要提交的key  
					var fileKey = ossFilePath + fileName
					console.log(fileKey)
					wx.uploadFile({
						url: 'https://storage.guagua.cn',
						filePath: uploadUrl[0],
						name: 'file',
						formData: {
							key: fileKey,
							policy: wx.getStorageSync('uploadData').content.policy,
							OSSAccessKeyId: wx.getStorageSync('uploadData').content.accessid,
							signature: wx.getStorageSync('uploadData').content.signature,
							success_action_status: "200"
						},
						success: function (resp) {
							console.log(1)
							//重新上传成功后，隐藏图片上的蒙版和按钮
							var changestate = {
								"state": "success",
								"url": reUploadUrl
							}
							changeArr.splice(reUploadIndex, 1, changestate);
							//重新上传成功后，更新resUrl数组
							var changeResurl = {
								"resUrl": 'https://storage.guagua.cn/' + fileKey,//必选
								"des": ""//可为null
							}
							changeResArr.splice(reUploadIndex, 1, changeResurl);
							console.log(changeArr)
							console.log(changeResArr)
							var addArrLength = that.data.arrLength + 1;
							var addsuccessLoad = that.data.successLoad + 1;
							that.setData({
								picArr: changeArr,
								resUrl: changeResArr,
								arrLength: addArrLength,
								successLoad:addsuccessLoad
							})
							// that.setViewStyle(changeArr)
						},
						fail: function (res) {
							console.log(2)
							var failNum = that.data.loadFiled;
							failNum++;
							that.setData({
								loadFiled: failNum
							})
						},
						complete: function () {
							console.log(3)
							that.setData({
								loadingPicLoacl: 1, //正在上传图片总张数--loading框计数用
								loadComplete: 1
							})
							console.log('上传完成');
							//上传完成后显示完成弹窗，2s后隐藏
							var timeFn, timeComplete;
							clearTimeout(timeFn);
							clearTimeout(timeComplete);
							timeComplete = setTimeout(function () {
								that.setData({
									iscomplete: true
								})
							}, 500)
							timeFn = setTimeout(function () {
								that.setData({
									maskShow: false
								})
							}, 2000)
						}
					})
				}
			},
		})
  },

  //关闭网络状态弹窗
  closeNetWorkTosat:function(){
    this.setData({
      netWork:false
    })
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
		console.log(this.data.textareaShow)
    var that = this
    wx.getNetworkType({
      success(res) {
        if (res.networkType == 'none') {
          that.setData({
            reload: true
          })
        }else{
          that.setpageTitle()
        }
      }
    })
    if (wx.getStorageSync('pretempid') != ''){
      var posttype;
      if (wx.getStorageSync('pretempid') == 9999 || wx.getStorageSync('pretempid') < 1000){
        posttype = 0
      }else{
        posttype = 1
      }
      that.setData({
        selectTempIndex: wx.getStorageSync('pretempid'),
        postType: posttype
      })
    }else{


    }
		if (wx.getStorageSync('presongid') != ''){
			that.setData({
				selectSongIndex: wx.getStorageSync('presongid')
			})
		}
    console.log(wx.getStorageSync('pretempid'))
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('hide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },
  isSave:function(){
    var that = this;
    var test = this.data
    if(that.data.navData.title == '编辑相册'){
      console.log('如果没有修改内容直接返回');
      if (that.data.picArr.join() != wx.getStorageSync("photoArr").join()){
        wx.showModal({
          content: '将此次编辑保存？',
          cancelText: '不保存',
          cancelColor: '#333333',
          confirmText: '保存',
          confirmColor: '#333',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.savePhoto(1)
            } else if (res.cancel) {
              console.log('用户点击取消')
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }else{
        wx.navigateBack({
          delta: 1
        })
      }
    } else if (that.data.navData.title == '上传照片'){
      if (wx.getStorageSync('saveConfirm')) {
        wx.navigateBack({
          delta: 1
        })
      }else{
        wx.showModal({
          content: '将此次编辑保存？',
          cancelText: '不保存',
          cancelColor: '#333333',
          confirmText: '保存',
          confirmColor: '#333',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.savePhoto(1)
            } else if (res.cancel) {
              console.log('用户点击取消')
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    } else if (that.data.navData.title == '无网络'){
      wx.navigateBack({
        delta: 1
      })
    }
  },
  //长按图片
  longTap: function (e) {
    console.log(e)
    // this.setData({
    //   moveTrue: true
    // })
  },

  //拖动元素时间
  moveChange:function(e){
    console.log(e);
    // if(e.detail.x < 105 )
  },

  reloadpage:function(){
    var that = this
    this.setData({
      reload: false
    })
    this.onLoad(that.data.options)
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