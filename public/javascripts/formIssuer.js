function formVerifier_AlwaysAllow(value) {
    'use strict';
    return true;
}

function formVerifier_NoBlank(value) {
    'use strict';
    return value !== '';
}

function formVerifier_Email(value) {
    'use strict';
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
}

/**
 * Form의 내용을 종합해 Ajax request를 전송합니다. 이 때 form의 input를 임시로 모두 disable시킵니다
 * @param url - ajax를 날릴 URL
 * @param formName - form의 아이디
 * @param nameTable - ajax의 파라미터 정의. 아래 형식 배열의 배열로 되어있다.
 *      [(form 내 name), (ajax 파라미터 이름), formVerifier, (verifier 실패시 메세지)]
 * @param callback(data) - ajax에서 error가 없을 때 낼 동작
 * @returns {boolean} - ajax가 제대로 보내졌는지
 */
function issueForm(url, formName, nameTable, callback) {
    'use strict';

    var targetForm = $('#' + formName);
    var ajaxData = {};

    if (!targetForm) {
        console.log('Unknown form \'' + formName + '\'');
        return false;
    }

    // Collect form values
    for(var i = 0 ; i < nameTable.length ; i++) {
        var nameTableEntry = nameTable[i];

        var inputName = nameTableEntry[0];
        var postName = nameTableEntry[1];
        var formVerifier = nameTableEntry[2] || formVerifier_AlwaysAllow;
        var errorMsg = nameTableEntry[3] || "허용되지 않은 입력입니다.";

        ajaxData[postName] = targetForm.find('*[name="' + inputName + '"]').val();
        if(!formVerifier(ajaxData[postName])) {
            window.alert(errorMsg);
            return false;
        }
    }

    // Disable form temporarilly
    targetForm.find('input, textarea').prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: url,
        data: ajaxData,
        dataType: 'json',
        success: function(data) {
            if(!data.error) {
                callback(data);
            }
            else {
                // Re-enable form to allow correction.
                targetForm.find('input, textarea').prop('disabled', false);
                window.alert(data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
    return true;
}


/////////////////////


/**
 * 로그인 ajax를 보냅니다.
 */
function issueLogin() {
    'use strict';
    issueForm(
        '/login',
        'login_form',
        [
            ['login_email', 'email', formVerifier_Email, '정확한 이메일을 입력하세요.'],
            ['login_password', 'password', formVerifier_NoBlank, '비밀번호를 입력하세요.'],
        ],
        function() {
            window.location.reload(true);
        }
    );
}
