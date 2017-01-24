$(function() {
    
    // カードをクリックしたら編集モーダルを開く
    $(document).on('click', '.panel-body .card', function() {
        $("#card_title_text").val($(this).html());
        $('#card-edit').attr('data-id', $(this).attr("cardId"));
        $('#card-edit').attr('card_panel_id', $(this).parent().parent().find('.panel-heading h2').attr("data-id"));
        $("#card_label_color").val($(this).attr("label_color"));
        // 複製/移動のモーダルのIDを更新する
        $("#card-move-modal").attr('data-id', $(this).attr("cardId"));
        
        // コンテンツの内容を取得して反映する
        exePost("cards", "find", $(this).attr("cardId"), "", "", "", "").done(function(data) {
            var detail = $.parseJSON(data);
            $("#contents").val(detail['contents']);
            $("#contents_view").html(nl2br(detail['contents'])).linkify({
                target: "_blank" // カード内のURLをリンクに置換
            });
        }).fail(function(data) {
            alert("system Error");
        });
        $('#card-edit').modal('show');
    });
    
    // カードの「編集」をクリックしたら、コンテンツのビューを切り替える
    $(document).on('click', '#contents_toggle', function () {
        $("#contents_view").toggle();
        $("#contents").toggle();
        if($("#contents_toggle").html() === "編集"){
            $("#contents_toggle").html("表示");
        }else{
            $("#contents_toggle").html("編集");
        }
    });
    
    
    // カードを増やす
    $(document).on('click', '.pannel .panel-footer .card_add', function () {
        $(this).parent().parent().children('.panel .panel-body').append($('<div class="card panel panel-default" label_color="" cardid="new">New</div>'));
    });
    
    
    // カード・モーダルの保存ボタンをクリックしたら保存処理を行う
    $(document).on("click", "#card-edit .modal-dialog .modal-footer button#save-btn", function () {
        var card_title_text = $('#card_title_text').val();
        var card_label_color = $("#card_label_color").val();
        var contents = $("#contents").val();
        var card_id = $('#card-edit').attr('data-id');
        var board_id = $('#board_title').attr("data-id");
        var panel_id = $('#card-edit').attr('card_panel_id');
        
        // IDが取得できない場合は新規分
        if ( (typeof card_id === "undefined") || ( card_id === "") ) {
            card_id = 'new';
        }
        exePost("cards", "save", card_id, card_title_text, panel_id, card_label_color, contents).done(function(data) {
            var detail = $.parseJSON(data);
            var label_color = detail["label_color"];
            if(label_color == null){
                label_color = "";
            }
            
            // 同パネル内に card_id = new が1つ以上あれば、一番最初の要素を更新する
            // new がなければ、id があるはずなので、idを元に要素を探して更新する
            // タイトルとラベルを保存したデータで更新する
            if( $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().find(".panel-body .card[cardId='new']").length > 0) {
                $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().find(".panel-body .card[cardId='new']:last-child").html(detail["title"]);
                $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().find(".panel-body .card[cardId='new']:last-child").attr("style", "border-top: 12px solid "+label_color);
            }else{
                $(".card[cardId='"+detail["id"]+"']").html(detail["title"]);
                $(".card[cardId='"+detail["id"]+"']").attr("style", "border-top: 12px solid "+label_color);
            }        
            
            // モーダルの中をリセットしてからモーダルを閉じる
            $('#card_title_text').val('');
            $("#card_label_color").val('');
            $("#contents").val('');
            $('#card-edit').modal('hide');
        }).fail(function(data) {
            alert("system Error");
        });
    });
    
    // カード･モーダルの削除ボタン押下で削除確認を表示    
    $(document).on("click", "#card-edit .modal-dialog .modal-footer button#delete-btn", function () {
        if(window.confirm('このカードを削除します。よろしいですか？')){
		    var card_id = $('#card-edit').attr('data-id');
		    var panel_id = $('#card-edit').attr('card_panel_id');
		    exePost("cards", "del", card_id, "", "", "", "").done(function() {
		        $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().find(".panel-body .card[cardId='"+card_id+"']").remove();
		        $('#card-edit').modal('hide');
		    }).fail(function() {
                alert("system Error");
            });  
	    }
    });
    
    
    // カード･モーダルの移動/複製ボタン押下で専用モーダルを開く
    $(document).on("click", "#card-edit .modal-dialog .modal-footer button#move-btn", function () {
        $('#card-move-modal').modal('show');
        // ボードリストを取得し、モーダルに反映する
        $("#board_select").html('');
        $("#panel_select").html('');
        exePost("boards", "list", "", "", "").done(function(data) {
            var obj = $.parseJSON(data);
            var lists = "<option value=''>-</option>";
            $.each(obj, function(index, value) {
                lists += "<option value='" + value["id"]+"'>" + value["title"] + "</option>";
            });
            $("#board_select").append(lists);
        }).fail(function(data) {
            alert("system Error");
        });
        // ボードリストが選択されたら、パネルリストを更新する
        $(document).on("change", "#board_select", function () {
            exePost("panels", "list", $(this).val(), "", "").done(function(data) {
                if(data !==false){
                    var obj = $.parseJSON(data);
                    var lists = "";
                    $.each(obj, function(index, value) {
                        lists += "<option value='" + value["id"]+"'>" + value["title"] + "</option>";
                    });
                }
                $("#panel_select").html('');
                $("#panel_select").append(lists);
            }).fail(function(data) {
                alert("system Error");
            });
        });
        
        // 実行ボタンが押下されたら、フォームの値を取得して処理する
        $(document).on("click", "#card-move-modal .modal-dialog .modal-footer button#save-panel-btn", function () {
            var boards_id = $("#board_select").val();
            var panels_id = $("#panel_select").val();
            var id = $("#card-move-modal").attr('data-id');
            var mode = $("input[name='q']:radio:checked").val();
            console.log(mode);
		    exePost("cards", mode, id, panels_id, "", "", "").done(function() {
		        $("#panel_area").html('');
		        var board_id = $('#board_title').attr("data-id");
		        getPanels(board_id);
		        $('#card-move-modal').modal('hide');
		    }).fail(function() {
                alert("system Error");
            });
        });
    });
});
