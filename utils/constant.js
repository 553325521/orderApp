// 全局静态常量
var constant = {
    "socketCode": {         //webSocket通知代码
        "order": {       //新订单
            "new": {
                "code": "101",    //通知码
                "fileUrl": ""   //语音路径
            }
        },
        "shopInfo": {   //通知店铺信息，包括id
            "code": "3001"
        },
        "update": {
            "setting": {   //通知更新店铺开关设置
                "code": "5001"    //通知码
            }
        },
    },
    "tabBar": {
        "color": "#5C5A58",
        "selectedColor": "#DA251D",
        "borderStyle": "#000",
        "backgroundColor": "#EF9BA0",
        "list": [
            {
                "pagePath": "../founding/founding",
                "iconPath": "../../images/icon/caidan.png",
                "selectedIconPath": "../../images/icon/caidan.png",
                "text": "开台",
                "show": true
            },
            {
                "pagePath": "../indent/indent",
                "iconPath": "../../images/icon/dindan.png",
                "selectedIconPath": "../../images/icon/dindan.png",
                "text": "订单",
                "show": true
            },
            {
                "pagePath": "../statement/statement",
                "iconPath": "../../images/icon/bb-icon.png",
                "selectedIconPath": "../../images/icon/bb-icon.png",
                "text": "报表",
                "show": true
            },
            {
                "pagePath": "../takeOut/takeOut",
                "iconPath": "../../images/icon/wm-icon.png",
                "selectedIconPath": "../../images/icon/wm-icon.png",
                "text": "外卖",
                "show": true
            },
            {
                "pagePath": "../cashier/cashier",
                "iconPath": "../../images/icon/shouyin.png",
                "selectedIconPath": "../../images/icon/shouyin.png",
                "text": "收银",
                "show": true
            }
        ]
    }
   
}

//转化成小程序模板语言 这一步非常重要 不然无法正确调用
module.exports = {
    get: constant
}