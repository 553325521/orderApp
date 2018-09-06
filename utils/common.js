var app = getApp();
// var MD5Encode = require("MD5Encode.js");

/**
 * 对字符串判空
 */
function isStringEmpty(data) {
  if (null == data || "" == data) {
    return true;
  }
  return false;
}

/**
 * 封装网络请求
 */
function sentHttpRequestToServer(uri, data, method, successCallback, failCallback, completeCallback) {
  wx.request({
    url: app.d.hostUrl + uri,
    data: data,
    method: method,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: successCallback,
    fail: failCallback,
    complete: completeCallback
  })
}

/**
 * 将map对象转换为json字符串
 */
function mapToJson(map) {
  if (null == map) {
    return null;
  }
  var jsonString = "{";
  for (var key in map) {
    jsonString = jsonString + key + ":" + map[key] + ",";
  }
  if ("," == jsonString.charAt(jsonString.length - 1)) {
    jsonString = jsonString.substring(0, jsonString.length - 1);
  }
  jsonString += "}";
  return jsonString;
}

/**
 * 调用微信支付
 */
function doWechatPay(prepayId, successCallback, failCallback, completeCallback) {
  var nonceString = getRandomString();
  var currentTimeStamp = getCurrentTimeStamp();
  var packageName = "prepay_id=" + prepayId;
  var dataMap = {
    timeStamp: currentTimeStamp,
    nonceStr: nonceString,
    package: packageName,
    signType: "MD5",
    paySign: getWechatPaySign(nonceString, packageName, currentTimeStamp),
    success: successCallback,
    fail: failCallback,
    complete: completeCallback
  }
  console.log(dataMap);
  wx.requestPayment(dataMap);
}

/**
 * 获取微信支付签名字符串
 */
function getWechatPaySign(nonceStr, packageName, timeStamp) {
  var beforMD5 = "appid=" + app.d.appId + "&nonceStr=" + nonceStr + "&package=" + packageName + "&signType=MD5" + "&timeStamp=" + timeStamp + "&key=" + app.d.appKey;
  return doMD5Encode(beforMD5).toUpperCase();
}

/**
 * 获取当前时间戳
 */
function getCurrentTimeStamp() {
  var timestamp = Date.parse(new Date());
  return timestamp + "";
}

/**
 * 获取随机字符串，32位以下
 */
function getRandomString() {
  return Math.random().toString(36).substring(3, 8);
}

/**
 * MD5加密
 */
function doMD5Encode(toEncode) {
  return MD5Encode.hexMD5(toEncode);
}
/**
 * 年份
 */
function getYears(){
  var years = [];
  for(let i = 1990; i<=2999;i++){
    i=i+''
    years.push(i)
  }
  return years
}
/**
 * 月份
 */
function getMonths() {
  var months = [];
  for (let i = 1; i <= 12; i++) {
    i = i<10?'0'+i:i+''
    months.push(i)
  }
  return months
}
/**
 * 天
 */
function getDays() {
  var days1 = [];
  var days2 = [];
  var days3 = [];
  var days4 = [];
  for (let i = 1; i <= 31; i++) {
    if(i<=28){
      i = i < 10 ? '0' + i : i + ''
      days1.push(i)
    } if (i <= 29){
      days2.push(i)      
    } if (i <= 30) {
      days3.push(i)
    }
    days4.push(i)
  }
  return {
    days1: days1,
    days2: days2,
    days3: days3,
    days4: days4
  }
}
/**
 * 小时
 */
function getHours() {
  var hours = [];
  for (let i = 1; i <= 24; i++) {
    i = i < 10 ? '0' + i : i + ''
    hours.push(i)
  }
  return hours
}
/**
 * 分钟
 */
function getMins() {
  var mins = [];
  for (let i = 0; i <= 59; i++) {
    i = i < 10 ? '0' + i : i + ''
    mins.push(i)
  }
  return mins
}

module.exports = {
  isStringEmpty: isStringEmpty,
  sentHttpRequestToServer: sentHttpRequestToServer,
  mapToJson: mapToJson,
  doWechatPay: doWechatPay,
  getYears:getYears,
  getMonths:getMonths,
  getDays:getDays,
  getHours:getHours,
  getMins:getMins
}