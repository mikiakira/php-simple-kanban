<?php
if (extension_loaded('zlib')) {
    //　ライブラリが存在していたら圧縮する
    ob_start('ob_gzhandler');
}
require_once("class/apiFunc.php");
require_once("config/define.php");
$apiFunc = new apiFunc();
$_SESSION["active"] = '';

// Cookie に値がセット済みならPOSTに値を代入する
if (isset($_COOKIE['pass_word'])) {
    $pass = $_COOKIE['pass_word'];
} else {
    $pass = '';
    $_POST['pass'] = '';
    $_POST['save'] = '';
}

// POSTされたらエスケープ処理をする
if ($apiFunc->is_post()) {
    $pass = filter_input(INPUT_POST, 'pass');
    $save = filter_input(INPUT_POST, 'save');
    // 「ログイン情報を記録する」にチェックが入っていたらクッキーを書き込む
    if ($save === 'on') {
        setcookie('pass_word', $pass, time() + 60 * 60 * 24 * 14);
    }
}

// パスワードが一致したらログイン処理を行う
if ($pass === APP_PASS) {
    session_name(SESSION_NAME);
    ini_set('session.hash_function', 'sha512');
    ini_set('session.hash_bits_per_character', 6);
    ini_set('session.use_strict_mode', 1);
    session_start();
    // ログイン済みの情報をセッションにセットする
    $_SESSION["active"] = "on";
}
?>

