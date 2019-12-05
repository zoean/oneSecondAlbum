 //index.js
//获取应用实例
const app = getApp();
var Util = require('../../utils/util.js');
var pageList = 1;//请求个人作品接口第一页
var pages;//个人作品接口总页数
var sizeNum = 4;//获取个人作品每页作品数
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    homePageList:[], // 首页个人作品数据
    picArr:[], //选择图片地址数组
    loadurl:'../../images/loading.png',
    loadtext:'正在删除',
    isremove:false,
		isAutuor:false, //用户是否授权获取个人信息
    loadClass:'loading-pic',
    changeBg:false, //长按上传照片改变按钮颜色
    changeBgRight:true,
    removePhoto:false, //删除相册弹窗
    removeId:0, //删除相册的id
    removeIndex:0, //删除相册位置
		globalNetType: app.globalData, //检测网络状态，默认有网
    barHeight:0,
    reload:false,

    navData:{
      title:'呱呱相册',
      color:'#333'
    }
  },
  onLoad: function (options) {
		var that = this
    console.log(options);
    wx.setStorageSync('photoIdInit',0)
    // if (options.from == 1){
    //   return
    // }
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


		wx.getSetting({
			success:function(res){
				if (res.authSetting['scope.userInfo']){
					that.setData({
						isAutuor:true
					})
				}else{
					that.setData({
						isAutuor: false
					})
				}
			}
		})

    this.setData({
      barHeight: pt
    })
    var that = this
    wx.setStorageSync('isRefresh', false);
    if (wx.getStorageSync('expire') == ''){
      console.log('还没授权登陆过');
			that.setData({
				isAutuor:false
			})
    }else{
      //页面加载后查看登录是否过期
      var nowtime = Math.round(new Date().getTime()).toString();
      var limtiTime = wx.getStorageSync('expire');
      //如果登录过期，重新请求用户信息登录
      if (nowtime > limtiTime) {
        console.log('guoqile')
        wx.showLoading({
          title: '正在登录',
          mask:true
        });
        wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {

              // 已经授权，可以直接调用getUserInfo 
              wx.login({
                success:function(res){
                  console.log('重新登录')
                  var code = res.code;
                  console.log(code);
                  console.log(res)
                  wx.getUserInfo({
                    success:function(res){
                      var newencryptedData = res.encryptedData;
                      var newiv = res.iv
                      console.log(newencryptedData)
                      console.log(newiv)
                      //发起网络请求
                      wx.request({
                        url: 'https://cgi.guagua.cn/post/login',
                        data: {
                          loginType: 'wechat_mini_program',
                          code: code,
                          encryptedData: newencryptedData,
                          iv: newiv
                        },
                        method: 'POST',
                        header: {
                          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        success: function (res) {
                          console.log(res)
                          that.setData({
                            reload: false
                          })
                          if (res.statusCode == 200) {
                            var uid = res.data.content.uid;
                            var webToken = res.data.content.webToken;
                            var expire = res.data.content.expire;
                            wx.setStorageSync('uid', uid);
                            wx.setStorageSync('webToken', webToken);
                            wx.setStorageSync('expire', expire);
                            wx.hideLoading();
                            //查询用户个人作品数据
                            pageList = 1
                            var userid = parseInt(wx.getStorageSync('uid'));
                            var userWebToken = wx.getStorageSync('webToken');
                            wx.request({
                              url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=' + sizeNum,
                              method: 'GET',
                              header: {
                                'Content-Type': "application/json;charset=UTF-8",
                                'userid': uid,
                                'webToken': webToken
                              },
                              success: function (res) {
                                console.log(res)
                                pages = res.data.content.pages
                                that.setData({
                                  homePageList: res.data.content.list,
                                  reload:false,
																	isAutuor:true
                                });
                                app.globalData.homePageList = res.data.content.list;
                              },
                              fail: function () {
                                that.setData({
                                  reload:true
                                })
                              }
                            })
                          } else {
                            wx.showLoading({
                              title: '登录失败'
                            });
                            setTimeout(function () {
                              wx.hideLoading();
                            }, 1500);
                            // wx.removeStorageSync('uid');
                          }
                        },
                        fail: function () {
                          wx.showLoading({
                            title: '登录失败'
                          });
                          setTimeout(function () {
                            wx.hideLoading();
                            that.setData({
                              reload: true
                            })
                          }, 500);
                        }
                      })
                    }
                  })
                }
              })   
            } else {
              wx.showLoading({
                title: '请授权！'
              });
							that.setData({
								isAutuor: false
							})
              setTimeout(function () {
                wx.hideLoading();
              }, 2000)
            }
          }
        })
      } else {
        //如用户已经授权，自动登录
    
        var reuid = wx.getStorageSync('uid');
        var rewebtoken = wx.getStorageSync('webToken')
        wx.showLoading({
          title: '正在登录'
        });
        wx.request({
          url: 'https://cgi.guagua.cn/post/login',
          data: {
            loginType: 'renew',
            openid: reuid,
            openkey: rewebtoken
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          success: function (res) {
            if (res.statusCode == 200) {
              that.setData({
                reload: false
              })
              var resetuid = res.data.content.uid;
              var resetwebToken = res.data.content.webToken;
              var reexpire = res.data.content.expire;
              wx.setStorageSync('uid', resetuid);
              wx.setStorageSync('webToken', resetwebToken);
              wx.setStorageSync('expire', reexpire);
              wx.hideLoading();
        
              //查询用户个人作品数据
              pageList = 1
              if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
                var userid = parseInt(wx.getStorageSync('uid'));
                var userWebToken = wx.getStorageSync('webToken');
                wx.request({
                  url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=' + sizeNum,
                  method: 'GET',
                  header: {
                    'Content-Type': "application/json;charset=UTF-8",
                    'userid': resetuid,
                    'webToken': resetwebToken
                  },
                  success: function (res) {
                    pages = res.data.content.pages
                    that.setData({
                      homePageList: res.data.content.list,
                      reload: false
                    });
                    app.globalData.homePageList = res.data.content.list;
                  },
                  fail: function () {
                    that.setData({
                      reload: true
                    })
                  }
                })
              }

            } else {
              wx.showLoading({
                title: '登录失败'
              });
              setTimeout(function () {
                wx.hideLoading();
              }, 1500);
              wx.removeStorageSync('uid');
            }
          },
          fail: function () {
            console.log('自动登录失败');
            wx.showLoading({
              title: '登录失败'
            });
            setTimeout(function () {
              wx.hideLoading();
              that.setData({
                reload: true
              })
            }, 500)
          }
        })
        
      }
    }
  },

  onShow: function () {
		wx.setStorageSync('pretempid', '');
		wx.setStorageSync('presongid', '');
    wx.setStorageSync('photoIdInit', 0);
    wx.setStorageSync('saveConfirm', false);
    var that = this
    //如果编辑页改变了内容。返回首页时做出相应的改变
    if (app.globalData.homePageList){
      // console.log(app.globalData.homePageList)
      this.setData({
        homePageList: app.globalData.homePageList
      })
    }

    //如果新建了相册，返回首页时重新刷新页面
    if(wx.getStorageSync('isRefresh')){
      console.log('shuaxinle')
      pageList = 1
      var that = this;
      //查询用户个人作品数据
      if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
        var userid = parseInt(wx.getStorageSync('uid'));
        var userWebToken = wx.getStorageSync('webToken');
        wx.request({
          url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=' + sizeNum,
          method: 'GET',
          header: {
            'Content-Type': "application/json;charset=UTF-8",
            'userid': wx.getStorageSync('uid'),
            'webToken': wx.getStorageSync('webToken')
          },
          success: function (res) {
            pages = res.data.content.pages
            that.setData({
              homePageList: res.data.content.list
            });
            app.globalData.homePageList = res.data.content.list;
          },
          fail: function () {

          }
        })
      }
    }

    //每次展示页面判断用户是否关闭了授权
    // wx.getSetting({
    //   success:function(res){
    //     if (res.authSetting['scope.userInfo']){
    //       that.setData({
    //         showOrHidden:true
    //       })
    //     }else{
    //       that.setData({
    //         showOrHidden: false
    //       })
    //     }
    //   }
    // })
  },
  getUserInfo: function (e) {
    var that = this;
		var setTitl = '上传照片'
		wx.setStorageSync('setTitle', setTitl);
		wx.setStorageSync('photoIdInit', 0)
		var getEncryptedData = e.detail.encryptedData;
		var getIv = e.detail.iv;
		wx.setStorageSync('getEncryptedData', getEncryptedData);
		wx.setStorageSync('getIv', getIv);
		console.log(app.globalData.nettype);
		if (e.detail.userInfo) {
			that.setData({
				isAutuor:true
			})
			if (wx.getStorageSync('expire') != '') {
				var nowtime = Math.round(new Date().getTime()).toString();
				console.log(nowtime)
				var limtiTime = wx.getStorageSync('expire');
				if (nowtime < limtiTime) {
					that.chooseImg();
				} else {
					wx.showLoading({
						title: '正在登录',
					})
					wx.login({
						success: function (res) {
							console.log('wx.login请求成功')
							console.log(res);
							if (res.code) {
								//发起网络请求
								wx.request({
									url: 'https://cgi.guagua.cn/post/login',
									data: {
										loginType: 'wechat_mini_program',
										code: res.code,
										encryptedData: getEncryptedData,
										iv: getIv
									},
									method: 'POST',
									header: {
										'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
									},
									success: function (res) {
										if (res.statusCode == 200) {
											console.log('后台登录接口请求成功');
											console.log(res);
											var uid = res.data.content.uid;
											var webToken = res.data.content.webToken;
											var expire = res.data.content.expire;
											wx.setStorageSync('uid', uid);
											wx.setStorageSync('webToken', webToken);
											wx.setStorageSync('expire', expire);
											wx.hideLoading();
											//查询用户个人作品数据
											pageList = 1
											if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
												var userid = parseInt(wx.getStorageSync('uid'));
												var userWebToken = wx.getStorageSync('webToken');
												wx.request({
													url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=4',
													method: 'GET',
													header: {
														'Content-Type': "application/json;charset=UTF-8",
														'userid': wx.getStorageSync('uid'),
														'webToken': wx.getStorageSync('webToken')
													},
													success: function (res) {
														pages = res.data.content.pages
														that.setData({
															homePageList: res.data.content.list
														});
														app.globalData.homePageList = res.data.content.list;
														that.chooseImg();
													},
													fail: function () {

													}
												})
											}
										} else {
											wx.showLoading({
												title: '登录失败'
											});
											setTimeout(function () {
												wx.hideLoading();
											}, 1500)
										}
									},
									fail: function (res) {
										wx.showLoading({
											title: '登录失败'
										});
										setTimeout(function () {
											wx.hideLoading();
										}, 1500)
									}
								})
							} else {
								wx.showLoading({
									title: '登录失败'
								});
								setTimeout(function () {
									wx.hideLoading();
								}, 1500)
							}
						}
					});
				}
			} else {
				wx.showLoading({
					title: '正在登录',
				})
				wx.login({
					success: function (res) {
						console.log('wx.login请求成功')
						console.log(res);
						if (res.code) {
							//发起网络请求
							wx.request({
								url: 'https://cgi.guagua.cn/post/login',
								data: {
									loginType: 'wechat_mini_program',
									code: res.code,
									encryptedData: getEncryptedData,
									iv: getIv
								},
								method: 'POST',
								header: {
									'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
								},
								success: function (res) {
									if (res.statusCode == 200) {
										console.log('后台登录接口请求成功');
										console.log(res);
										var uid = res.data.content.uid;
										var webToken = res.data.content.webToken;
										var expire = res.data.content.expire;
										wx.setStorageSync('uid', uid);
										wx.setStorageSync('webToken', webToken);
										wx.setStorageSync('expire', expire);
										wx.hideLoading();
										//查询用户个人作品数据
										pageList = 1
										if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
											var userid = parseInt(wx.getStorageSync('uid'));
											var userWebToken = wx.getStorageSync('webToken');
											wx.request({
												url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=4',
												method: 'GET',
												header: {
													'Content-Type': "application/json;charset=UTF-8",
													'userid': wx.getStorageSync('uid'),
													'webToken': wx.getStorageSync('webToken')
												},
												success: function (res) {
													pages = res.data.content.pages
													that.setData({
														homePageList: res.data.content.list
													});
													app.globalData.homePageList = res.data.content.list;
													that.chooseImg();
												},
												fail: function () {

												}
											})
										}
									} else {
										wx.showLoading({
											title: '登录失败'
										});
										setTimeout(function () {
											wx.hideLoading();
										}, 1500)
									}
								},
								fail: function (res) {
									wx.showLoading({
										title: '登录失败'
									});
									setTimeout(function () {
										wx.hideLoading();
									}, 1500)
								}
							})
						} else {
							wx.showLoading({
								title: '登录失败'
							});
							setTimeout(function () {
								wx.hideLoading();
							}, 1500)
						}
					}
				});
			}
		} else {
			that.setData({
				isAutuor: false
			})
			wx.showLoading({
				title: '请授权！'
			});
			setTimeout(function () {
				wx.hideLoading();
			}, 1000)
		}
  },
	uploadimg:function(){
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
					if (wx.getStorageSync('expire') != '') {
						var nowtime = Math.round(new Date().getTime()).toString();
						console.log(nowtime)
						var limtiTime = wx.getStorageSync('expire');
						if (nowtime < limtiTime) {
							that.chooseImg();
						} else {

						}
					} else {
						wx.showLoading({
							title: '正在登录',
						})
						wx.getSetting({
							success: function (res) {
								if (res.authSetting['scope.userInfo']) {
									wx.showLoading({
										title: '正在登录',
									})
									wx.login({
										success: function (res) {
											console.log('wx.login请求成功')
											console.log(res);
											var rescode = res.code
											if (res.code) {
												wx.getUserInfo({
													success: function (res) {
														//发起网络请求
														wx.request({
															url: 'https://cgi.guagua.cn/post/login',
															data: {
																loginType: 'wechat_mini_program',
																code: rescode,
																encryptedData: res.encryptedData,
																iv: res.iv
															},
															method: 'POST',
															header: {
																'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
															},
															success: function (res) {
																if (res.statusCode == 200) {
																	console.log('后台登录接口请求成功');
																	console.log(res);
																	var uid = res.data.content.uid;
																	var webToken = res.data.content.webToken;
																	var expire = res.data.content.expire;
																	wx.setStorageSync('uid', uid);
																	wx.setStorageSync('webToken', webToken);
																	wx.setStorageSync('expire', expire);
																	wx.hideLoading();
																	//查询用户个人作品数据
																	pageList = 1
																	if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
																		var userid = parseInt(wx.getStorageSync('uid'));
																		var userWebToken = wx.getStorageSync('webToken');
																		wx.request({
																			url: 'https://cgi.guagua.cn/post/getMyPostsList?page=1&size=4',
																			method: 'GET',
																			header: {
																				'Content-Type': "application/json;charset=UTF-8",
																				'userid': wx.getStorageSync('uid'),
																				'webToken': wx.getStorageSync('webToken')
																			},
																			success: function (res) {
																				pages = res.data.content.pages
																				that.setData({
																					homePageList: res.data.content.list
																				});
																				app.globalData.homePageList = res.data.content.list;
																				that.chooseImg();
																			},
																			fail: function () {

																			}
																		})
																	}
																} else {
																	wx.showLoading({
																		title: '登录失败'
																	});
																	setTimeout(function () {
																		wx.hideLoading();
																	}, 1500)
																}
															},
															fail: function (res) {
																wx.showLoading({
																	title: '登录失败'
																});
																setTimeout(function () {
																	wx.hideLoading();
																}, 1500)
															}
														})
													}
												})
											} else {
												wx.showLoading({
													title: '登录失败'
												});
												setTimeout(function () {
													wx.hideLoading();
												}, 1500)
											}
										}
									});
								}
							}
						})
					}
				}
			},
		})
	},
  chooseImg:function(e){
		var that = this;
		var setTitl = '上传照片'
		wx.setStorageSync('setTitle', setTitl);
		wx.getNetworkType({
			success: function(res) {
				if(res.networkType == 'none'){
					wx.showToast({
						title: '网络异常',
						icon:'none',
						duration:2000
					})
				}else{
					wx.chooseImage({
						count: 9, // 最多可以选择的图片张数，默认9
						sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
						sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
						success: function (res) {
							var picArrList = res.tempFilePaths;
							// var tempFilePathsLength = res.tempFilePaths.length;
							that.setData({
								picArr: picArrList
							});
							console.log(that.data.picArr);
							wx.setStorageSync('newPhoto', 1);
							wx.navigateTo({
								url: '../uploadpic/uploadpic?picurl=' + JSON.stringify(that.data.picArr) + '&newPhoto=1'
							})
						},
						fail: function () {
							// fail
						},
						complete: function () {
							// complete
						}
					})
				}
			},
		})
    console.log('点击了相册选择按钮');
    
    
  },

 //页面上拉触底事件的处理函数
  onReachBottom: function () {
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
          pageList++;
          if (pageList <= pages) {
            if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
              var userid = parseInt(wx.getStorageSync('uid'));
              var userWebToken = wx.getStorageSync('webToken');
              // console.log(userid);
              wx.request({
                url: 'https://cgi.guagua.cn/post/getMyPostsList?page=' + pageList + '&size=' + sizeNum,
                method: 'GET',
                header: {
                  'Content-Type': "application/json;charset=UTF-8",
                  'userid': wx.getStorageSync('uid'),
                  'webToken': wx.getStorageSync('webToken')
                },
                success: function (res) {
                  var pageListArr = res.data.content.list;
                  var newHomePageList = that.data.homePageList.concat(pageListArr)
                  that.setData({
                    homePageList: newHomePageList
                  });
                  app.globalData.homePageList = newHomePageList;

                },
                fail: function () {
                  console.log('请求个人数据失败');
                  pageList--
                }
              })
            }
          } else {
            wx.showToast({
              title: '没有更多了',
              icon: 'none',
              duration: 1000
            })
          }
        }
      },
    })
  },



  //用户点击右上角分享
  onShareAppMessage: function (res) {
    wx.setStorageSync('isRefresh', false)
    console.log(res);
    return {
      title: '呱呱相册',
      path: '/pages/homePage/homepage'
    }
  },
  
  //预览相册
  previewPhoto:function(e){
    wx.setStorageSync('isRefresh', false)
    var redactPhotoId = e.target.dataset.photoid;
    var redactPhotoType = e.target.dataset.type;
    var redactTemplateID = e.target.dataset.templateid;
    console.log(redactTemplateID)
		wx.reLaunch({
      url: "../edit-album/edit-album?id=" + redactPhotoId + "&viewType=" + 1 + "&from=1"
    })
  },

  //首页个人作品删除按钮删除指定相册   
  removePhoto:function(e){
    var that = this
    var photoid = e.currentTarget.dataset.photoid;
    var photoindex = e.currentTarget.dataset.index;
    that.setData({
      removeId: photoid,
      removeIndex: photoindex
    })
    wx.getNetworkType({
      success: function(res) {
        if (res.networkType == 'none'){
          wx.showToast({
            title: '网络异常',
            icon:'none',
            duration: 2000
          })
        }else{
          that.setData({
            removePhoto:true
          })
        }
      }
    })
  },
  cancelRemove:function(){
    this.setData({
      removePhoto: false
    })
  },
  sureRemove:function(){
    var that = this;
		wx.getNetworkType({
			success: function(res) {
				if(res.networkType == 'none'){
					that.setData({
						removePhoto: false
					})
					wx.showToast({
						title: '网络异常',
						icon: 'none',
						duration: 2000
					})
				}else{
					var homepagedata = that.data.homePageList
					var photoid = that.data.removeId;
					var photoindex = that.data.removeIndex;
					var removePhotoUserid = wx.getStorageSync('uid');
					var removePhotoWebToken = wx.getStorageSync('webToken')
					console.log(photoid);
					console.log(photoindex);
					that.setData({
						removePhoto: false,
						isremove: true
					})
					wx.request({
						url: 'https://cgi.guagua.cn/post/delete?id=' + photoid,
						method: 'GET',
						header: {
							'content-type': 'application/json', // 默认值
							'userid': removePhotoUserid,
							'webToken': removePhotoWebToken
						},
						success: function (res) {
							console.log(res)
							if (res.statusCode == 200) {
								that.setData({
									loadurl: '../../images/loadComplete.png',
									loadClass: 'complete-pic',
									loadtext: '删除成功'
								})
								setTimeout(function () {
									that.setData({
										isremove: false
									})
								}, 1500)
								homepagedata.splice(photoindex, 1)
								that.setData({
									homePageList: homepagedata
								});
								app.globalData.homePageList = that.data.homePageList;

								if (that.data.homePageList.length < 4) {
									if (pageList <= pages) {
										if (wx.getStorageSync('uid') && wx.getStorageSync('webToken')) {
											var userid = parseInt(wx.getStorageSync('uid'));
											var userWebToken = wx.getStorageSync('webToken');
											// console.log(userid);
											wx.request({
												url: 'https://cgi.guagua.cn/post/getMyPostsList?page=0&size=4',
												method: 'GET',
												header: {
													'Content-Type': "application/json;charset=UTF-8",
													'userid': wx.getStorageSync('uid'),
													'webToken': wx.getStorageSync('webToken')
												},
												success: function (res) {
													console.log('加载了个人数据')
													var pageListArr = res.data.content.list;
													that.setData({
														homePageList: pageListArr
													});
													app.globalData.homePageList = pageListArr;

												},
												fail: function () {
													console.log('请求个人数据失败');
													
												}
											})
										}
									}
								}

							} else {
								that.setData({
									loadurl: '../../images/close-box.png',
									loadClass: 'complete-pic',
									loadtext: '删除失败'
								})
								setTimeout(function () {
									that.setData({
										isremove: false
									})
								}, 1500)
							}
						},
						fail: function () {

						}
					})
				}
			},
		})
    
    // wx.showModal({
    //   title: '删除相册',
    //   content: '确定删除此相册吗？',
    //   cancelColor: '#333333',
    //   confirmColor: '#333',
    //   success: function (sm) {
    //     if (sm.confirm) {
          
    //     } else if (sm.cancel) {
    //       console.log('用户点击取消')
    //     }
    //   }
    // })
  },
  //点击编辑按钮进入相册编辑页面
  redactPhoto: function (e) {
    wx.setStorageSync('isRefresh', false);
    wx.setStorageSync('pretempid', '');
		wx.setStorageSync('presongid', '');
    var setTitl = '编辑相册'
    wx.setStorageSync('setTitle', setTitl)
    // console.log(e);
    app.globalData.photoIndex = e.currentTarget.dataset.index;
    app.globalData.isedit = true;
    console.log(app.globalData)
    // console.log(app.globalData.photoIndex)
    var redactPhotoId = e.currentTarget.dataset.photoid;
    var redactPhotoType = e.currentTarget.dataset.type;
    var redactTemplateID = e.currentTarget.dataset.templateid;
    console.log('点了编辑之后的id' + redactPhotoId);
    console.log(redactTemplateID);
    console.log("../edit-album/edit-album?id=" + redactPhotoId + "&viewType=" + 0 + "&templateId=" + redactTemplateID)
    wx.setStorageSync('newPhoto',0);
    wx.setStorageSync('photoID', redactPhotoId)
    wx.navigateTo({
      url: "../uploadpic/uploadpic?id=" + redactPhotoId + "&newPhoto=0"
    })
  },

  //点击分享按钮跳转页面
  sharePhoto:function(e){
    wx.setStorageSync('isRefresh', false)
    console.log(e);
    var id = e.currentTarget.dataset.photoid;
    wx.navigateTo({
      url: '../share-album/share-album?id=' + id,
    })
  },

  //长按改变按钮颜色
  changeBg:function(){
    this.setData({
      changeBg:true
    })
  },
  
  //松开手指恢复按钮颜色
  changeBgEnd:function(){
    this.setData({
      changeBg: false
    })
  },

  changeBgRight:function(){
    this.setData({
      changeBgRight:false
    })
  },
  changeBgEndRight: function () {
    this.setData({
      changeBgRight: true
    })
  },
  //页面隐藏
  onHide: function () {
    
  },
  //监听页面卸载
  onUnload: function () {
   
  },
  reloadpage:function(){
    this.onLoad()
  }
})
//缓存用户uid时删掉了toString()方法；

  