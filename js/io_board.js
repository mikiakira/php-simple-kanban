$(function() {

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
            alert("system Error");
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
            alert("system Error");
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
                    alert("system Error");
                });
                getBoardList(); // ボード一覧を取得しなおす
                $('#board-modal').modal('hide'); // モーダルを閉じる
            }).fail(function () {
                alert("system Error");
            });
        }
    });
});

