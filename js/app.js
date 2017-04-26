jQuery(function ($) {

    var timeOutMsg = "処理に時間がかかっています。しばらくしてからやり直してみて下さい";

    /* *****************
     * 初期設定
     * *****************/

    // カラーピッカーの初期設定
    $('#card_label_color,#board_color,#board_new_color').spectrum({
        preferredFormat: "hex",
        showInput: true,
        showInitial: true,
        showPaletteOnly: true, // 外観をパレットのみにする
        palette: [ // パレットで使う色を指定
            ["#ffffff", "#cccccc", "#999999", "#666666", "#333333", "#000000"],
            ["#f44336", "#ff9800", "#ffeb3b", "#8bc34a", "#4caf50", "#03a9f4", "#2196f3"]
        ]
    });

    // パネルを並び替え
    $(".sortable").sortable();

    // パネルの並び替えが終わったら、並び順を更新する
    $(document).on('sortstop','.sortable',function(){
        var sortArray = [];
        $(".pannel").each(function(index) {
            var panel_id = $(this).find("h2").attr("data-id");
            if(panel_id !==''){
                sortArray.push(panel_id);
            }
        });
        var sortText = JSON.stringify(sortArray);
        exePost("panels", "sort", "", sortText, "").done(function() {
        }).fail(function() {
            alert(timeOutMsg);
        });
    });

    // カードを並び替え
    // connectWith で指定した要素と相互に並び替え
    $(".panel-body").sortable({
        connectWith: '.panel-body'
    });

   // カードの並び替えが終わったら、並び順を更新する
    $(document).on('sortstop','.panel-body',function(){
        // パネルごとに配列を集計
        // id = panels_id, title = card_id の配列で送信
        $(".pannel").each(function(index) {
            // パネルIDを取得
            var panel_id = $(this).find("h2").attr("data-id");
            // 空のパネルIDは除く
            if(panel_id !==''){
                // カードのIDを取得する
                var sortArray = [];
                $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().children('.panel-body').find('.card').each(function(index) {
                    var card_id = $(this).attr("cardid");
                    if(card_id !==''){
                        sortArray.push(card_id);
                    }
                });
                var sortText = JSON.stringify(sortArray);
                exePost("cards", "sort", panel_id, sortText, "").done(function() {
                }).fail(function() {
                    alert(timeOutMsg);
                });
            }
        });
    });


    /* *****************
     * 初期表示
     * *****************/
    // ボードは削除フラグが0で最小のidを抽出し、タイトルと背景色を取り出す
    exePost("boards", "first", "", "", "").done(function(data) {
        if (data) {
            var detail = $.parseJSON(data);
            $('#board_title h1').html(detail['title']);
            $('#board_title').attr('data-id', detail['id']);
            $('body').css('background-color', detail['board_color'])
            $("input#board_title_text").val(detail['title']);
            $("input#board_color").val(detail['board_color']);
            $("input#board_color").spectrum({
                showSelectionPalette: true,
                preferredFormat: "hex",
                showInput: true,
                showInitial: true,
                showPaletteOnly: true, // 外観をパレットのみにする
                palette: [// パレットで使う色を指定
                    ["#ffffff", "#cccccc", "#999999", "#666666", "#333333", "#000000"],
                    ["#f44336", "#ff9800", "#ffeb3b", "#8bc34a", "#4caf50", "#03a9f4", "#2196f3"]
                ]
            });
            // ボードに関連するパネルを表示する
            getPanels(detail['id']);
        }
    }).fail(function(data) {
        alert(timeOutMsg);
    });

    // ボード一覧を取得する
    getBoardList();

    // ボードリストをクリックしたらボードを切り替える
    $(document).on('click', '#board_all_list li', function() {
        var boards_id = $(this).attr('data-board');
        getBoard(boards_id);
    });

    // ログアウト
    $(document).on('click', '#logout', function() {
        window.location.replace("logout.php");
    });


    //////////////////////////////////////////////////
    // パネル
    //////////////////////////////////////////////////
    // パネルを増やす
    $("#panel_add").on("click", function (e) {
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
            alert(timeOutMsg);
        });
    });

    // パネル・モーダルの削除ボタンを押下したら確認する
    $(document).on("click", "#panel-modal .modal-dialog .modal-footer button#delete-btn", function () {
         if (window.confirm('このパネルを削除します。よろしいですか？')) {
            var panel_id = $('#panel-modal').attr('data-id');
            exePost("panels", "del", panel_id, "", "", "", "").done(function () {
                $("#panel_area .panel h2[data-id='" + panel_id + "']").parent().parent().remove();
                $('#panel-modal').modal('hide'); // モーダルを閉じる
            }).fail(function () {
                alert(timeOutMsg);
            });
        }
    });


    //////////////////////////////////////////////////
    // ボード
    //////////////////////////////////////////////////

    // ボードのタイトルをクリックしたら更新用モーダルを開く
    $(document).on("click", "#board_title h1", function () {
        $('#board-modal').modal('show');
    });

    // ボードの追加ボタンを押下したら編集モーダルを開く
    $(document).on("click", "#board_add", function () {
        $("#board_new_title_text").val('');
        $("#board_new_color").val('#000');
        $('#board-add-modal').modal('show');
    });

    // ボード・更新用モーダルの保存ボタンをクリックしたら保存処理を行う
    $(document).on("click", "#board-modal #save-btn", function () {
        var board_title_text = $('#board_title_text').val();
        var board_color = $('#board_color').val();
        var id = $('#board_title').attr("data-id");
        exePost("boards", "save", id, board_title_text, board_color).done(function(data) {
            var detail = $.parseJSON(data);
            $('#board_title h1').html(detail['title']);
            $('body').css('background-color', detail['board_color']);
            $("input#board_title_text").val(detail['title']);
            $('#board_title').attr("data-id", detail['id']);
            getBoardList(); // ボード一覧を取得しなおす
            $('#board-modal').modal('hide'); // モーダルを閉じる
        }).fail(function(data) {
            alert(timeOutMsg);
        });
    });

    // ボード・登録モーダルの保存ボタンをクリックしたら保存処理を行う
    $(document).on("click", "#board-add-modal #save-btn", function () {
        var board_title_text = $('#board_new_title_text').val();
        var board_color = $('#board_new_color').val();
        exePost("boards", "save", "new", board_title_text, board_color).done(function(data) {
            var detail = $.parseJSON(data);
            $('#board_title h1').html(detail['title']);
            $('body').css('background-color', detail['board_color']);
            $("input#board_title_text").val(detail['title']);
            $('#board_title').attr("data-id", detail['id']);
            $("#panel_area").html(''); // 新規のボードなので、パネルをクリアする
            getBoardList(); // ボード一覧を取得しなおす
            $('#board-add-modal').modal('hide'); // モーダルを閉じる
        }).fail(function(data) {
            alert(timeOutMsg);
        });
    });


    // ボード・モーダルの削除ボタンをクリックしたら確認する
    $(document).on("click", "#board-modal #delete-btn", function () {
        if (window.confirm('このボードを削除します。よろしいですか？')) {
            var id = $('#board_title').attr("data-id");
            exePost("boards", "del", id, "", "", "", "").done(function () {
                // ボードを削除したので、初期表示をやり直す
                exePost("boards", "first", "", "", "").done(function (data) {
                    var detail = $.parseJSON(data);
                    $('#board_title h1').html(detail['title']);
                    $('#board_title').attr('data-id', detail['id']);
                    $('body').css('background-color', detail['board_color'])
                    $("input#board_title_text").val(detail['title']);
                    $("input#board_color").val(detail['board_color']);

                    // ボードに関連するパネルを表示する
                    getPanels(detail['id']);
                }).fail(function (data) {
                    alert(timeOutMsg);
                });
                getBoardList(); // ボード一覧を取得しなおす
                $('#board-modal').modal('hide'); // モーダルを閉じる
            }).fail(function () {
                alert(timeOutMsg);
            });
        }
    });

    //////////////////////////////////////////////////
    // カード
    //////////////////////////////////////////////////
    // カードをクリックしたら編集モーダルを開く
    $(document).on('click', '.panel-body .card', function() {
        $("#card_title_text").val($(this).html());
        $('#card-edit').attr('data-id', $(this).attr("cardId"));
        $('#card-edit').attr('card_panel_id', $(this).parent().parent().find('.panel-heading h2').attr("data-id"));
        $("#card_label_color").val($(this).attr("label_color"));
        // 複製/移動のモーダルのIDを更新する
        $("#card-move-modal").attr('data-id', $(this).attr("cardId"));

        if ($(this).attr("cardId") === 'new') {
            // 新しいカードは削除と、移動/複製ボタンを出さない
            $("#move-btn").hide();
            $("#delete-btn").hide();

            $("#card_title_text").val('');
            $("#contents").val('');
            $("#contents_view").html('');
            $("#card_label_color").val("#cccccc");
            $("#card_label_color").spectrum({
                showSelectionPalette: true,
                preferredFormat: "hex",
                showInput: true,
                showInitial: true,
                showPaletteOnly: true, // 外観をパレットのみにする
                palette: [// パレットで使う色を指定
                    ["#ffffff", "#cccccc", "#999999", "#666666", "#333333", "#000000"],
                    ["#f44336", "#ff9800", "#ffeb3b", "#8bc34a", "#4caf50", "#03a9f4", "#2196f3"]
                ]
            });
        } else {
            $("#move-btn").show();
            $("#delete-btn").show();
            // コンテンツの内容を取得して反映する
            exePost("cards", "find", $(this).attr("cardId"), "", "", "", "").done(function (data) {
                if (data) {
                    var detail = $.parseJSON(data);
                    $("#contents").val(detail['contents']);
                    $("#contents_view").html(nl2br(detail['contents'])).linkify({
                        target: "_blank" // カード内のURLをリンクに置換
                    });

                    $("#card_label_color").val(detail['label_color']);
                    $("#card_label_color").spectrum({
                        showSelectionPalette: true,
                        preferredFormat: "hex",
                        showInput: true,
                        showInitial: true,
                        showPaletteOnly: true, // 外観をパレットのみにする
                        palette: [// パレットで使う色を指定
                            ["#ffffff", "#cccccc", "#999999", "#666666", "#333333", "#000000"],
                            ["#f44336", "#ff9800", "#ffeb3b", "#8bc34a", "#4caf50", "#03a9f4", "#2196f3"]
                        ]
                    });

                }
            }).fail(function (data) {
                alert(timeOutMsg);
            });

            // 初期表示は、編集モードをオフにする
            $("#contents").css('display', 'none');
            $("#contents_view").css('display', 'block');
        }
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
                // 最後にIDをnewから取得したIDに変更する
                $("#panel_area .panel h2[data-id='"+panel_id+"']").parent().parent().find(".panel-body .card[cardId='new']:last-child").attr("cardID", detail["id"]);
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
            alert(timeOutMsg);
        });
    });

    // カード･モーダルの削除ボタン押下で削除確認を表示
    $(document).on("click", "#card-edit .modal-dialog .modal-footer button#delete-btn", function () {
        if (window.confirm('このカードを削除します。よろしいですか？')) {
            var card_id = $('#card-edit').attr('data-id');
            var panel_id = $('#card-edit').attr('card_panel_id');
            exePost("cards", "del", card_id, "", "", "", "").done(function () {
                $("#panel_area .panel h2[data-id='" + panel_id + "']").parent().parent().find(".panel-body .card[cardId='" + card_id + "']").remove();
                $('#card-edit').modal('hide');
            }).fail(function () {
                alert(timeOutMsg);
            });
        }
    });

    //////////////////////////////////////////////////
    // カードの移動
    //////////////////////////////////////////////////
    // カード･モーダルの移動/複製ボタン押下で専用モーダルを開く
    $(document).on("click", "#card-edit .modal-dialog .modal-footer button#move-btn", function () {
        // モーダルを開く
        $('#card-move-modal').modal('show');
        // ボードリストを取得し、モーダルに反映する
        $("#panel_select").html('');
        exePost("boards", "list", "", "", "").done(function(data) {
            var obj = $.parseJSON(data);
            var lists = "<option value=''>-</option>";
            $.each(obj, function(index, value) {
                lists += "<option value='" + value["id"]+"'>" + value["title"] + "</option>";
            });
            $("#board_select").html('');
            $("#board_select").append(lists);
            // イベントの多重登録を防止
            $("#card-move-modal .modal-dialog .modal-footer button#save-panel-btn").off("click");
            $("#card-move-modal .modal-dialog .modal-footer button#save-panel-btn").on("click", saveMovingCard);
        }).fail(function() {
            alert(timeOutMsg);
        });
    });

    // ボードリストが選択されたら、パネルリストを更新する
    $(document).on("change", "#board_select", function () {
        exePost("panels", "list", $(this).val(), "", "").done(function (data) {
            if (data !== false) {
                var obj = $.parseJSON(data);
                var lists = "";
                $.each(obj, function (index, value) {
                    lists += "<option value='" + value["id"] + "'>" + value["title"] + "</option>";
                });
            }
            $("#panel_select").html('');
            $("#panel_select").append(lists);
        }).fail(function (data) {
            alert(timeOutMsg);
        });
    });
    //  カードの移動ここまで */



}); // jQuery(function($) End

