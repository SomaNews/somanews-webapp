var sprintf = require("sprintf-js").sprintf;

/**
 * 어제에 해당하는 Date를 리턴한다
 * @returns {Date}
 */

exports.getYesterday = function () {
    'use strict';
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
};


/**
 * Escape text
 * @param str - Input string
 * @returns {string} Escaped string
 */
function htmlEscape(str) {
    'use strict';
    str = str.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return str;
}

exports.htmlEscape = htmlEscape;


/**
 * Escape multiline text
 * @param text - Multiline text
 * @returns {string} - Escaped string with each paragraph in <p> tag
 */

exports.htmlEscapeMultilineText = function (text) {
    'use strict';
    var paragraphs = text.split('\n').map(function (str) {
        if (str) {
            str = htmlEscape(str);
            return '<p>' + str + '</p>';
        }
        return '';
    });
    return paragraphs.join('');
};


/**
 * Date를 스트링으로 변환한다
 * @param date - 변환할 Date
 * @returns {String} - 변환한 String
 */
exports.formatDate = function (date) {
    return sprintf("%04d/%02d/%02d %02d:%02d",
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
    );
};
