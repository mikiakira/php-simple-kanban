<?php
/*
 * apiFunc.php
 * API 通信のためのクラス
 *
 * @regist    2016/09/15
 * @modify
 * @author    oukouchi
 *
 *
*/

class apiFunc {

    // Ajax通信か判定
    public function is_ajax(){
        return isset($_SERVER['HTTP_X_REQUESTED_WITH'])&&strtolower($_SERVER['HTTP_X_REQUESTED_WITH'])=='xmlhttprequest';
    }

    // POST通信か判定する
    public function is_post() {
        if($_SERVER["REQUEST_METHOD"] === "POST"){
            return true;
        }else{
            return false;
        }
    }

    // GET通信か判定する
    public function is_get() {
        if($_SERVER["REQUEST_METHOD"] === "GET"){
            return true;
        }else{
            return false;
        }
    }

    /** CSRF 開始(ハッシュ作成)
     *
     * @param session_column string セッションキー名
     * @param csrf_hash パスワード生成のためのハッシュ名
     */
    public function createCsrf($session_column, $csrf_hash){
        $_SESSION[$session_column] = password_hash($csrf_hash, PASSWORD_DEFAULT);
    }

    /** CSRF チェック関数
     *
     * @param session_column string セッションキー名
     * @param csrf_key 送信されたキー名
     * @result boolean
     */
    public function chkCsrf($session_column, $csrf_key){
        if( $_SESSION[$session_column] === $csrf_key ){
            return true;
        } else {
            return false;
        }
    }


    /**
     * DB接続チェック
     */
    public function chkDbConnect($db_type, $db_host, $db_name, $db_accout, $db_pass, $db_port){

        // 接続文字列を切替
        switch($db_type) {
            case "mysql":
                $dsn = 'mysql:dbname='.$db_name.';host='.$db_host.';charset=utf8';
            break;
            case "postgres":
                $dsn = 'pgsql:dbname='.$db_name.';host='.$db_host.';port=5432';
            break;
            default:
            break;
        }

        try {
            $dbh = new PDO($dsn, $db_accout, $db_pass);
        } catch (PDOException $e)
        {
            return false;
            // die('Error:' . $e->getMessage());
        }
        return true;

    }

}
