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
    "use strict";
    return sprintf("%04d/%02d/%02d %02d:%02d",
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
    );
};


/**
 * Make frequency count ( object -> int ) to chartist.js friendly format.
 * @param frequencies - Dictionary of frequencies.
 * @returns {{labels: Array, items: Array}}
 */
exports.makeFrequencyGraphData = function (frequencies) {
    "use strict";
    var keys = Object.keys(frequencies);
    var l = [];
    for(var i = 0 ; i < keys.length ; i++) {
        l[l.length] = [frequencies[keys[i]], keys[i]];
    }
    l.sort();
    var items = l.map((e) => e[0]);
    var labels = l.map((e) => e[1]);
    return {
        labels: labels,
        series: items
    };
};
