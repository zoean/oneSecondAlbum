/**
 * @author  lijiancheng | lijiancheng@17guagua.com
 * @version 1.0 | 2015/12/30
 * @desc  用途说明
 * @param str 为要截取的字符串,
 * @param len 为要截取的长度
 * @param hasDot 截取后是否有点
 * @example  使用示例
 */

exports.subString = function (str, len, hasDot) {
    if(null == str || undefined == str){
        str = '';
    }
    str = str.replace(/&nbsp;/g, ' ');
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex, "**").length;

    for (var i = 0; i < strLength; i++) {
        singleChar = str.charAt(i).toString();
        if (singleChar.match(chineseRegex) != null) {
            newLength += 2;
        } else {
            newLength++;
        }
        if (newLength > len) {
            break;
        }
        newStr += singleChar;
    }
    if (hasDot && strLength > len) {
        newStr += "...";
    }
    return newStr;
};