/**
 * Created by whyask37 on 2016. 11. 6..
 */

/**
 * Graph frequencies with given data
 * @param className - Class of div to put graph to
 * @param data - Data with labels and series.
 */
function graphFrequencies(className, data) {
    "use strict";
    new Chartist.Bar(className, {
        labels: data.labels,
        series: [data.series]
    }, {
        reverseData: true,
        horizontalBars: true,
        height: ( data.labels.length * 30 + 30) + 'px', // last 40pxs are for the labels
        axisX: {
            onlyInteger: true
        },
        axisY: {
            offset: 120
        },
    });
}