function saveMovingCard() {
    var boards_id = $("#board_select").val();
    var panels_id = $("#panel_select").val();
    var id = $("#card-move-modal").attr('data-id');
    var mode = $("input[name='q']:radio:checked").val();
    exePost("cards", mode, id, panels_id, "", "", "").done(function () {
        // 開いているモーダルを閉じる
        $('#card-move-modal').modal('hide');
        $('#card-edit').modal('hide');
        $("#board_all_list li[data-board=" + boards_id + "]").trigger("click");
    }).fail(function () {
        alert(timeOutMsg);
    });
}



// ボード情報を取得して画面に反映する
function getBoard(id){
    exePost("boards", "find", id, "", "").done(function(data) {
        // ボードの内容を反映
        var detail = $.parseJSON(data);
        $('#board_title h1').html(detail['title']);
        $('#board_title').attr('data-id', detail['id']);
        $('body').css('background-color', detail['board_color'])
        $("input#board_title_text").val(detail['title']);
        $("input#board_color").val(detail['board_color']);
        $("input#board_color").spectrum({
            showSelectionPalette: true,
            preferredFormat: "hex",
            showInput: true,
            showInitial: true,
            showPaletteOnly: true, // 外観をパレットのみにする
            palette: [// パレットで使う色を指定
                ["#ffffff", "#cccccc", "#999999", "#666666", "#333333", "#000000"],
                ["#f44336", "#ff9800", "#ffeb3b", "#8bc34a", "#4caf50", "#03a9f4", "#2196f3"]
            ]
        });
        // パネルをクリアする
        $("#panel_area").html('');

        // ボードIDに紐づくパネルとカードの情報を取得して表示する
        getPanels(detail['id']);

    }).fail(function(data) {
        alert("処理に時間がかかっています。しばらくしてからやり直してみて下さい");
    });
}

