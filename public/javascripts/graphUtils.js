/**
 * Created by whyask37 on 2016. 11. 6..
 */

/**
 * Graph frequencies with given data
 * @param data - Data with labels and series.
 */
function graphFrequencies(data) {
    "use strict";
    var freqsum = data.series.reduce(function (a, b) { return a + b; }, 0);
    if (freqsum === 0) {
        console.warn('Cannot graph data with nothing');
        return;  // Cannot graph with no data
    }

    var labelGenerator = function (originalLabel, index) {
        var freq = data.series[index];
        var percent = Math.floor(freq * 100 / freqsum);
        return originalLabel + " (" + percent + "%)";
    };

    new Chartist.Pie('.ct-chart', data, {
        chartPadding: 30,
        labelOffset: 60,
        labelDirection: 'explode',
        labelInterpolationFnc: labelGenerator
    });
}