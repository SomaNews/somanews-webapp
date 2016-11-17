/**
 * Created by whyask37 on 2016. 11. 16..
 */


var _processing = false;

function setDatabaseType(type) {
    "use strict";

    if (_processing) {
        return;
    }

    var modeStr;
    if (type == 'A') modeStr = '/articles/modeA';
    else modeStr = '/articles/modeB';

    $.ajax({
        type: 'GET',
        url: modeStr,
        success: function() {
            _processing = false;
            window.location.reload(true);
        },
        error: function() {
            _processing = false;
        }
    });
}
