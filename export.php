<?php
require_once("class/apiFunc.php");
$apiFunc = new apiFunc();

if( $_SESSION["active"] !== "on"){
    
    $file = 'app.db';
    
    // バイナリ形式であることを宣言
    header('Content-Type: application/octet-stream'); 
     
    //　通常は実行しているPHPスクリプトの名前でファイルがダウンロードされてしまうため、
    // ブラウザに名前を通知して、ファイル名でダウンロードしてもらう。
    header('Content-Disposition: attachment; filename='.$file."");
     
    $file_size = filesize($file);
     
    //　ダイアログのダウンロード進捗が表示されるよう、ファイルサイズを取得する
    header('Content-Length: '.$file_size);
     
    // 実際のファイルを読み込む
    readfile($file);

}
?>