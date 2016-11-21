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
 * Count attributes
 * @param entries - Entries
 * @param attrType - Attribute to count
 * @returns {{Dict}} - attrValue: count
 */
function countAttributes(entries, attrType) {
    "use strict";
    // Count attributes
    var attrCounts = {};
    entries.forEach(function (entry) {
        var attr = entry[attrType];
        attrCounts[attr] = (attrCounts[attr] || 0) + 1;
    });
    return attrCounts;
}

exports.countAttributes = countAttributes;


exports.normalizeAttributeCounts = function (attrCounts) {
    "use strict";
    var s = 0;
    Object.keys(attrCounts).forEach((k) => {
        s += attrCounts[k];
    });

    if(s === 0) s = 1;  // Prevent divide by 0

    Object.keys(attrCounts).forEach((k) => {
        attrCounts[k] /= s;
    });
    return attrCounts;
};

/**
 * Sort attribute count data by counts.
 * @param attrCounts Count data from 'countAttributes'
 * @returns {Array} - Array of (attrValue, count}
 */
function sortAttributeCounts(attrCounts) {
    "use strict";
    // Sort by attribute frequencies
    var keys = Object.keys(attrCounts);
    var l = [];
    for(var i = 0 ; i < keys.length ; i++) {
        l[l.length] = [attrCounts[keys[i]], keys[i]];
    }
    l.sort((a, b) => b[0] - a[0]);
    return l.map((v) => [v[1], v[0]]);
}

exports.sortAttributeCounts = sortAttributeCounts;



/**
 * Make frequency count ( object -> int ) to chartist.js friendly format.
 * @param entries - Entries
 * @param attrType - name of attribute being counted.
 * @returns {{labels: Array, items: Array}}
 */
exports.makePieGraphData = function (entries, attrType) {
    "use strict";
    // Count attributes
    var attrCounts = countAttributes(entries, attrType);
    var l = sortAttributeCounts(attrCounts);


    // Return chartist.js format data
    var items = l.map((e) => e[1]);
    var labels = l.map((e) => e[0]);
    return {
        labels: labels,
        series: items
    };
};


/**
 * Sum of list
 * @param data - List
 * @returns {*|Number}
 */
function sum(data) {
    "use strict";
    return data.reduce((a, b) => a + b, 0);
}
exports.sum = sum;


/**
 * Shorten string/title
 * @param str - String to shorten
 * @param maxLength - Maximum length
 * @returns {*}
 */
exports.shortenString = function (str, maxLength) {
    "use strict";
    if(str.length > maxLength - 3) return str.substring(0, maxLength - 3) + '...';
    return str;
};


/**
 * Dictionary-based cosine similarity
 * @param dictA
 * @param dictB
 * @returns {number}
 */
exports.dictCosineSimilarity = function (dictA, dictB) {
    "use strict";
    var aKeys = Object.keys(dictA);
    var aSize = Math.sqrt(sum(Object.keys(dictA).map(x => dictA[x] * dictA[x]))) || 1;
    var bSize = Math.sqrt(sum(Object.keys(dictB).map(x => dictB[x] * dictB[x]))) || 1;
    var dotProduct = sum(aKeys.map(key => dictA[key] * (dictB[key] || 0)));
    return dotProduct / aSize / bSize;
};
