//app.js
App({
  onLaunch: function () {
    var that = this
    //版本更新
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: "发现新版本",
        content: "发现新版本，是否更新？",
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
          if (res.cancel) {
            console.log("下次冷启动时更新");
          }
        }
      })
    });

    updateManager.onUpdateFailed(function () {
      console.log("新版本更新失败");
    })
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     console.log('dadsasasadasdsa')
    //   }
    // })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })

    //获取设备导航栏高度
    wx.getSystemInfo({
      success: function(res){
        that.globalData.height = res.statusBarHeight
      }
    })
		wx.onNetworkStatusChange(function (res) {
			if (res.isConnected){
				that.globalData.nettype = res.isConnected
			}else{
				that.globalData.nettype = res.isConnected
			}
		})
  },
  onShow: function (){    
  },
  globalData: {
    userInfo: null,
		nettype:true
  }
})