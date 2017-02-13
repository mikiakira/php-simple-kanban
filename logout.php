<?php

// セッション情報を破棄
session_start();
session_destroy();
$_SESSION = array();
// Cookie情報を削除
setcookie('pass_word', '', time() - 420000);
header("Location: index.php");
