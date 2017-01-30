$(function() {

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
            alert("system Error");
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
                    alert("system Error");
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
        alert("system Error");
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


});



// ボード一覧を取得する
function getBoardList() {
    $("#board_all_list").html('');
    exePost("boards", "list", "", "", "").done(function(data) {
        var obj = $.parseJSON(data);
        var lists = '<ul">';
        $.each(obj, function(index, value) {
            lists += "<li class='list-group-item' data-board='" + value["id"] + "' style='background: 10px "+value['board_color']+"'>" + value["title"] + "</li>";
        });
        $("#board_all_list").html(lists);
    }).fail(function(data) {
        alert("system Error");
    });
}


// パネル一覧を取得して画面に反映する
function getPanels(id){

    // ボードIDから関連するパネルのタイトルとIDを取得して反映
    exePost("panels", "list", id, "", "").done(function(data) {
        if(data !==false){
            var obj = $.parseJSON(data);
            var panels = "";

            $.each(obj, function(index, value) {
                $("#panel_area").append($("#hidden .panel").html());
                $("#panel_area .panel:last-child h2").html(value["title"]);
                $("#panel_area .panel:last-child h2").attr("data-id", value["id"]);

                // カード情報を取得して反映反映
                exePost("cards", "list", value["id"], "", "").done(function(card_data) {
                    var card_obj = $.parseJSON(card_data);
                    var cards = "";
                    $.each(card_obj, function(index, val) {
                        cards += "<div class='card panel panel-default' style='border-top: 12px solid "+val["label_color"] + "' label_color='"+val["label_color"] + "' cardId='" + val["id"] + "'>" + val["title"] + "</div>";
                    });
                    $("#panel_area .panel h2[data-id='"+value["id"]+"']").parent().parent().children('.panel-body').append(cards);
                    // パネルの中のカードがドラッグできるように再設定
                    $("#panel_area .panel h2[data-id='"+value["id"]+"']").parent().parent().children('.panel-body').sortable({
                        connectWith: '.panel-body'
                    });

                });
            });
        }
    }).fail(function(data) {
        alert("system Error");
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
        alert("system Error");
    });
}