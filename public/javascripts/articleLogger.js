/*global $, window */

$(document).ready(function() {
    "use strict";
    // Ping every 10 seconds
    setInterval(function(){
        var viewToken = $('#viewToken').val();
        $.ajax({
            type: 'POST',
            async: true,
            data: {viewToken: viewToken},
            url: '/articles/articlePing',
            success: function () {}
        });
    }, 10000);
});
