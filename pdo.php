<?php
/**
 * PDO コントローラ
 *
 */


// 文字化け対策
mb_language('ja');
mb_internal_encoding("UTF-8") ;

require_once("class/apiFunc.php");
require_once("class/idiorm.php");
require_once("models/boards.php");
require_once("models/panels.php");
require_once("models/cards.php");

$apiFunc = new apiFunc();

ORM::configure('sqlite:app.db');
ORM::configure('caching', true);
ORM::configure('logging', true);
ORM::configure('id_column', 'id');

$db = ORM::get_db();

// $res = articles::findLabel(1);
// $res = articles::find(1);

// foreach($res as $v){
//     var_dump($v->id);
//     var_dump($v->title);
//     // echo "<br><br>";
// }

// var_dump(ORM::get_query_log());

if ($apiFunc->is_ajax() ){

    // 返り値を初期化
    $return = [];
    $articleDetail = [];
    $articleList = [];

    // エスケープするパラメータを設定
    $arrays = ['mode', 'action', 'id', 'title', 'contents', 'label', 'etc1'];
    foreach ($arrays as $value) {
        ${$value} = filter_input(INPUT_POST, $value);
    }

    /**
     * ボード
     */
    if($mode === "boards") {

        // 最初の1件を取得
        if($action === "first") {
            $val = boards::findFirst();
            if ($val) {
                $return = ["id" => $val->id, "title" => $val->title, "board_color" => $val->board_color];
                echo json_encode($return);
            } else {
                return false;
            }
        }
        // 指定したIDの情報を取得
        if($action === "find"){
            $val = boards::find($id);
            $return = ["id" => $val->id, "title"=>$val->title, "board_color"=>$val->board_color];
            echo json_encode($return);
        }
        // 指定したIDで論理削除
        if($action === "del"){
            boards::del($id);
        }
        if($action === "save"){
            // id が new だったら新規登録
            if($id === 'new'){
                $id = boards::create(["title"=>$title, 'board_color'=>$contents]);
                if($id){
                    $val = boards::find($id);
                }
            }else{
                boards::edit($id, ["title"=>$title, 'board_color'=>$contents]);
                $val = boards::find($id);
            }

            $return = ["id" => $val->id, "title"=>$val->title, "board_color"=>$val->board_color];
            echo json_encode($return);
        }
        if($action === "list"){
            $result = boards::findAll();
            foreach( (array)$result as $values){
                $articleList[] = ["id" => $values->id, "title"=>$values->title, "board_color"=>$values->board_color];
            }
            echo json_encode($articleList);
        }
        /*
        if($action ==="add"){
            return boards::create(["name"=>$label]);
        }
        */
    }

    /**
     * パネル
     */
    if($mode === "panels"){
        if($action === "save"){
            if($id === 'new'){
                $id = panels::create(["title"=>$title, "boards_id"=>$contents]);
                if($id){
                    $val = panels::find($id);
                }
            }else{
                panels::edit($id, ["title"=>$title]);
                $val = panels::find($id);
            }
            $return = ["id" => $val->id, "title"=>$val->title];
            echo json_encode($return);
        }

        // 指定したIDで論理削除
        if($action === "del"){
            panels::del($id);
        }

        if($action === "list"){
            $result = panels::findAll($id);
            if($result){
                foreach( (array)$result as $values){
                    $articleList[] = ["id" => $values->id, "title"=>$values->title];
                }
            }else{
                $articleList = false;
            }

            echo json_encode($articleList);
        }

        // 並び替え
        if($action === "sort"){
            $n = 1;
            $arrays = json_decode($title, true);
            foreach ((array)$arrays as $val) {
                panels::edit($val, ["order_key"=>$n]);
                $n++;
            }
        }
    }

    /**
     * カード
     */
    if($mode === "cards"){
        if($action === "list"){
            $result = cards::findAll($id);
            if($result){
                foreach( (array)$result as $values){
                    $articleList[] = ["id" => $values->id, "title"=>$values->title, "label_color"=>$values->label_color];
                }
            }else{
                $articleList = false;
            }

            echo json_encode($articleList);
        }

        if($action === "search"){
            $result = cards::search($id);
            if($result){
                foreach( (array)$result as $values){
                    $articleList[] = ["id" => $values->id, "title"=>$values->title, "panels_id" => $values->panels_id, "boards_id" => $values->boards_id];
                }
            }else{
                $articleList = false;
            }

            echo json_encode($articleList);
        }

        // 指定したIDの情報を取得
        if($action === "find"){
            $val = cards::find($id);
            if ($val) {
                $return = ["id" => $val->id, "panels_id" => $val->panels_id, "title" => $val->title, "label_color" => $val->label_color, "contents" => $val->contents];
                echo json_encode($return);
            } else {
                return false;
            }
        }

        // 指定したIDで論理削除
        if($action === "del"){
            cards::del($id);
        }

        // 移動
        if($action === "move"){
            cards::edit($id, ["panels_id"=>$title]);
        }

        // 複製
        if($action === "copy"){
            $val = cards::find($id);
            $id = cards::create(["title"=>$val->title, "panels_id"=>$title ,"label_color"=>$val->label_color, "contents"=>$val->contents]);
        }

        if($action === "save"){
            if($id === 'new'){
                $id = cards::create(["title"=>$title, "panels_id"=>$contents ,"label_color"=>$label, "contents"=>$etc1]);
                if($id){
                    $val = cards::find($id);
                }
            }else{
                cards::edit($id, ["title"=>$title, "panels_id"=>$contents ,"label_color"=>$label, "contents"=>$etc1]);
                $val = cards::find($id);
            }
            $return = ["id" => $val->id, "panels_id"=>$val->panels_id, "title"=>$val->title, "label_color"=>$val->label_color, "contents"=>$val->contents];
            echo json_encode($return);
        }

        // 並び替え
        if($action === "sort"){
            $n = 1;
            $arrays = json_decode($title, true);
            foreach ((array)$arrays as $val) {
                cards::edit($val, ["panels_id"=>$id, "order_key"=>$n]);
                $n++;
            }
        }
    }

}else{
    echo "system Error";
}