const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var app = getApp();
//时间戳转时间
function timestampToTime(timestamp) {
  var timestamp = timestamp;
  if (timestamp.length == 10){
    timestamp = timestamp * 1000
  }
  var Y, M, D, h, m, s
  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  Y = date.getFullYear();
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
  m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}

//当前时间
function nowTime() {
  var Y, M, D, h, m, s
  var date = new Date();
  Y = date.getFullYear();
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
  m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}


//首页上传图片
function uploadimage(data) {
  console.log('走了首页的方法')
  var that = this,
    i = data.i ? data.i : 0,//当前上传的哪张图片
    success = data.success ? data.success : 0,//上传成功的个数
    fail = data.fail ? data.fail : 0;//上传失败的个数
  var pagethis = data.pagethis; //保存调用该方法页面this
  var resUrlList = data.resurl; //保存上传成功的图片地址
  var resurlFail = data.resurlFail //保存上传失败的图片地址
  var ishomePage = data.ishomePage //是否在首页创建相册是点击上传图片
  pagethis.setData({
    successnum: success //保存上传成功个数
  })
  var myDate = new Date();
  var ossPath = 'pic/' + wx.getStorageSync('uid') + '/'
  // 获取文件后缀  
  var pathArr = data.path[i].split('.');
  //  随机生成文件名称  
  var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000)
  var fileName = fileRandName + '.' + pathArr[1]
  // 要提交的key  
  var fileKey = ossPath + fileName
  wx.uploadFile({
    url: data.url,
    filePath: data.path[i],
    name: 'file',
    formData: {
      key: fileKey,
      policy: data.policy,
      OSSAccessKeyId: data.OSSAccessKeyId,
      signature: data.signature,
      success_action_status: "200"
    },
    success: function(resp){
      if (resp.statusCode == 200) {
        success++;//图片上传成功，图片上传成功的变量+1
        console.log(resp);
        pagethis.setData({
          successnum: success
        });
        //上传成功照片地址保存在数组中，作为请求相册id接口的参数
        resUrlList.push({
          "resUrl": 'https://storage.guagua.cn/' + fileKey,//必选
          "des": ""//可为null
        });
      }
    },
    fail: function(res){
      fail++;//图片上传失败，图片上传失败的变量+1
      console.log('fail:' + i + "fail:" + fail);
      resurlFail.push(data.path[i]);
      console.log('上传失败的图片数组集合' + resurlFail);
    },
    complete: function(){
      var upresUrlList = JSON.stringify(resUrlList)
      i++;//这个图片执行完上传后，开始上传下一张
      if (i == data.path.length) {   //当图片传完时，停止调用
        if (success > 0){
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          pagethis.setData({
            picArr: []
          });
          var creatUserid = wx.getStorageSync('uid');
          var creatWebtoken = wx.getStorageSync('webToken');
          //getPhotoId(creatUserid, creatWebtoken, data.postType, upresUrlList, pagethis);

          
          var getuid = creatUserid;
          var getwebToken = creatWebtoken;
          var getPhototype = data.postType;
          var getres = upresUrlList;
          var getPagethis = pagethis;
          wx.request({
            url: 'https://cgi.guagua.cn/post/create',
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'userid': creatUserid,
              'webToken': creatWebtoken
            },
            data: {
              postType: getPhototype,
              res: getres
            },
            success: function (res) {
              console.log('创建相册接口请求' + res);
              if (res.statusCode == 200) {
                //如果创建帖子成功保存变量，回到首页时会刷新数据，展示新建的相册
                wx.setStorageSync('isRefresh', true)

                console.log('发布帖子成功')
                var postid = res.data.content.postId;
                pagethis.setData({
                  uploadshow: 0
                })
                wx.navigateTo({
                  url: "../edit-album/edit-album?id=" + postid + '&viewType=' + 0
                })
              } else {
                pagethis.setData({
                  uploadshow: 0
                });
                wx.showModal({
                  title: '提示',
                  content: '创建相册失败',
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            },
            fail: function (res) {
              console.log(res); 
              var failContent = res.errMsg
              pagethis.setData({
                uploadshow: 0
              });
              wx.showModal({
                title: '提示',
                content: failContent,
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          }) 
        }else{
          pagethis.setData({
            uploadshow: 0
          });
          wx.showModal({
            title: '提示',
            content: '图片上传失败',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } 
      } else {//若图片还没有传完，则继续调用函数
        console.log(i);
        data.i = i;
        data.success = success;
        data.fail = fail;
        that.uploadimage(data);
      }
    }
  })
}

//编辑页添加图片
function addimage(data) {
  console.log('走了编辑页的方法')
  var that = this,
    i = data.i ? data.i : 0,//当前上传的哪张图片
    success = data.success ? data.success : 0,//上传成功的个数
    fail = data.fail ? data.fail : 0;//上传失败的个数
  var pagethis = data.pagethis; //保存调用该方法页面this
  var resUrlList = data.resurl; //保存上传成功的图片地址
  var resurlFail = data.resurlFail //保存上传失败的图片地址
  var ishomePage = data.ishomePage //是否在首页创建相册是点击上传图片
  pagethis.setData({
    successnum: success //保存上传成功个数
  })
  console.log(data.policy)
  var myDate = new Date();
  var ossPath = 'pic/' + wx.getStorageSync('uid') + '/'
  // 获取文件后缀  
  var pathArr = data.path[i].split('.');
  //  随机生成文件名称  
  var fileRandName = Date.now() + "" + parseInt(Math.random() * 1000)
  var fileName = fileRandName + '.' + pathArr[1]
  // 要提交的key  
  var fileKey = ossPath + fileName
  wx.uploadFile({
    url: data.url,
    filePath: data.path[i],
    name: 'file',
    formData: {
      key: fileKey,
      policy: data.policy,
      OSSAccessKeyId: data.OSSAccessKeyId,
      signature: data.signature,
      success_action_status: "200"
    },
    success: function(resp) {
      if (resp.statusCode == 200) {
        success++;//图片上传成功，图片上传成功的变量+1
        console.log(resp);
        //上传成功照片地址保存在数组中，作为请求相册id接口的参数
        resUrlList.push({
          "resUrl": 'https://storage.guagua.cn/' + fileKey,//必选
          "des": ""//可为null
        });
        console.log(resUrlList)
      }
    },
    fail: function(res){
      // wx.showToast({
      //   title: '图片上传失败',
      //   duration:1000,
      //   icon:none
      // })
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
      fail++;//图片上传失败，图片上传失败的变量+1
      console.log('fail:' + i + "fail:" + fail);
      resurlFail.push(data.path[i]);
      console.log('上传失败的图片数组集合' + resurlFail);
    },
    complete: function(){
      i++;//这个图片执行完上传后，开始上传下一张
      if (i == data.path.length) {   //当图片传完时，停止调用
        if (success > 0) {
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          var updateUserid = wx.getStorageSync('uid');
          var updateWebtoken = wx.getStorageSync('webToken');
          update(updateUserid, updateWebtoken, data.updateId, data.updatePinJson, resUrlList, data.updataTitle);
        } 
      } else {//若图片还没有传完，则继续调用函数
        console.log(i);
        data.i = i;
        console.log('data.i=' + data.i)
        data.success = success;
        console.log('data.i=' + data.success)
        data.fail = fail;
        that.addimage(data);
      }
    }
  })
}

//创建帖子
function getPhotoId(uid, webToken, postType, upresUrlList, pagethis){
  var getuid = uid;
  var getwebToken = webToken;
  var getPhototype = postType;
  var getres = upresUrlList;
  var getPagethis = pagethis;
  wx.request({
    url: 'https://cgi.guagua.cn/post/create',
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'userid': getuid,
      'webToken': getwebToken
    },
    data: {
      postType: getPhototype,
      res: getres
    },
    success: function (res) {
      console.log('创建相册接口请求'+res);
      if (res.statusCode == 200) {
        console.log('发布帖子成功');
        var postid = res.data.content.postId;
        pagethis.setData({
          uploadshow: 0
        })
        wx.navigateTo({
          url: "../edit-album/edit-album?id=" + postid+'&viewType=' + 0
        })
      } else {
        pagethis.setData({
          uploadshow: 0
        });
        wx.showModal({
          title: '提示',
          content: '创建相册失败',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    },
    fail: function (res) {
      console.log(res);
      pagethis.setData({
        uploadshow: 0
      });
      wx.showModal({
        title: '提示',
        content: '创建相册失败',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  })
}

//更新帖子
function update(uid, webToken,id,upPicJson,localPicJson,title){
  var appHomePageData = app.globalData.homePageList;
  var appPhotoIndex = app.globalData.photoIndex
  var updateTitle = title
  var updateuid = uid;
  var updatewebToken = webToken;
  var updateid = id;
  var updatePicJson = upPicJson;
  var localPicJson = localPicJson;
  var musicPhotoTemplateId = wx.getStorageSync('musicPhotoTemplateId')
  var newPicJson;
  
  if (localPicJson.length == 0){
    newPicJson = JSON.stringify(updatePicJson)
  }else{
    newPicJson = JSON.stringify(updatePicJson.concat(localPicJson));
  }
  var globalCoverPic = JSON.parse(newPicJson);
  console.log(globalCoverPic)
  wx.request({
    url: 'https://cgi.guagua.cn/post/update',
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'userid': updateuid,
      'webToken': updatewebToken
    },
    data: {
      id: updateid,
      res: newPicJson,
      title: updateTitle
    },
    success: function (res) {
      console.log(res);
      if (res.statusCode == 200) {
        appHomePageData[appPhotoIndex].title = updateTitle; //本地保存修改的标题，返回首页时展示
        appHomePageData[appPhotoIndex].coverImg = globalCoverPic[0].resUrl; //本地保存修改的图片，返回首页时展示
        console.log('更新帖子成功');
        wx.hideLoading()
        var postid = res.data.content.postId;

        // //填充编辑条页url
        // var pages = getCurrentPages();
        // var prevPage = pages[pages.length - 2];
        // prevPage.prevSet();  
        
        wx.redirectTo({
          url: '../edit-album/edit-album?id=' + updateid + '&viewType=' + 1 + '&templateId=' + musicPhotoTemplateId ,
        });
      } else {
        // wx.showModal({
        //   title: '警告',
        //   content: '创建相册失败',
        //   success: function (res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })
      }
    },
    fail: function (res) {
      console.log(res);
      pagethis.setData({
        uploadshow: 0
      });
      wx.showModal({
        title: '警告',
        content: '创建相册失败',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  })
}

//手机自带表情转码
function utf16toEntities(str) {
  var patt = /[\ud800-\udbff][\udc00-\udfff]/g;
  // 检测utf16字符正则
  str = str.replace(patt, function (char) {
    var H, L, code;
    if (char.length === 2) {
      H = char.charCodeAt(0);
      // 取出高位
      L = char.charCodeAt(1);
      // 取出低位
      code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00;
      // 转换算法
      return "&#" + code + ";";
    } else {
      return char;
    }
  });
  return str;
}

//解码手机表情
function entitiestoUtf(str) {
  // 检测出形如&#12345;形式的字符串
  var strObj = utf16toEntities(str);
  var patt = /&#\d+;/g;
  var H, L, code;
  var arr = strObj.match(patt) || [];
  for (var i = 0; i < arr.length; i++) {
    code = arr[i];
    code = code.replace('&#', '').replace(';', '');
    // 高位
    H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
    // 低位
    L = (code - 0x10000) % 0x400 + 0xDC00;
    code = "&#" + code + ";";
    var s = String.fromCharCode(H, L);
    strObj.replace(code, s);
  }
  return strObj;
} 

module.exports = {
  formatTime: formatTime,
  timestampToTime: timestampToTime,
  nowTime: nowTime,
  uploadimage: uploadimage,
  addimage: addimage,
  update: update,
  utf16toEntities: utf16toEntities,
  entitiestoUtf:entitiestoUtf
}