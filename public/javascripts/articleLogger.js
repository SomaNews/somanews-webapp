/*global $, window */

var leftFlagSent = false;
function sendLeftFlag() {
    'use strict';

    if (leftFlagSent) {
        return;
    }

    var viewToken = $('#viewToken').val();
    $.ajax({
        type: 'POST',
        async: false,
        data: {viewToken: viewToken},
        url: '/articles/articleLeave',
        success: function () {
            leftFlagSent = true;
        }
    });
}

$(window).on('unload', function () {
    'use strict';
    sendLeftFlag();
});

$(window).on('beforeunload', function () {
    'use strict';
    sendLeftFlag();
});