<!doctype html>
<html lang="ja">
    <head>
        <meta charset="utf-8" />
        <title>php-simple-kanban</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1, maximum-scale=1,user-scalable=yes">
        <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" type="text/css" media="all">
        <link rel="stylesheet" href="//code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" />
        <link rel="stylesheet" type="text/css" href="css/spectrum.min.css">
        <link rel="stylesheet" href="css/app.min.css" />
        <link rel="icon" type="image/x-icon" href="favicon.png">
    </head>
    <body>
        <?php
        if ($_SESSION["active"] !== "on") {
            echo '<div id="login_box" class="container">';
            echo '<div class="row">';
            echo '<div class="col-xs-12">';
            echo '<form method="post" action="">';
            echo '<label for="pass">Login:</label> ';
            echo '<input type="password" name="pass"><br>';
    echo '<input type="checkbox" name="save" value="on">&nbsp;<span class="white">ログイン情報を記録する</span><br>';
            echo '<input type="submit" value="ログイン">';
            echo '</form>';
            echo '</div>';
            echo '</div>';
            echo '</div>';
            return;
        }
        ?>
        <div id="app_header" class="board">
            <div class="sortable">
                <div id="board_list" class="dropdown">
                    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">&nbsp;ボード<span class="caret"></span>
                    </button>
                    <!-- ボード一覧 -->
                    <div id="board_all_list" class="dropdown-menu" aria-labelledby="dropdownMenu1">
                    </div>
                </div>
                <div id="board_add" class="btn btn-default"><span class="glyphicon glyphicon-plus-sign"></span>&nbsp;ボード追加</div>
                <div id="panel_add" class="btn btn-default"><span class="glyphicon glyphicon-plus-sign"></span>&nbsp;パネル追加</div>
                <div id="logout" class="btn btn-default"><span class="glyphicon glyphicon-log-out"></span>&nbsp;ログアウト</div>
            </div>

        </div>
        <!-- ボードヘッダ -->
        <div id="board_header">
            <!-- ボードタイトル -->
            <div id="board_title" data-id=""><h1 style=""></h1></div>
        </div>

        <div class="board">
            <div id="panel_area" class="sortable">
            </div>
        </div>

        <!-- Hidden Elements -->
        <div id="hidden">
            <!-- パネル -->
            <div class="panel per_panel">
                <div class="pannel panel panel-default">
                    <div class="panel-heading">
                        <h2 data-id="new">New</h2>
                    </div>
                    <div class="panel-body">

                    </div>
                    <div class="panel-footer">
                        <div class="btn btn-default card_add">カードを追加</div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Modal Elements -->
        <!-- Card Modal -->
        <div class="modal" id="card-edit" data-id="" card_panel_id="" tabindex="-1">
            <div class="modal-dialog">
                <!-- モーダルのコンテンツ -->
                <div class="modal-content">
                    <!-- モーダルのヘッダ -->
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="modal-label">カード情報編集</h4>
                    </div>
                    <!-- モーダルのボディ -->
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="fieldName" class="col-sm-2 control-label">タイトル</label>
                            <div class="col-sm-10">
                                <input type="text" id="card_title_text">
                            </div>
                            <label for="fieldTel" class="col-sm-2 control-label">ラベル</label>
                            <div class="col-sm-10">
                                <input type="text" id="card_label_color">
                            </div>
                            <label for="fieldTel" class="col-sm-2 control-label">本文<br><span id="contents_toggle">編集</span></label>
                            <div class="col-sm-10">
                                <div id="contents_view" style=""></div>
                                <textarea id="contents" style="display: none;" cols="50" rows="10"></textarea>
                            </div>
                        </div>
                    </div>
                    <!-- モーダルのフッタ -->
                    <div class="modal-footer">
                        <button type="button" id="delete-btn" class="btn btn-danger">削除</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">閉じる</button>
                        <button type="button" id="move-btn" class="btn btn-info">移動/複製</button>
                        <button type="button" id="save-btn" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- カード・移動/複製モーダル -->
        <div class="modal" id="card-move-modal" data-id="" tabindex="-1">
            <div class="modal-dialog">
                <!-- モーダルのコンテンツ -->
                <div class="modal-content">
                    <!-- モーダルのヘッダ -->
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="modal-label">カードの移動/複製</h4>
                    </div>
                    <!-- モーダルのボディ -->
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="board_select" class="col-sm-2 control-label">ボード</label>
                            <select id="board_select"></select>
                        </div>
                        <div class="form-group">
                            <label for="panel_select" class="col-sm-2 control-label">パネル</label>
                            <select id="panel_select"></select>
                        </div>
                        <div class="form-group">
                            <div id="selectGroup">
                                <label for="panel_select" class="col-sm-2 control-label"></label>
                                <input type="radio" name="q" value="move"> 移動
                                <input type="radio" name="q" value="copy"> 複製
                            </div>
                        </div>
                    </div>
                    <!-- モーダルのフッタ -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">閉じる</button>
                        <button type="button" id="save-panel-btn" class="btn btn-primary">実行</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ボード・更新用モーダル -->
        <div class="modal" id="board-modal" tabindex="-1">
            <div class="modal-dialog">
                <!-- モーダルのコンテンツ -->
                <div class="modal-content">
                    <!-- モーダルのヘッダ -->
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="modal-label">ボード編集</h4>
                    </div>
                    <!-- モーダルのボディ -->
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="board_title_text" class="col-sm-2 control-label">ボード名</label>
                            <div class="col-sm-10">
                                <input type="text" id="board_title_text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="board_title_text" class="col-sm-2 control-label">カラー</label>
                            <div class="col-sm-10">
                                <input type="text" id="board_color">
                            </div>
                        </div>
                    </div>
                    <!-- モーダルのフッタ -->
                    <div class="modal-footer">
                        <button type="button" id="delete-btn" class="btn btn-danger">削除</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">閉じる</button>
                        <button type="button" id="save-btn" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ボード・登録用モーダル -->
        <div class="modal" id="board-add-modal" tabindex="-1">
            <div class="modal-dialog">
                <!-- モーダルのコンテンツ -->
                <div class="modal-content">
                    <!-- モーダルのヘッダ -->
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="modal-label">ボード追加</h4>
                    </div>
                    <!-- モーダルのボディ -->
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="board_new_title_text" class="col-sm-2 control-label">ボード名</label>
                            <div class="col-sm-10">
                                <input type="text" id="board_new_title_text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="board_new_color" class="col-sm-2 control-label">カラー</label>
                            <div class="col-sm-10">
                                <input type="text" id="board_new_color">
                            </div>
                        </div>
                    </div>
                    <!-- モーダルのフッタ -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">閉じる</button>
                        <button type="button" id="save-btn" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- パネル・モーダル -->
        <div class="modal" id="panel-modal" data-id="" tabindex="-1">
            <div class="modal-dialog">
                <!-- モーダルのコンテンツ -->
                <div class="modal-content">
                    <!-- モーダルのヘッダ -->
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="modal-label">パネル編集</h4>
                    </div>
                    <!-- モーダルのボディ -->
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="fieldName" class="col-sm-2 control-label">名前</label>
                            <div class="col-sm-10">
                                <input type="text" id="panel_title_text" />
                            </div>
                        </div>
                    </div>
                    <!-- モーダルのフッタ -->
                    <div class="modal-footer">
                        <button type="button" id="delete-btn" class="btn btn-danger">削除</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">閉じる</button>
                        <button type="button" id="save-panel-btn" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 編集用モーダルここまで -->
        <script type="text/javascript" src="//code.jquery.com/jquery-2.1.1.min.js"></script>
        <script type="text/javascript" src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
        <script src="//code.jquery.com/ui/1.10.0/jquery-ui.js"></script>
        <script src="js/spectrum.min.js"></script>
        <script src="js/linkify.min.js"></script>
        <script src="js/linkify-jquery.min.js"></script>
        <script src="js/jquery.spectrum-ja.min.js"></script>
        <script src="js/app.min.js"></script>
        <script src="js/io_board.min.js"></script>
        <script src="js/io_panel.min.js"></script>
        <script src="js/io_card.min.js"></script>
        <script src="js/common.min.js"></script>
    </body>

</html>
<?php
if (extension_loaded('zlib')) {
    ob_end_flush();
}