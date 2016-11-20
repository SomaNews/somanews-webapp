/**
 * Created by whyask37 on 2016. 11. 19..
 */

var articleScoreEditor = ace.edit("articleRank");
articleScoreEditor.setTheme("ace/theme/monokai");
articleScoreEditor.getSession().setMode("ace/mode/javascript");


function recalculateScore() {
    recalculateArticleScore();
}

function recalculateArticleScore() {
    try {
        // Create function
        var funcBody = articleScoreEditor.getValue();
        var f = new Function(['lcr', 'tcr', 'ds', 'rank'], funcBody);

        // Calculate score for each row
        var $aList = $('#aList');
        var $rows = $aList.find('tbody > tr').get();
        $.each($rows, function () {
            var $this = $(this);
            var lcr = Number($this.find('.lcr').val());
            var tcr = Number($this.find('.tcr').val());
            var dateSince = Number($this.find('.ds').val());
            var rank = Number($this.find('td.rank').text());
            $this.find('td.cs').text(f(lcr, tcr, dateSince, rank));
        });

        // Sort
        $rows.sort(function (a, b) {
            var acs = Number($(a).find('td.cs').text());
            var bcs = Number($(b).find('td.cs').text());
            if (acs == bcs) {
                var ai = Number($(a).find('input.idx').val());
                var bi = Number($(b).find('input.idx').val());
                return ai - bi;
            }
            else return bcs - acs;
        });

        // Turn score to fixed
        $.each($rows, function () {
            var $this = $(this);
            var cs = Number($this.find('.cs').text());
            $this.find('.cs').text(cs.toFixed(3));
        });

        // Insert sorted thing
        $.each($rows, function (i, row) {
            $aList.children('tbody').append(row);
        });

    }
    catch (e) {
    }
}

articleScoreEditor.getSession().on('change', recalculateScore);

function recalculateLCR() {
    var rows = $('table#aList tbody tr');
    var logLength = $('input.setViewed:checked').length || 1;
    var clusterCounts = {};
    rows.each(function () {
        var $this = $(this);
        if ($this.find('input.setViewed').is(':checked')) {
            var cluster = $this.find('input.cluster').val();
            clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        }
    });
    rows.each(function () {
        var $this = $(this);
        var cluster = $this.find('input.cluster').val();
        var lCR = (clusterCounts[cluster] || 0) / logLength;
        $this.find('input.lcr').val(lCR);
        $this.find('span.lcrText').text(lCR.toFixed(2));
    });

    recalculateScore();
}

$('input.setViewed').change(recalculateLCR);
recalculateLCR();
