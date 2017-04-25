$(function() {
    // パネルを増やす
    $("#panel_add").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        // パネルを追加したら、その時の個数を取得する
        var count = $(".pannel").length;
        if (count > 7) {
            alert('パネルを増やせるのは7個までです');
            return;
        }
        // 空のパネルを追加
        $("#panel_area").append($("#hidden .panel").html());

        // パネルの中のカードがドラッグできるように再設定
        $("#panel_area .panel-body").sortable({
            connectWith: '.panel-body'
        });
        return false;
    });

    // パネルのタイトルをクリックしたら編集モーダルを開く
    $(document).on("click", ".panel h2", function () {
        var id = $(this).attr("data-id");
        $("#panel-modal").attr("data-id", id);
        if(id ==='new'){
            $('#panel-modal #panel_title_text').val('');
        }else{
            $('#panel-modal #panel_title_text').val($(this).html());
        }

        $('#panel-modal').modal('show');
    });

    // パネル・モーダルの保存ボタンをクリックしたら保存処理を行う
    $(document).on("click", "#panel-modal .modal-dialog .modal-footer button#save-panel-btn", function () {
        var panel_title_text = $('#panel_title_text').val();
        var panel_id = $('#panel-modal').attr('data-id');
        var board_id = $('#board_title').attr("data-id");
        // IDが取得できない場合は新規分
        if ( (typeof panel_id === "undefined") || ( panel_id === "")) {
            panel_id = 'new';
        }
        exePost("panels", "save", panel_id, panel_title_text, board_id).done(function(data) {
            var detail = $.parseJSON(data);
            // タイトルを保存したデータで更新する
            // new の時は、data-id = new を対象に、それ以外は既存のIDで検索する
            if(panel_id === 'new'){
                $("#panel_area .panel").find("h2[data-id='new']").eq(0).html(detail['title']);
                $("#panel_area .panel").find("h2[data-id='new']").eq(0).attr("data-id", detail['id']);
            }else{
                $("#panel_area .panel h2[data-id='"+panel_id+"']").attr("data-id", detail['id']);
                $("#panel_area .panel h2[data-id='"+panel_id+"']").html(detail['title']);
            }
            $('#panel-modal').modal('hide'); // モーダルを閉じる
        }).fail(function(data) {
            alert("system Error");
        });
    });

    // パネル・モーダルの削除ボタンを押下したら確認する
    $(document).on("click", "#panel-modal .modal-dialog .modal-footer button#delete-btn", function () {
         if(window.confirm('このパネルを削除します。よろしいですか？')){
		    var panel_id = $('#panel-modal').attr('data-id');
		    exePost("panels", "del", panel_id, "", "", "", "").done(function() {
		        $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().remove();
		        $('#panel-modal').modal('hide'); // モーダルを閉じる
		    }).fail(function() {
                alert("system Error");
            });
	    }
    });

});

