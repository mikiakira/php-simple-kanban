/* *****************
 * --- INDEX ---
 * 初期設定
 * 新規作成
 * 削除
 * 編集
 * *****************/


$(function(editor) {
    var result;
    var label;
    var article;
    var title;
    var id;

    // ラベル一覧表示
    getLabelList();

    // 記事一覧表示
    getArticlelList(1);

    /*
     * 実装待ちイベント
     *
     */
    // ラベル追加ボタン
    $(document).on('click', '#addLabel', function() {
        /* 変数nameに入力値を格納 */
        var name = prompt("ラベル名を入力して下さい", "");
        if (name === "") {
        }else{
            // mode, action, id, label, title, article
            exePost("label", "add", "0", name, "", "").done(function(data) {
                // ラベル一覧表示
                getLabelList();
            }).fail(function(data) {
                alert("system Error");
            });
        }
    });


    /*
     * リストイベント
     *
     */

    // カテゴリ詳細
    $(document).on('change', '#labels', function() {
        getArticlelList($(this).val());
    });


    /*
     * 記事イベント
     *
     */

    // 記事新規ボタン
    $(document).on('click', '#addArticle', function() {
        resetForm();
    });

    // 記事保存ボタン
    $(document).on('click', '#editArticle', function() {
        label = $("#label").val();
        var editor = ace.edit("article");
        article = editor.getValue();
        id = $("#editArticleId").val();
        title = $("#title").val();
        exePost("article", "add", id, label, title, article).done(function(data) {

        }).fail(function(data) {
            alert("system Error");
        });
    });

    // 記事詳細
    $(document).on('click', '.viewArticle', function(editor) {
        $("#editArticleId").val($(this).data("article"));
        id = $(this).data("article");
        exePost("article", "find", id, "", "", "").done(function(data) {
            var detail = $.parseJSON(data);
            $("#editArticleId").val(detail["id"]);
            $("#title").val(detail["title"]);
            $("#label").val(detail["labelid"]);
            var editor = ace.edit("article");
            editor.getSession().setValue(detail["article"]);
        }).fail(function(data) {
            alert("system Error");
        });
    });

    // 記事更新
    $(document).on('click', '#editArticle', function() {
        label = $("#label").val();
        var editor = ace.edit("article");
        article = editor.getValue();
        id = $("#editArticleId").val();
        title = $("#title").val();
        exePost("article", "edit", id, label, title, article).done(function(data) {
            getArticlelList(label);
        }).fail(function(data) {
            alert("system Error");
        });
    });

    // 記事削除
    $(document).on('click', '#delete', function() {
        id = $("#editArticleId").val();
        label = $("#label").val();
        exePost("article", "del", id, "", "", "").done(function(data) {
            resetForm();
            getArticlelList(label);
        }).fail(function(data) {
            alert("system Error");
        });
    });

    // 記事コピー
    $(document).on('click', '#copy', function() {
        var editor = ace.edit("article");
        copyTextToClipboard(editor.getValue());
    });
});

// PHP に送信
function exePost(mode, action, id, label, title, article) {
    return $.ajax({
        type: "POST",
        url: "pdo.php",
        dataType: 'text',
        data: {
            mode: mode,
            action: action,
            id: id,
            label: label,
            title: title,
            article: article
        }
    })
}

// ラベルを一覧表示
function getLabelList() {
    exePost("label", "list", "all", '', '', '').done(function(data) {
        $("#labels .listCategory").remove();
        $("select#label option").remove();
        var obj = $.parseJSON(data);
        var options = "";
        $.each(obj, function(index, value) {
            options += "<option value='" + value["id"] + "'>" + value["name"] + "</option>";
        });
        $("#labels").html(options);
        $("#label").html(options);

    }).fail(function(data) {
        alert("system Error");
    });
}

// 記事一覧表示
function getArticlelList(labelId) {
    $("#articles").html("");
    exePost("article", "list", '', labelId, '', '').done(function(data) {
        var obj = $.parseJSON(data);
        var lists = "";
        $.each(obj, function(index, value) {
            lists += "<li class='list-group-item viewArticle' data-article='" + value["id"] + "'>" + value["title"] + "</li>";
        });
        $("#articles").html(lists);

    }).fail(function(data) {
        alert("system Error");
    });
}

// フォームの要素をすべてリセット
function resetForm() {
    $("#label").val('');
    $("#title").val('');
    var editor = ace.edit("article");
    editor.getSession().setValue('');
    $("#editArticleId").val('0');
    
}

/**
 * クリップボードコピー関数
 * 入力値をクリップボードへコピーする
 * [引数]   textVal: 入力値
 * [返却値] true: 成功　false: 失敗
 */
function copyTextToClipboard(textVal){
  // テキストエリアを用意する
  var copyFrom = document.createElement("textarea");
  // テキストエリアへ値をセット
  copyFrom.textContent = textVal;
 
  // bodyタグの要素を取得
  var bodyElm = document.getElementsByTagName("body")[0];
  // 子要素にテキストエリアを配置
  bodyElm.appendChild(copyFrom);
 
  // テキストエリアの値を選択
  copyFrom.select();
  // コピーコマンド発行
  var retVal = document.execCommand('copy');
  // 追加テキストエリアを削除
  bodyElm.removeChild(copyFrom);
 
  return retVal;
}