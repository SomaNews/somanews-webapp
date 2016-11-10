/**
 * Created by whyask37 on 2016. 11. 10..
 */

var sprintf = require('sprintf-js').sprintf;

var targetLabels = null;
var targetVectors = null;
var v = require('vectorious'),
    Matrix = v.Matrix;

/**
 * Load vectors to container
 * @param labels - Label of each vectors
 * @param vectors - Vectors
 */
exports.loadVectors = function (labels, vectors) {
    "use strict";
    targetLabels = labels;
    targetVectors = new Matrix(vectors);
    // [n * d]
};

/**
 * Check if vector is properly loaded
 * @returns {boolean}
 */
exports.isVectorLoaded = function () {
    "use strict";
    return targetLabels !== null;
};

/**
 * Find most similar index to zone
 * @param v - Target vector
 * @param count - Number of documents to retrieve from
 * @returns {Array.<*>}
 */
exports.findSimilarVectorIndexes = function (v, count) {
    "use strict";
    if(v instanceof Array) v = new Matrix([v]).transpose();
    else v = new Matrix(v);
    var simVector = targetVectors.multiply(v).transpose().toArray()[0];  // [n, 1]
    var n = simVector.length;
    var indexes = [...new Array(n).keys()];
    indexes.sort((a, b) => (simVector[b] - simVector[a]));
    return indexes.slice(0, count).map((i) => targetLabels[i]);
};