function exePost(mode, action, id, title, contents, label, etc1) {
    return $.ajax({
        type: "POST",
        url: "pdo.php",
        dataType: 'text',
        timeout:10000,
        data: {
            mode: mode,
            action: action,
            id: id,
            label: label,
            title: title,
            contents: contents,
            etc1: etc1
        }
    })
}

// JS で PHP の nl2br
function nl2br(str) {
    if(!str){
    }else{
        str = str.replace(/\r\n/g, "<br />");
        str = str.replace(/(\n|\r)/g, "<br />");
    }
    return str;
}

// ボード一覧を取得する
function getBoardList() {
    $("#board_all_list").html('');
    exePost("boards", "list", "", "", "").done(function(data) {
        var obj = $.parseJSON(data);
        var lists = '<ul>';
        $.each(obj, function(index, value) {
            lists += "<li class='list-group-item' data-board='" + value["id"] + "' style='background: 10px "+value['board_color']+"'>" + value["title"] + "</li>";
        });
        lists += '</ul>';
        $("#board_all_list").html(lists);
    }).fail(function(data) {
        alert(timeOutMsg);
    });
}


// パネル一覧を取得して画面に反映する
function getPanels(id) {

    // ボードIDから関連するパネルのタイトルとIDを取得して反映
    exePost("panels", "list", id, "", "").done(function (data) {
        if (data !== false) {
            var obj = $.parseJSON(data);
            var panels = "";

            $.each(obj, function (index, value) {
                $("#panel_area").append($("#hidden .panel").html());
                $("#panel_area .panel:last-child h2").html(value["title"]);
                $("#panel_area .panel:last-child h2").attr("data-id", value["id"]);

                // カード情報を取得して反映反映
                exePost("cards", "list", value["id"], "", "").done(function (card_data) {
                    var card_obj = $.parseJSON(card_data);
                    var cards = "";
                    $.each(card_obj, function (index, val) {
                        cards += "<div class='card panel panel-default' style='border-top: 12px solid " + val["label_color"] + "' label_color='" + val["label_color"] + "' cardId='" + val["id"] + "'>" + val["title"] + "</div>";
                    });
                    $("#panel_area .panel h2[data-id='" + value["id"] + "']").parent().parent().children('.panel-body').append(cards);
                    // パネルの中のカードがドラッグできるように再設定
                    $("#panel_area .panel h2[data-id='" + value["id"] + "']").parent().parent().children('.panel-body').sortable({
                        connectWith: '.panel-body'
                    });

                });
            });
        }
    }).fail(function (data) {
        alert(timeOutMsg);
    });
}