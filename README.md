php-simple-kanban
====

<img src="https://github.com/mikiakira/imageArchive/blob/master/img/php-simple-kanban.png?raw=true" width="50%">

## Overview
A web app that was inspired by Trello and cloned only the "Kanban" function with PHP.

Since the data is managed by SQlite, after downloading,
it can be started immediately by just rewriting the password with the setting file.


## Requirement

  * PHP 5.6+ (PDO is required)
  * Idirom
  * SQLite
  * Bootstrap 3.x
  * jQuery 2.x
  * jQuery UI 1.x
  * jQuery.spectrum
  * linkify-jquery
  * Remodal.js


## Installation
  * Copy app.template.db and rename it to app.db
  * Open config / define.php and set the password
  * Open config / define.php and please choose a language. Change the value of "const LANG". The default is en in English. Japanese is ja.


## BackUp
(Current hidden mode) When logged in, you access export.php then download the database backup (app.db)


## Copyright and license
Code copyright 2017 the Web Atelier Midori Inc. Code released under the MIT License.

## Donation
You can use this software for free, but I am seeking donations.
https://PayPal.Me/ateliermidori/500

## An explanation of Japanese
For commentary on Japanese please see [official blog] (https://web-atelier-midori.com/blog/php/1817/)
(日本語の解説は [公式ブログ](https://web-atelier-midori.com/blog/php/1817/)をご覧下さい).
