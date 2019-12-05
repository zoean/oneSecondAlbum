function getData(url,callback){
  wx.request({
    url: url,
    method: 'GET',
    header: 'application/json',
    success: function (data) {
      callback(data)
    }
  });
}

module.exports = {
  getData: getData
}